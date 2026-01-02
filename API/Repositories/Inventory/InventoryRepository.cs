using API.Data;
using API.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InventoryRepository> _logger;

    public InventoryRepository(ApplicationDbContext context, ILogger<InventoryRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task AddAsync(InventoryItem item)
    {
        try
        {
            await _context.InventoryItems.AddAsync(item);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateAsync(InventoryItem item)
    {
        try
        {
            item.UpdatedAt = DateTime.UtcNow;
            _context.InventoryItems.Update(item);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteAsync(InventoryItem item)
    {
        try
        {
            _context.InventoryItems.Remove(item);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<InventoryItem?> GetByIdAsync(Guid itemId)
    {
        try
        {
            return await _context.InventoryItems.FirstOrDefaultAsync(i => i.Id == itemId);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<InventoryItem>> GetAllAsync()
    {
        try
        {
            return await _context.InventoryItems
                .OrderBy(i => i.Name)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<InventoryItem>> GetByCompanyIdAsync(Guid companyId)
    {
        try
        {
            return await _context.InventoryItems
                .Where(i => i.CompanyId == companyId)
                .OrderBy(i => i.Name)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<InventoryItem>> GetLowStockByCompanyIdAsync(Guid companyId)
    {
        try
        {
            return await _context.InventoryItems
                .Where(i => i.CompanyId == companyId 
                            && i.MinQuantity.HasValue 
                            && i.Quantity <= i.MinQuantity.Value
                            && i.IsActive)
                .OrderBy(i => i.Quantity)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<InventoryItem?> GetBySkuAndCompanyIdAsync(string sku, Guid companyId)
    {
        try
        {
            return await _context.InventoryItems
                .FirstOrDefaultAsync(i => i.Sku == sku && i.CompanyId == companyId);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<bool> ExistsByNameAndCompanyIdAsync(string name, Guid companyId, Guid? excludeId = null)
    {
        try
        {
            var query = _context.InventoryItems
                .Where(i => i.Name.ToLower() == name.ToLower() && i.CompanyId == companyId);
            
            if (excludeId.HasValue)
            {
                query = query.Where(i => i.Id != excludeId.Value);
            }
            
            return await query.AnyAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }
}
