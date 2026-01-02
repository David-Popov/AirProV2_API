using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Text.Json.Serialization;

namespace API.Common;

/// <summary>
/// Represents page parameters with validation
/// </summary>
[DebuggerDisplay("PageNumber: {" + nameof(PageNumber) + "}, PageSize: {" + nameof(PageSize) + "}")]
public class PageParameters
{
    /// <summary>
    /// Use for page number that is passed from frontend.
    /// </summary>
    [JsonPropertyName("pageNumber")]
    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Use for page size that is passed from frontend.
    /// </summary>
    [JsonPropertyName("pageSize")]
    [Range(1, MaxPageSize, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize { get; set; } = 20;

    /// <summary>
    /// Maximum allowed page size to prevent performance issues
    /// </summary>
    public const int MaxPageSize = 100;
}