using System.Text.Json.Serialization;

namespace API.DTOs;

public class UpdateSubscriptionDto
{
    [JsonPropertyName("subscription_plan")]
    public string SubscriptionPlan { get; set; } = string.Empty;

    [JsonPropertyName("subscription_status")]
    public string? SubscriptionStatus { get; set; }

    [JsonPropertyName("is_subscription_active")]
    public bool IsSubscriptionActive { get; set; }
}
