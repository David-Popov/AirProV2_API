using System.Text.Json.Serialization;

namespace API.DTOs;

public class EmployeeLimitsDto
{
    [JsonPropertyName("current_count")]
    public int CurrentCount { get; set; }

    [JsonPropertyName("max_count")]
    public int MaxCount { get; set; }

    [JsonPropertyName("can_add_more")]
    public bool CanAddMore { get; set; }

    [JsonPropertyName("subscription_plan")]
    public string SubscriptionPlan { get; set; } = string.Empty;
}
