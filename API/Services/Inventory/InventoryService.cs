using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace API.Services.Inventory;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _repository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InventoryService> _logger;

    public InventoryService(
        IInventoryRepository repository,
        ApplicationDbContext context,
        ILogger<InventoryService> logger)
    {
        _repository = repository;
        _context = context;
        _logger = logger;
    }

    public async Task AddAsync(CreateInventoryItemDto dto)
    {
        try
        {
            // Check for duplicate name within the same company
            var exists = await _repository.ExistsByNameAndCompanyIdAsync(dto.Name, dto.CompanyId);
            if (exists)
            {
                throw new InvalidOperationException($"An inventory item with name '{dto.Name}' already exists for this company");
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
                throw new InvalidOperationException("Inventory item not found");
            }

            // Check for duplicate name within the same company (excluding current item)
            var exists = await _repository.ExistsByNameAndCompanyIdAsync(dto.Name, item.CompanyId, itemId);
            if (exists)
            {
                throw new InvalidOperationException($"An inventory item with name '{dto.Name}' already exists for this company");
            }

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
            return item == null ? null : ToDto(item);
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
                .OrderBy(i => i.Name)
                .Select(i => new InventoryItemDto
                {
                    Id = i.Id,
                    CompanyId = i.CompanyId,
                    Name = i.Name,
                    Description = i.Description,
                    Sku = i.Sku,
                    Quantity = i.Quantity,
                    UnitOfMeasure = i.UnitOfMeasure.ToString(),
                    MinQuantity = i.MinQuantity,
                    UnitPrice = i.UnitPrice,
                    Supplier = i.Supplier,
                    Location = i.Location,
                    Notes = i.Notes,
                    IsActive = i.IsActive,
                    IsLowStock = i.MinQuantity.HasValue && i.Quantity <= i.MinQuantity.Value,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt
                });

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
                .Where(i => i.CompanyId == companyId)
                .OrderBy(i => i.Name)
                .Select(i => new InventoryItemDto
                {
                    Id = i.Id,
                    CompanyId = i.CompanyId,
                    Name = i.Name,
                    Description = i.Description,
                    Sku = i.Sku,
                    Quantity = i.Quantity,
                    UnitOfMeasure = i.UnitOfMeasure.ToString(),
                    MinQuantity = i.MinQuantity,
                    UnitPrice = i.UnitPrice,
                    Supplier = i.Supplier,
                    Location = i.Location,
                    Notes = i.Notes,
                    IsActive = i.IsActive,
                    IsLowStock = i.MinQuantity.HasValue && i.Quantity <= i.MinQuantity.Value,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt
                });

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
                .Where(i => i.CompanyId == companyId 
                            && i.MinQuantity.HasValue 
                            && i.Quantity <= i.MinQuantity.Value
                            && i.IsActive)
                .OrderBy(i => i.Quantity)
                .Select(i => new InventoryItemDto
                {
                    Id = i.Id,
                    CompanyId = i.CompanyId,
                    Name = i.Name,
                    Description = i.Description,
                    Sku = i.Sku,
                    Quantity = i.Quantity,
                    UnitOfMeasure = i.UnitOfMeasure.ToString(),
                    MinQuantity = i.MinQuantity,
                    UnitPrice = i.UnitPrice,
                    Supplier = i.Supplier,
                    Location = i.Location,
                    Notes = i.Notes,
                    IsActive = i.IsActive,
                    IsLowStock = true,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt
                });

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
            return item == null ? null : ToDto(item);
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
                throw new InvalidOperationException("Inventory item not found");
            }

            var newQuantity = item.Quantity + dto.AdjustmentAmount;
            
            if (newQuantity < 0)
            {
                throw new InvalidOperationException($"Cannot adjust quantity. Current quantity is {item.Quantity} {item.UnitOfMeasure}, adjustment of {dto.AdjustmentAmount} would result in negative quantity.");
            }

            item.Quantity = newQuantity;
            
            // Optionally append the reason to notes
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
                    // Append to existing notes, keeping within the 500 char limit
                    var combinedNotes = $"{item.Notes}\n{adjustmentNote}";
                    item.Notes = combinedNotes.Length > 500 ? combinedNotes.Substring(0, 500) : combinedNotes;
                }
            }

            await _repository.UpdateAsync(item);
            
            return ToDto(item);
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
                .Where(i => i.CompanyId == companyId && 
                           (i.Name.ToLower().Contains(lowerSearchTerm) ||
                            (i.Sku != null && i.Sku.ToLower().Contains(lowerSearchTerm)) ||
                            (i.Description != null && i.Description.ToLower().Contains(lowerSearchTerm)) ||
                            (i.Supplier != null && i.Supplier.ToLower().Contains(lowerSearchTerm))))
                .OrderBy(i => i.Name)
                .Select(i => new InventoryItemDto
                {
                    Id = i.Id,
                    CompanyId = i.CompanyId,
                    Name = i.Name,
                    Description = i.Description,
                    Sku = i.Sku,
                    Quantity = i.Quantity,
                    UnitOfMeasure = i.UnitOfMeasure.ToString(),
                    MinQuantity = i.MinQuantity,
                    UnitPrice = i.UnitPrice,
                    Supplier = i.Supplier,
                    Location = i.Location,
                    Notes = i.Notes,
                    IsActive = i.IsActive,
                    IsLowStock = i.MinQuantity.HasValue && i.Quantity <= i.MinQuantity.Value,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt
                });

            return await PagedList<InventoryItemDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    private static InventoryItemDto ToDto(InventoryItem item)
    {
        return new InventoryItemDto
        {
            Id = item.Id,
            CompanyId = item.CompanyId,
            Name = item.Name,
            Description = item.Description,
            Sku = item.Sku,
            Quantity = item.Quantity,
            UnitOfMeasure = item.UnitOfMeasure.ToString(),
            MinQuantity = item.MinQuantity,
            UnitPrice = item.UnitPrice,
            Supplier = item.Supplier,
            Location = item.Location,
            Notes = item.Notes,
            IsActive = item.IsActive,
            IsLowStock = item.MinQuantity.HasValue && item.Quantity <= item.MinQuantity.Value,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };
    }
}
