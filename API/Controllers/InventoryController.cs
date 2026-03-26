using System.Security.Claims;
using API.Common;
using API.DTOs;
using API.Services.Inventory;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _service;
    private readonly ILogger<InventoryController> _logger;
    private readonly IValidator<CreateInventoryItemDto> _createValidator;
    private readonly IValidator<UpdateInventoryItemDto> _updateValidator;
    private readonly IValidator<AdjustInventoryQuantityDto> _adjustValidator;

    public InventoryController(
        IInventoryService service,
        ILogger<InventoryController> logger,
        IValidator<CreateInventoryItemDto> createValidator,
        IValidator<UpdateInventoryItemDto> updateValidator,
        IValidator<AdjustInventoryQuantityDto> adjustValidator)
    {
        _service = service;
        _logger = logger;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _adjustValidator = adjustValidator;
    }

    /// <summary>
    /// Get all inventory items with pagination for the current user's company
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<InventoryItemDto>>> GetAll([FromQuery] PageParameters pageParameters)
    {
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var result = await _service.GetByCompanyIdAsync(companyId.Value, pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get all low stock items for the current user's company
    /// </summary>
    [HttpGet("low-stock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<InventoryItemDto>>> GetLowStock([FromQuery] PageParameters pageParameters)
    {
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var result = await _service.GetLowStockByCompanyIdAsync(companyId.Value, pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get inventory item by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<InventoryItemDto>> GetById(Guid id)
    {
        try
        {
            if (id == Guid.Empty)
            {
                return BadRequest("Id is required");
            }

            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var result = await _service.GetByIdAsync(id);
            if (result == null || result.CompanyId != companyId)
            {
                return NotFound(new { message = "Inventory item not found" });
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get inventory items by company ID
    /// </summary>
    [HttpGet("company/{companyId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<InventoryItemDto>>> GetByCompanyId(Guid companyId, [FromQuery] PageParameters pageParameters)
    {
        try
        {
            var result = await _service.GetByCompanyIdAsync(companyId, pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get low stock items by company ID
    /// </summary>
    [HttpGet("company/{companyId}/low-stock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<InventoryItemDto>>> GetLowStockByCompanyId(Guid companyId, [FromQuery] PageParameters pageParameters)
    {
        try
        {
            var result = await _service.GetLowStockByCompanyIdAsync(companyId, pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Search inventory items by company ID
    /// </summary>
    [HttpGet("company/{companyId}/search")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<InventoryItemDto>>> SearchByCompanyId(
        Guid companyId, 
        [FromQuery] string searchTerm, 
        [FromQuery] PageParameters pageParameters)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest(new { message = "Search term is required" });
            }

            var result = await _service.SearchByCompanyIdAsync(companyId, searchTerm, pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get inventory item by SKU and company ID
    /// </summary>
    [HttpGet("company/{companyId}/sku/{sku}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<InventoryItemDto>> GetBySkuAndCompanyId(Guid companyId, string sku)
    {
        try
        {
            var result = await _service.GetBySkuAndCompanyIdAsync(sku, companyId);
            if (result == null)
            {
                return NotFound(new { message = "Inventory item not found" });
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create new inventory item
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Create([FromBody] CreateInventoryItemDto dto)
    {
        try
        {
            var validationResult = await _createValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            dto.UserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            var companyIdClaim = User.FindFirst("company_id")?.Value;
            if (!string.IsNullOrEmpty(companyIdClaim) && Guid.TryParse(companyIdClaim, out var companyId))
            {
                dto.CompanyId = companyId;
            }
            
            await _service.AddAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = Guid.NewGuid() }, dto);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update inventory item
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateInventoryItemDto dto)
    {
        try
        {
            var validationResult = await _updateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            dto.UserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            var companyIdClaim = User.FindFirst("company_id")?.Value;
            if (!string.IsNullOrEmpty(companyIdClaim) && Guid.TryParse(companyIdClaim, out var companyId))
            {
                var existingItem = await _service.GetByIdAsync(id);
                if (existingItem != null && existingItem.CompanyId != companyId)
                {
                    return NotFound(new { message = "Inventory item not found" });
                }
            }

            await _service.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Adjust inventory quantity (add or subtract)
    /// </summary>
    /// <remarks>
    /// Use positive values to add stock, negative values to subtract.
    /// Example: { "adjustment_amount": -1.5, "reason": "Used in montage" }
    /// </remarks>
    [HttpPatch("{id}/adjust-quantity")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<InventoryItemDto>> AdjustQuantity(Guid id, [FromBody] AdjustInventoryQuantityDto dto)
    {
        try
        {
            var validationResult = await _adjustValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var existing = await _service.GetByIdAsync(id);
            if (existing == null || existing.CompanyId != companyId)
            {
                return NotFound(new { message = "Inventory item not found" });
            }

            dto.UserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var result = await _service.AdjustQuantityAsync(id, dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update inventory item status
    /// </summary>
    [HttpPatch("{id}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateInventoryItemStatusDto request)
    {
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var existing = await _service.GetByIdAsync(id);
            if (existing == null || existing.CompanyId != companyId)
            {
                return NotFound(new { message = "Inventory item not found" });
            }

            await _service.UpdateStatusAsync(id, request.IsActive);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check if an inventory item can be deleted
    /// </summary>
    [HttpGet("{id}/can-delete")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<bool>> CanDelete(Guid id)
    {
        try
        {
            var canDelete = await _service.CanDeleteAsync(id);
            return Ok(new { canDelete });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete inventory item
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var existing = await _service.GetByIdAsync(id);
            if (existing == null || existing.CompanyId != companyId)
            {
                return NotFound(new { message = "Inventory item not found" });
            }

            var canDelete = await _service.CanDeleteAsync(id);
            if (!canDelete)
            {
                return BadRequest(new { message = "Cannot delete this item. It has been used in montages or is older than 30 days. You can deactivate it instead." });
            }

            await _service.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    private Guid? GetCurrentUserCompanyId()
    {
        var companyIdClaim = User.FindFirstValue("company_id");
        if (string.IsNullOrEmpty(companyIdClaim))
        {
            return null;
        }
        return Guid.TryParse(companyIdClaim, out var companyId) ? companyId : null;
    }
}
