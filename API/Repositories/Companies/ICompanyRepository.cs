using API.Data.Entities;

namespace API.Repositories.Companies;

public interface ICompanyRepository
{
    Task AddCompanyAsync(Company company);
    Task UpdateCompanyAsync(Company company);
    Task DeleteCompanyAsync(Company company);
    Task<Company?> GetByIdAsync(Guid companyId);
    Task<Company?> GetByIdWithUsersAsync(Guid companyId);
    Task<IEnumerable<Company>> GetAllAsync();
    Task<IEnumerable<Company>> GetActiveCompaniesAsync();
    Task<Company?> GetByBulstatAsync(string bulstat);
    Task<IEnumerable<ApplicationUser>> GetCompanyUsersAsync(Guid companyId);
    Task<bool> HasActiveSubscriptionAsync(Guid companyId);
}