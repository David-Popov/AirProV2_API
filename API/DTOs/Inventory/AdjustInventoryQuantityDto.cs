using System.Text.Json.Serialization;

namespace API.DTOs;

/// <summary>
/// DTO for adjusting inventory quantity (add or subtract)
/// </summary>
public class AdjustInventoryQuantityDto
{
    /// <summary>
    /// The amount to adjust. Positive to add, negative to subtract.
    /// For example: -1.5 to reduce copper pipes by 1.5 meters
    /// </summary>
    [JsonPropertyName("adjustment_amount")]
    public decimal AdjustmentAmount { get; set; }
    
    /// <summary>
    /// Optional reason for the adjustment (e.g., "Used in montage", "Restocked")
    /// </summary>
    [JsonPropertyName("reason")]
    public string? Reason { get; set; }

    [JsonIgnore]
    public string? UserId { get; set; }
}
