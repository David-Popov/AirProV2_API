using ValidationException = FluentValidation.ValidationException;
using API.Common;
using API.DTOs;
using API.DTOs.MontagePhotos;
using API.Models;
using API.Services.MontagePhotos;
using API.Services.Montages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class MontagePhotosController : ApiControllerBase
{
    private readonly IMontagePhotoService _photoService;
    private readonly IMontageService _montageService;

    public MontagePhotosController(IMontagePhotoService photoService, IMontageService montageService)
    {
        _photoService = photoService;
        _montageService = montageService;
    }

    /// <summary>
    /// Upload a photo for a montage
    /// </summary>
    [HttpPost("montage/{montageId}")]
    [ProducesResponseType(typeof(MontagePhotoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MontagePhotoDto>> UploadPhoto(
        Guid montageId,
        IFormFile file,
        [FromForm] string? description = null,
        [FromForm] int displayOrder = 0)
    {
        await EnsureCanAccessMontageAsync(montageId);

        // Validate file before processing
        var (isValid, fileError) = _photoService.ValidateFile(file);
        if (!isValid)
        {
            throw new ValidationException(fileError);
        }

        // Check if can add more photos
        var (canAdd, countError) = await _photoService.CanAddPhotoAsync(montageId);
        if (!canAdd)
        {
            throw new ValidationException(countError);
        }

        var result = await _photoService.UploadPhotoAsync(montageId, file, description, displayOrder);
        return CreatedAtAction(nameof(GetPhotoById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Upload multiple photos for a montage (up to 5 total)
    /// </summary>
    [HttpPost("montage/{montageId}/batch")]
    [ProducesResponseType(typeof(List<MontagePhotoDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<MontagePhotoDto>>> UploadPhotos(
        Guid montageId,
        List<IFormFile> files,
        [FromForm] string? description = null)
    {
        await EnsureCanAccessMontageAsync(montageId);

        // Validate total count
        var currentCount = await _photoService.GetPhotoCountAsync(montageId);
        var totalAfterUpload = currentCount + files.Count;

        if (totalAfterUpload > ImageValidationConstants.MaxPhotosPerMontage)
        {
            var remaining = ImageValidationConstants.MaxPhotosPerMontage - currentCount;
            throw new ValidationException(
                $"Cannot upload {files.Count} photos. Only {remaining} more photo(s) can be added (max {ImageValidationConstants.MaxPhotosPerMontage} per montage)");
        }

        // Validate each file
        foreach (var file in files)
        {
            var (isValid, fileError) = _photoService.ValidateFile(file);
            if (!isValid)
            {
                throw new ValidationException($"File '{file.FileName}': {fileError}");
            }
        }

        var results = new List<MontagePhotoDto>();
        var displayOrder = currentCount;

        foreach (var file in files)
        {
            var result = await _photoService.UploadPhotoAsync(montageId, file, description, displayOrder++);
            results.Add(result);
        }

        return CreatedAtAction(nameof(GetPhotosByMontage), new { montageId }, results);
    }

    /// <summary>
    /// Get all photos for a montage
    /// </summary>
    [HttpGet("montage/{montageId}")]
    [ProducesResponseType(typeof(List<MontagePhotoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<MontagePhotoDto>>> GetPhotosByMontage(Guid montageId)
    {
        await EnsureCanAccessMontageAsync(montageId);
        var photos = await _photoService.GetPhotosByMontageIdAsync(montageId);
        return Ok(photos);
    }

    /// <summary>
    /// Get photo metadata by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MontagePhotoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MontagePhotoDto>> GetPhotoById(Guid id)
    {
        var photo = await _photoService.GetPhotoByIdAsync(id);
        if (photo == null)
        {
            throw new NotFoundException("Photo not found");
        }
        return Ok(photo);
    }

    /// <summary>
    /// Download a photo file
    /// </summary>
    [HttpGet("{id}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DownloadPhoto(Guid id)
    {
        var result = await _photoService.GetPhotoStreamAsync(id);
        if (result == null)
        {
            throw new NotFoundException("Photo not found");
        }

        var (stream, contentType, fileName) = result.Value;
        return File(stream, contentType, fileName);
    }

    /// <summary>
    /// Update photo metadata
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(MontagePhotoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MontagePhotoDto>> UpdatePhotoMetadata(
        Guid id,
        [FromBody] UpdateMontagePhotoMetadataDto dto)
    {
        var result = await _photoService.UpdatePhotoMetadataAsync(id, dto.Description, dto.DisplayOrder);
        if (result == null)
        {
            throw new NotFoundException("Photo not found");
        }
        return Ok(result);
    }

    /// <summary>
    /// Delete a photo
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager,Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeletePhoto(Guid id)
    {
        var result = await _photoService.DeletePhotoAsync(id);
        if (!result)
        {
            throw new NotFoundException("Photo not found");
        }
        return NoContent();
    }

    /// <summary>
    /// Get validation info for photo uploads
    /// </summary>
    [HttpGet("validation-info")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public ActionResult GetValidationInfo()
    {
        return Ok(new
        {
            maxPhotosPerMontage = ImageValidationConstants.MaxPhotosPerMontage,
            maxFileSizeMB = ImageValidationConstants.MaxFileSizeMB,
            maxFileSizeBytes = ImageValidationConstants.MaxFileSizeBytes,
            allowedContentTypes = ImageValidationConstants.AllowedContentTypes,
            allowedExtensions = ImageValidationConstants.AllowedExtensions
        });
    }

    /// <summary>
    /// Workers may only access montages they are assigned to; managers/admins any in their company.
    /// Guards the montage-scoped endpoints; the photo-id endpoints are protected because their
    /// GUIDs are only obtainable through the now-guarded montage/photo listings.
    /// </summary>
    private async Task EnsureCanAccessMontageAsync(Guid montageId)
    {
        var companyId = GetCurrentUserCompanyId();
        var montage = await _montageService.GetByIdAsync(montageId);
        if (companyId == null || montage == null || montage.CompanyId != companyId ||
            (!IsManagerOrAdmin() && !montage.AssignedUserIds.Contains(GetCurrentUserId()!)))
        {
            throw new NotFoundException("Montage not found");
        }
    }
}
