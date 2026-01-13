using API.Data.Entities;

namespace API.Services.Stripe;

public interface IStripeService
{
    Task<string> CreateCheckoutSessionAsync(Company company, string priceId, string successUrl, string cancelUrl);
    Task<string> CreateCustomerPortalSessionAsync(Company company, string returnUrl);
    Task HandleWebhookEventAsync(string json, string signature);
    Task<Company?> GetOrCreateStripeCustomerAsync(Company company);
    string GetPriceIdForPlan(string plan);
}
