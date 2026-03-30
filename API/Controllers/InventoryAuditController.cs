using API.Data.Entities;
using API.DTOs;
using API.Services.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/inventory-audit")]
public class InventoryAuditController : ControllerBase
{
    private readonly IInventoryAuditService _auditService;
    private readonly ILogger<InventoryAuditController> _logger;

    public InventoryAuditController(
        IInventoryAuditService auditService,
        ILogger<InventoryAuditController> logger)
    {
        _auditService = auditService;
        _logger = logger;
    }

    /// <summary>
    /// Get audit history for a specific inventory item
    /// </summary>
    [HttpGet("item/{itemId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetItemHistory(
        Guid itemId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _auditService.GetAuditLogsAsync(itemId, pageNumber, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Get recent inventory activity for the company
    /// </summary>
    [HttpGet("recent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetRecentActivity([FromQuery] int count = 6)
    {
        var companyId = User.FindFirst("company_id")?.Value;

        _logger.LogInformation("GetRecentActivity: User Claims: {Claims}", string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));

        if (string.IsNullOrEmpty(companyId) || !Guid.TryParse(companyId, out var parsedCompanyId))
        {
            // Fallback check for "CompanyId" just in case
            companyId = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyId) || !Guid.TryParse(companyId, out parsedCompanyId))
            {
                 _logger.LogWarning("GetRecentActivity: Company ID not found in token");
                 return BadRequest(new { message = "Company ID not found in token" });
            }
        }

        _logger.LogInformation("GetRecentActivity: Fetching for CompanyId: {CompanyId}, Count: {Count}", parsedCompanyId, count);

        var result = await _auditService.GetRecentActivityAsync(parsedCompanyId, count);

        _logger.LogInformation("GetRecentActivity: Found {Count} items", result.Count);

        return Ok(result);
    }

    /// <summary>
    /// Get audit history by user
    /// </summary>
    [HttpGet("user/{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetUserHistory(
        string userId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _auditService.GetAuditLogsByUserAsync(userId, pageNumber, pageSize);
        return Ok(result);
    }
}
