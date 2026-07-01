import { apiClient } from './api';
import type { 
  AirConditioner, 
  CreateAirConditionerRequest, 
  UpdateAirConditionerRequest,
  PagedList,
  ErrorCode,
  ErrorCodeStats,
  CreateErrorCodeRequest,
  UpdateErrorCodeRequest
} from '@/types';

export const airConditionerService = {
  getAll: async (page = 1, pageSize = 10, filters?: Record<string, any>) => {
    const params = new URLSearchParams({
      pageNumber: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
        }
      });
    }

    return await apiClient.get<PagedList<AirConditioner>>(
      `/AirConditioners?${params.toString()}`
    );
  },

  getById: async (id: string) => {
    return await apiClient.get<AirConditioner>(`/AirConditioners/${id}`);
  },

  create: async (data: CreateAirConditionerRequest) => {
    return await apiClient.post<AirConditioner>('/AirConditioners', data);
  },

  update: async (id: string, data: UpdateAirConditionerRequest) => {
    await apiClient.put(`/AirConditioners/${id}`, data);
  },

  delete: async (id: string) => {
    await apiClient.delete(`/AirConditioners/${id}`);
  },

  getErrorCodes: async (airConditionerId: string, page = 1, pageSize = 10) => {
    return await apiClient.get<PagedList<ErrorCode>>(
      `/AirConditioners/${airConditionerId}/error-codes?PageNumber=${page}&PageSize=${pageSize}`
    );
  },

  getAllErrorCodes: async (page = 1, pageSize = 10) => {
    return await apiClient.get<PagedList<ErrorCode>>(
      `/AirConditioners/error-codes?PageNumber=${page}&PageSize=${pageSize}`
    );
  },

  getErrorCodeStats: async () => {
    return await apiClient.get<ErrorCodeStats>('/AirConditioners/error-codes/stats');
  },

  getErrorCodeById: async (errorCodeId: string) => {
    return await apiClient.get<ErrorCode>(`/AirConditioners/error-codes/${errorCodeId}`);
  },

  createErrorCode: async (data: CreateErrorCodeRequest) => {
    return await apiClient.post<ErrorCode>('/AirConditioners/error-codes', data);
  },

  updateErrorCode: async (errorCodeId: string, data: UpdateErrorCodeRequest) => {
    await apiClient.put(`/AirConditioners/error-codes/${errorCodeId}`, data);
  },

  deleteErrorCode: async (errorCodeId: string) => {
    await apiClient.delete(`/AirConditioners/error-codes/${errorCodeId}`);
  }
};

