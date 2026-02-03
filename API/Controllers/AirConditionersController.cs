using API.Common;
using API.DTOs;
using API.Services;
using API.Services.AirConditioners;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AirConditionersController : ControllerBase
{
    private readonly IAirConditionerService _service;
    private readonly ILogger<AirConditionersController> _logger;
    private readonly IValidator<CreateAirConditionerDto> _createAirConditionerValidator;
    private readonly IValidator<UpdateAirConditionerDto> _updateAirConditionerValidator;
    private readonly IValidator<CreateErrorCodeDto> _createErrorCodeValidator;
    private readonly IValidator<UpdateErrorCodeDto> _updateErrorCodeValidator;

    public AirConditionersController(
        IAirConditionerService service,
        ILogger<AirConditionersController> logger,
        IValidator<CreateAirConditionerDto> createAirConditionerValidator,
        IValidator<UpdateAirConditionerDto> updateAirConditionerValidator,
        IValidator<CreateErrorCodeDto> createErrorCodeValidator,
        IValidator<UpdateErrorCodeDto> updateErrorCodeValidator)
    {
        _service = service;
        _logger = logger;
        _createAirConditionerValidator = createAirConditionerValidator;
        _updateAirConditionerValidator = updateAirConditionerValidator;
        _createErrorCodeValidator = createErrorCodeValidator;
        _updateErrorCodeValidator = updateErrorCodeValidator;
    }

    /// <summary>
    /// Get all air conditioners with pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<AirConditionerDto>>> GetAirConditioners([FromQuery] AirConditionerParameters parameters)
    {
        try
        {
            var result = await _service.GetAirConditionersAsync(parameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get air conditioner by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AirConditionerDto>> GetById(Guid id)
    {
        try
        {
            var result = await _service.GetByIdAsync(id);
            return Ok(result);
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
    /// Create new air conditioner
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Create([FromBody] CreateAirConditionerDto dto)
    {
        try
        {
            var validationResult = await _createAirConditionerValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            await _service.AddAirConditionerAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = Guid.NewGuid() }, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update air conditioner
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateAirConditionerDto dto)
    {
        try
        {
            var validationResult = await _updateAirConditionerValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            await _service.UpdateAirConditionerAsync(id, dto);
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
    /// Delete air conditioner
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            await _service.DeleteAirConditionerAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get all error codes with pagination
    /// </summary>
    [HttpGet("error-codes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<ErrorCodeDto>>> GetAllErrorCodes([FromQuery] PageParameters pageParameters)
    {
        try
        {
            var result = await _service.GetAllErrorCodesAsync(pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get error codes by air conditioner ID
    /// </summary>
    [HttpGet("{airConditionerId}/error-codes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<ErrorCodeDto>>> GetErrorCodesByAirConditionerId(Guid airConditionerId, [FromQuery] PageParameters pageParameters)
    {
        try
        {
            var result = await _service.GetErrorCodesByAirConditionerIdAsync(airConditionerId, pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get error code by ID
    /// </summary>
    [HttpGet("error-codes/{errorCodeId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ErrorCodeDto>> GetErrorCodeById(Guid errorCodeId)
    {
        try
        {
            var result = await _service.GetErrorCodeByIdAsync(errorCodeId);
            return Ok(result);
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
    /// Create new error code
    /// </summary>
    [HttpPost("error-codes")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> CreateErrorCode([FromBody] CreateErrorCodeDto dto)
    {
        try
        {
            var validationResult = await _createErrorCodeValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            await _service.AddErrorCodeAsync(dto);
            return CreatedAtAction(nameof(GetErrorCodeById), new { errorCodeId = Guid.NewGuid() }, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update error code
    /// </summary>
    [HttpPut("error-codes/{errorCodeId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateErrorCode(Guid errorCodeId, [FromBody] UpdateErrorCodeDto dto)
    {
        try
        {
            var validationResult = await _updateErrorCodeValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            await _service.UpdateErrorCodeAsync(errorCodeId, dto);
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
    /// Delete error code
    /// </summary>
    [HttpDelete("error-codes/{errorCodeId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteErrorCode(Guid errorCodeId)
    {
        try
        {
            await _service.DeleteErrorCodeAsync(errorCodeId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }
}