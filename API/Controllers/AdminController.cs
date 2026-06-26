using ValidationException = FluentValidation.ValidationException;
using API.Common;
using API.DTOs.Admin;
using API.DTOs.Auth;
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

    [HttpGet("companies")]
    public async Task<IActionResult> GetAllCompanies([FromQuery] AdminCompanyFilterDto filter)
    {
        var result = await _adminService.GetAllCompaniesAsync(filter);
        return Ok(result);
    }

    [HttpGet("companies/{id:guid}")]
    public async Task<IActionResult> GetCompanyById(Guid id)
    {
        var company = await _adminService.GetCompanyByIdAsync(id);
        if (company == null) return NotFound();
        return Ok(company);
    }

    [HttpPut("companies/{id:guid}/subscription")]
    public async Task<IActionResult> UpdateCompanySubscription(Guid id, [FromBody] AdminUpdateSubscriptionDto dto)
    {
        var result = await _adminService.UpdateCompanySubscriptionAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("companies/{id:guid}")]
    public async Task<IActionResult> DeleteCompany(Guid id)
    {
        var result = await _adminService.SoftDeleteCompanyAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("companies/{id:guid}/restore")]
    public async Task<IActionResult> RestoreCompany(Guid id)
    {
        var result = await _adminService.RestoreCompanyAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    #endregion

    #region User Endpoints

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers([FromQuery] AdminUserFilterDto filter)
    {
        var result = await _adminService.GetAllUsersAsync(filter);
        return Ok(result);
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _adminService.GetUserByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] AdminUpdateUserDto dto)
    {
        var result = await _adminService.UpdateUserAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("users/{id}/password")]
    public async Task<IActionResult> ChangeUserPassword(string id, [FromBody] AdminChangePasswordDto dto)
    {
        var result = await _adminService.ChangeUserPasswordAsync(id, dto);
        if (!result) throw new ValidationException("Failed to change password");
        return NoContent();
    }

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

    [HttpPost("users/{id}/change-email/request")]
    public async Task<IActionResult> RequestUserEmailChange(string id, [FromBody] RequestEmailChangeDto dto)
    {
        await _adminService.RequestUserEmailChangeAsync(id, dto.NewEmail);
        return NoContent();
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var result = await _adminService.SoftDeleteUserAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("users/{id}/restore")]
    public async Task<IActionResult> RestoreUser(string id)
    {
        var result = await _adminService.RestoreUserAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    #endregion

    #region Montage Endpoints

    [HttpGet("montages")]
    public async Task<IActionResult> GetAllMontages([FromQuery] AdminMontageFilterDto filter)
    {
        var result = await _adminService.GetAllMontagesAsync(filter);
        return Ok(result);
    }

    [HttpGet("montages/{id:guid}")]
    public async Task<IActionResult> GetMontageById(Guid id)
    {
        var montage = await _adminService.GetMontageByIdAsync(id);
        if (montage == null) return NotFound();
        return Ok(montage);
    }

    [HttpPost("montages")]
    public async Task<IActionResult> CreateMontage([FromBody] AdminCreateMontageDto dto)
    {
        var result = await _adminService.CreateMontageAsync(dto);
        return CreatedAtAction(nameof(GetMontageById), new { id = result.Id }, result);
    }

    [HttpPut("montages/{id:guid}")]
    public async Task<IActionResult> UpdateMontage(Guid id, [FromBody] AdminCreateMontageDto dto)
    {
        var result = await _adminService.UpdateMontageAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("montages/{id:guid}")]
    public async Task<IActionResult> DeleteMontage(Guid id)
    {
        var result = await _adminService.DeleteMontageAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    #endregion
}
