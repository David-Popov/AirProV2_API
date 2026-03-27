using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace API.DTOs.Auth;

public class ConfirmEmailDto
{
    [Required]
    [JsonPropertyName("user_id")]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;
}
