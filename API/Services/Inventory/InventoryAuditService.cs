using API.Data;
using API.Data.Entities;
using API.Models;
using API.Common;
using API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace API.Services.Inventory;

public class InventoryAuditService : IInventoryAuditService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InventoryAuditService> _logger;

    public InventoryAuditService(ApplicationDbContext context, ILogger<InventoryAuditService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task LogActionAsync(InventoryAuditLog log)
    {
        _logger.LogInformation("LogAction: Saving log for Item {ItemId}, Company {CompanyId}, Action {Action}", 
            log.InventoryItemId, log.CompanyId, log.Action);
            
        _context.InventoryAuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    public async Task<PagedList<InventoryAuditLogDto>> GetAuditLogsAsync(Guid inventoryItemId, int pageNumber, int pageSize)
    {
        var query = _context.InventoryAuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .Include(a => a.RelatedMontage)
            .Include(a => a.InventoryItem)
            .Where(a => a.InventoryItemId == inventoryItemId)
            .OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = items.Select(MapToDto).ToList();

        return new PagedList<InventoryAuditLogDto>(dtos, pageNumber, pageSize, totalCount);
    }

    public async Task<List<InventoryAuditLogDto>> GetRecentActivityAsync(Guid companyId, int count = 6)
    {
        _logger.LogInformation("GetRecentActivity: Querying for CompanyId {CompanyId}", companyId);

        var query = _context.InventoryAuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .Include(a => a.InventoryItem)
            .Include(a => a.RelatedMontage)
            .Where(a => a.CompanyId == companyId);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Take(count)
            .ToListAsync();

        return items.Select(MapToDto).ToList();
    }

    public async Task<PagedList<InventoryAuditLogDto>> GetAuditLogsByUserAsync(string userId, int pageNumber, int pageSize)
    {
        var query = _context.InventoryAuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .Include(a => a.InventoryItem)
            .Include(a => a.RelatedMontage)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = items.Select(MapToDto).ToList();

        return new PagedList<InventoryAuditLogDto>(dtos, pageNumber, pageSize, totalCount);
    }

    private static InventoryAuditLogDto MapToDto(InventoryAuditLog log)
    {
        return new InventoryAuditLogDto
        {
            Id = log.Id,
            CompanyId = log.CompanyId,
            InventoryItemId = log.InventoryItemId,
            Action = log.Action,
            UserId = log.UserId,
            User = log.User != null ? new AuditUserDto 
            { 
                Id = log.User.Id, 
                FullName = $"{log.User.FirstName} {log.User.LastName}".Trim(),
                Email = log.User.Email 
            } : null,
            QuantityBefore = log.QuantityBefore,
            QuantityAfter = log.QuantityAfter,
            QuantityChanged = log.QuantityChanged,
            Reason = log.Reason,
            RelatedMontageId = log.RelatedMontageId,
            RelatedMontage = log.RelatedMontage != null ? new AuditMontageDto 
            { 
                Id = log.RelatedMontage.Id, 
                ClientName = log.RelatedMontage.ClientName 
            } : null,
            InventoryItem = log.InventoryItem != null ? new AuditInventoryItemDto
            {
                Id = log.InventoryItem.Id,
                Name = log.InventoryItem.Name,
                Sku = log.InventoryItem.Sku
            } : null,
            Details = log.Details,
            CreatedAt = log.CreatedAt
        };
    }
}
