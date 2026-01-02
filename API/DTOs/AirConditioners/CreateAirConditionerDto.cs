using System.Text.Json.Serialization;

namespace API.DTOs;

public class CreateAirConditionerDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("brand")]
    public string? Brand { get; set; }
    
    [JsonPropertyName("model")]
    public string? Model { get; set; }
    
    [JsonPropertyName("kilowatts")]
    public int? Kilowatts { get; set; }
    
    [JsonPropertyName("description")]
    public string? Description { get; set; }
    
    [JsonPropertyName("price")]
    public decimal? Price { get; set; }
    
    [JsonPropertyName("image_url")]
    public string? ImageUrl { get; set; }
}