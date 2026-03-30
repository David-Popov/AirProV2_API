using System.Text.Json.Serialization;
using API.Data.Entities;

namespace API.DTOs;

public class TrialActivationResultDto
{
    [JsonPropertyName("trial_end_date")]
    public DateTime TrialEndDate { get; set; }

    [JsonPropertyName("subscription_plan")]
    public string SubscriptionPlan { get; set; } = string.Empty;

    [JsonPropertyName("subscription_status")]
    public string SubscriptionStatus { get; set; } = string.Empty;

    /// <summary>
    /// The company entity — used by the controller to queue the trial activation email.
    /// Not serialized in the HTTP response.
    /// </summary>
    [JsonIgnore]
    public Company Company { get; set; } = null!;
}
