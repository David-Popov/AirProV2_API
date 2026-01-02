using API.Data.Entities;

namespace API.Repositories;

public interface IInventoryRepository
{
    Task AddAsync(InventoryItem item);
    
    Task UpdateAsync(InventoryItem item);
    
    Task DeleteAsync(InventoryItem item);
    
    Task<InventoryItem?> GetByIdAsync(Guid itemId);
    
    Task<IEnumerable<InventoryItem>> GetAllAsync();
    
    Task<IEnumerable<InventoryItem>> GetByCompanyIdAsync(Guid companyId);
    
    Task<IEnumerable<InventoryItem>> GetLowStockByCompanyIdAsync(Guid companyId);
    
    Task<InventoryItem?> GetBySkuAndCompanyIdAsync(string sku, Guid companyId);
    
    Task<bool> ExistsByNameAndCompanyIdAsync(string name, Guid companyId, Guid? excludeId = null);
}
