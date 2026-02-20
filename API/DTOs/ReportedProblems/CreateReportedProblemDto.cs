using API.Models;

namespace API.DTOs.ReportedProblems;

public class CreateReportedProblemDto
{
    public ProblemCategory Category { get; set; }
    
    public string Description { get; set; } = string.Empty;
}
