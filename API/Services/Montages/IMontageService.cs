using API.Common;
using API.DTOs;

namespace API.Services.Montages;

public interface IMontageService
{
    Task AddMontageAsync(CreateMontageDto dto);
    
    Task UpdateMontageAsync(Guid montageId, UpdateMontageDto dto);
    
    Task UpdateMontageStatusAsync(Guid montageId, string status);
    
    Task DeleteMontageAsync(Guid montageId);
    
    Task<MontageDto?> GetByIdAsync(Guid montageId);
    
    Task<MontageDto?> GetByIdWithAirConditionerAsync(Guid montageId);
    
    Task<PagedList<MontageDto>> GetAllAsync(PageParameters pageParameters);
    
    Task<PagedList<MontageDto>> GetByCompanyIdAsync(Guid companyId, PageParameters pageParameters);
    
    Task<PagedList<MontageDto>> GetByUserIdAsync(string userId, PageParameters pageParameters);
    
    Task<PagedList<MontageDto>> GetByCompanyAndUserIdAsync(Guid companyId, string userId, PageParameters pageParameters);
    
    Task<PagedList<MontageDto>> GetByStatusAsync(string status, PageParameters pageParameters);
    
    Task<PagedList<MontageDto>> GetByInstallationDateRangeAsync(DateOnly startDate, DateOnly endDate, PageParameters pageParameters);
}