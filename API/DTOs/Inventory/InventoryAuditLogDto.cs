using System.Text.Json.Serialization;

namespace API.DTOs;

public class InventoryAuditLogDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("company_id")]
    public Guid CompanyId { get; set; }

    [JsonPropertyName("inventory_item_id")]
    public Guid InventoryItemId { get; set; }

    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;

    [JsonPropertyName("user_id")]
    public string? UserId { get; set; }

    // User details object to match frontend expectation
    [JsonPropertyName("user")]
    public AuditUserDto? User { get; set; }

    [JsonPropertyName("quantity_before")]
    public decimal? QuantityBefore { get; set; }

    [JsonPropertyName("quantity_after")]
    public decimal? QuantityAfter { get; set; }

    [JsonPropertyName("quantity_changed")]
    public decimal? QuantityChanged { get; set; }

    [JsonPropertyName("reason")]
    public string? Reason { get; set; }

    [JsonPropertyName("related_montage_id")]
    public Guid? RelatedMontageId { get; set; }

    [JsonPropertyName("related_montage")]
    public AuditMontageDto? RelatedMontage { get; set; }

    [JsonPropertyName("inventory_item")]
    public AuditInventoryItemDto? InventoryItem { get; set; }

    [JsonPropertyName("details")]
    public string? Details { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
}

public class AuditUserDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("full_name")]
    public string? FullName { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }
}

public class AuditMontageDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("client_name")]
    public string ClientName { get; set; } = string.Empty;
}

public class AuditInventoryItemDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("sku")]
    public string? Sku { get; set; }
}
