using API.Common;
using API.DTOs;

namespace API.Services.Companies;

public interface ICompanyService
{
    Task<CompanyDto> AddCompanyAsync(CreateCompanyDto dto);
    Task UpdateCompanyAsync(Guid companyId, UpdateCompanyDto dto);
    Task DeleteCompanyAsync(Guid companyId);
    Task<CompanyDto?> GetByIdAsync(Guid companyId);
    Task<PagedList<CompanyDto>> GetAllAsync(PageParameters pageParameters);
    Task<PagedList<CompanyDto>> GetActiveCompaniesAsync(PageParameters pageParameters);
    Task<CompanyDto?> GetByBulstatAsync(string bulstat);
    Task<UserDto> CreateCompanyUserAsync(Guid companyId, CreateCompanyUserDto dto);
    Task<IEnumerable<UserDto>> GetCompanyUsersAsync(Guid companyId);
    Task UpdateSubscriptionAsync(Guid companyId, UpdateSubscriptionDto dto);
    Task RenewSubscriptionForAllUsersAsync(Guid companyId);
    Task CheckAndExpireTrialSubscriptionsAsync();
}