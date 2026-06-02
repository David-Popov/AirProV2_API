using ValidationException = FluentValidation.ValidationException;
using API.Common;
using API.DTOs;
using API.Services.Auth;
using API.Services.Email;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Controller for manager-specific operations like employee management
/// </summary>
[Authorize(Roles = "Manager,Admin")]
public class ManagerController : ApiControllerBase
{
    private readonly IAuthService _authService;
    private readonly IValidator<CreateEmployeeDto> _createEmployeeValidator;
    private readonly IBackgroundEmailQueue _backgroundEmailQueue;

    public ManagerController(
        IAuthService authService,
        IValidator<CreateEmployeeDto> createEmployeeValidator,
        IBackgroundEmailQueue backgroundEmailQueue)
    {
        _authService = authService;
        _createEmployeeValidator = createEmployeeValidator;
        _backgroundEmailQueue = backgroundEmailQueue;
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
        var validationResult = await _createEmployeeValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var result = await _authService.CreateEmployeeAsync(dto, companyId.Value);
        return CreatedAtAction(nameof(GetEmployeeById), new { id = result.Id }, result);
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
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var employees = await _authService.GetEmployeesByCompanyIdAsync(companyId.Value);
        return Ok(employees);
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
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var employee = await _authService.GetEmployeeByIdAsync(id, companyId.Value);
        if (employee == null)
        {
            throw new NotFoundException("Employee not found");
        }

        return Ok(employee);
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
        // Password is optional for updates
        var validationResult = await _createEmployeeValidator.ValidateAsync(dto);
        // Filter out password validation errors if password is empty (optional for update)
        var errors = validationResult.Errors
            .Where(e => !e.PropertyName.Equals("Password", StringComparison.OrdinalIgnoreCase) || !string.IsNullOrEmpty(dto.Password))
            .ToList();

        if (errors.Any())
        {
            throw new ValidationException(errors);
        }

        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var result = await _authService.UpdateEmployeeAsync(id, dto, companyId.Value);
        return Ok(result);
    }

    /// <summary>
    /// Activate an employee
    /// </summary>
    [HttpPost("employees/{id}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> ActivateEmployee(string id)
    {
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        await _authService.ActivateEmployeeAsync(id, companyId.Value);
        return Ok(new { message = "Employee activated successfully" });
    }

    /// <summary>
    /// Deactivate an employee
    /// </summary>
    [HttpPost("employees/{id}/deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeactivateEmployee(string id)
    {
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        await _authService.DeactivateEmployeeAsync(id, companyId.Value);
        return Ok(new { message = "Employee deactivated successfully" });
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
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        // Prevent self-deletion
        var currentUserId = GetCurrentUserId();
        if (id == currentUserId)
        {
            throw new ValidationException("You cannot delete your own account");
        }

        await _authService.DeleteEmployeeAsync(id, companyId.Value);
        return NoContent();
    }

    /// <summary>
    /// Activate 6-month trial period for the company
    /// </summary>
    /// <remarks>
    /// Trial can only be activated once per company and only from Free plan.
    /// Trial period is 6 months with unlimited employees.
    /// </remarks>
    [HttpPost("activate-trial")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> ActivateTrial()
    {
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var result = await _authService.ActivateTrialAsync(companyId.Value);

        // Queue trial activation email (non-blocking)
        var trialCompany = result.Company;
        var trialEndDate = result.TrialEndDate;
        _backgroundEmailQueue.QueueEmail(async sp =>
        {
            var emailService = sp.GetRequiredService<IEmailService>();
            await emailService.SendTrialActivatedEmailAsync(trialCompany, trialEndDate);
        });

        return Ok(new
        {
            message = "Trial activated successfully",
            trial_end_date = result.TrialEndDate,
            subscription_plan = result.SubscriptionPlan,
            subscription_status = result.SubscriptionStatus
        });
    }

    /// <summary>
    /// Get employee limits for the current company's subscription plan
    /// </summary>
    [HttpGet("employee-limits")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EmployeeLimitsDto>> GetEmployeeLimits()
    {
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var result = await _authService.GetEmployeeLimitsAsync(companyId.Value);
        return Ok(result);
    }

    /// <summary>
    /// Delete the manager's own account, company, and all associated data permanently
    /// </summary>
    /// <remarks>
    /// This is a destructive, irreversible operation. It deletes:
    /// - All montages (and their photos, inventory usage records)
    /// - All inventory items and audit logs
    /// - All employee accounts
    /// - The manager's own account
    /// - The company itself
    /// Only the company Manager can perform this action.
    /// </remarks>
    [HttpDelete("account")]
    [Authorize(Roles = "Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteAccountAndCompany()
    {
        var companyId = GetCurrentUserCompanyId();
        if (companyId == null)
        {
            throw new ValidationException("User is not associated with a company");
        }

        var currentUserId = GetCurrentUserId();
        if (string.IsNullOrEmpty(currentUserId))
        {
            throw new ValidationException("Unable to identify current user");
        }

        var (companyEmail, companyName) = await _authService.DeleteAccountAndCompanyAsync(companyId.Value);

        // Queue deletion confirmation email
        if (!string.IsNullOrEmpty(companyEmail))
        {
            _backgroundEmailQueue.QueueEmail(async sp =>
            {
                var emailService = sp.GetRequiredService<IEmailService>();
                await emailService.SendAccountDeletionConfirmationEmailAsync(companyEmail, companyName);
            });
        }

        return NoContent();
    }

}
