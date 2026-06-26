using System.Text.Json.Serialization;

namespace API.DTOs;

public class CompanyDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
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

    [JsonPropertyName("subscription_plan")]
    public string SubscriptionPlan { get; set; } = string.Empty;

    [JsonPropertyName("subscription_status")]
    public string SubscriptionStatus { get; set; } = string.Empty;

    [JsonPropertyName("trial_end_date")]
    public DateTime? TrialEndDate { get; set; }

    [JsonPropertyName("is_subscription_active")]
    public bool? IsSubscriptionActive { get; set; }

    [JsonPropertyName("last_activity_at")]
    public DateTime? LastActivityAt { get; set; }

    [JsonPropertyName("is_active")]
    public bool? IsActive { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [JsonPropertyName("updated_at")]
    public DateTime? UpdatedAt { get; set; }
    
    [JsonPropertyName("users_count")]
    public int UsersCount { get; set; }
}