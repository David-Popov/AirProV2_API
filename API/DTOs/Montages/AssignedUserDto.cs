using System.Text.Json.Serialization;

namespace API.DTOs;

/// <summary>
/// Lightweight representation of a worker assigned to a montage,
/// returned inside <see cref="MontageDto"/> so the client can display
/// assignee names without calling the manager-only employees endpoint.
/// </summary>
public class AssignedUserDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = string.Empty;
}
