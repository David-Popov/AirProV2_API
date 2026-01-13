using System.Text.Json.Serialization;

namespace API.DTOs;

public class MontagePhotoDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }
    
    [JsonPropertyName("montage_id")]
    public Guid MontageId { get; set; }
    
    [JsonPropertyName("file_name")]
    public string FileName { get; set; } = string.Empty;
    
    [JsonPropertyName("original_file_name")]
    public string OriginalFileName { get; set; } = string.Empty;
    
    [JsonPropertyName("content_type")]
    public string ContentType { get; set; } = string.Empty;
    
    [JsonPropertyName("file_size")]
    public long FileSize { get; set; }
    
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;
    
    [JsonPropertyName("description")]
    public string? Description { get; set; }
    
    [JsonPropertyName("display_order")]
    public int DisplayOrder { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
}
