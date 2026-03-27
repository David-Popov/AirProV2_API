using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace API.DTOs.Auth;

public class RequestEmailChangeDto
{
    [Required]
    [EmailAddress]
    [JsonPropertyName("new_email")]
    public string NewEmail { get; set; } = string.Empty;
}
