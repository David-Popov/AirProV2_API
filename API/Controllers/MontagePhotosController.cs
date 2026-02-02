using API.DTOs;
using API.Models;
using API.Services.MontagePhotos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MontagePhotosController : ControllerBase
{
    private readonly IMontagePhotoService _photoService;
    private readonly ILogger<MontagePhotosController> _logger;

    public MontagePhotosController(
        IMontagePhotoService photoService,
        ILogger<MontagePhotosController> logger)
    {
        _photoService = photoService;
        _logger = logger;
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
        try
        {
            // Validate file before processing
            var (isValid, fileError) = _photoService.ValidateFile(file);
            if (!isValid)
            {
                return BadRequest(new { message = fileError });
            }

            // Check if can add more photos
            var (canAdd, countError) = await _photoService.CanAddPhotoAsync(montageId);
            if (!canAdd)
            {
                return BadRequest(new { message = countError });
            }

            var result = await _photoService.UploadPhotoAsync(montageId, file, description, displayOrder);
            return CreatedAtAction(nameof(GetPhotoById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload photo for montage {MontageId}", montageId);
            return StatusCode(500, new { message = "Failed to upload photo" });
        }
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
        try
        {
            // Validate total count
            var currentCount = await _photoService.GetPhotoCountAsync(montageId);
            var totalAfterUpload = currentCount + files.Count;
            
            if (totalAfterUpload > ImageValidationConstants.MaxPhotosPerMontage)
            {
                var remaining = ImageValidationConstants.MaxPhotosPerMontage - currentCount;
                return BadRequest(new { 
                    message = $"Cannot upload {files.Count} photos. Only {remaining} more photo(s) can be added (max {ImageValidationConstants.MaxPhotosPerMontage} per montage)" 
                });
            }

            // Validate each file
            foreach (var file in files)
            {
                var (isValid, fileError) = _photoService.ValidateFile(file);
                if (!isValid)
                {
                    return BadRequest(new { message = $"File '{file.FileName}': {fileError}" });
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
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload photos for montage {MontageId}", montageId);
            return StatusCode(500, new { message = "Failed to upload photos" });
        }
    }

    /// <summary>
    /// Get all photos for a montage
    /// </summary>
    [HttpGet("montage/{montageId}")]
    [ProducesResponseType(typeof(List<MontagePhotoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<MontagePhotoDto>>> GetPhotosByMontage(Guid montageId)
    {
        try
        {
            var photos = await _photoService.GetPhotosByMontageIdAsync(montageId);
            return Ok(photos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get photos for montage {MontageId}", montageId);
            return StatusCode(500, new { message = "Failed to retrieve photos" });
        }
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
        try
        {
            var photo = await _photoService.GetPhotoByIdAsync(id);
            if (photo == null)
            {
                return NotFound(new { message = "Photo not found" });
            }
            return Ok(photo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get photo {PhotoId}", id);
            return StatusCode(500, new { message = "Failed to retrieve photo" });
        }
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
        try
        {
            var result = await _photoService.GetPhotoStreamAsync(id);
            if (result == null)
            {
                return NotFound(new { message = "Photo not found" });
            }

            var (stream, contentType, fileName) = result.Value;
            return File(stream, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download photo {PhotoId}", id);
            return StatusCode(500, new { message = "Failed to download photo" });
        }
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
        try
        {
            var result = await _photoService.UpdatePhotoMetadataAsync(id, dto.Description, dto.DisplayOrder);
            if (result == null)
            {
                return NotFound(new { message = "Photo not found" });
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update photo {PhotoId}", id);
            return StatusCode(500, new { message = "Failed to update photo" });
        }
    }

    /// <summary>
    /// Delete a photo
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeletePhoto(Guid id)
    {
        try
        {
            var result = await _photoService.DeletePhotoAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Photo not found" });
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete photo {PhotoId}", id);
            return StatusCode(500, new { message = "Failed to delete photo" });
        }
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
}

public class UpdateMontagePhotoMetadataDto
{
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
}
