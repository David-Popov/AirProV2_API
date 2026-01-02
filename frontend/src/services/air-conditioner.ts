import { apiClient } from './api';
import type { 
  AirConditioner, 
  CreateAirConditionerRequest, 
  UpdateAirConditionerRequest,
  PagedList,
  ErrorCode
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

  getErrorCodes: async (id: string, page = 1, pageSize = 10) => {
    return await apiClient.get<PagedList<ErrorCode>>(
      `/AirConditioners/${id}/error-codes?PageNumber=${page}&PageSize=${pageSize}`
    );
  },

  update: async (id: string, data: UpdateAirConditionerRequest) => {
    // Backend expects full object or partial? Controller uses UpdateAirConditionerDto.
    // Usually Put replaces, but DTO might be partial.
    // Controller signature: Update(Guid id, [FromBody] UpdateAirConditionerDto dto)
    await apiClient.put(`/AirConditioners/${id}`, data);
  },

  delete: async (id: string) => {
    await apiClient.delete(`/AirConditioners/${id}`);
  }
};
