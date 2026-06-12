using API.Data;
using API.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class MontageRepository : IMontageRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MontageRepository> _logger;
    
    public MontageRepository(ApplicationDbContext context, ILogger<MontageRepository> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    public async Task AddMontageAsync(Montage montage)
    {
        try
        {
            await _context.Montages.AddAsync(montage);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateMontageAsync(Montage montage)
    {
        try
        {
            _context.Montages.Update(montage);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteMontageAsync(Montage montage)
    {
        try
        {
            _context.Montages.Remove(montage);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<Montage?> GetByIdAsync(Guid montageId)
    {
        try
        {
            return await _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .Include(m => m.UsedMaterials)
                    .ThenInclude(um => um.InventoryItem)
                .Include(m => m.Photos)
                .Include(m => m.Assignments)
                    .ThenInclude(a => a.User)
                .AsSplitQuery()
                .FirstOrDefaultAsync(m => m.Id == montageId);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<Montage?> GetByIdWithAirConditionerAsync(Guid montageId)
    {
        try
        {
            return await _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .Include(m => m.Assignments)
                    .ThenInclude(a => a.User)
                .FirstOrDefaultAsync(m => m.Id == montageId);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<Montage>> GetAllAsync()
    {
        try
        {
            return await _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .OrderByDescending(m => m.InstallationDate)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<Montage>> GetByCompanyIdAsync(Guid companyId)
    {
        try
        {
            return await _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .Where(m => m.CompanyId == companyId)
                .OrderByDescending(m => m.InstallationDate)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<Montage>> GetByUserIdAsync(string userId)
    {
        try
        {
            return await _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.InstallationDate)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<Montage>> GetByCompanyAndUserIdAsync(Guid companyId, string userId)
    {
        try
        {
            return await _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .Where(m => m.CompanyId == companyId && m.UserId == userId)
                .OrderByDescending(m => m.InstallationDate)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<Montage>> GetByStatusAsync(string status)
    {
        try
        {
            return await _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .Where(m => m.Status.ToString().ToLower() == status.ToLower())
                .OrderByDescending(m => m.InstallationDate)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<Montage>> GetByInstallationDateRangeAsync(DateOnly startDate, DateOnly endDate)
    {
        try
        {
            return await _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .Where(m => m.InstallationDate >= startDate && m.InstallationDate <= endDate)
                .OrderByDescending(m => m.InstallationDate)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }
}