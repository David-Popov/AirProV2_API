using API.Data;
using API.Data.Entities;
using API.DTOs.ReportedProblems;
using API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace API.Services.ReportedProblems;

public class ReportedProblemService : IReportedProblemService
{
    private readonly ApplicationDbContext _context;
    private readonly IMinioClient _minioClient;
    private readonly MinioSettings _minioSettings;
    private readonly ILogger<ReportedProblemService> _logger;

    private static readonly string[] AllowedContentTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10MB

    public ReportedProblemService(
        ApplicationDbContext context,
        IMinioClient minioClient,
        IOptions<MinioSettings> minioSettings,
        ILogger<ReportedProblemService> logger)
    {
        _context = context;
        _minioClient = minioClient;
        _minioSettings = minioSettings.Value;
        _logger = logger;
    }

    public async Task<ReportedProblemDto> CreateAsync(string userId, ProblemCategory category, string description, IFormFile? screenshot)
    {
        var reportedProblem = new ReportedProblem
        {
            UserId = userId,
            Category = category,
            Description = description
        };

        // Handle screenshot upload if provided
        if (screenshot != null && screenshot.Length > 0)
        {
            var (isValid, error) = ValidateScreenshot(screenshot);
            if (!isValid)
            {
                throw new InvalidOperationException(error);
            }

            await EnsureBucketExistsAsync();

            var fileExtension = Path.GetExtension(screenshot.FileName).ToLowerInvariant();
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var objectName = $"reported-problems/{reportedProblem.Id}/{uniqueFileName}";

            await using var stream = screenshot.OpenReadStream();
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_minioSettings.BucketName)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(screenshot.Length)
                .WithContentType(screenshot.ContentType);

            await _minioClient.PutObjectAsync(putObjectArgs);

            reportedProblem.ScreenshotFileName = screenshot.FileName;
            reportedProblem.ScreenshotObjectName = objectName;
            reportedProblem.ScreenshotContentType = screenshot.ContentType;
        }

        _context.ReportedProblems.Add(reportedProblem);
        await _context.SaveChangesAsync();

        // Load user information
        await _context.Entry(reportedProblem).Reference(p => p.User).LoadAsync();

        return ToDto(reportedProblem);
    }

    public async Task<List<ReportedProblemDto>> GetAllAsync()
    {
        var problems = await _context.ReportedProblems
            .AsNoTracking()
            .Include(p => p.User)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return problems.Select(ToDto).ToList();
    }

    public async Task<ReportedProblemDto?> GetByIdAsync(Guid id)
    {
        var problem = await _context.ReportedProblems
            .AsNoTracking()
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == id);

        return problem == null ? null : ToDto(problem);
    }

    public async Task<(Stream stream, string contentType, string fileName)?> GetScreenshotStreamAsync(Guid id)
    {
        var problem = await _context.ReportedProblems.FindAsync(id);
        if (problem?.ScreenshotObjectName == null)
        {
            return null;
        }

        var memoryStream = new MemoryStream();

        var getObjectArgs = new GetObjectArgs()
            .WithBucket(_minioSettings.BucketName)
            .WithObject(problem.ScreenshotObjectName)
            .WithCallbackStream(async (stream, cancellationToken) =>
            {
                await stream.CopyToAsync(memoryStream, cancellationToken);
            });

        await _minioClient.GetObjectAsync(getObjectArgs);
        memoryStream.Position = 0;

        return (memoryStream, problem.ScreenshotContentType ?? "application/octet-stream", problem.ScreenshotFileName ?? "screenshot");
    }

    public async Task<bool> MarkAsReviewedAsync(Guid id)
    {
        var problem = await _context.ReportedProblems.FindAsync(id);
        if (problem == null)
        {
            return false;
        }

        // Delete screenshot from MinIO if exists
        if (!string.IsNullOrEmpty(problem.ScreenshotObjectName))
        {
            try
            {
                var removeObjectArgs = new RemoveObjectArgs()
                    .WithBucket(_minioSettings.BucketName)
                    .WithObject(problem.ScreenshotObjectName);

                await _minioClient.RemoveObjectAsync(removeObjectArgs);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete screenshot from MinIO: {ObjectName}", problem.ScreenshotObjectName);
                // Continue to delete database record even if MinIO delete fails
            }
        }

        _context.ReportedProblems.Remove(problem);
        await _context.SaveChangesAsync();

        return true;
    }

    public (bool isValid, string? error) ValidateScreenshot(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return (false, "No file provided or file is empty");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return (false, $"File size exceeds the maximum allowed size of {MaxFileSizeBytes / (1024 * 1024)}MB");
        }

        var contentType = file.ContentType.ToLowerInvariant();
        if (!AllowedContentTypes.Contains(contentType))
        {
            return (false, $"Invalid file type. Allowed types: {string.Join(", ", AllowedExtensions)}");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return (false, $"Invalid file extension. Allowed extensions: {string.Join(", ", AllowedExtensions)}");
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

    private ReportedProblemDto ToDto(ReportedProblem problem)
    {
        return new ReportedProblemDto
        {
            Id = problem.Id,
            UserId = problem.UserId,
            UserName = problem.User != null 
                ? $"{problem.User.FirstName} {problem.User.LastName}".Trim() 
                : "Unknown",
            UserEmail = problem.User?.Email ?? "Unknown",
            Category = problem.Category,
            Description = problem.Description,
            HasScreenshot = !string.IsNullOrEmpty(problem.ScreenshotObjectName),
            ScreenshotUrl = !string.IsNullOrEmpty(problem.ScreenshotObjectName) 
                ? $"/api/reportedproblems/{problem.Id}/screenshot" 
                : null,
            CreatedAt = problem.CreatedAt
        };
    }
}
