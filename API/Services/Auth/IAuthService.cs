using API.DTOs;
using API.DTOs.Auth;
using API.Models;
namespace API.Services.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    
    Task<AuthResponseDto> RefreshTokenAsync(string token, string refreshToken);

    Task<AuthUserDto?> GetCurrentUserAsync(string userId);
    
    Task<bool> UserExistsAsync(string email);
    
    Task<AuthUserDto> UpdateProfileAsync(string userId, UpdateProfileDto dto);
    
    // Employee management (for Managers)
    Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto, Guid companyId);
    
    Task<List<EmployeeDto>> GetEmployeesByCompanyIdAsync(Guid companyId);
    
    Task<EmployeeDto?> GetEmployeeByIdAsync(string employeeId, Guid companyId);
    
    Task DeleteEmployeeAsync(string employeeId, Guid companyId);

    Task<EmployeeDto> UpdateEmployeeAsync(string employeeId, CreateEmployeeDto dto, Guid companyId);

    Task<IList<string>> GetUserRolesAsync(string userId);

    Task<int> GetActiveEmployeeCountAsync(Guid companyId);

    Task<bool> IsManagerAsync(string userId);
}
