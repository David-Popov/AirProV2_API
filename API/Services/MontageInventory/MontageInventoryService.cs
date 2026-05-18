using ValidationException = FluentValidation.ValidationException;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Common;
using API.Services.Inventory;
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
    private readonly IInventoryAuditService _auditService;

    public MontageInventoryService(
        ApplicationDbContext context, 
        ILogger<MontageInventoryService> logger,
        IInventoryAuditService auditService)
    {
        _context = context;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<List<MontageInventoryItemDto>> AddMaterialsAsync(Guid montageId, AddMaterialsToMontageRequest request)
    {
        // Validate montage exists
        var montage = await _context.Montages.FindAsync(montageId);
        if (montage == null)
        {
            throw new NotFoundException("Montage not found");
        }

        var addedItems = new List<MontageInventoryItemDto>();

        // Use transaction to ensure atomicity
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Batch-load all required inventory items upfront to avoid N+1 queries
            var materialIds = request.Materials.Select(m => m.InventoryItemId).Distinct().ToList();
            var inventoryItemsMap = await _context.InventoryItems
                .Where(i => materialIds.Contains(i.Id))
                .ToDictionaryAsync(i => i.Id);

            foreach (var material in request.Materials)
            {
                // Get inventory item and check stock
                if (!inventoryItemsMap.TryGetValue(material.InventoryItemId, out var inventoryItem))
                {
                    throw new ValidationException($"Inventory item {material.InventoryItemId} not found");
                }

                if (inventoryItem.Quantity < material.QuantityUsed)
                {
                    throw new ValidationException($"Insufficient stock for {inventoryItem.Name}. Available: {inventoryItem.Quantity}, Requested: {material.QuantityUsed}");
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

                // Log the usage in montage
                await _auditService.LogActionAsync(new InventoryAuditLog
                {
                    CompanyId = inventoryItem.CompanyId,
                    InventoryItemId = material.InventoryItemId,
                    Action = "UsedInMontage",
                    UserId = request.UserId, // Assuming we add UserId to request
                    QuantityBefore = inventoryItem.Quantity + material.QuantityUsed,
                    QuantityAfter = inventoryItem.Quantity,
                    QuantityChanged = -material.QuantityUsed,
                    RelatedMontageId = montageId,
                    Reason = $"Used in montage"
                });
                
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
                throw new NotFoundException("Material record not found");
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
                throw new NotFoundException("Material record not found");
            }

            if (montageItem.InventoryItem == null)
            {
                throw new NotFoundException("Inventory item no longer exists");
            }
            
            decimal diff = newQuantity - montageItem.QuantityUsed;
            
            if (Math.Abs(diff) < 0.001m) return; // No change

            if (diff > 0)
            {
                 // Need more stock
                 if (montageItem.InventoryItem.Quantity < diff)
                 {
                      throw new ValidationException($"Insufficient stock. Available: {montageItem.InventoryItem.Quantity}, Needed additional: {diff}");
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
            .AsNoTracking()
            .Where(x => x.MontageId == montageId)
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
            .AsNoTracking()
            .Where(x => x.InventoryItemId == inventoryItemId)
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
