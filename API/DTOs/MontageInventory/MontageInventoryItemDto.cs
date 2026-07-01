using System.Text.Json.Serialization;

namespace API.DTOs;

/// <summary>
/// DTO for displaying a material used in a montage
/// </summary>
public class MontageInventoryItemDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }
    
    [JsonPropertyName("montage_id")]
    public Guid MontageId { get; set; }
    
    [JsonPropertyName("inventory_item_id")]
    public Guid InventoryItemId { get; set; }
    
    [JsonPropertyName("quantity_used")]
    public decimal QuantityUsed { get; set; }
    
    [JsonPropertyName("unit_price_at_time")]
    public decimal? UnitPriceAtTime { get; set; }
    
    [JsonPropertyName("notes")]
    public string? Notes { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("item_name")]
    public string? ItemName { get; set; }
    
    [JsonPropertyName("item_sku")]
    public string? ItemSku { get; set; }
    
    [JsonPropertyName("unit_of_measure")]
    public string? UnitOfMeasure { get; set; }

    /// <summary>
    /// Whether the referenced inventory item is currently active.
    /// Null when the inventory item no longer exists.
    /// </summary>
    [JsonPropertyName("item_is_active")]
    public bool? ItemIsActive { get; set; }
}

/// <summary>
/// DTO for adding a single material to a montage
/// </summary>
public class AddMaterialToMontageRequest
{
    [JsonPropertyName("inventory_item_id")]
    public Guid InventoryItemId { get; set; }
    
    [JsonPropertyName("quantity_used")]
    public decimal QuantityUsed { get; set; }
    
    [JsonPropertyName("notes")]
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for adding multiple materials to a montage at once
/// </summary>
public class AddMaterialsToMontageRequest
{
    [JsonPropertyName("materials")]
    public List<AddMaterialToMontageRequest> Materials { get; set; } = new();

    [JsonIgnore]
    public string? UserId { get; set; }
}
