using API.DTOs;

namespace API.Services.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    
    Task<AuthUserDto?> GetCurrentUserAsync(string userId);
    
    Task<bool> UserExistsAsync(string email);
    
    // Employee management (for Managers)
    Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto, Guid companyId);
    
    Task<List<EmployeeDto>> GetEmployeesByCompanyIdAsync(Guid companyId);
    
    Task<EmployeeDto?> GetEmployeeByIdAsync(string employeeId, Guid companyId);
    
    Task DeleteEmployeeAsync(string employeeId, Guid companyId);
    
    Task<EmployeeDto> UpdateEmployeeAsync(string employeeId, CreateEmployeeDto dto, Guid companyId);
}
