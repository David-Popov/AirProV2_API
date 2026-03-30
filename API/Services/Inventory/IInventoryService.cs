using API.Common;
using API.DTOs;

namespace API.Services.Inventory;

public interface IInventoryService
{
    Task<Guid> AddAsync(CreateInventoryItemDto dto);
    
    Task UpdateAsync(Guid itemId, UpdateInventoryItemDto dto);
    
    Task DeleteAsync(Guid itemId);
    
    Task<InventoryItemDto?> GetByIdAsync(Guid itemId);
    
    Task<PagedList<InventoryItemDto>> GetAllAsync(PageParameters pageParameters);
    
    Task<PagedList<InventoryItemDto>> GetByCompanyIdAsync(Guid companyId, PageParameters pageParameters);
    
    Task<PagedList<InventoryItemDto>> GetLowStockByCompanyIdAsync(Guid companyId, PageParameters pageParameters);
    
    Task<PagedList<InventoryItemDto>> GetLowStockAsync(PageParameters pageParameters);
    
    Task<InventoryItemDto?> GetBySkuAndCompanyIdAsync(string sku, Guid companyId);
    
    Task<InventoryItemDto?> AdjustQuantityAsync(Guid itemId, AdjustInventoryQuantityDto dto);
    
    Task<PagedList<InventoryItemDto>> SearchByCompanyIdAsync(Guid companyId, string searchTerm, PageParameters pageParameters);
    
    Task UpdateStatusAsync(Guid itemId, bool isActive);

    Task<bool> CanDeleteAsync(Guid itemId);
}
