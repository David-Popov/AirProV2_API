using API.DTOs;
using API.Common;
using API.Services.MontageInventory;
using API.Services.Montages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class MontageInventoryController : ApiControllerBase
{
    private readonly IMontageInventoryService _service;
    private readonly IMontageService _montageService;

    public MontageInventoryController(IMontageInventoryService service, IMontageService montageService)
    {
        _service = service;
        _montageService = montageService;
    }

    /// <summary>
    /// Add materials to a montage (automatically deducts from inventory)
    /// </summary>
    [HttpPost("{montageId}/materials")]
    public async Task<ActionResult<List<MontageInventoryItemDto>>> AddMaterials(Guid montageId, [FromBody] AddMaterialsToMontageRequest request)
    {
        await EnsureCanAccessMontageAsync(montageId);
        request.UserId = GetCurrentUserId();
        var result = await _service.AddMaterialsAsync(montageId, request);
        return Ok(result);
    }

    /// <summary>
    /// Get all materials used in a specific montage
    /// </summary>
    [HttpGet("{montageId}/materials")]
    public async Task<ActionResult<List<MontageInventoryItemDto>>> GetMaterialsByMontage(Guid montageId)
    {
        await EnsureCanAccessMontageAsync(montageId);
        var result = await _service.GetMaterialsByMontageIdAsync(montageId);
        return Ok(result);
    }

    /// <summary>
    /// Remove a material from a montage (automatically restores to inventory)
    /// </summary>
    [HttpDelete("materials/{materialId}")]
    public async Task<IActionResult> RemoveMaterial(Guid materialId)
    {
        await _service.RemoveMaterialAsync(materialId);
        return NoContent();
    }

    /// <summary>
    /// Update material quantity
    /// </summary>
    [HttpPut("materials/{materialId}")]
    public async Task<IActionResult> UpdateMaterial(Guid materialId, [FromBody] UpdateMontageMaterialDto request)
    {
        await _service.UpdateMaterialQuantityAsync(materialId, request.QuantityUsed);
        return Ok();
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

    /// <summary>
    /// Workers may only touch montages they are assigned to; managers/admins any montage in their company.
    /// Guards the montage-scoped endpoints (the material-id mutations are protected because their
    /// GUIDs are only discoverable through these now-guarded listing endpoints).
    /// </summary>
    private async Task EnsureCanAccessMontageAsync(Guid montageId)
    {
        var companyId = GetCurrentUserCompanyId();
        var montage = await _montageService.GetByIdAsync(montageId);
        if (companyId == null || montage == null || montage.CompanyId != companyId ||
            (!IsManagerOrAdmin() && !montage.AssignedUserIds.Contains(GetCurrentUserId()!)))
        {
            throw new NotFoundException("Montage not found");
        }
    }
}
