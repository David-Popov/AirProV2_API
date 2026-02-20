using API.Data;
using API.Data.Entities;
using API.Models;
using API.Services.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace API.Services.Stripe;

public class StripeService : IStripeService
{
    private readonly ApplicationDbContext _context;
    private readonly StripeSettings _stripeSettings;
    private readonly ILogger<StripeService> _logger;
    private readonly IEmailService _emailService;

    public StripeService(
        ApplicationDbContext context,
        IOptions<StripeSettings> stripeSettings,
        ILogger<StripeService> logger,
        IEmailService emailService)
    {
        _context = context;
        _stripeSettings = stripeSettings.Value;
        _logger = logger;
        _emailService = emailService;

        StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
    }

    public async Task<string> CreateCheckoutSessionAsync(Company company, string priceId, string successUrl, string cancelUrl)
    {
        // Ensure company has Stripe customer
        await GetOrCreateStripeCustomerAsync(company);

        var options = new SessionCreateOptions
        {
            Customer = company.StripeCustomerId,
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    Price = priceId,
                    Quantity = 1,
                }
            },
            Mode = "subscription",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            // IMPORTANT: Add metadata to link back to our company
            Metadata = new Dictionary<string, string>
            {
                { "companyId", company.Id.ToString() }
            },
            // Also add to subscription metadata
            SubscriptionData = new SessionSubscriptionDataOptions
            {
                Metadata = new Dictionary<string, string>
                {
                    { "companyId", company.Id.ToString() }
                }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return session.Url!;
    }

    public async Task<string> CreateCustomerPortalSessionAsync(Company company, string returnUrl)
    {
        if (string.IsNullOrEmpty(company.StripeCustomerId))
        {
            throw new InvalidOperationException("Company does not have a Stripe customer ID");
        }

        var options = new global::Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = company.StripeCustomerId,
            ReturnUrl = returnUrl,
        };

