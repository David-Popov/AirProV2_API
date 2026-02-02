using API.Data;
using API.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class AirConditionerRepository : IAirConditionerRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AirConditionerRepository> _logger;
    
    public AirConditionerRepository(ApplicationDbContext context, ILogger<AirConditionerRepository> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    public async Task AddAirConditionerAsync(AirConditioner airConditioner)
    {
        try
        {
            await _context.AirConditioners.AddAsync(airConditioner);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateAirConditionerAsync(AirConditioner airConditioner)
    {
        try
        {
            _context.AirConditioners.Update(airConditioner);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteAirConditionerAsync(AirConditioner airConditioner)
    {
        try
        {
            _context.AirConditioners.Remove(airConditioner);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<AirConditioner?> GetByIdAsync(Guid airConditionerId)
    {
        try
        {
            return await _context.AirConditioners.AsNoTracking().FirstOrDefaultAsync(a => a.Id == airConditionerId);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<AirConditioner>> GetAirConditionersAsync()
    {
        try
        {
            return await _context.AirConditioners.AsNoTracking().ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task AddErrorCodeAsync(ErrorCode errorCode)
    {
        try
        {
            await _context.ErrorCodes.AddAsync(errorCode);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateErrorCodeAsync(ErrorCode errorCode)
    {
        try
        {
            _context.ErrorCodes.Update(errorCode);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteErrorCodeAsync(ErrorCode errorCode)
    {
        try
        {
            _context.ErrorCodes.Remove(errorCode);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<ErrorCode?> GetErrorCodeByIdAsync(Guid errorCodeId)
    {
        try
        {
            return await _context.ErrorCodes.AsNoTracking().FirstOrDefaultAsync(e => e.Id == errorCodeId);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<ErrorCode>> GetErrorCodesByAirConditionerIdAsync(Guid airConditionerId)
    {
        try
        {
            return await _context.ErrorCodes
                .AsNoTracking()
                .Where(e => e.AirConditionerId == airConditionerId)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<ErrorCode>> GetAllErrorCodesAsync()
    {
        try
        {
            return await _context.ErrorCodes.AsNoTracking().ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }
}