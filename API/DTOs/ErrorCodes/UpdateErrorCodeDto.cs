using System.Text.Json.Serialization;

namespace API.DTOs;

public class UpdateErrorCodeDto
{
    [JsonPropertyName("air_conditioner_id")]
    public Guid? AirConditionerId { get; set; }
    
    [JsonPropertyName("code")]
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