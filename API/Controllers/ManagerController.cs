using System.Security.Claims;
using API.Data;
using API.DTOs;
using API.Models;
using API.Services.Auth;
using API.Services.Email;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ManagerController> _logger;
    private readonly IValidator<CreateEmployeeDto> _createEmployeeValidator;
    private readonly IEmailService _emailService;

    public ManagerController(
        IAuthService authService,
        ApplicationDbContext context,
        ILogger<ManagerController> logger,
        IValidator<CreateEmployeeDto> createEmployeeValidator,
        IEmailService emailService)
    {
        _authService = authService;
        _context = context;
        _logger = logger;
        _createEmployeeValidator = createEmployeeValidator;
        _emailService = emailService;
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
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var activeCount = await _authService.GetActiveEmployeeCountAsync(companyId.Value);

            var company = await _context.Companies.FindAsync(companyId.Value);
            if (company == null)
            {
                return NotFound(new { message = "Company not found" });
            }

            var maxEmployees = SubscriptionLimits.GetMaxEmployees(company.SubscriptionPlan);

            if (activeCount >= maxEmployees)
            {
                return BadRequest(new { message = $"Cannot activate more employees. Current plan allows {maxEmployees} active employees." });
            }

            var employee = await _context.Users.FindAsync(id);
            if (employee == null || employee.CompanyId != companyId.Value)
            {
                return NotFound(new { message = "Employee not found" });
            }

            if (await _authService.IsManagerAsync(id))
            {
                return BadRequest(new { message = "Cannot activate a Manager" });
            }

            employee.IsActive = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Employee activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = "An error occurred while activating the employee" });
        }
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
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var employee = await _context.Users.FindAsync(id);
            if (employee == null || employee.CompanyId != companyId.Value)
            {
                return NotFound(new { message = "Employee not found" });
            }

            if (await _authService.IsManagerAsync(id))
            {
                return BadRequest(new { message = "Cannot deactivate a Manager" });
            }

            employee.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Employee deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = "An error occurred while deactivating the employee" });
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
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var company = await _context.Companies.FindAsync(companyId.Value);
            if (company == null)
            {
                return NotFound(new { message = "Company not found" });
            }

            // Check if trial has already been used
            if (company.HasUsedTrial)
            {
                return BadRequest(new { message = "Trial period has already been used for this company. Please upgrade to Premium plan." });
            }

            // Can only activate trial from Free plan
            if (company.SubscriptionPlan != SubscriptionPlan.Free)
            {
                return BadRequest(new { message = $"Trial can only be activated from Free plan. Current plan: {company.SubscriptionPlan}" });
            }

            // Activate trial
            company.SubscriptionPlan = SubscriptionPlan.FreeTrial;
            company.SubscriptionStatus = SubscriptionStatus.Trial;
            company.TrialStartDate = DateTime.UtcNow;
            company.TrialEndDate = DateTime.UtcNow.AddMonths(6);  // 6 months trial
            company.HasUsedTrial = true;  // Mark as used (cannot activate again)
            company.IsSubscriptionActive = true;
            company.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send trial activation email
            try
            {
                await _emailService.SendTrialActivatedEmailAsync(company, company.TrialEndDate!.Value);
            }
            catch (Exception emailEx)
            {
                _logger.LogWarning(emailEx, "Failed to send trial activation email for company {CompanyId}", company.Id);
            }

            return Ok(new
            {
                message = "Trial activated successfully",
                trial_end_date = company.TrialEndDate,
                subscription_plan = company.SubscriptionPlan.ToString(),
                subscription_status = company.SubscriptionStatus.ToString()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = "An error occurred while activating trial" });
        }
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
        try
        {
            var companyId = GetCurrentUserCompanyId();
            if (companyId == null)
            {
                return BadRequest(new { message = "User is not associated with a company" });
            }

            var company = await _context.Companies.FindAsync(companyId.Value);
            if (company == null)
            {
                return NotFound(new { message = "Company not found" });
            }

            // Count only active User role employees (NOT Manager role!)
            var currentCount = await _authService.GetActiveEmployeeCountAsync(companyId.Value);
            var maxCount = SubscriptionLimits.GetMaxEmployees(company.SubscriptionPlan);

            return Ok(new EmployeeLimitsDto
            {
                CurrentCount = currentCount,
                MaxCount = maxCount,
                CanAddMore = currentCount < maxCount,
                SubscriptionPlan = company.SubscriptionPlan.ToString()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return StatusCode(500, new { message = "An error occurred while retrieving employee limits" });
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
