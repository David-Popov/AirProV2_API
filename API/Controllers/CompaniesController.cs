using API.Common;
using API.DTOs;
using API.Services;
using API.Services.Companies;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyService _service;
    private readonly ILogger<CompaniesController> _logger;
    private readonly IValidator<CreateCompanyDto> _createCompanyValidator;
    private readonly IValidator<UpdateCompanyDto> _updateCompanyValidator;
    private readonly IValidator<CreateCompanyUserDto> _createCompanyUserValidator;
    private readonly IValidator<UpdateSubscriptionDto> _updateSubscriptionValidator;

    public CompaniesController(
        ICompanyService service,
        ILogger<CompaniesController> logger,
        IValidator<CreateCompanyDto> createCompanyValidator,
        IValidator<UpdateCompanyDto> updateCompanyValidator,
        IValidator<CreateCompanyUserDto> createCompanyUserValidator,
        IValidator<UpdateSubscriptionDto> updateSubscriptionValidator)
    {
        _service = service;
        _logger = logger;
        _createCompanyValidator = createCompanyValidator;
        _updateCompanyValidator = updateCompanyValidator;
        _createCompanyUserValidator = createCompanyUserValidator;
        _updateSubscriptionValidator = updateSubscriptionValidator;
    }

    /// <summary>
    /// Get all companies with pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<CompanyDto>>> GetAll([FromQuery] PageParameters pageParameters)
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
    /// Get active companies with pagination
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedList<CompanyDto>>> GetActiveCompanies([FromQuery] PageParameters pageParameters)
    {
        try
        {
            var result = await _service.GetActiveCompaniesAsync(pageParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get company by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CompanyDto>> GetById(Guid id)
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
                return NotFound(new { message = "Company not found" });
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
    /// Get company by BULSTAT
    /// </summary>
    [HttpGet("bulstat/{bulstat}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CompanyDto>> GetByBulstat(string bulstat)
    {
        try
        {
            if (string.IsNullOrEmpty(bulstat))
            {
                return BadRequest("Bulstat is required");
            }
            
            var result = await _service.GetByBulstatAsync(bulstat);
            if (result == null)
            {
                return NotFound(new { message = "Company not found" });
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
    /// Create new company
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CompanyDto>> Create([FromBody] CreateCompanyDto dto)
    {
        try
        {
            var validationResult = await _createCompanyValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var result = await _service.AddCompanyAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
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
    /// Update company
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateCompanyDto dto)
    {
        try
        {
            if (id == Guid.Empty)
            {
                return BadRequest("Id is required");
            }
            
            var validationResult = await _updateCompanyValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            await _service.UpdateCompanyAsync(id, dto);
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
    /// Delete company
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            if (id == Guid.Empty)
            {
                return BadRequest("Id is required");
            }
            
            await _service.DeleteCompanyAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get company users
    /// </summary>
    [HttpGet("{id}/users")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetCompanyUsers(Guid id)
    {
        try
        {
            if (id == Guid.Empty)
            {
                return BadRequest("Id is required");
            }
            
            var result = await _service.GetCompanyUsersAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create user for company
    /// </summary>
    [HttpPost("{id}/users")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserDto>> CreateCompanyUser(Guid id, [FromBody] CreateCompanyUserDto dto)
    {
        try
        {
            if (id == Guid.Empty)
            {
                return BadRequest("Id is required");
            }
            
            var validationResult = await _createCompanyUserValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var result = await _service.CreateCompanyUserAsync(id, dto);
            return CreatedAtAction(nameof(GetCompanyUsers), new { id }, result);
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
    /// Update company subscription
    /// </summary>
    [HttpPut("{id}/subscription")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateSubscription(Guid id, [FromBody] UpdateSubscriptionDto dto)
    {
        try
        {
            if (id == Guid.Empty)
            {
                return BadRequest("Id is required");
            }
            
            var validationResult = await _updateSubscriptionValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            await _service.UpdateSubscriptionAsync(id, dto);
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
    /// Renew subscription for company and all users
    /// </summary>
    [HttpPost("{id}/subscription/renew")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> RenewSubscription(Guid id)
    {
        try
        {
            if (id == Guid.Empty)
            {
                return BadRequest("Id is required");
            }
            
            await _service.RenewSubscriptionForAllUsersAsync(id);
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
    /// Check and expire trial subscriptions (admin endpoint)
    /// </summary>
    [HttpPost("subscriptions/check-trials")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> CheckTrialSubscriptions()
    {
        try
        {
            await _service.CheckAndExpireTrialSubscriptionsAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = ex.Message });
        }
    }
}