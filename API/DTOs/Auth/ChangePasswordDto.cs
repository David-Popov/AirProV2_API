using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace API.DTOs.Auth;

public class ChangePasswordDto
{
    [Required]
    [StringLength(100, MinimumLength = 6)]
    [JsonPropertyName("new_password")]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    [JsonPropertyName("confirm_password")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
