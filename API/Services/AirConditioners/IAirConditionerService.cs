using API.Common;
using API.DTOs;

namespace API.Services.AirConditioners;

public interface IAirConditionerService
{
    Task AddAirConditionerAsync(CreateAirConditionerDto dto);
    
    Task UpdateAirConditionerAsync(Guid airConditionerId, UpdateAirConditionerDto dto);
    
    Task DeleteAirConditionerAsync(Guid airConditionerId);
    
    Task<AirConditionerDto?> GetByIdAsync(Guid airConditionerId);
    
    Task<PagedList<AirConditionerDto>> GetAirConditionersAsync(PageParameters pageParameters);
    
    Task AddErrorCodeAsync(CreateErrorCodeDto dto);
    
    Task UpdateErrorCodeAsync(Guid errorCodeId, UpdateErrorCodeDto dto);
    
    Task DeleteErrorCodeAsync(Guid errorCodeId);
    
    Task<ErrorCodeDto?> GetErrorCodeByIdAsync(Guid errorCodeId);
    
    Task<PagedList<ErrorCodeDto>> GetErrorCodesByAirConditionerIdAsync(Guid airConditionerId, PageParameters pageParameters);
    
    Task<PagedList<ErrorCodeDto>> GetAllErrorCodesAsync(PageParameters pageParameters);
}