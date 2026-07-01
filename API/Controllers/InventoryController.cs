using ValidationException = FluentValidation.ValidationException;
using API.Common;
using API.DTOs;
using API.Services.Inventory;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class InventoryController : ApiControllerBase
{
    private readonly IInventoryService _service;
    private readonly IValidator<CreateInventoryItemDto> _createValidator;
    private readonly IValidator<UpdateInventoryItemDto> _updateValidator;
    private readonly IValidator<AdjustInventoryQuantityDto> _adjustValidator;

    public InventoryController(
        IInventoryService service,
        IValidator<CreateInventoryItemDto> createValidator,
        IValidator<UpdateInventoryItemDto> updateValidator,
        IValidator<AdjustInventoryQuantityDto> adjustValidator)
    {
        _service = service;
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
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var result = await _service.GetByCompanyIdAsync(companyId.Value, pageParameters);
        return Ok(result);
    }

    /// <summary>
    /// Get all low stock items for the current user's company
    /// </summary>
    [HttpGet("low-stock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<InventoryItemDto>>> GetLowStock([FromQuery] PageParameters pageParameters)
    {
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var result = await _service.GetLowStockByCompanyIdAsync(companyId.Value, pageParameters);
        return Ok(result);
    }

    /// <summary>
    /// Search inventory items for the current user's company
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<InventoryItemDto>>> Search(
        [FromQuery] string searchTerm,
        [FromQuery] PageParameters pageParameters)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            throw new ValidationException("Search term is required");
        }

        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var result = await _service.SearchByCompanyIdAsync(companyId.Value, searchTerm, pageParameters);
        return Ok(result);
    }

    /// <summary>
    /// Get inventory item by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<InventoryItemDto>> GetById(Guid id)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException("Id is required");
        }

        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var result = await _service.GetByIdAsync(id);
        if (result == null || result.CompanyId != companyId)
        {
            throw new NotFoundException("Inventory item not found");
        }
        return Ok(result);
    }

    /// <summary>
    /// Get inventory items by company ID
    /// </summary>
    [HttpGet("company/{companyId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<InventoryItemDto>>> GetByCompanyId(Guid companyId, [FromQuery] PageParameters pageParameters)
    {
        var result = await _service.GetByCompanyIdAsync(companyId, pageParameters);
        return Ok(result);
    }

    /// <summary>
    /// Get low stock items by company ID
    /// </summary>
    [HttpGet("company/{companyId}/low-stock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<InventoryItemDto>>> GetLowStockByCompanyId(Guid companyId, [FromQuery] PageParameters pageParameters)
    {
        var result = await _service.GetLowStockByCompanyIdAsync(companyId, pageParameters);
        return Ok(result);
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
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            throw new ValidationException("Search term is required");
        }

        var userCompanyId = GetCurrentUserCompanyId();
        if (userCompanyId == null || userCompanyId != companyId)
        {
            return Forbid();
        }

        var result = await _service.SearchByCompanyIdAsync(companyId, searchTerm, pageParameters);
        return Ok(result);
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
        var result = await _service.GetBySkuAndCompanyIdAsync(sku, companyId);
        if (result == null)
        {
            throw new NotFoundException("Inventory item not found");
        }
        return Ok(result);
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
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        dto.UserId = GetCurrentUserId();

        var callerCompanyId = GetCurrentUserCompanyId();
        if (callerCompanyId.HasValue)
        {
            dto.CompanyId = callerCompanyId.Value;
        }

        var id = await _service.AddAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id }, dto);
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
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        dto.UserId = GetCurrentUserId();

        var callerCompanyId = GetCurrentUserCompanyId();
        if (callerCompanyId.HasValue)
        {
            var existingItem = await _service.GetByIdAsync(id);
            if (existingItem != null && existingItem.CompanyId != callerCompanyId.Value)
            {
                throw new NotFoundException("Inventory item not found");
            }
        }

        await _service.UpdateAsync(id, dto);
        return NoContent();
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
        var validationResult = await _adjustValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var existing = await _service.GetByIdAsync(id);
        if (existing == null || existing.CompanyId != companyId)
        {
            throw new NotFoundException("Inventory item not found");
        }

        dto.UserId = GetCurrentUserId();
        var result = await _service.AdjustQuantityAsync(id, dto);
        return Ok(result);
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
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var existing = await _service.GetByIdAsync(id);
        if (existing == null || existing.CompanyId != companyId)
        {
            throw new NotFoundException("Inventory item not found");
        }

        await _service.UpdateStatusAsync(id, request.IsActive);
        return NoContent();
    }

    /// <summary>
    /// Check if an inventory item can be deleted
    /// </summary>
    [HttpGet("{id}/can-delete")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<bool>> CanDelete(Guid id)
    {
        var canDelete = await _service.CanDeleteAsync(id);
        return Ok(new { canDelete });
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
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var existing = await _service.GetByIdAsync(id);
        if (existing == null || existing.CompanyId != companyId)
        {
            throw new NotFoundException("Inventory item not found");
        }

        var canDelete = await _service.CanDeleteAsync(id);
        if (!canDelete)
        {
            throw new ValidationException("Cannot delete this item. It has been used in montages or is older than 30 days. You can deactivate it instead.");
        }

        await _service.DeleteAsync(id);
        return NoContent();
    }

}
