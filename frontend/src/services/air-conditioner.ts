import { apiClient } from './api';
import type { 
  AirConditioner, 
  CreateAirConditionerRequest, 
  UpdateAirConditionerRequest,
  PagedList,
  ErrorCode,
  CreateErrorCodeRequest,
  UpdateErrorCodeRequest
} from '@/types';

export const airConditionerService = {
  getAll: async (page = 1, pageSize = 10) => {
    return await apiClient.get<PagedList<AirConditioner>>(
      `/AirConditioners?PageNumber=${page}&PageSize=${pageSize}`
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

  // Error Code methods
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

