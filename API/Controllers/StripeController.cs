using API.Common;
using API.Constants;
using API.DTOs.Stripe;
using API.Models;
using API.Services.Stripe;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StripeController : ApiControllerBase
{
    private readonly IStripeService _stripeService;
    private readonly string _frontendBaseUrl;
    private readonly ILogger<StripeController> _logger;

    public StripeController(
        IStripeService stripeService,
        IOptions<EmailSettings> emailSettings,
        ILogger<StripeController> logger)
    {
        _stripeService = stripeService;
        _frontendBaseUrl = emailSettings.Value.WebsiteUrl.TrimEnd('/');
        _logger = logger;
    }

    /// <summary>
    /// Get Stripe publishable key for frontend.
    /// </summary>
    [HttpGet("config")]
    [ProducesResponseType(typeof(StripeConfigDto), StatusCodes.Status200OK)]
    public ActionResult<StripeConfigDto> GetConfig() => Ok(_stripeService.GetConfig());

    /// <summary>
    /// Get Premium plan info (single plan).
    /// </summary>
    [HttpGet("plan")]
    [ProducesResponseType(typeof(StripePlanDto), StatusCodes.Status200OK)]
    public ActionResult<StripePlanDto> GetPlan() => Ok(_stripeService.GetPremiumPlan());

    /// <summary>
    /// Create a checkout session for Premium subscription.
    /// </summary>
    [HttpPost("create-checkout-session")]
    [Authorize]
    [ProducesResponseType(typeof(CheckoutSessionResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CheckoutSessionResponseDto>> CreateCheckoutSession()
    {
        var userId = GetCurrentUserId();
        var successUrl = $"{_frontendBaseUrl}/settings?tab=subscription&success=true";
        var cancelUrl = $"{_frontendBaseUrl}/settings?tab=subscription";

        var result = await _stripeService.CreateCheckoutSessionForUserAsync(userId!, successUrl, cancelUrl);
        return Ok(result);
    }

    /// <summary>
    /// Create a customer portal session for managing subscription.
    /// </summary>
    [HttpPost("create-portal-session")]
    [Authorize]
    [ProducesResponseType(typeof(CheckoutSessionResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CheckoutSessionResponseDto>> CreatePortalSession()
    {
        var userId = GetCurrentUserId();
        var returnUrl = $"{_frontendBaseUrl}/settings?tab=subscription";

        var result = await _stripeService.CreatePortalSessionForUserAsync(userId!, returnUrl);
        return Ok(result);
    }

    /// <summary>
    /// Get current subscription status.
    /// </summary>
    [HttpGet("subscription-status")]
    [Authorize]
    [ProducesResponseType(typeof(SubscriptionStatusDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SubscriptionStatusDto>> GetSubscriptionStatus()
    {
        var userId = GetCurrentUserId();
        var result = await _stripeService.GetSubscriptionStatusForUserAsync(userId!);
        return Ok(result);
    }

    /// <summary>
    /// Return to Free plan after trial expiration — deactivates non-manager employees.
    /// </summary>
    [HttpPost("return-to-free")]
    [Authorize(Roles = AppRoles.Manager)]
    [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<MessageResponseDto>> ReturnToFreePlan()
    {
        var userId = GetCurrentUserId();
        var result = await _stripeService.ReturnCompanyToFreePlanAsync(userId!);
        return Ok(result);
    }

    /// <summary>
    /// Stripe webhook endpoint. Signature is verified inside the service; replays are deduped.
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].ToString();

        if (string.IsNullOrEmpty(signature))
        {
            _logger.LogWarning("Webhook received without Stripe signature");
            return BadRequest();
        }

        await _stripeService.HandleWebhookEventAsync(json, signature);
        return Ok();
    }
}
