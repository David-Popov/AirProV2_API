import { apiClient } from './api';
import type { 
  Montage, 
  CreateMontageRequest, 
  UpdateMontageRequest,
  PagedList
} from '@/types';

export const montageService = {
  /**
   * Get all montages
   */
  async getAll(pageNumber = 1, pageSize = 10): Promise<PagedList<Montage>> {
    return apiClient.get<PagedList<Montage>>(`/Montages?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  },

  /**
   * Get montage by ID
   */
  async getById(id: string): Promise<Montage> {
    return apiClient.get<Montage>(`/Montages/${id}`);
  },

  /**
   * Get montage by ID with AC details
   */
  async getByIdWithAC(id: string): Promise<Montage> {
    return apiClient.get<Montage>(`/Montages/${id}/with-air-conditioner`);
  },

  /**
   * Create new montage
   */
  async create(data: CreateMontageRequest): Promise<Montage> {
    return apiClient.post<Montage>('/Montages', data);
  },

  /**
   * Update montage
   */
  async update(id: string, data: UpdateMontageRequest): Promise<void> {
    return apiClient.put<void>(`/Montages/${id}`, data);
  },

  /**
   * Update montage status only
   */
  async updateStatus(id: string, status: string): Promise<void> {
    return apiClient.patch<void>(`/Montages/${id}/status`, { status });
  },

  /**
   * Delete montage
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/Montages/${id}`);
  },

  /**
   * Get by status
   */
  async getByStatus(status: string, pageNumber = 1, pageSize = 10): Promise<PagedList<Montage>> {
    return apiClient.get<PagedList<Montage>>(`/Montages/status/${status}?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }
};