        var service = new global::Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options);

        return session.Url;
    }

    public async Task<Company?> GetOrCreateStripeCustomerAsync(Company company)
    {
        if (!string.IsNullOrEmpty(company.StripeCustomerId))
        {
            return company;
        }

        var customerOptions = new CustomerCreateOptions
        {
            Email = company.Email,
            Name = company.CompanyName,
            Metadata = new Dictionary<string, string>
            {
                { "companyId", company.Id.ToString() }
            }
        };

        var customerService = new CustomerService();
        var customer = await customerService.CreateAsync(customerOptions);

        company.StripeCustomerId = customer.Id;
        company.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created Stripe customer {CustomerId} for company {CompanyId}", 
            customer.Id, company.Id);

        return company;
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
                throwOnApiVersionMismatch: false  // Allow different API versions
            );
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe webhook signature verification failed");
            throw;
        }

        _logger.LogInformation("Processing Stripe event: {EventType}", stripeEvent.Type);

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
    }

    public string GetPriceIdForPlan(string plan)
    {
        // We only have Premium now
        return _stripeSettings.PremiumPriceId;
    }

    private SubscriptionPlan GetPlanFromPriceId(string priceId)
    {
        // Only Premium plan available
        return SubscriptionPlan.Premium;
    }

    private async Task HandleCheckoutSessionCompleted(Event stripeEvent)
    {
        var session = stripeEvent.Data.Object as Session;
        if (session == null) return;

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
        company.SubscriptionPlan = SubscriptionPlan.Premium; // We only have Premium plan
        company.SubscriptionStatus = SubscriptionStatus.Active;
        company.IsSubscriptionActive = true;
        company.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Send subscription purchased email
        try
        {
            await _emailService.SendSubscriptionPurchasedEmailAsync(company, "Premium");
        }
        catch (Exception emailEx)
        {
            _logger.LogWarning(emailEx, "Failed to send subscription email for company {CompanyId}", companyId);
        }

        _logger.LogInformation("Checkout completed for company {CompanyId}, subscription {SubscriptionId}",
            companyId, session.SubscriptionId);
    }

    private async Task HandleSubscriptionUpdated(Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as Subscription;
        if (subscription == null) return;

        var companyIdStr = subscription.Metadata?.GetValueOrDefault("companyId");
        if (string.IsNullOrEmpty(companyIdStr) || !Guid.TryParse(companyIdStr, out var companyId))
        {
            // Try to find by customer ID
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.StripeCustomerId == subscription.CustomerId);
            
            if (company == null)
            {
                _logger.LogWarning("Could not find company for subscription {SubscriptionId}", subscription.Id);
                return;
            }
            
            companyId = company.Id;
        }

        var targetCompany = await _context.Companies.FindAsync(companyId);
        if (targetCompany == null) return;

        var previousStatus = targetCompany.SubscriptionStatus.ToString();

        targetCompany.StripeSubscriptionId = subscription.Id;
        targetCompany.SubscriptionCurrentPeriodEnd = subscription.CurrentPeriodEnd;

        // Update subscription status based on Stripe status
        targetCompany.SubscriptionStatus = subscription.Status switch
        {
            "active" => SubscriptionStatus.Active,
            "past_due" => SubscriptionStatus.Suspended,
            "canceled" => SubscriptionStatus.Cancelled,
            "unpaid" => SubscriptionStatus.Suspended,
            "trialing" => SubscriptionStatus.Trial,
            _ => targetCompany.SubscriptionStatus
        };

        targetCompany.IsSubscriptionActive = subscription.Status == "active" || subscription.Status == "trialing";

        // Determine plan from price
        if (subscription.Items?.Data?.Any() == true)
        {
            var priceId = subscription.Items.Data[0].Price.Id;
            targetCompany.SubscriptionPlan = GetPlanFromPriceId(priceId);
        }

        targetCompany.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Send status change email if status actually changed
        var newStatus = targetCompany.SubscriptionStatus.ToString();
        if (previousStatus != newStatus)
        {
            try
            {
                await _emailService.SendSubscriptionStatusChangedEmailAsync(targetCompany, previousStatus, newStatus);
            }
            catch (Exception emailEx)
            {
                _logger.LogWarning(emailEx, "Failed to send status change email for company {CompanyId}", companyId);
            }
        }

        _logger.LogInformation("Subscription updated for company {CompanyId}: Status={Status}",
            companyId, subscription.Status);
    }

    private async Task HandleSubscriptionDeleted(Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as Subscription;
        if (subscription == null) return;

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

        await _context.SaveChangesAsync();

        // Send cancellation email
        try
        {
            await _emailService.SendSubscriptionStatusChangedEmailAsync(company, previousStatus, "Cancelled");
        }
        catch (Exception emailEx)
        {
            _logger.LogWarning(emailEx, "Failed to send cancellation email for company {CompanyId}", company.Id);
        }

        _logger.LogInformation("Subscription cancelled for company {CompanyId}", company.Id);
    }

    private async Task HandleInvoicePaymentSucceeded(Event stripeEvent)
    {
        var invoice = stripeEvent.Data.Object as Invoice;
        if (invoice == null || string.IsNullOrEmpty(invoice.SubscriptionId)) return;

        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.StripeSubscriptionId == invoice.SubscriptionId);
        
        if (company == null) return;

        company.SubscriptionStatus = SubscriptionStatus.Active;
        company.IsSubscriptionActive = true;
        company.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Payment succeeded for company {CompanyId}", company.Id);
    }

    private async Task HandleInvoicePaymentFailed(Event stripeEvent)
    {
        var invoice = stripeEvent.Data.Object as Invoice;
        if (invoice == null || string.IsNullOrEmpty(invoice.SubscriptionId)) return;

        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.StripeSubscriptionId == invoice.SubscriptionId);
        
        if (company == null) return;

        company.SubscriptionStatus = SubscriptionStatus.Suspended;
        company.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        _logger.LogWarning("Payment failed for company {CompanyId}", company.Id);
    }

    private async Task HandleChargeRefunded(Event stripeEvent)
    {
        var charge = stripeEvent.Data.Object as Charge;
        if (charge == null || !charge.Refunded) return;

        // Find company by customer ID
        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.StripeCustomerId == charge.CustomerId);
        
        if (company == null)
        {
            _logger.LogWarning("Company not found for refunded charge {ChargeId}", charge.Id);
            return;
        }

        // If fully refunded, cancel the subscription
        if (charge.AmountRefunded >= charge.Amount)
        {
            company.SubscriptionStatus = SubscriptionStatus.Cancelled;
            company.IsSubscriptionActive = false;
            company.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Full refund processed for company {CompanyId}, subscription cancelled", 
                company.Id);
        }
        else
        {
            _logger.LogInformation("Partial refund processed for company {CompanyId}", company.Id);
        }
    }
}
