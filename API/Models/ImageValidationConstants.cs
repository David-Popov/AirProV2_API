namespace API.Models;

public static class ImageValidationConstants
{
    /// <summary>
    /// Maximum number of photos allowed per montage
    /// </summary>
    public const int MaxPhotosPerMontage = 5;
    
    /// <summary>
    /// Maximum file size in bytes (5 MB)
    /// </summary>
    public const long MaxFileSizeBytes = 5 * 1024 * 1024;
    
    /// <summary>
    /// Maximum file size in MB for display purposes
    /// </summary>
    public const int MaxFileSizeMB = 5;
    
    /// <summary>
    /// Allowed content types for image uploads
    /// </summary>
    public static readonly string[] AllowedContentTypes = new[]
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    };
    
    /// <summary>
    /// Allowed file extensions for image uploads
    /// </summary>
    public static readonly string[] AllowedExtensions = new[]
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };
}
