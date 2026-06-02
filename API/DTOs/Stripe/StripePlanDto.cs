namespace API.DTOs.Stripe;

public class StripePlanDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PriceId { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Interval { get; set; } = string.Empty;
    public string[] Features { get; set; } = Array.Empty<string>();
}
