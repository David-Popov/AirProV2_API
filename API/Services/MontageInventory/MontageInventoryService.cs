using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Common;
using Microsoft.EntityFrameworkCore;

namespace API.Services.MontageInventory;

public interface IMontageInventoryService
{
    /// <summary>
    /// Add materials to a montage and deduct from inventory
    /// </summary>
    Task<List<MontageInventoryItemDto>> AddMaterialsAsync(Guid montageId, AddMaterialsToMontageRequest request);
    
    /// <summary>
    /// Remove a material from a montage and restore to inventory
    /// </summary>
    Task RemoveMaterialAsync(Guid materialId);

    /// <summary>
    /// Update material quantity and adjust inventory
    /// </summary>
    Task UpdateMaterialQuantityAsync(Guid materialId, decimal newQuantity);
    
    /// <summary>
    /// Get all materials used in a specific montage
    /// </summary>
    Task<List<MontageInventoryItemDto>> GetMaterialsByMontageIdAsync(Guid montageId);
    
    /// <summary>
    /// Get usage history for a specific inventory item
    /// </summary>
    Task<PagedList<MontageInventoryItemDto>> GetUsageHistoryByItemIdAsync(Guid inventoryItemId, PageParameters pageParameters);
}

public class MontageInventoryService : IMontageInventoryService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MontageInventoryService> _logger;

    public MontageInventoryService(ApplicationDbContext context, ILogger<MontageInventoryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<MontageInventoryItemDto>> AddMaterialsAsync(Guid montageId, AddMaterialsToMontageRequest request)
    {
        // Validate montage exists
        var montage = await _context.Montages.FindAsync(montageId);
        if (montage == null)
        {
            throw new InvalidOperationException("Montage not found");
        }

        var addedItems = new List<MontageInventoryItemDto>();

        // Use transaction to ensure atomicity
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            foreach (var material in request.Materials)
            {
                // Get inventory item and check stock
                var inventoryItem = await _context.InventoryItems.FindAsync(material.InventoryItemId);
                if (inventoryItem == null)
                {
                    throw new InvalidOperationException($"Inventory item {material.InventoryItemId} not found");
                }

                if (inventoryItem.Quantity < material.QuantityUsed)
                {
                    throw new InvalidOperationException($"Insufficient stock for {inventoryItem.Name}. Available: {inventoryItem.Quantity}, Requested: {material.QuantityUsed}");
                }

                // Deduct from inventory
                inventoryItem.Quantity -= material.QuantityUsed;
                inventoryItem.UpdatedAt = DateTime.UtcNow;

                // Create link record
                var montageInventoryItem = new MontageInventoryItem
                {
                    MontageId = montageId,
                    InventoryItemId = material.InventoryItemId,
                    QuantityUsed = material.QuantityUsed,
                    UnitPriceAtTime = inventoryItem.UnitPrice,
                    Notes = material.Notes
                };

                _context.MontageInventoryItems.Add(montageInventoryItem);
                
                addedItems.Add(new MontageInventoryItemDto
                {
                    Id = montageInventoryItem.Id,
                    MontageId = montageId,
                    InventoryItemId = material.InventoryItemId,
                    QuantityUsed = material.QuantityUsed,
                    UnitPriceAtTime = inventoryItem.UnitPrice,
                    Notes = material.Notes,
                    CreatedAt = montageInventoryItem.CreatedAt,
                    ItemName = inventoryItem.Name,
                    ItemSku = inventoryItem.Sku,
                    UnitOfMeasure = inventoryItem.UnitOfMeasure.ToString()
                });

                _logger.LogInformation("Added material {ItemName} (qty: {Qty}) to montage {MontageId}", 
                    inventoryItem.Name, material.QuantityUsed, montageId);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return addedItems;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task RemoveMaterialAsync(Guid materialId)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var montageItem = await _context.MontageInventoryItems
                .Include(x => x.InventoryItem)
                .FirstOrDefaultAsync(x => x.Id == materialId);

            if (montageItem == null)
            {
                throw new InvalidOperationException("Material record not found");
            }

            // Restore quantity to inventory
            if (montageItem.InventoryItem != null)
            {
                montageItem.InventoryItem.Quantity += montageItem.QuantityUsed;
                montageItem.InventoryItem.UpdatedAt = DateTime.UtcNow;
                
                _logger.LogInformation("Restored {Qty} of {ItemName} to inventory", 
                    montageItem.QuantityUsed, montageItem.InventoryItem.Name);
            }

            _context.MontageInventoryItems.Remove(montageItem);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task UpdateMaterialQuantityAsync(Guid materialId, decimal newQuantity)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var montageItem = await _context.MontageInventoryItems
                .Include(x => x.InventoryItem)
                .FirstOrDefaultAsync(x => x.Id == materialId);

            if (montageItem == null)
            {
                throw new InvalidOperationException("Material record not found");
            }

            if (montageItem.InventoryItem == null)
            {
                throw new InvalidOperationException("Inventory item no longer exists");
            }
            
            decimal diff = newQuantity - montageItem.QuantityUsed;
            
            if (Math.Abs(diff) < 0.001m) return; // No change

            if (diff > 0)
            {
                 // Need more stock
                 if (montageItem.InventoryItem.Quantity < diff)
                 {
                      throw new InvalidOperationException($"Insufficient stock. Available: {montageItem.InventoryItem.Quantity}, Needed additional: {diff}");
                 }
                 montageItem.InventoryItem.Quantity -= diff;
            }
            else
            {
                 // Returning stock
                 montageItem.InventoryItem.Quantity += Math.Abs(diff);
            }
            
            montageItem.InventoryItem.UpdatedAt = DateTime.UtcNow;
            montageItem.QuantityUsed = newQuantity;
            
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            
            _logger.LogInformation("Updated material {Id} quantity to {Qty} (Diff: {Diff})", materialId, newQuantity, diff);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<MontageInventoryItemDto>> GetMaterialsByMontageIdAsync(Guid montageId)
    {
        return await _context.MontageInventoryItems
            .Where(x => x.MontageId == montageId)
            .Include(x => x.InventoryItem)
            .Select(x => new MontageInventoryItemDto
            {
                Id = x.Id,
                MontageId = x.MontageId,
                InventoryItemId = x.InventoryItemId,
                QuantityUsed = x.QuantityUsed,
                UnitPriceAtTime = x.UnitPriceAtTime,
                Notes = x.Notes,
                CreatedAt = x.CreatedAt,
                ItemName = x.InventoryItem != null ? x.InventoryItem.Name : null,
                ItemSku = x.InventoryItem != null ? x.InventoryItem.Sku : null,
                UnitOfMeasure = x.InventoryItem != null ? x.InventoryItem.UnitOfMeasure.ToString() : null
            })
            .ToListAsync();
    }

    public async Task<PagedList<MontageInventoryItemDto>> GetUsageHistoryByItemIdAsync(Guid inventoryItemId, PageParameters pageParameters)
    {
        var query = _context.MontageInventoryItems
            .Where(x => x.InventoryItemId == inventoryItemId)
            .Include(x => x.Montage)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new MontageInventoryItemDto
            {
                Id = x.Id,
                MontageId = x.MontageId,
                InventoryItemId = x.InventoryItemId,
                QuantityUsed = x.QuantityUsed,
                UnitPriceAtTime = x.UnitPriceAtTime,
                Notes = x.Notes,
                CreatedAt = x.CreatedAt
            });

        return await PagedList<MontageInventoryItemDto>.CreateAsync(query, pageParameters);
    }
}
