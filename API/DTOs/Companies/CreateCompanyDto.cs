using System.Text.Json.Serialization;

namespace API.DTOs;

public class CreateCompanyDto
{
    [JsonPropertyName("company_name")]
    public string CompanyName { get; set; } = string.Empty;
    
    [JsonPropertyName("company_type")]
    public string CompanyType { get; set; } = string.Empty;
    
    [JsonPropertyName("bulstat")]
    public string? Bulstat { get; set; }
    
    [JsonPropertyName("vat_number")]
    public string? VatNumber { get; set; }
    
    [JsonPropertyName("is_vat_registered")]
    public bool? IsVatRegistered { get; set; }
    
    [JsonPropertyName("address")]
    public string? Address { get; set; }
    
    [JsonPropertyName("city")]
    public string? City { get; set; }
    
    [JsonPropertyName("postal_code")]
    public string? PostalCode { get; set; }
    
    [JsonPropertyName("phone")]
    public string? Phone { get; set; }
    
    [JsonPropertyName("email")]
    public string? Email { get; set; }
    
    [JsonPropertyName("is_company_owner")]
    public bool IsCompanyOwner { get; set; }
    
    [JsonPropertyName("warranty_default_months")]
    public int? WarrantyDefaultMonths { get; set; }
    
    [JsonPropertyName("subscription_plan")]
    public string? SubscriptionPlan { get; set; }
}