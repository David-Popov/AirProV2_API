import { apiClient } from './api';
import type { InventoryAuditLog } from '../types/inventory';

export interface PagedResult<T> {
  items: T[];
  total_count: number;
  page_number: number;
  page_size: number;
  total_pages: number;
}

export const inventoryAuditService = {
  /**
   * Get audit history for a specific inventory item
   */
  async getItemHistory(
    itemId: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<PagedResult<InventoryAuditLog>> {
    return apiClient.get<PagedResult<InventoryAuditLog>>(`/inventory-audit/item/${itemId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  /**
   * Get recent inventory activity for the company
   */
  async getRecentActivity(count: number = 6): Promise<InventoryAuditLog[]> {
    return apiClient.get<InventoryAuditLog[]>(`/inventory-audit/recent?count=${count}`);
  },

  /**
   * Get audit history by user
   */
  async getUserHistory(
    userId: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<PagedResult<InventoryAuditLog>> {
    return apiClient.get<PagedResult<InventoryAuditLog>>(`/inventory-audit/user/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },
};
