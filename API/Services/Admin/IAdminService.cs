using API.Common;
using API.DTOs.Admin;

namespace API.Services.Admin;

public interface IAdminService
{
    Task<PagedResult<AdminCompanyDto>> GetAllCompaniesAsync(AdminCompanyFilterDto filter);
    Task<AdminCompanyDto?> GetCompanyByIdAsync(Guid id);
    Task<AdminCompanyDto?> UpdateCompanySubscriptionAsync(Guid companyId, AdminUpdateSubscriptionDto dto);
    Task<bool> SoftDeleteCompanyAsync(Guid companyId);
    Task<bool> RestoreCompanyAsync(Guid companyId);
    
    Task<PagedResult<AdminUserDto>> GetAllUsersAsync(AdminUserFilterDto filter);
    Task<AdminUserDto?> GetUserByIdAsync(string userId);
    Task<AdminUserDto?> UpdateUserAsync(string userId, AdminUpdateUserDto dto);
    Task<bool> ChangeUserPasswordAsync(string userId, AdminChangePasswordDto dto);
    Task<bool> ChangeUserRoleAsync(string userId, AdminChangeRoleDto dto);
    Task RequestUserEmailChangeAsync(string userId, string newEmail);
    Task<bool> SoftDeleteUserAsync(string userId);
    Task<bool> RestoreUserAsync(string userId);
    
    Task<PagedResult<AdminMontageDto>> GetAllMontagesAsync(AdminMontageFilterDto filter);
    Task<AdminMontageDto?> GetMontageByIdAsync(Guid montageId);
    Task<AdminMontageDto> CreateMontageAsync(AdminCreateMontageDto dto);
    Task<AdminMontageDto?> UpdateMontageAsync(Guid montageId, AdminCreateMontageDto dto);
    Task<bool> DeleteMontageAsync(Guid montageId);
}
