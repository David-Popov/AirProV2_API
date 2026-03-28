using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace API.DTOs.Auth;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
}
