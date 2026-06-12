using API.DTOs;
using API.DTOs.Auth;
using API.Models;
using Microsoft.AspNetCore.Identity;

namespace API.Services.Auth;

public interface IAuthService
{
    Task RegisterAsync(RegisterDto dto);
    
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    
    Task<AuthResponseDto> RefreshTokenAsync(string token, string refreshToken);

    Task<AuthUserDto?> GetCurrentUserAsync(string userId);
    
    Task<bool> UserExistsAsync(string email);
    
    Task<AuthUserDto> UpdateProfileAsync(string userId, UpdateProfileDto dto);
    
    Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto, Guid companyId);
    
    Task<List<EmployeeDto>> GetEmployeesByCompanyIdAsync(Guid companyId);
    
    Task<EmployeeDto?> GetEmployeeByIdAsync(string employeeId, Guid companyId);
    
    Task DeleteEmployeeAsync(string employeeId, Guid companyId);

    Task<EmployeeDto> UpdateEmployeeAsync(string employeeId, CreateEmployeeDto dto, Guid companyId);

    Task<IList<string>> GetUserRolesAsync(string userId);

    Task<int> GetActiveEmployeeCountAsync(Guid companyId);

    Task<bool> IsManagerAsync(string userId);

    /// <summary>Activates an employee. Throws NotFoundException or InvalidOperationException on business-rule violations.</summary>
    Task ActivateEmployeeAsync(string employeeId, Guid companyId);

    /// <summary>Deactivates an employee. Throws NotFoundException or InvalidOperationException on business-rule violations.</summary>
    Task DeactivateEmployeeAsync(string employeeId, Guid companyId);

    /// <summary>Activates the free trial for the company. Returns a DTO with trial details and the company entity for email queuing.</summary>
    Task<TrialActivationResultDto> ActivateTrialAsync(Guid companyId);

    /// <summary>Returns the current and maximum employee counts for the company's subscription plan.</summary>
    Task<EmployeeLimitsDto> GetEmployeeLimitsAsync(Guid companyId);

    /// <summary>Deletes the company and all associated data. Returns (companyEmail, companyName) for the controller to queue a confirmation email.</summary>
    Task<(string email, string companyName)> DeleteAccountAndCompanyAsync(Guid companyId);

    Task<IdentityResult> ConfirmEmailAsync(string userId, string token);
    Task ResendConfirmationEmailAsync(string email);
    Task ForgotPasswordAsync(string email);
    Task<IdentityResult> ResetPasswordAsync(string email, string token, string newPassword);
    Task<IdentityResult> ChangePasswordAsync(string userId, string newPassword);
    Task RequestEmailChangeAsync(string userId, string newEmail);
    Task<IdentityResult> ConfirmEmailChangeAsync(string userId, string newEmail, string token);
}
