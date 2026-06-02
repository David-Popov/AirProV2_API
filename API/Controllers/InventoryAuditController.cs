using API.Common;
using API.Services.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/inventory-audit")]
public class InventoryAuditController : ApiControllerBase
{
    private readonly IInventoryAuditService _auditService;

    public InventoryAuditController(IInventoryAuditService auditService)
    {
        _auditService = auditService;
    }

    /// <summary>
    /// Get audit history for a specific inventory item.
    /// </summary>
    [HttpGet("item/{itemId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetItemHistory(
        Guid itemId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _auditService.GetAuditLogsAsync(itemId, pageNumber, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Get recent inventory activity for the company.
    /// </summary>
    [HttpGet("recent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetRecentActivity([FromQuery] int count = 6)
    {
        var companyId = GetCurrentUserCompanyId()
            ?? throw new ForbiddenException("Company id missing from token.");

        var result = await _auditService.GetRecentActivityAsync(companyId, count);
        return Ok(result);
    }

    /// <summary>
    /// Get audit history by user.
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
