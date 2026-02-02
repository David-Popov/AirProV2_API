using System.Text.Json.Serialization;

namespace API.DTOs;

public class CreateInventoryItemDto
{
    [JsonPropertyName("company_id")]
    public Guid CompanyId { get; set; }
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("description")]
    public string? Description { get; set; }
    
    [JsonPropertyName("sku")]
    public string? Sku { get; set; }
    
    [JsonPropertyName("quantity")]
    public decimal Quantity { get; set; }
    
    [JsonPropertyName("unit_of_measure")]
    public string UnitOfMeasure { get; set; } = string.Empty;
    
    [JsonPropertyName("min_quantity")]
    public decimal? MinQuantity { get; set; }
    
    [JsonPropertyName("unit_price")]
    public decimal? UnitPrice { get; set; }
    
    [JsonPropertyName("supplier")]
    public string? Supplier { get; set; }
    
    [JsonPropertyName("location")]
    public string? Location { get; set; }
    
    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonIgnore]
    public string? UserId { get; set; }
}
