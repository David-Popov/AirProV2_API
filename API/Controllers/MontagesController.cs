using ValidationException = FluentValidation.ValidationException;
using API.Common;
using API.DTOs;
using API.Services;
using API.Services.Montages;
using API.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class MontagesController : ApiControllerBase
{
    private readonly IMontageService _service;
    private readonly IValidator<CreateMontageDto> _createValidator;
    private readonly IValidator<UpdateMontageDto> _updateValidator;

    public MontagesController(
        IMontageService service,
        IValidator<CreateMontageDto> createValidator,
        IValidator<UpdateMontageDto> updateValidator)
    {
        _service = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    /// <summary>
    /// Get all montages with pagination for the current user's company
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetAll([FromQuery] MontageParameters parameters)
    {
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var result = await _service.GetByCompanyIdAsync(companyId.Value, parameters);
        return Ok(result);
    }

    /// <summary>
    /// Get montage by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MontageDto>> GetById(Guid id)
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
            throw new NotFoundException("Montage not found");
        }
        return Ok(result);
    }

    /// <summary>
    /// Get montage by ID with air conditioner details
    /// </summary>
    [HttpGet("{id}/with-air-conditioner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MontageDto>> GetByIdWithAirConditioner(Guid id)
    {
        var result = await _service.GetByIdWithAirConditionerAsync(id);
        if (result == null)
        {
            throw new NotFoundException("Montage not found");
        }
        return Ok(result);
    }

    /// <summary>
    /// Get montages by company ID
    /// </summary>
    [HttpGet("company/{companyId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetByCompanyId(Guid companyId, [FromQuery] MontageParameters parameters)
    {
        var result = await _service.GetByCompanyIdAsync(companyId, parameters);
        return Ok(result);
    }

    /// <summary>
    /// Get montages by user ID
    /// </summary>
    [HttpGet("user/{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetByUserId(string userId, [FromQuery] PageParameters pageParameters)
    {
        var result = await _service.GetByUserIdAsync(userId, pageParameters);
        return Ok(result);
    }

    /// <summary>
    /// Get montages by company and user ID
    /// </summary>
    [HttpGet("company/{companyId}/user/{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetByCompanyAndUserId(Guid companyId, string userId, [FromQuery] PageParameters pageParameters)
    {
        var result = await _service.GetByCompanyAndUserIdAsync(companyId, userId, pageParameters);
        return Ok(result);
    }

    /// <summary>
    /// Get montages by status
    /// </summary>
    [HttpGet("status/{status}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetByStatus(string status, [FromQuery] PageParameters pageParameters)
    {
        var result = await _service.GetByStatusAsync(status, pageParameters);
        return Ok(result);
    }

    /// <summary>
    /// Get montages by installation date range
    /// </summary>
    [HttpGet("date-range")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetByDateRange(
        [FromQuery] DateOnly startDate,
        [FromQuery] DateOnly endDate,
        [FromQuery] PageParameters pageParameters)
    {
        var result = await _service.GetByInstallationDateRangeAsync(startDate, endDate, pageParameters);
        return Ok(result);
    }

    /// <summary>
    /// Create new montage
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Create([FromBody] CreateMontageDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Populate CompanyId and UserId from JWT token
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            throw new ValidationException("User ID not found");
        }

        dto.CompanyId = companyId.Value;
        dto.UserId = userId;

        var id = await _service.AddMontageAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id }, dto);
    }

    /// <summary>
    /// Update montage
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateMontageDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        // Check if montage belongs to user's company
        var existing = await _service.GetByIdAsync(id);
        if (existing == null || existing.CompanyId != companyId)
        {
            throw new NotFoundException("Montage not found");
        }

        await _service.UpdateMontageAsync(id, dto);
        return NoContent();
    }

    /// <summary>
    /// Update montage status only
    /// </summary>
    [HttpPatch("{id}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateStatus(Guid id, [FromBody] UpdateMontageStatusDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Status))
        {
            throw new ValidationException("Status is required");
        }

        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        // Check if montage belongs to user's company
        var existing = await _service.GetByIdAsync(id);
        if (existing == null || existing.CompanyId != companyId)
        {
            throw new NotFoundException("Montage not found");
        }

        await _service.UpdateMontageStatusAsync(id, dto.Status);
        return NoContent();
    }

    /// <summary>
    /// Update montage payment status
    /// </summary>
    [HttpPatch("{id}/payment-status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdatePaymentStatus(Guid id, [FromBody] UpdatePaymentStatusDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.PaymentStatus))
        {
            throw new ValidationException("Payment status is required");
        }

        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        // Check if montage belongs to user's company
        var existing = await _service.GetByIdAsync(id);
        if (existing == null || existing.CompanyId != companyId)
        {
            throw new NotFoundException("Montage not found");
        }

        await _service.UpdatePaymentStatusAsync(id, dto.PaymentStatus, dto.PaidAmount);
        return NoContent();
    }

    /// <summary>
    /// Delete montage
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Delete(Guid id)
    {
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        // Check if montage belongs to user's company
        var existing = await _service.GetByIdAsync(id);
        if (existing == null || existing.CompanyId != companyId)
        {
            throw new NotFoundException("Montage not found");
        }

        await _service.DeleteMontageAsync(id);
        return NoContent();
    }

}
