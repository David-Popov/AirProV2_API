using API.Common;
using API.DTOs;

namespace API.Services.Montages;

public interface IMontageService
{
    Task AddMontageAsync(CreateMontageDto dto);
    
    Task UpdateMontageAsync(Guid montageId, UpdateMontageDto dto);
    
    Task UpdateMontageStatusAsync(Guid montageId, string status);
    
    Task UpdatePaymentStatusAsync(Guid montageId, string paymentStatus, decimal? paidAmount = null);

    
    Task DeleteMontageAsync(Guid montageId);
    
    Task<MontageDto?> GetByIdAsync(Guid montageId);
    
    Task<MontageDto?> GetByIdWithAirConditionerAsync(Guid montageId);
    
    Task<PagedList<MontageDto>> GetAllAsync(MontageParameters parameters);
    
    Task<PagedList<MontageDto>> GetByCompanyIdAsync(Guid companyId, MontageParameters parameters);
    
    Task<PagedList<MontageDto>> GetByUserIdAsync(string userId, PageParameters pageParameters);
    
    Task<PagedList<MontageDto>> GetByCompanyAndUserIdAsync(Guid companyId, string userId, PageParameters pageParameters);
    
    Task<PagedList<MontageDto>> GetByStatusAsync(string status, PageParameters pageParameters);
    
    Task<PagedList<MontageDto>> GetByInstallationDateRangeAsync(DateOnly startDate, DateOnly endDate, PageParameters pageParameters);
}