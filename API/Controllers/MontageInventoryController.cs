using API.DTOs;
using API.Common;
using API.Services.MontageInventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MontageInventoryController : ControllerBase
{
    private readonly IMontageInventoryService _service;

    public MontageInventoryController(IMontageInventoryService service)
    {
        _service = service;
    }

    /// <summary>
    /// Add materials to a montage (automatically deducts from inventory)
    /// </summary>
    [HttpPost("{montageId}/materials")]
    public async Task<ActionResult<List<MontageInventoryItemDto>>> AddMaterials(Guid montageId, [FromBody] AddMaterialsToMontageRequest request)
    {
        try
        {
            request.UserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var result = await _service.AddMaterialsAsync(montageId, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get all materials used in a specific montage
    /// </summary>
    [HttpGet("{montageId}/materials")]
    public async Task<ActionResult<List<MontageInventoryItemDto>>> GetMaterialsByMontage(Guid montageId)
    {
        var result = await _service.GetMaterialsByMontageIdAsync(montageId);
        return Ok(result);
    }

    /// <summary>
    /// Remove a material from a montage (automatically restores to inventory)
    /// </summary>
    [HttpDelete("materials/{materialId}")]
    public async Task<IActionResult> RemoveMaterial(Guid materialId)
    {
        try
        {
            await _service.RemoveMaterialAsync(materialId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update material quantity
    /// </summary>
    [HttpPut("materials/{materialId}")]
    public async Task<IActionResult> UpdateMaterial(Guid materialId, [FromBody] UpdateMontageMaterialDto request)
    {
        try
        {
            await _service.UpdateMaterialQuantityAsync(materialId, request.QuantityUsed);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get usage history for a specific inventory item
    /// </summary>
    [HttpGet("item/{inventoryItemId}/usage")]
    public async Task<ActionResult<PagedList<MontageInventoryItemDto>>> GetItemUsageHistory(
        Guid inventoryItemId, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        var pageParams = new PageParameters { PageNumber = page, PageSize = pageSize };
        var result = await _service.GetUsageHistoryByItemIdAsync(inventoryItemId, pageParams);
        return Ok(result);
    }
}
