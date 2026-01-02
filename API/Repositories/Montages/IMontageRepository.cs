using API.Data.Entities;

namespace API.Repositories;

public interface IMontageRepository
{
    Task AddMontageAsync(Montage montage);
    
    Task UpdateMontageAsync(Montage montage);
    
    Task DeleteMontageAsync(Montage montage);
    
    Task<Montage?> GetByIdAsync(Guid montageId);
    
    Task<Montage?> GetByIdWithAirConditionerAsync(Guid montageId);
    
    Task<IEnumerable<Montage>> GetAllAsync();
    
    Task<IEnumerable<Montage>> GetByCompanyIdAsync(Guid companyId);
    
    Task<IEnumerable<Montage>> GetByUserIdAsync(string userId);
    
    Task<IEnumerable<Montage>> GetByCompanyAndUserIdAsync(Guid companyId, string userId);
    
    Task<IEnumerable<Montage>> GetByStatusAsync(string status);
    
    Task<IEnumerable<Montage>> GetByInstallationDateRangeAsync(DateOnly startDate, DateOnly endDate);
}