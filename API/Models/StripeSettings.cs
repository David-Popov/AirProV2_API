namespace API.Models;

public class StripeSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;

    public string PremiumPriceId { get; set; } = string.Empty;

    public StripePlanInfo PremiumPlan { get; set; } = new();
}

public class StripePlanInfo
{
    public string Id { get; set; } = "premium";
    public string Name { get; set; } = "Premium";
    public decimal Price { get; set; } = 4.99m;
    public string Currency { get; set; } = "EUR";
    public string Interval { get; set; } = "month";
    public string[] Features { get; set; } = Array.Empty<string>();
}
