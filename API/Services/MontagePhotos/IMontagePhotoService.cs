using API.DTOs;

namespace API.Services.MontagePhotos;

public interface IMontagePhotoService
{
    /// <summary>
    /// Uploads a photo for a montage with validation
    /// </summary>
    Task<MontagePhotoDto> UploadPhotoAsync(Guid montageId, IFormFile file, string? description, int displayOrder);
    
    /// <summary>
    /// Gets all photos for a montage
    /// </summary>
    Task<List<MontagePhotoDto>> GetPhotosByMontageIdAsync(Guid montageId);
    
    /// <summary>
    /// Gets a photo by ID
    /// </summary>
    Task<MontagePhotoDto?> GetPhotoByIdAsync(Guid photoId);
    
    /// <summary>
    /// Gets the photo stream for downloading
    /// </summary>
    Task<(Stream stream, string contentType, string fileName)?> GetPhotoStreamAsync(Guid photoId);
    
    /// <summary>
    /// Deletes a photo
    /// </summary>
    Task<bool> DeletePhotoAsync(Guid photoId);
    
    /// <summary>
    /// Updates photo metadata (description, display order)
    /// </summary>
    Task<MontagePhotoDto?> UpdatePhotoMetadataAsync(Guid photoId, string? description, int displayOrder);
    
    /// <summary>
    /// Gets the count of photos for a montage
    /// </summary>
    Task<int> GetPhotoCountAsync(Guid montageId);
    
    /// <summary>
    /// Validates if more photos can be added to a montage
    /// </summary>
    Task<(bool canAdd, string? error)> CanAddPhotoAsync(Guid montageId);
    
    /// <summary>
    /// Validates the file for upload
    /// </summary>
    (bool isValid, string? error) ValidateFile(IFormFile file);
}
