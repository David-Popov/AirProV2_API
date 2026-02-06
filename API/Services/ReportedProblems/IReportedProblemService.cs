using API.DTOs.ReportedProblems;
using API.Models;

namespace API.Services.ReportedProblems;

public interface IReportedProblemService
{
    /// <summary>
    /// Creates a new problem report with optional screenshot
    /// </summary>
    Task<ReportedProblemDto> CreateAsync(string userId, ProblemCategory category, string description, IFormFile? screenshot);
    
    /// <summary>
    /// Gets all reported problems (for admin)
    /// </summary>
    Task<List<ReportedProblemDto>> GetAllAsync();
    
    /// <summary>
    /// Gets a specific problem report by ID
    /// </summary>
    Task<ReportedProblemDto?> GetByIdAsync(Guid id);
    
    /// <summary>
    /// Gets the screenshot stream for downloading
    /// </summary>
    Task<(Stream stream, string contentType, string fileName)?> GetScreenshotStreamAsync(Guid id);
    
    /// <summary>
    /// Marks a problem as reviewed (deletes it from the database)
    /// </summary>
    Task<bool> MarkAsReviewedAsync(Guid id);
    
    /// <summary>
    /// Validates the screenshot file for upload
    /// </summary>
    (bool isValid, string? error) ValidateScreenshot(IFormFile file);
}
