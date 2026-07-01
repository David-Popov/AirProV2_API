using System.Text.Json.Serialization;

namespace API.DTOs;

/// <summary>
/// Aggregate statistics for the error-codes catalog (computed across the whole
/// dataset, not a single page).
/// </summary>
public class ErrorCodeStatsDto
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("with_solutions")]
    public int WithSolutions { get; set; }

    [JsonPropertyName("air_conditioners")]
    public int AirConditioners { get; set; }
}
