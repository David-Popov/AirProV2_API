import { apiClient } from './api';
import type { 
  Montage, 
  CreateMontageRequest, 
  UpdateMontageRequest,
  PagedList
} from '@/types';


export interface MontageFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  clientName?: string;
  clientPhone?: string;
}

export const montageService = {
  async getAll(pageNumber = 1, pageSize = 10, filters?: MontageFilters): Promise<PagedList<Montage>> {
    const params = new URLSearchParams();
    params.append('PageNumber', pageNumber.toString());
    params.append('PageSize', pageSize.toString());

    if (filters) {
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.clientName) params.append('clientName', filters.clientName);
      if (filters.clientPhone) params.append('clientPhone', filters.clientPhone);
    }

    return apiClient.get<PagedList<Montage>>(`/Montages?${params.toString()}`);
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
