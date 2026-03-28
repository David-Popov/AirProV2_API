using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace API.DTOs.Auth;

public class UpdateProfileDto
{
    [Required]
    [StringLength(50, MinimumLength = 2)]
    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [StringLength(50)]
    [JsonPropertyName("middle_name")]
    public string? MiddleName { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    [JsonPropertyName("last_name")]
    public string LastName { get; set; } = string.Empty;

    [Phone]
    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }
}
