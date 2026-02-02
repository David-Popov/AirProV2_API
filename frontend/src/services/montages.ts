import { apiClient } from './api';
import type { 
  Montage, 
  CreateMontageRequest, 
  UpdateMontageRequest,
  PagedList
} from '@/types';

export const montageService = {
  async getAll(pageNumber = 1, pageSize = 10): Promise<PagedList<Montage>> {
    return apiClient.get<PagedList<Montage>>(`/Montages?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  },

  async getById(id: string): Promise<Montage> {
    return apiClient.get<Montage>(`/Montages/${id}`);
  },

  async getByIdWithAC(id: string): Promise<Montage> {
    return apiClient.get<Montage>(`/Montages/${id}/with-air-conditioner`);
  },

  async create(data: CreateMontageRequest): Promise<Montage> {
    return apiClient.post<Montage>('/Montages', data);
  },

  async update(id: string, data: UpdateMontageRequest): Promise<void> {
    return apiClient.put<void>(`/Montages/${id}`, data);
  },

  async updateStatus(id: string, status: string): Promise<void> {
    return apiClient.patch<void>(`/Montages/${id}/status`, { status });
  },

  async updatePaymentStatus(id: string, paymentStatus: string, paidAmount?: number): Promise<void> {
    return apiClient.patch<void>(`/Montages/${id}/payment-status`, { 
      payment_status: paymentStatus,
      paid_amount: paidAmount 
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/Montages/${id}`);
  },

  async getByStatus(status: string, pageNumber = 1, pageSize = 10): Promise<PagedList<Montage>> {
    return apiClient.get<PagedList<Montage>>(`/Montages/status/${status}?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }
};
