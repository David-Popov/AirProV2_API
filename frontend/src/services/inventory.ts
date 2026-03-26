import { apiClient } from './api';
import type { 
  InventoryItem, 
  CreateInventoryItemRequest, 
  UpdateInventoryItemRequest,
  AdjustInventoryQuantityRequest,
  PagedList
} from '@/types';

export const inventoryService = {
  async getAll(pageNumber = 1, pageSize = 10): Promise<PagedList<InventoryItem>> {
    return apiClient.get<PagedList<InventoryItem>>(`/Inventory?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  },

  async getById(id: string): Promise<InventoryItem> {
    return apiClient.get<InventoryItem>(`/Inventory/${id}`);
  },

  async create(data: CreateInventoryItemRequest): Promise<InventoryItem> {
    return apiClient.post<InventoryItem>('/Inventory', data);
  },

  async update(id: string, data: UpdateInventoryItemRequest): Promise<void> {
    return apiClient.put<void>(`/Inventory/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/Inventory/${id}`);
  },

  async adjustQuantity(id: string, data: AdjustInventoryQuantityRequest): Promise<void> {
    return apiClient.post<void>(`/Inventory/${id}/adjust`, data);
  },

  async search(searchTerm: string, pageNumber = 1, pageSize = 10): Promise<PagedList<InventoryItem>> {
    return apiClient.get<PagedList<InventoryItem>>(`/Inventory/search?searchTerm=${encodeURIComponent(searchTerm)}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
  },

  async getLowStock(pageNumber = 1, pageSize = 10): Promise<PagedList<InventoryItem>> {
    return apiClient.get<PagedList<InventoryItem>>(`/Inventory/low-stock?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  },
  async updateStatus(id: string, isActive: boolean): Promise<void> {
    return apiClient.patch<void>(`/Inventory/${id}/status`, { isActive });
  },

  async canDelete(id: string): Promise<{ canDelete: boolean }> {
    return apiClient.get<{ canDelete: boolean }>(`/Inventory/${id}/can-delete`);
  },
};
