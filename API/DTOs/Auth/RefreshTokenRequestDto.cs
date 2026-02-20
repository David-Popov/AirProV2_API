using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace API.DTOs;

public class RefreshTokenRequestDto
{
    [Required]
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = string.Empty;
}
