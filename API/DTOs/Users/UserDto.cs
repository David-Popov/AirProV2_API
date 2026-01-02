using System.Text.Json.Serialization;

namespace API.DTOs;

public class UserDto
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
    
    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }
    
    [JsonPropertyName("address")]
    public string? Address { get; set; }
    
    [JsonPropertyName("company_id")]
    public string? CompanyId { get; set; }
}