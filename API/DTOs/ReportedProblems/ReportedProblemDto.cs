using API.Models;

namespace API.DTOs.ReportedProblems;

public class ReportedProblemDto
{
    public Guid Id { get; set; }
    
    public string UserId { get; set; } = string.Empty;
    
    public string UserName { get; set; } = string.Empty;
    
    public string UserEmail { get; set; } = string.Empty;
    
    public ProblemCategory Category { get; set; }
    
    public string Description { get; set; } = string.Empty;
    
    public string? ScreenshotUrl { get; set; }
    
    public bool HasScreenshot { get; set; }
    
    public DateTime CreatedAt { get; set; }
}
