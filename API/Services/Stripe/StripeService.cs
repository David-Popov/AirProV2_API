using API.Common;
using API.Constants;
using API.Data;
using API.Data.Entities;
using API.DTOs.Stripe;
using API.Models;
using API.Services.Email;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using ValidationException = FluentValidation.ValidationException;

namespace API.Services.Stripe;

public class StripeService : IStripeService
{
    private readonly ApplicationDbContext _context;
    private readonly StripeSettings _stripeSettings;
    private readonly ILogger<StripeService> _logger;
    private readonly IBackgroundEmailQueue _backgroundEmailQueue;
    private readonly UserManager<ApplicationUser> _userManager;

    public StripeService(
        ApplicationDbContext context,
        IOptions<StripeSettings> stripeSettings,
        ILogger<StripeService> logger,
        IBackgroundEmailQueue backgroundEmailQueue,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _stripeSettings = stripeSettings.Value;
        _logger = logger;
        _backgroundEmailQueue = backgroundEmailQueue;
        _userManager = userManager;

        StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
    }

    public StripeConfigDto GetConfig() => new()
    {
        PublishableKey = _stripeSettings.PublishableKey
    };

    public StripePlanDto GetPremiumPlan()
    {
        var plan = _stripeSettings.PremiumPlan;
        return new StripePlanDto
        {
            Id = plan.Id,
            Name = plan.Name,
            PriceId = _stripeSettings.PremiumPriceId,
            Price = plan.Price,
            Currency = plan.Currency,
            Interval = plan.Interval,
            Features = plan.Features
        };
    }

    public async Task<CheckoutSessionResponseDto> CreateCheckoutSessionForUserAsync(string userId, string successUrl, string cancelUrl)
    {
        var company = await GetCallerCompanyAsync(userId);

        if (string.IsNullOrEmpty(_stripeSettings.PremiumPriceId))
        {
            throw new ValidationException("Premium plan is not configured.");
        }

        await GetOrCreateStripeCustomerAsync(company);

        var options = new SessionCreateOptions
        {
            Customer = company.StripeCustomerId,
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new() { Price = _stripeSettings.PremiumPriceId, Quantity = 1 }
            },
            Mode = "subscription",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            Metadata = new Dictionary<string, string> { { "companyId", company.Id.ToString() } },
            SubscriptionData = new SessionSubscriptionDataOptions
            {
                Metadata = new Dictionary<string, string> { { "companyId", company.Id.ToString() } }
            }
        };

