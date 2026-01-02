using System.Security.Claims;
using API.DTOs;
using API.Services.Auth;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Controller for manager-specific operations like employee management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager,Admin")]
public class ManagerController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<ManagerController> _logger;
    private readonly IValidator<CreateEmployeeDto> _createEmployeeValidator;

    public ManagerController(
        IAuthService authService,
        ILogger<ManagerController> logger,
        IValidator<CreateEmployeeDto> createEmployeeValidator)
    {
        _authService = authService;
        _logger = logger;
        _createEmployeeValidator = createEmployeeValidator;
    }

    /// <summary>
    /// Create a new employee for the manager's company
    /// </summary>
    /// <remarks>
    /// Creates a new user account with the "User" role, linked to the manager's company.
    /// The employee will share the company's subscription.
    /// </remarks>
    [HttpPost("employees")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EmployeeDto>> CreateEmployee([FromBody] CreateEmployeeDto dto)
    {
        try
        {
            var validationResult = await _createEmployeeValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var result = await _authService.CreateEmployeeAsync(dto, companyId.Value);
            return CreatedAtAction(nameof(GetEmployeeById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = "An error occurred while creating the employee" });
        }
    }

    /// <summary>
    /// Get all employees in the manager's company
    /// </summary>
    [HttpGet("employees")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<EmployeeDto>>> GetEmployees()
    {
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var employees = await _authService.GetEmployeesByCompanyIdAsync(companyId.Value);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = "An error occurred while retrieving employees" });
        }
    }

    /// <summary>
    /// Get an employee by ID
    /// </summary>
    [HttpGet("employees/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EmployeeDto>> GetEmployeeById(string id)
    {
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var employee = await _authService.GetEmployeeByIdAsync(id, companyId.Value);
            if (employee == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            return Ok(employee);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = "An error occurred while retrieving the employee" });
        }
    }

    /// <summary>
    /// Update an employee
    /// </summary>
    [HttpPut("employees/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EmployeeDto>> UpdateEmployee(string id, [FromBody] CreateEmployeeDto dto)
    {
        try
        {
            // Password is optional for updates
            var validationResult = await _createEmployeeValidator.ValidateAsync(dto);
            // Filter out password validation errors if password is empty (optional for update)
            var errors = validationResult.Errors
                .Where(e => !e.PropertyName.Equals("Password", StringComparison.OrdinalIgnoreCase) || !string.IsNullOrEmpty(dto.Password))
                .ToList();
            
            if (errors.Any())
            {
                return BadRequest(new { errors = errors.Select(e => e.ErrorMessage) });
            }

            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var result = await _authService.UpdateEmployeeAsync(id, dto, companyId.Value);
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
            return StatusCode(500, new { message = "An error occurred while updating the employee" });
        }
    }

    /// <summary>
    /// Delete an employee
    /// </summary>
    /// <remarks>
    /// Managers cannot be deleted. Only users with the "User" role can be deleted.
    /// </remarks>
    [HttpDelete("employees/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteEmployee(string id)
    {
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            // Prevent self-deletion
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (id == currentUserId)
            {
                return BadRequest(new { message = "You cannot delete your own account" });
            }

            await _authService.DeleteEmployeeAsync(id, companyId.Value);
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
            return StatusCode(500, new { message = "An error occurred while deleting the employee" });
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
