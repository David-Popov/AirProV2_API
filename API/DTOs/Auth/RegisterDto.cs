using System.Text.Json.Serialization;

namespace API.DTOs;

/// <summary>
/// DTO for user registration with company data
/// </summary>
public class RegisterDto
{
    // User Information
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
    
    [JsonPropertyName("confirm_password")]
    public string ConfirmPassword { get; set; } = string.Empty;
    
    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;
    
    [JsonPropertyName("middle_name")]
    public string? MiddleName { get; set; }
    
    [JsonPropertyName("last_name")]
    public string LastName { get; set; } = string.Empty;
    
    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }
    
    [JsonPropertyName("address")]
    public string? Address { get; set; }
    
    // Company Information
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
    
    [JsonPropertyName("company_address")]
    public string? CompanyAddress { get; set; }
    
    [JsonPropertyName("company_city")]
    public string? CompanyCity { get; set; }
    
    [JsonPropertyName("company_postal_code")]
    public string? CompanyPostalCode { get; set; }
    
    [JsonPropertyName("company_phone")]
    public string? CompanyPhone { get; set; }
    
    [JsonPropertyName("company_email")]
    public string? CompanyEmail { get; set; }
}