        var session = await new SessionService().CreateAsync(options);
        return new CheckoutSessionResponseDto { Url = session.Url! };
    }

    public async Task<CheckoutSessionResponseDto> CreatePortalSessionForUserAsync(string userId, string returnUrl)
    {
        var company = await GetCallerCompanyAsync(userId);

        if (string.IsNullOrEmpty(company.StripeCustomerId))
        {
            throw new ValidationException("No subscription found. Please subscribe first.");
        }

        var options = new global::Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = company.StripeCustomerId,
            ReturnUrl = returnUrl
        };

        var session = await new global::Stripe.BillingPortal.SessionService().CreateAsync(options);
        return new CheckoutSessionResponseDto { Url = session.Url };
    }

    public async Task<SubscriptionStatusDto> GetSubscriptionStatusForUserAsync(string userId)
    {
        var company = await GetCallerCompanyAsync(userId);

        return new SubscriptionStatusDto
        {
            Plan = company.SubscriptionPlan.ToString(),
            Status = company.SubscriptionStatus.ToString(),
            IsActive = company.IsSubscriptionActive ?? false,
            CurrentPeriodEnd = company.SubscriptionCurrentPeriodEnd,
            TrialEndDate = company.TrialEndDate,
            HasStripeSubscription = !string.IsNullOrEmpty(company.StripeSubscriptionId)
        };
    }

    public async Task<MessageResponseDto> ReturnCompanyToFreePlanAsync(string userId)
    {
        var company = await GetCallerCompanyAsync(userId, trackForUpdate: true);

        if (company.SubscriptionStatus != SubscriptionStatus.Expired &&
            company.SubscriptionStatus != SubscriptionStatus.Cancelled)
        {
            throw new ValidationException("This action is only available when subscription is expired or cancelled.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var employeesWithRoles = await (
            from user in _context.Users
            where user.CompanyId == company.Id
            join userRole in _context.UserRoles on user.Id equals userRole.UserId into urj
            from ur in urj.DefaultIfEmpty()
            join role in _context.Roles on ur.RoleId equals role.Id into rj
            from r in rj.DefaultIfEmpty()
            select new { User = user, RoleName = r != null ? r.Name : null }
        ).ToListAsync();

        var perUser = employeesWithRoles
            .GroupBy(x => x.User.Id)
            .Select(g => new
            {
                User = g.First().User,
                Roles = g.Select(x => x.RoleName).Where(n => n != null).ToHashSet()
            })
            .ToList();

        var deactivatedCount = 0;
        foreach (var entry in perUser)
        {
            if (entry.Roles.Contains(AppRoles.Manager) || entry.Roles.Contains(AppRoles.Admin))
            {
                continue;
            }

            entry.User.IsActive = false;
            deactivatedCount++;
        }

        company.SubscriptionPlan = SubscriptionPlan.Free;
        company.SubscriptionStatus = SubscriptionStatus.Active;
        company.IsSubscriptionActive = true;
        company.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        _logger.LogInformation(
            "Company {CompanyId} returned to Free plan. Deactivated {Count} employee(s).",
            company.Id, deactivatedCount);

        return new MessageResponseDto
        {
            Message = "Successfully returned to Free plan. All non-manager employees have been deactivated."
        };
    }

    public async Task HandleWebhookEventAsync(string json, string signature)
    {
        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                json,
                signature,
                _stripeSettings.WebhookSecret,
                throwOnApiVersionMismatch: false);
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe webhook signature verification failed");
            throw;
        }

        var alreadyProcessed = await _context.ProcessedStripeEvents
            .AsNoTracking()
            .AnyAsync(e => e.EventId == stripeEvent.Id);

        if (alreadyProcessed)
        {
            _logger.LogInformation("Skipping already-processed Stripe event {EventId} ({EventType})",
                stripeEvent.Id, stripeEvent.Type);
            return;
        }

        _logger.LogInformation("Processing Stripe event {EventId} ({EventType})", stripeEvent.Id, stripeEvent.Type);

        try
        {
            switch (stripeEvent.Type)
            {
                case "checkout.session.completed":
                    await HandleCheckoutSessionCompleted(stripeEvent);
                    break;

                case "customer.subscription.created":
                case "customer.subscription.updated":
                    await HandleSubscriptionUpdated(stripeEvent);
                    break;

                case "customer.subscription.deleted":
                    await HandleSubscriptionDeleted(stripeEvent);
                    break;

                case "invoice.payment_succeeded":
                    await HandleInvoicePaymentSucceeded(stripeEvent);
                    break;

                case "invoice.payment_failed":
                    await HandleInvoicePaymentFailed(stripeEvent);
                    break;

                case "charge.refunded":
                    await HandleChargeRefunded(stripeEvent);
                    break;

                default:
                    _logger.LogInformation("Unhandled Stripe event type: {EventType}", stripeEvent.Type);
                    break;
            }

            _context.ProcessedStripeEvents.Add(new ProcessedStripeEvent
            {
                EventId = stripeEvent.Id,
                EventType = stripeEvent.Type,
                ProcessedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            _logger.LogInformation("Concurrent duplicate detected for Stripe event {EventId}", stripeEvent.Id);
        }
    }

    private static bool IsUniqueViolation(DbUpdateException ex)
    {
        return ex.InnerException is Npgsql.PostgresException pg && pg.SqlState == "23505";
    }

    private async Task<Company> GetCallerCompanyAsync(string userId, bool trackForUpdate = false)
    {
        if (string.IsNullOrEmpty(userId))
        {
            throw new ForbiddenException("User is not authenticated.");
        }

        var query = _context.Users.Include(u => u.Company).AsQueryable();
        if (!trackForUpdate)
        {
            query = query.AsNoTracking();
        }

        var user = await query.FirstOrDefaultAsync(u => u.Id == userId)
                   ?? throw new NotFoundException("User not found.");

        if (user.Company == null)
        {
            throw new ValidationException("User does not belong to a company.");
        }

        return user.Company;
    }

    private async Task GetOrCreateStripeCustomerAsync(Company company)
    {
        if (!string.IsNullOrEmpty(company.StripeCustomerId))
        {
            return;
        }

        var customer = await new CustomerService().CreateAsync(new CustomerCreateOptions
        {
            Email = company.Email,
            Name = company.CompanyName,
            Metadata = new Dictionary<string, string> { { "companyId", company.Id.ToString() } }
        });

        company.StripeCustomerId = customer.Id;
        company.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created Stripe customer {CustomerId} for company {CompanyId}", customer.Id, company.Id);
    }

    private SubscriptionPlan GetPlanFromPriceId(string priceId) => SubscriptionPlan.Premium;

    private async Task HandleCheckoutSessionCompleted(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Session session) return;

        var companyIdStr = session.Metadata?.GetValueOrDefault("companyId");
        if (string.IsNullOrEmpty(companyIdStr) || !Guid.TryParse(companyIdStr, out var companyId))
        {
            _logger.LogWarning("Checkout session completed without valid companyId metadata");
            return;
        }

        var company = await _context.Companies.FindAsync(companyId);
        if (company == null)
        {
            _logger.LogWarning("Company {CompanyId} not found for checkout session", companyId);
            return;
        }

        company.StripeSubscriptionId = session.SubscriptionId;
        company.SubscriptionPlan = SubscriptionPlan.Premium;
        company.SubscriptionStatus = SubscriptionStatus.Active;
        company.IsSubscriptionActive = true;
        company.UpdatedAt = DateTime.UtcNow;

        var purchasedCompany = company;
        _backgroundEmailQueue.QueueEmail(async sp =>
        {
            var emailService = sp.GetRequiredService<IEmailService>();
            await emailService.SendSubscriptionPurchasedEmailAsync(purchasedCompany, "Premium");
        });

        _logger.LogInformation("Checkout completed for company {CompanyId}, subscription {SubscriptionId}",
            companyId, session.SubscriptionId);
    }

    private async Task HandleSubscriptionUpdated(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Subscription subscription) return;

        var companyIdStr = subscription.Metadata?.GetValueOrDefault("companyId");
        Company? targetCompany = null;

        if (!string.IsNullOrEmpty(companyIdStr) && Guid.TryParse(companyIdStr, out var companyId))
        {
            targetCompany = await _context.Companies.FindAsync(companyId);
        }

        targetCompany ??= await _context.Companies
            .FirstOrDefaultAsync(c => c.StripeCustomerId == subscription.CustomerId);

        if (targetCompany == null)
        {
            _logger.LogWarning("Could not find company for subscription {SubscriptionId}", subscription.Id);
            return;
        }

        var previousStatus = targetCompany.SubscriptionStatus.ToString();

        targetCompany.StripeSubscriptionId = subscription.Id;
        targetCompany.SubscriptionCurrentPeriodEnd = subscription.CurrentPeriodEnd;

        targetCompany.SubscriptionStatus = subscription.Status switch
        {
            "active" => SubscriptionStatus.Active,
            "past_due" => SubscriptionStatus.Suspended,
            "canceled" => SubscriptionStatus.Cancelled,
            "unpaid" => SubscriptionStatus.Suspended,
            "trialing" => SubscriptionStatus.Trial,
            _ => targetCompany.SubscriptionStatus
        };

        targetCompany.IsSubscriptionActive = subscription.Status is "active" or "trialing";

        if (subscription.Items?.Data?.Any() == true)
        {
            targetCompany.SubscriptionPlan = GetPlanFromPriceId(subscription.Items.Data[0].Price.Id);
        }

        targetCompany.UpdatedAt = DateTime.UtcNow;

        var newStatus = targetCompany.SubscriptionStatus.ToString();
        if (previousStatus != newStatus)
        {
            var statusCompany = targetCompany;
            var prev = previousStatus;
            var cur = newStatus;
            _backgroundEmailQueue.QueueEmail(async sp =>
            {
                var emailService = sp.GetRequiredService<IEmailService>();
                await emailService.SendSubscriptionStatusChangedEmailAsync(statusCompany, prev, cur);
            });
        }

        _logger.LogInformation("Subscription updated for company {CompanyId}: Status={Status}",
            targetCompany.Id, subscription.Status);
    }

    private async Task HandleSubscriptionDeleted(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Subscription subscription) return;

        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.StripeSubscriptionId == subscription.Id);

        if (company == null)
        {
            _logger.LogWarning("Could not find company for deleted subscription {SubscriptionId}", subscription.Id);
            return;
        }

        var previousStatus = company.SubscriptionStatus.ToString();
        company.SubscriptionStatus = SubscriptionStatus.Cancelled;
        company.IsSubscriptionActive = false;
        company.UpdatedAt = DateTime.UtcNow;

        var cancelCompany = company;
        var prev = previousStatus;
        _backgroundEmailQueue.QueueEmail(async sp =>
        {
            var emailService = sp.GetRequiredService<IEmailService>();
            await emailService.SendSubscriptionStatusChangedEmailAsync(cancelCompany, prev, "Cancelled");
        });

        _logger.LogInformation("Subscription cancelled for company {CompanyId}", company.Id);
    }

    private async Task HandleInvoicePaymentSucceeded(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Invoice invoice || string.IsNullOrEmpty(invoice.SubscriptionId))
            return;

        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.StripeSubscriptionId == invoice.SubscriptionId);
        if (company == null) return;

        company.SubscriptionStatus = SubscriptionStatus.Active;
        company.IsSubscriptionActive = true;
        company.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Payment succeeded for company {CompanyId}", company.Id);
    }

    private async Task HandleInvoicePaymentFailed(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Invoice invoice || string.IsNullOrEmpty(invoice.SubscriptionId))
            return;

        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.StripeSubscriptionId == invoice.SubscriptionId);
        if (company == null) return;

        company.SubscriptionStatus = SubscriptionStatus.Suspended;
        company.UpdatedAt = DateTime.UtcNow;

        _logger.LogWarning("Payment failed for company {CompanyId}", company.Id);
    }

    private async Task HandleChargeRefunded(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Charge charge || !charge.Refunded) return;

        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.StripeCustomerId == charge.CustomerId);
        if (company == null)
        {
            _logger.LogWarning("Company not found for refunded charge {ChargeId}", charge.Id);
            return;
        }

        if (charge.AmountRefunded >= charge.Amount)
        {
            company.SubscriptionStatus = SubscriptionStatus.Cancelled;
            company.IsSubscriptionActive = false;
            company.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation("Full refund processed for company {CompanyId}; subscription cancelled", company.Id);
        }
        else
        {
            _logger.LogInformation("Partial refund processed for company {CompanyId}", company.Id);
        }
    }
}
