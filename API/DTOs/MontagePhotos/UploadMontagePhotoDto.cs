using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;

namespace API.DTOs;

public class UploadMontagePhotoDto
{
    [JsonPropertyName("description")]
    public string? Description { get; set; }
    
    [JsonPropertyName("display_order")]
    public int DisplayOrder { get; set; }
}
