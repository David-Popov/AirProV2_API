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

    /// <summary>
    /// Get all reported problems (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<ReportedProblemDto>>> GetAll()
    {
        var problems = await _service.GetAllAsync();
        return Ok(problems);
    }

    /// <summary>
    /// Get a specific problem report by ID (Admin only)
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ReportedProblemDto>> GetById(Guid id)
    {
        var problem = await _service.GetByIdAsync(id);
        if (problem == null)
        {
            return NotFound(new { message = "Problem report not found" });
        }

        return Ok(problem);
    }

    /// <summary>
    /// Download screenshot for a problem report
    /// </summary>
    [HttpGet("{id:guid}/screenshot")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetScreenshot(Guid id)
    {
        var result = await _service.GetScreenshotStreamAsync(id);
        if (result == null)
        {
            return NotFound(new { message = "Screenshot not found" });
        }

        var (stream, contentType, fileName) = result.Value;
        return File(stream, contentType, fileName);
    }

    /// <summary>
    /// Mark a problem as reviewed (deletes it) - Admin only
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkAsReviewed(Guid id)
    {
        var result = await _service.MarkAsReviewedAsync(id);
        if (!result)
        {
            return NotFound(new { message = "Problem report not found" });
        }

        _logger.LogInformation("Problem report {Id} marked as reviewed and deleted", id);
        return NoContent();
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
