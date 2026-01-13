namespace API.Models;

public class StripeSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    
    // Premium plan price ID (€4.99/month)
    public string PremiumPriceId { get; set; } = string.Empty;
}
