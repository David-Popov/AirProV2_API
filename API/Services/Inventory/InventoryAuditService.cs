using API.Data;
using API.Data.Entities;
using API.Models;
using API.Common;
using API.DTOs;
using Mapster;
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
            .Where(a => a.InventoryItemId == inventoryItemId)
            .OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync();
        var dtos = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ProjectToType<InventoryAuditLogDto>()
            .ToListAsync();

        return new PagedList<InventoryAuditLogDto>(dtos, pageNumber, pageSize, totalCount);
    }

    public async Task<List<InventoryAuditLogDto>> GetRecentActivityAsync(Guid companyId, int count = 6)
    {
        _logger.LogInformation("GetRecentActivity: Querying for CompanyId {CompanyId}", companyId);

        return await _context.InventoryAuditLogs
            .AsNoTracking()
            .Where(a => a.CompanyId == companyId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(count)
            .ProjectToType<InventoryAuditLogDto>()
            .ToListAsync();
    }

    public async Task<PagedList<InventoryAuditLogDto>> GetAuditLogsByUserAsync(string userId, int pageNumber, int pageSize)
    {
        var query = _context.InventoryAuditLogs
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync();
        var dtos = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ProjectToType<InventoryAuditLogDto>()
            .ToListAsync();

        return new PagedList<InventoryAuditLogDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
