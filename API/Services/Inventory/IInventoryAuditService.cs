using API.Data.Entities;
using API.Models;
using API.Common;
using API.DTOs;

namespace API.Services.Inventory;

public interface IInventoryAuditService
{
    /// <summary>
    /// Logs an inventory action to the audit trail
    /// </summary>
    Task LogActionAsync(InventoryAuditLog log);

    /// <summary>
    /// Gets audit logs for a specific inventory item with pagination
    /// </summary>
    Task<PagedList<InventoryAuditLogDto>> GetAuditLogsAsync(Guid inventoryItemId, int pageNumber, int pageSize);

    /// <summary>
    /// Gets recent inventory activity for a company
    /// </summary>
    Task<List<InventoryAuditLogDto>> GetRecentActivityAsync(Guid companyId, int count = 6);

    /// <summary>
    /// Gets audit logs by user with pagination
    /// </summary>
    Task<PagedList<InventoryAuditLogDto>> GetAuditLogsByUserAsync(string userId, int pageNumber, int pageSize);
}
