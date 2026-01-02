import { apiClient } from './api';
import type { 
  InventoryItem, 
  CreateInventoryItemRequest, 
  UpdateInventoryItemRequest,
  AdjustInventoryQuantityRequest,
  PagedList
} from '@/types';

export const inventoryService = {
  /**
   * Get all inventory items
   */
  async getAll(pageNumber = 1, pageSize = 10): Promise<PagedList<InventoryItem>> {
    return apiClient.get<PagedList<InventoryItem>>(`/Inventory?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  },

  /**
   * Get inventory item by ID
   */
  async getById(id: string): Promise<InventoryItem> {
    return apiClient.get<InventoryItem>(`/Inventory/${id}`);
  },

  /**
   * Create new inventory item
   */
  async create(data: CreateInventoryItemRequest): Promise<InventoryItem> {
    return apiClient.post<InventoryItem>('/Inventory', data);
  },

  /**
   * Update inventory item
   */
  async update(id: string, data: UpdateInventoryItemRequest): Promise<void> {
    return apiClient.put<void>(`/Inventory/${id}`, data);
  },

  /**
   * Delete inventory item
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/Inventory/${id}`);
  },

  /**
   * Adjust quantity
   */
  async adjustQuantity(id: string, data: AdjustInventoryQuantityRequest): Promise<void> {
    return apiClient.post<void>(`/Inventory/${id}/adjust`, data);
  },

  /**
   * Search inventory
   */
  async search(searchTerm: string, pageNumber = 1, pageSize = 10): Promise<PagedList<InventoryItem>> {
    return apiClient.get<PagedList<InventoryItem>>(`/Inventory/search?searchTerm=${encodeURIComponent(searchTerm)}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
  },

  /**
   * Get low stock items
   */
  async getLowStock(pageNumber = 1, pageSize = 10): Promise<PagedList<InventoryItem>> {
    return apiClient.get<PagedList<InventoryItem>>(`/Inventory/low-stock?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }
};
