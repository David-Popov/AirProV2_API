using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace API.Services.MontagePhotos;

public class MontagePhotoService : IMontagePhotoService
{
    private readonly ApplicationDbContext _context;
    private readonly IMinioClient _minioClient;
    private readonly MinioSettings _minioSettings;
    private readonly ILogger<MontagePhotoService> _logger;

    public MontagePhotoService(
        ApplicationDbContext context,
        IMinioClient minioClient,
        IOptions<MinioSettings> minioSettings,
        ILogger<MontagePhotoService> logger)
    {
        _context = context;
        _minioClient = minioClient;
        _minioSettings = minioSettings.Value;
        _logger = logger;
    }

    public async Task<MontagePhotoDto> UploadPhotoAsync(Guid montageId, IFormFile file, string? description, int displayOrder)
    {
        var montageExists = await _context.Montages.AnyAsync(m => m.Id == montageId);
        if (!montageExists)
        {
            throw new InvalidOperationException("Montage not found");
        }

        var (canAdd, countError) = await CanAddPhotoAsync(montageId);
        if (!canAdd)
        {
            throw new InvalidOperationException(countError);
        }

        var (isValid, fileError) = ValidateFile(file);
        if (!isValid)
        {
            throw new InvalidOperationException(fileError);
        }

        await EnsureBucketExistsAsync();

        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var objectName = $"montages/{montageId}/{uniqueFileName}";

        await using var stream = file.OpenReadStream();
        var putObjectArgs = new PutObjectArgs()
            .WithBucket(_minioSettings.BucketName)
            .WithObject(objectName)
            .WithStreamData(stream)
            .WithObjectSize(file.Length)
            .WithContentType(file.ContentType);

        await _minioClient.PutObjectAsync(putObjectArgs);

        var montagePhoto = new MontagePhoto
        {
            MontageId = montageId,
            FileName = uniqueFileName,
            OriginalFileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            ObjectName = objectName,
            Description = description,
            DisplayOrder = displayOrder
        };

        _context.MontagePhotos.Add(montagePhoto);
        await _context.SaveChangesAsync();

        return ToDto(montagePhoto);
    }

    public async Task<List<MontagePhotoDto>> GetPhotosByMontageIdAsync(Guid montageId)
    {
        var photos = await _context.MontagePhotos
            .Where(p => p.MontageId == montageId)
            .OrderBy(p => p.DisplayOrder)
            .ThenBy(p => p.CreatedAt)
            .ToListAsync();

        return photos.Select(ToDto).ToList();
    }

    public async Task<MontagePhotoDto?> GetPhotoByIdAsync(Guid photoId)
    {
        var photo = await _context.MontagePhotos.FindAsync(photoId);
        return photo == null ? null : ToDto(photo);
    }

    public async Task<(Stream stream, string contentType, string fileName)?> GetPhotoStreamAsync(Guid photoId)
    {
        var photo = await _context.MontagePhotos.FindAsync(photoId);
        if (photo == null)
        {
            return null;
        }

        var memoryStream = new MemoryStream();
        
        var getObjectArgs = new GetObjectArgs()
            .WithBucket(_minioSettings.BucketName)
            .WithObject(photo.ObjectName)
            .WithCallbackStream(async (stream, cancellationToken) =>
            {
                await stream.CopyToAsync(memoryStream, cancellationToken);
            });

        await _minioClient.GetObjectAsync(getObjectArgs);
        memoryStream.Position = 0;
        
        return (memoryStream, photo.ContentType, photo.OriginalFileName);
    }

    public async Task<bool> DeletePhotoAsync(Guid photoId)
    {
        var photo = await _context.MontagePhotos.FindAsync(photoId);
        if (photo == null)
        {
            return false;
        }

        try
        {
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(_minioSettings.BucketName)
                .WithObject(photo.ObjectName);

            await _minioClient.RemoveObjectAsync(removeObjectArgs);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete photo from MinIO: {ObjectName}", photo.ObjectName);
            // Continue to delete database record even if MinIO delete fails
        }

        _context.MontagePhotos.Remove(photo);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<MontagePhotoDto?> UpdatePhotoMetadataAsync(Guid photoId, string? description, int displayOrder)
    {
        var photo = await _context.MontagePhotos.FindAsync(photoId);
        if (photo == null)
        {
            return null;
        }

        photo.Description = description;
        photo.DisplayOrder = displayOrder;

        await _context.SaveChangesAsync();

        return ToDto(photo);
    }

    public async Task<int> GetPhotoCountAsync(Guid montageId)
    {
        return await _context.MontagePhotos.CountAsync(p => p.MontageId == montageId);
    }

    public async Task<(bool canAdd, string? error)> CanAddPhotoAsync(Guid montageId)
    {
        var currentCount = await GetPhotoCountAsync(montageId);
        
        if (currentCount >= ImageValidationConstants.MaxPhotosPerMontage)
        {
            return (false, $"Maximum of {ImageValidationConstants.MaxPhotosPerMontage} photos per montage has been reached");
        }

        return (true, null);
    }

    public (bool isValid, string? error) ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return (false, "No file provided or file is empty");
        }

        if (file.Length > ImageValidationConstants.MaxFileSizeBytes)
        {
            return (false, $"File size exceeds the maximum allowed size of {ImageValidationConstants.MaxFileSizeMB}MB");
        }

        var contentType = file.ContentType.ToLowerInvariant();
        if (!ImageValidationConstants.AllowedContentTypes.Contains(contentType))
        {
            return (false, $"Invalid file type. Allowed types: {string.Join(", ", ImageValidationConstants.AllowedExtensions)}");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!ImageValidationConstants.AllowedExtensions.Contains(extension))
        {
            return (false, $"Invalid file extension. Allowed extensions: {string.Join(", ", ImageValidationConstants.AllowedExtensions)}");
        }

        return (true, null);
    }

    private async Task EnsureBucketExistsAsync()
    {
        try
        {
            var bucketExistsArgs = new BucketExistsArgs().WithBucket(_minioSettings.BucketName);
            var exists = await _minioClient.BucketExistsAsync(bucketExistsArgs);
            
            if (!exists)
            {
                var makeBucketArgs = new MakeBucketArgs().WithBucket(_minioSettings.BucketName);
                await _minioClient.MakeBucketAsync(makeBucketArgs);
                _logger.LogInformation("Created MinIO bucket: {BucketName}", _minioSettings.BucketName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ensure bucket exists: {BucketName}", _minioSettings.BucketName);
            throw;
        }
    }

    private MontagePhotoDto ToDto(MontagePhoto photo)
    {
        return new MontagePhotoDto
        {
            Id = photo.Id,
            MontageId = photo.MontageId,
            FileName = photo.FileName,
            OriginalFileName = photo.OriginalFileName,
            ContentType = photo.ContentType,
            FileSize = photo.FileSize,
            Url = $"/api/montagephotos/{photo.Id}/download",
            Description = photo.Description,
            DisplayOrder = photo.DisplayOrder,
            CreatedAt = photo.CreatedAt
        };
    }
}
