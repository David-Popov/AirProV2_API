using API.Common;
using API.DTOs;
using API.Services;
using API.Services.Montages;
using API.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MontagesController : ControllerBase
{
    private readonly IMontageService _service;
    private readonly ILogger<MontagesController> _logger;
    private readonly IValidator<CreateMontageDto> _createValidator;
    private readonly IValidator<UpdateMontageDto> _updateValidator;

    public MontagesController(
        IMontageService service, 
        ILogger<MontagesController> logger,
        IValidator<CreateMontageDto> createValidator,
        IValidator<UpdateMontageDto> updateValidator)
    {
        _service = service;
        _logger = logger;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    /// <summary>
    /// Get all montages with pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetAll([FromQuery] PageParameters pageParameters)
    {
        try
        {
            var result = await _service.GetAllAsync(pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
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
        try
        {
            if (id == Guid.Empty)
            {
                return BadRequest("Id is required");
            }
            
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = "Montage not found" });
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
    /// Get montage by ID with air conditioner details
    /// </summary>
    [HttpGet("{id}/with-air-conditioner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MontageDto>> GetByIdWithAirConditioner(Guid id)
    {
        try
        {
            var result = await _service.GetByIdWithAirConditionerAsync(id);
            if (result == null)
            {
                return NotFound(new { message = "Montage not found" });
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
    /// Get montages by company ID
    /// </summary>
    [HttpGet("company/{companyId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetByCompanyId(Guid companyId, [FromQuery] PageParameters pageParameters)
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
    /// Get montages by user ID
    /// </summary>
    [HttpGet("user/{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetByUserId(string userId, [FromQuery] PageParameters pageParameters)
    {
        try
        {
            var result = await _service.GetByUserIdAsync(userId, pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get montages by company and user ID
    /// </summary>
    [HttpGet("company/{companyId}/user/{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetByCompanyAndUserId(Guid companyId, string userId, [FromQuery] PageParameters pageParameters)
    {
        try
        {
            var result = await _service.GetByCompanyAndUserIdAsync(companyId, userId, pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get montages by status
    /// </summary>
    [HttpGet("status/{status}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<MontageDto>>> GetByStatus(string status, [FromQuery] PageParameters pageParameters)
    {
        try
        {
            var result = await _service.GetByStatusAsync(status, pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
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
        try
        {
            var result = await _service.GetByInstallationDateRangeAsync(startDate, endDate, pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
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
        try
        {
            var validationResult = await _createValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            await _service.AddMontageAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = Guid.NewGuid() }, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
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
        try
        {
            var validationResult = await _updateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            await _service.UpdateMontageAsync(id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
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
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Status))
            {
                return BadRequest(new { message = "Status is required" });
            }

            await _service.UpdateMontageStatusAsync(id, dto.Status);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete montage
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            await _service.DeleteMontageAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }
}