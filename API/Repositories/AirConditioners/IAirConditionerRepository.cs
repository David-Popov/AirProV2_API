using API.Data.Entities;

namespace API.Repositories;

public interface IAirConditionerRepository
{
    Task AddAirConditionerAsync(AirConditioner airConditioner);
    
    Task UpdateAirConditionerAsync(AirConditioner airConditioner);
    
    Task DeleteAirConditionerAsync(AirConditioner airConditioner);
    
    Task<AirConditioner?> GetByIdAsync(Guid airConditionerId);
    
    Task<IEnumerable<AirConditioner>> GetAirConditionersAsync();
    
    Task AddErrorCodeAsync(ErrorCode errorCode);
    
    Task UpdateErrorCodeAsync(ErrorCode errorCode);
    
    Task DeleteErrorCodeAsync(ErrorCode errorCode);
    
    Task<ErrorCode?> GetErrorCodeByIdAsync(Guid errorCodeId);
    
    Task<IEnumerable<ErrorCode>> GetErrorCodesByAirConditionerIdAsync(Guid airConditionerId);
    
    Task<IEnumerable<ErrorCode>> GetAllErrorCodesAsync();
}