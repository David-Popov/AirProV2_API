using System.Text.Json.Serialization;

namespace API.DTOs;

public class UpdateMontageDto
{
    [JsonPropertyName("air_conditioner_id")]
    public Guid? AirConditionerId { get; set; }
    
    [JsonPropertyName("custom_ac_brand")]
    public string? CustomAcBrand { get; set; }
    
    [JsonPropertyName("custom_ac_model")]
    public string? CustomAcModel { get; set; }
    
    [JsonPropertyName("custom_ac_kilowatts")]
    public decimal? CustomAcKilowatts { get; set; }
    
    [JsonPropertyName("client_name")]
    public string ClientName { get; set; } = string.Empty;
    
    [JsonPropertyName("client_phone")]
    public string? ClientPhone { get; set; }
    
    [JsonPropertyName("client_email")]
    public string? ClientEmail { get; set; }
    
    [JsonPropertyName("client_address")]
    public string? ClientAddress { get; set; }
    
    [JsonPropertyName("client_city")]
    public string? ClientCity { get; set; }
    
    [JsonPropertyName("installation_date")]
    public DateOnly InstallationDate { get; set; }
    
    [JsonPropertyName("completion_date")]
    public DateOnly? CompletionDate { get; set; }
    
    [JsonPropertyName("status")]
    public string? Status { get; set; }
    
    [JsonPropertyName("indoor_unit_serial")]
    public string? IndoorUnitSerial { get; set; }
    
    [JsonPropertyName("outdoor_unit_serial")]
    public string? OutdoorUnitSerial { get; set; }
    
    [JsonPropertyName("total_price")]
    public decimal? TotalPrice { get; set; }
    
    [JsonPropertyName("paid_amount")]
    public decimal? PaidAmount { get; set; }
    
    [JsonPropertyName("payment_status")]
    public string? PaymentStatus { get; set; }
    
    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    /// <summary>
    /// New set of assigned workers. Honored only for manager/admin callers
    /// (reassignment); ignored for workers. Null = leave assignments unchanged.
    /// </summary>
    [JsonPropertyName("assigned_user_ids")]
    public List<string>? AssignedUserIds { get; set; }
}