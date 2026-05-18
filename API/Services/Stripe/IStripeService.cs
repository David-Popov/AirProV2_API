using API.DTOs.Stripe;

namespace API.Services.Stripe;

public interface IStripeService
{
    /// <summary>
    /// Build the publishable-key payload used by the frontend's Stripe Elements / Checkout init.
    /// </summary>
    StripeConfigDto GetConfig();

    /// <summary>
    /// Return the marketed Premium plan info (price, features, etc.) from configuration.
    /// </summary>
    StripePlanDto GetPremiumPlan();

    /// <summary>
    /// Create a Stripe Checkout session for the caller's company's Premium subscription.
    /// </summary>
    Task<CheckoutSessionResponseDto> CreateCheckoutSessionForUserAsync(string userId, string successUrl, string cancelUrl);

    /// <summary>
    /// Create a Stripe Billing Portal session so the caller can manage their existing subscription.
    /// </summary>
    Task<CheckoutSessionResponseDto> CreatePortalSessionForUserAsync(string userId, string returnUrl);

    /// <summary>
    /// Return the caller's company subscription status snapshot.
    /// </summary>
    Task<SubscriptionStatusDto> GetSubscriptionStatusForUserAsync(string userId);

    /// <summary>
    /// Move the caller's company back to the Free plan after trial expiration.
    /// Deactivates all employee accounts except Managers/Admins.
    /// </summary>
    Task<MessageResponseDto> ReturnCompanyToFreePlanAsync(string userId);

    /// <summary>
    /// Verify the Stripe webhook signature and dispatch the event. Idempotent — duplicate
    /// deliveries of the same Stripe event id are detected and ignored.
    /// </summary>
    Task HandleWebhookEventAsync(string json, string signature);
}
