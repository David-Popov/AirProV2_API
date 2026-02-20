using System.Security.Claims;
using API.Data;
using API.Data.Entities;
using API.Models;
using API.Services.Stripe;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StripeController : ControllerBase
{
    private readonly IStripeService _stripeService;
    private readonly ApplicationDbContext _context;
    private readonly StripeSettings _stripeSettings;
    private readonly string _frontendBaseUrl;
    private readonly ILogger<StripeController> _logger;

    public StripeController(
        IStripeService stripeService,
        ApplicationDbContext context,
        IOptions<StripeSettings> stripeSettings,
        IOptions<EmailSettings> emailSettings,
        ILogger<StripeController> logger)
    {
        _stripeService = stripeService;
        _context = context;
        _stripeSettings = stripeSettings.Value;
        _frontendBaseUrl = emailSettings.Value.WebsiteUrl.TrimEnd('/');
        _logger = logger;
    }

    /// <summary>
    /// Get Stripe publishable key for frontend
    /// </summary>
    [HttpGet("config")]
    public IActionResult GetConfig()
    {
        return Ok(new
        {
            publishableKey = _stripeSettings.PublishableKey
        });
    }

    /// <summary>
    /// Get Premium plan info (single plan at €4.99/month)
    /// </summary>
    [HttpGet("plan")]
    public IActionResult GetPlan()
    {
        var plan = new
        {
            id = "premium",
            name = "Premium",
            priceId = _stripeSettings.PremiumPriceId,
            price = 4.99m,
            currency = "EUR",
            interval = "month",
            features = new[] 
            { 
                "Unlimited montages",
                "Advanced inventory management",
                "Full team management",
                "Priority support",
                "All premium features"
            }
        };

        return Ok(plan);
    }

    /// <summary>
    /// Create a checkout session for Premium subscription
    /// </summary>
    [HttpPost("create-checkout-session")]
    [Authorize]
    public async Task<IActionResult> CreateCheckoutSession()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var user = await _context.Users
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Company == null)
        {
            return BadRequest(new { message = "User does not belong to a company" });
        }

        if (string.IsNullOrEmpty(_stripeSettings.PremiumPriceId))
        {
            return BadRequest(new { message = "Premium plan is not configured. Please set PremiumPriceId in appsettings.json" });
        }

        try
        {
            var successUrl = $"{_frontendBaseUrl}/settings?tab=subscription&success=true";
            var cancelUrl = $"{_frontendBaseUrl}/settings?tab=subscription";

            var checkoutUrl = await _stripeService.CreateCheckoutSessionAsync(
                user.Company, 
                _stripeSettings.PremiumPriceId, 
                successUrl, 
                cancelUrl);

            return Ok(new { url = checkoutUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create checkout session for company {CompanyId}", user.Company.Id);
            return BadRequest(new { message = "Failed to create checkout session. Please try again." });
        }
    }

    /// <summary>
    /// Create a customer portal session for managing subscription
    /// </summary>
    [HttpPost("create-portal-session")]
    [Authorize]
    public async Task<IActionResult> CreatePortalSession()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var user = await _context.Users
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Company == null)
        {
            return BadRequest(new { message = "User does not belong to a company" });
        }

        if (string.IsNullOrEmpty(user.Company.StripeCustomerId))
        {
            return BadRequest(new { message = "No subscription found. Please subscribe first." });
        }

        try
        {
            var returnUrl = $"{_frontendBaseUrl}/settings?tab=subscription";
            var portalUrl = await _stripeService.CreateCustomerPortalSessionAsync(user.Company, returnUrl);

            return Ok(new { url = portalUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create portal session for company {CompanyId}", user.Company.Id);
            return BadRequest(new { message = "Failed to open customer portal. Please try again." });
        }
    }

    /// <summary>
    /// Get current subscription status
    /// </summary>
    [HttpGet("subscription-status")]
    [Authorize]
    public async Task<IActionResult> GetSubscriptionStatus()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var user = await _context.Users
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Company == null)
        {
            return BadRequest(new { message = "User does not belong to a company" });
        }

        var company = user.Company;
        
        return Ok(new
        {
            plan = company.SubscriptionPlan.ToString(),
            status = company.SubscriptionStatus.ToString(),
            isActive = company.IsSubscriptionActive ?? false,
            currentPeriodEnd = company.SubscriptionCurrentPeriodEnd,
            trialEndDate = company.TrialEndDate,
            hasStripeSubscription = !string.IsNullOrEmpty(company.StripeSubscriptionId)
        });
    }

    /// <summary>
    /// Return to Free plan after trial expiration - deactivates all employees
    /// </summary>
    [HttpPost("return-to-free")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> ReturnToFreePlan()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var user = await _context.Users
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Company == null)
        {
            return BadRequest(new { message = "User does not belong to a company" });
        }

        var company = user.Company;

        // Only allow if subscription is expired or cancelled
        if (company.SubscriptionStatus != SubscriptionStatus.Expired &&
            company.SubscriptionStatus != SubscriptionStatus.Cancelled)
        {
            return BadRequest(new { message = "This action is only available when subscription is expired or cancelled" });
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _logger.LogInformation($"Returning company {company.CompanyName} ({company.Id}) to Free plan");

            // Deactivate all employees (User role only, not Manager)
            var users = await _context.Users
                .Where(u => u.CompanyId == company.Id)
                .ToListAsync();

            var userManager = HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();

            int deactivatedCount = 0;
            foreach (var emp in users)
            {
                var roles = await userManager.GetRolesAsync(emp);
                if (!roles.Contains("Manager"))
                {
                    emp.IsActive = false;
                    _context.Entry(emp).State = EntityState.Modified;
                    deactivatedCount++;
                    _logger.LogInformation($"Deactivating user: {emp.Email} (ID: {emp.Id})");
                }
            }

            _logger.LogInformation($"Total users to deactivate: {deactivatedCount}");

            // Move to Free plan
            company.SubscriptionPlan = SubscriptionPlan.Free;
            company.SubscriptionStatus = SubscriptionStatus.Active;
            company.IsSubscriptionActive = true;
            company.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation(
                $"Successfully moved company {company.CompanyName} to Free plan. " +
                $"All employees deactivated. Manager can reactivate up to 2 employees.");

            return Ok(new { message = "Successfully returned to Free plan. All employees have been deactivated." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, $"Failed to return company {company.CompanyName} ({company.Id}) to Free plan");
            return BadRequest(new { message = "Failed to return to Free plan. Please try again." });
        }
    }

    /// <summary>
    /// Stripe webhook endpoint
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        _logger.LogInformation("=== WEBHOOK RECEIVED ===");
        
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].ToString();

        _logger.LogInformation("Webhook body length: {Length}", json.Length);
        _logger.LogInformation("Webhook signature present: {HasSignature}", !string.IsNullOrEmpty(signature));

        if (string.IsNullOrEmpty(signature))
        {
            _logger.LogWarning("Webhook received without Stripe signature");
            return BadRequest(new { message = "Missing Stripe signature" });
        }

        try
        {
            _logger.LogInformation("Calling HandleWebhookEventAsync...");
            await _stripeService.HandleWebhookEventAsync(json, signature);
            _logger.LogInformation("=== WEBHOOK PROCESSED SUCCESSFULLY ===");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "=== WEBHOOK PROCESSING FAILED ===");
            return BadRequest(new { message = "Webhook processing failed", error = ex.Message });
        }
    }
}
