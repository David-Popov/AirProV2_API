using System.Text.Json.Serialization;

namespace API.DTOs;

public class AuthResponseDto
{
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;
    
    [JsonPropertyName("token_expiration")]
    public DateTime TokenExpiration { get; set; }

    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = string.Empty;
    
    [JsonPropertyName("user")]
    public AuthUserDto User { get; set; } = new();
}

public class AuthUserDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    
    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;
    
    [JsonPropertyName("middle_name")]
    public string? MiddleName { get; set; }
    
    [JsonPropertyName("last_name")]
    public string LastName { get; set; } = string.Empty;
    
    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = string.Empty;
    
    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }
    
    [JsonPropertyName("company_id")]
    public Guid? CompanyId { get; set; }
    
    [JsonPropertyName("company_name")]
    public string? CompanyName { get; set; }
    
    [JsonPropertyName("subscription_plan")]
    public string? SubscriptionPlan { get; set; }

    [JsonPropertyName("subscription_status")]
    public string? SubscriptionStatus { get; set; }

    [JsonPropertyName("trial_end_date")]
    public DateTime? TrialEndDate { get; set; }

    [JsonPropertyName("must_change_password")]
    public bool MustChangePassword { get; set; }

    [JsonPropertyName("roles")]
    public List<string> Roles { get; set; } = new();
}
