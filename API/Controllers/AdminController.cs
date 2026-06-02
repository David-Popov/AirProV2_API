using ValidationException = FluentValidation.ValidationException;
using API.Common;
using API.DTOs.Admin;
using API.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    #region Company Endpoints

    /// <summary>
    /// Get all companies with filters (Admin only)
    /// </summary>
    [HttpGet("companies")]
    public async Task<IActionResult> GetAllCompanies([FromQuery] AdminCompanyFilterDto filter)
    {
        var result = await _adminService.GetAllCompaniesAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// Get company by ID (Admin only)
    /// </summary>
    [HttpGet("companies/{id:guid}")]
    public async Task<IActionResult> GetCompanyById(Guid id)
    {
        var company = await _adminService.GetCompanyByIdAsync(id);
        if (company == null) return NotFound();
        return Ok(company);
    }

    /// <summary>
    /// Update company subscription (Admin only)
    /// </summary>
    [HttpPut("companies/{id:guid}/subscription")]
    public async Task<IActionResult> UpdateCompanySubscription(Guid id, [FromBody] AdminUpdateSubscriptionDto dto)
    {
        var result = await _adminService.UpdateCompanySubscriptionAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// Soft delete company (Admin only)
    /// </summary>
    [HttpDelete("companies/{id:guid}")]
    public async Task<IActionResult> DeleteCompany(Guid id)
    {
        var result = await _adminService.SoftDeleteCompanyAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Restore soft-deleted company (Admin only)
    /// </summary>
    [HttpPost("companies/{id:guid}/restore")]
    public async Task<IActionResult> RestoreCompany(Guid id)
    {
        var result = await _adminService.RestoreCompanyAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    #endregion

    #region User Endpoints

    /// <summary>
    /// Get all users with filters (Admin only)
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers([FromQuery] AdminUserFilterDto filter)
    {
        var result = await _adminService.GetAllUsersAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// Get user by ID (Admin only)
    /// </summary>
    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _adminService.GetUserByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    /// <summary>
    /// Update user attributes (Admin only)
    /// </summary>
    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] AdminUpdateUserDto dto)
    {
        var result = await _adminService.UpdateUserAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// Change user password (Admin only)
    /// </summary>
    [HttpPut("users/{id}/password")]
    public async Task<IActionResult> ChangeUserPassword(string id, [FromBody] AdminChangePasswordDto dto)
    {
        var result = await _adminService.ChangeUserPasswordAsync(id, dto);
        if (!result) throw new ValidationException("Failed to change password");
        return NoContent();
    }

    /// <summary>
    /// Change user role (Admin only) - Only Manager <-> User allowed
    /// </summary>
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> ChangeUserRole(string id, [FromBody] AdminChangeRoleDto dto)
    {
        if (dto.NewRole != "Manager" && dto.NewRole != "User")
        {
            throw new ValidationException("Only 'Manager' or 'User' roles are allowed");
        }

        var result = await _adminService.ChangeUserRoleAsync(id, dto);
        if (!result) throw new ValidationException("Failed to change role. Admin users cannot have their roles changed.");
        return NoContent();
    }

    /// <summary>
    /// Soft delete user (Admin only)
    /// </summary>
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var result = await _adminService.SoftDeleteUserAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Restore soft-deleted user (Admin only)
    /// </summary>
    [HttpPost("users/{id}/restore")]
    public async Task<IActionResult> RestoreUser(string id)
    {
        var result = await _adminService.RestoreUserAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    #endregion

    #region Montage Endpoints

    /// <summary>
    /// Get all montages with filters (Admin only)
    /// </summary>
    [HttpGet("montages")]
    public async Task<IActionResult> GetAllMontages([FromQuery] AdminMontageFilterDto filter)
    {
        var result = await _adminService.GetAllMontagesAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// Get montage by ID (Admin only)
    /// </summary>
    [HttpGet("montages/{id:guid}")]
    public async Task<IActionResult> GetMontageById(Guid id)
    {
        var montage = await _adminService.GetMontageByIdAsync(id);
        if (montage == null) return NotFound();
        return Ok(montage);
    }

    /// <summary>
    /// Create montage (Admin only)
    /// </summary>
    [HttpPost("montages")]
    public async Task<IActionResult> CreateMontage([FromBody] AdminCreateMontageDto dto)
    {
        var result = await _adminService.CreateMontageAsync(dto);
        return CreatedAtAction(nameof(GetMontageById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update montage (Admin only)
    /// </summary>
    [HttpPut("montages/{id:guid}")]
    public async Task<IActionResult> UpdateMontage(Guid id, [FromBody] AdminCreateMontageDto dto)
    {
        var result = await _adminService.UpdateMontageAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// Delete montage (Admin only)
    /// </summary>
    [HttpDelete("montages/{id:guid}")]
    public async Task<IActionResult> DeleteMontage(Guid id)
    {
        var result = await _adminService.DeleteMontageAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    #endregion
}
