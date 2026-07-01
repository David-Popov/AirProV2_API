using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace API.DTOs;

public class ErrorCodeDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [JsonPropertyName("air_conditioner_id")]
    public Guid? AirConditionerId { get; set; }

    [JsonPropertyName("air_conditioner_name")]
    public string? AirConditionerName { get; set; }

    [Required]
    [JsonPropertyName("error_code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("error_name")]
    public string? ErrorName { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("solution")]
    public string? Solution { get; set; }

    [JsonPropertyName("severity")]
    public string? Severity { get; set; }
}