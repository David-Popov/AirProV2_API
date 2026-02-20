using System.Security.Claims;
using API.DTOs.ReportedProblems;
using API.Models;
using API.Services.ReportedProblems;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportedProblemsController : ControllerBase
{
    private readonly IReportedProblemService _service;
    private readonly ILogger<ReportedProblemsController> _logger;

    public ReportedProblemsController(
        IReportedProblemService service,
        ILogger<ReportedProblemsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Create a new problem report
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ReportedProblemDto>> Create(
        [FromForm] ProblemCategory category,
        [FromForm] string description,
        IFormFile? screenshot)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(description))
            {
                return BadRequest(new { message = "Description is required" });
            }

            if (description.Length > 2000)
            {
                return BadRequest(new { message = "Description cannot exceed 2000 characters" });
            }

            var result = await _service.CreateAsync(userId, category, description, screenshot);
            _logger.LogInformation("Problem report created by user {UserId}, Category: {Category}", userId, category);
            
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to create problem report");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating problem report");
            return StatusCode(500, new { message = "An error occurred while creating the problem report" });
        }
    }

    /// <summary>
    /// Get all reported problems (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<ReportedProblemDto>>> GetAll()
    {
        try
        {
            var problems = await _service.GetAllAsync();
            return Ok(problems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all problem reports");
            return StatusCode(500, new { message = "An error occurred while fetching problem reports" });
        }
    }

    /// <summary>
    /// Get a specific problem report by ID (Admin only)
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ReportedProblemDto>> GetById(Guid id)
    {
        try
        {
            var problem = await _service.GetByIdAsync(id);
            if (problem == null)
            {
                return NotFound(new { message = "Problem report not found" });
            }

            return Ok(problem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting problem report {Id}", id);
            return StatusCode(500, new { message = "An error occurred while fetching the problem report" });
        }
    }

    /// <summary>
    /// Download screenshot for a problem report
    /// </summary>
    [HttpGet("{id:guid}/screenshot")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetScreenshot(Guid id)
    {
        try
        {
            var result = await _service.GetScreenshotStreamAsync(id);
            if (result == null)
            {
                return NotFound(new { message = "Screenshot not found" });
            }

            var (stream, contentType, fileName) = result.Value;
            return File(stream, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading screenshot for problem {Id}", id);
            return StatusCode(500, new { message = "An error occurred while downloading the screenshot" });
        }
    }

    /// <summary>
    /// Mark a problem as reviewed (deletes it) - Admin only
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkAsReviewed(Guid id)
    {
        try
        {
            var result = await _service.MarkAsReviewedAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Problem report not found" });
            }

            _logger.LogInformation("Problem report {Id} marked as reviewed and deleted", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking problem {Id} as reviewed", id);
            return StatusCode(500, new { message = "An error occurred while marking the problem as reviewed" });
        }
    }

    /// <summary>
    /// Get available problem categories
    /// </summary>
    [HttpGet("categories")]
    public ActionResult<object> GetCategories()
    {
        var categories = Enum.GetValues<ProblemCategory>()
            .Select(c => new { value = (int)c, name = c.ToString() })
            .ToList();

        return Ok(categories);
    }
}
