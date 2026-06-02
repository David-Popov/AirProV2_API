using API.Common;
using API.Constants;
using API.DTOs;
using API.Services.Companies;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CompaniesController : ApiControllerBase
{
    private readonly ICompanyService _service;
    private readonly IValidator<CreateCompanyDto> _createCompanyValidator;
    private readonly IValidator<UpdateCompanyDto> _updateCompanyValidator;
    private readonly IValidator<CreateCompanyUserDto> _createCompanyUserValidator;
    private readonly IValidator<UpdateSubscriptionDto> _updateSubscriptionValidator;

    public CompaniesController(
        ICompanyService service,
        IValidator<CreateCompanyDto> createCompanyValidator,
        IValidator<UpdateCompanyDto> updateCompanyValidator,
        IValidator<CreateCompanyUserDto> createCompanyUserValidator,
        IValidator<UpdateSubscriptionDto> updateSubscriptionValidator)
    {
        _service = service;
        _createCompanyValidator = createCompanyValidator;
        _updateCompanyValidator = updateCompanyValidator;
        _createCompanyUserValidator = createCompanyUserValidator;
        _updateSubscriptionValidator = updateSubscriptionValidator;
    }

    /// <summary>
    /// Get all companies with pagination (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(typeof(PagedList<CompanyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedList<CompanyDto>>> GetAll([FromQuery] PageParameters pageParameters)
    {
        var result = await _service.GetAllAsync(pageParameters);
        return Ok(result);
    }

    /// <summary>
    /// Get active companies with pagination (Admin only)
    /// </summary>
    [HttpGet("active")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(typeof(PagedList<CompanyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedList<CompanyDto>>> GetActiveCompanies([FromQuery] PageParameters pageParameters)
    {
        var result = await _service.GetActiveCompaniesAsync(pageParameters);
        return Ok(result);
    }

    /// <summary>
    /// Get company by ID — caller must be Admin OR a member of the requested company
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CompanyDto>> GetById(Guid id)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException("Id is required");
        }

        EnsureCanAccessCompany(id);

        var result = await _service.GetByIdAsync(id);
        if (result == null)
        {
            throw new NotFoundException("Company not found");
        }
        return Ok(result);
    }

    /// <summary>
    /// Get company by BULSTAT — Admin only (lookup endpoint; cannot enforce per-company scoping pre-fetch)
    /// </summary>
    [HttpGet("bulstat/{bulstat}")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CompanyDto>> GetByBulstat(string bulstat)
    {
        if (string.IsNullOrEmpty(bulstat))
        {
            throw new ValidationException("Bulstat is required");
        }

        var result = await _service.GetByBulstatAsync(bulstat);
        if (result == null)
        {
            throw new NotFoundException("Company not found");
        }
        return Ok(result);
    }

    /// <summary>
    /// Create new company (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CompanyDto>> Create([FromBody] CreateCompanyDto dto)
    {
        var validationResult = await _createCompanyValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var result = await _service.AddCompanyAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update company (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateCompanyDto dto)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException("Id is required");
        }

        var validationResult = await _updateCompanyValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        await _service.UpdateCompanyAsync(id, dto);
        return NoContent();
    }

    /// <summary>
    /// Delete company (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> Delete(Guid id)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException("Id is required");
        }

        await _service.DeleteCompanyAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Get company users — caller must be Admin or a member of the company
    /// </summary>
    [HttpGet("{id}/users")]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetCompanyUsers(Guid id)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException("Id is required");
        }

        EnsureCanAccessCompany(id);

        var result = await _service.GetCompanyUsersAsync(id);
        return Ok(result);
    }

    /// <summary>
    /// Create user for company (Admin only)
    /// </summary>
    [HttpPost("{id}/users")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> CreateCompanyUser(Guid id, [FromBody] CreateCompanyUserDto dto)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException("Id is required");
        }

        var validationResult = await _createCompanyUserValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var result = await _service.CreateCompanyUserAsync(id, dto);
        return CreatedAtAction(nameof(GetCompanyUsers), new { id }, result);
    }

    /// <summary>
    /// Update company subscription (Admin only)
    /// </summary>
    [HttpPut("{id}/subscription")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UpdateSubscription(Guid id, [FromBody] UpdateSubscriptionDto dto)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException("Id is required");
        }

        var validationResult = await _updateSubscriptionValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        await _service.UpdateSubscriptionAsync(id, dto);
        return NoContent();
    }

    /// <summary>
    /// Renew subscription for company and all users (Admin only)
    /// </summary>
    [HttpPost("{id}/subscription/renew")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> RenewSubscription(Guid id)
    {
        if (id == Guid.Empty)
        {
            throw new ValidationException("Id is required");
        }

        await _service.RenewSubscriptionForAllUsersAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Check and expire trial subscriptions (Admin only)
    /// </summary>
    [HttpPost("subscriptions/check-trials")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> CheckTrialSubscriptions()
    {
        await _service.CheckAndExpireTrialSubscriptionsAsync();
        return NoContent();
    }

    private void EnsureCanAccessCompany(Guid companyId)
    {
        if (User.IsInRole(AppRoles.Admin))
        {
            return;
        }

        var callerCompanyId = GetCurrentUserCompanyId();
        if (callerCompanyId != companyId)
        {
            throw new ForbiddenException("You do not have access to this company.");
        }
    }
}
