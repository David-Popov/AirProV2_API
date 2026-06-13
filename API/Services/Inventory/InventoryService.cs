using ValidationException = FluentValidation.ValidationException;
using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Repositories;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace API.Services.Inventory;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _repository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InventoryService> _logger;
    private readonly IInventoryAuditService _auditService;

    public InventoryService(
        IInventoryRepository repository,
        ApplicationDbContext context,
        ILogger<InventoryService> logger,
        IInventoryAuditService auditService)
    {
        _repository = repository;
        _context = context;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<Guid> AddAsync(CreateInventoryItemDto dto)
    {
        try
        {
            var exists = await _repository.ExistsByNameAndCompanyIdAsync(dto.Name, dto.CompanyId);
            if (exists)
            {
                throw new ValidationException($"An inventory item with name '{dto.Name}' already exists for this company");
            }

            var item = new InventoryItem
            {
                CompanyId = dto.CompanyId,
                Name = dto.Name,
                Description = dto.Description,
                Sku = dto.Sku,
                Quantity = dto.Quantity,
                UnitOfMeasure = Enum.TryParse(dto.UnitOfMeasure, true, out UnitOfMeasure unit) ? unit : UnitOfMeasure.Pieces,
                MinQuantity = dto.MinQuantity,
                UnitPrice = dto.UnitPrice,
                Supplier = dto.Supplier,
                Location = dto.Location,
                Notes = dto.Notes
            };

            await _repository.AddAsync(item);

            await _auditService.LogActionAsync(new InventoryAuditLog
            {
                CompanyId = item.CompanyId,
                InventoryItemId = item.Id,
                Action = "Created",
                UserId = dto.UserId,
                QuantityAfter = item.Quantity,
                QuantityChanged = item.Quantity,
                Reason = "Initial creation"
            });

            return item.Id;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateAsync(Guid itemId, UpdateInventoryItemDto dto)
    {
        try
        {
            var item = await _repository.GetByIdAsync(itemId);
            if (item == null)
            {
                throw new NotFoundException("Inventory item not found");
            }


            var exists = await _repository.ExistsByNameAndCompanyIdAsync(dto.Name, item.CompanyId, itemId);
            if (exists)
            {
                throw new ValidationException($"An inventory item with name '{dto.Name}' already exists for this company");
            }

            var oldQuantity = item.Quantity;

            item.Name = dto.Name;
            item.Description = dto.Description;
            item.Sku = dto.Sku;
            item.Quantity = dto.Quantity;
            item.UnitOfMeasure = Enum.TryParse(dto.UnitOfMeasure, true, out UnitOfMeasure unit) ? unit : item.UnitOfMeasure;
            item.MinQuantity = dto.MinQuantity;
            item.UnitPrice = dto.UnitPrice;
            item.Supplier = dto.Supplier;
            item.Location = dto.Location;
            item.Notes = dto.Notes;
            item.IsActive = dto.IsActive;

            await _repository.UpdateAsync(item);

            if (oldQuantity != item.Quantity)
            {
                await _auditService.LogActionAsync(new InventoryAuditLog
                {
                    CompanyId = item.CompanyId,
                    InventoryItemId = item.Id,
                    Action = "Updated",
                    UserId = dto.UserId,
                    QuantityBefore = oldQuantity,
                    QuantityAfter = item.Quantity,
                    QuantityChanged = item.Quantity - oldQuantity,
                    Reason = "Inventory item updated"
                });
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteAsync(Guid itemId)
    {
        try
        {
            var item = await _repository.GetByIdAsync(itemId);
            if (item != null)
            {
                await _repository.DeleteAsync(item);
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<InventoryItemDto?> GetByIdAsync(Guid itemId)
    {
        try
        {
            var item = await _repository.GetByIdAsync(itemId);
            return item?.Adapt<InventoryItemDto>();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<InventoryItemDto>> GetAllAsync(PageParameters pageParameters)
    {
        try
        {
            var query = _context.InventoryItems
                .AsNoTracking()
                .OrderBy(i => i.Name)
                .ProjectToType<InventoryItemDto>();

            return await PagedList<InventoryItemDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<InventoryItemDto>> GetByCompanyIdAsync(Guid companyId, PageParameters pageParameters)
    {
        try
        {
            var query = _context.InventoryItems
                .AsNoTracking()
                .Where(i => i.CompanyId == companyId)
                .OrderBy(i => i.Name)
                .ProjectToType<InventoryItemDto>();

            return await PagedList<InventoryItemDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<InventoryItemDto>> GetLowStockByCompanyIdAsync(Guid companyId, PageParameters pageParameters)
    {
        try
        {
            var query = _context.InventoryItems
                .AsNoTracking()
                .Where(i => i.CompanyId == companyId 
                            && i.MinQuantity.HasValue 
                            && i.Quantity <= i.MinQuantity.Value
                            && i.IsActive)
                .OrderBy(i => i.Quantity)
                .ProjectToType<InventoryItemDto>();

            return await PagedList<InventoryItemDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<InventoryItemDto>> GetLowStockAsync(PageParameters pageParameters)
    {
        try
        {
            var query = _context.InventoryItems
                .AsNoTracking()
                .Where(i => i.MinQuantity.HasValue 
                            && i.Quantity <= i.MinQuantity.Value
                            && i.IsActive)
                .OrderBy(i => i.Quantity)
                .ProjectToType<InventoryItemDto>();

            return await PagedList<InventoryItemDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<InventoryItemDto?> GetBySkuAndCompanyIdAsync(string sku, Guid companyId)
    {
        try
        {
            var item = await _repository.GetBySkuAndCompanyIdAsync(sku, companyId);
            return item?.Adapt<InventoryItemDto>();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<InventoryItemDto?> AdjustQuantityAsync(Guid itemId, AdjustInventoryQuantityDto dto)
    {
        try
        {
            var item = await _repository.GetByIdAsync(itemId);
            if (item == null)
            {
                throw new NotFoundException("Inventory item not found");
            }

            var newQuantity = item.Quantity + dto.AdjustmentAmount;
            
            if (newQuantity < 0)
            {
                throw new ValidationException($"Cannot adjust quantity. Current quantity is {item.Quantity} {item.UnitOfMeasure}, adjustment of {dto.AdjustmentAmount} would result in negative quantity.");
            }

            var oldQuantity = item.Quantity;
            item.Quantity = newQuantity;

            if (!string.IsNullOrEmpty(dto.Reason))
            {
                var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
                var adjustmentNote = $"[{timestamp}] Adjusted by {dto.AdjustmentAmount:+0.##;-0.##}: {dto.Reason}";
                
                if (string.IsNullOrEmpty(item.Notes))
                {
                    item.Notes = adjustmentNote;
                }
                else
                {
                    var combinedNotes = $"{item.Notes}\n{adjustmentNote}";
                    item.Notes = combinedNotes.Length > 500 ? combinedNotes.Substring(0, 500) : combinedNotes;
                }
            }

            await _repository.UpdateAsync(item);

            await _auditService.LogActionAsync(new InventoryAuditLog
            {
                CompanyId = item.CompanyId,
                InventoryItemId = item.Id,
                Action = "QuantityAdjusted",
                UserId = dto.UserId,
                QuantityBefore = oldQuantity,
                QuantityAfter = item.Quantity,
                QuantityChanged = dto.AdjustmentAmount,
                Reason = dto.Reason
            });
            
            return item.Adapt<InventoryItemDto>();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<InventoryItemDto>> SearchByCompanyIdAsync(Guid companyId, string searchTerm, PageParameters pageParameters)
    {
        try
        {
            var lowerSearchTerm = searchTerm.ToLower();
            
            var query = _context.InventoryItems
                .AsNoTracking()
                .Where(i => i.CompanyId == companyId && 
                           (i.Name.ToLower().Contains(lowerSearchTerm) ||
                            (i.Sku != null && i.Sku.ToLower().Contains(lowerSearchTerm)) ||
                            (i.Description != null && i.Description.ToLower().Contains(lowerSearchTerm)) ||
                            (i.Supplier != null && i.Supplier.ToLower().Contains(lowerSearchTerm))))
                .OrderBy(i => i.Name)
                .ProjectToType<InventoryItemDto>();

            return await PagedList<InventoryItemDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateStatusAsync(Guid itemId, bool isActive)
    {
        try
        {
            var item = await _repository.GetByIdAsync(itemId);
            if (item == null)
            {
                throw new NotFoundException("Inventory item not found");
            }

            item.IsActive = isActive;
            await _repository.UpdateAsync(item);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<bool> CanDeleteAsync(Guid itemId)
    {
        try
        {
            var item = await _context.InventoryItems
                .AsNoTracking()
                .Where(i => i.Id == itemId)
                .Select(i => new { i.CreatedAt })
                .FirstOrDefaultAsync();

            if (item == null)
            {
                return false;
            }

            if (await _context.MontageInventoryItems.AnyAsync(m => m.InventoryItemId == itemId))
            {
                return false;
            }

            if ((DateTime.UtcNow - item.CreatedAt).TotalDays > 30)
            {
                return false;
            }

            return true;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return false;
        }
    }

}
