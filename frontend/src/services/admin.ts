import { apiClient } from './api';
import type {
  AdminCompanyFilter,
  AdminCompany,
  AdminUpdateSubscription,
  AdminUserFilter,
  AdminUser,
  AdminUpdateUser,
  AdminChangePassword,
  AdminChangeRole,
  AdminMontageFilter,
  AdminMontage,
  AdminCreateMontage,
  PagedResult,
} from '@/types/admin';

const BASE_URL = '/api/admin';

function buildQueryString(filter: object): string {
  const params = new URLSearchParams();
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export const adminService = {
  // Company endpoints
  async getCompanies(filter: AdminCompanyFilter): Promise<PagedResult<AdminCompany>> {
    const query = buildQueryString(filter);
    return apiClient.get<PagedResult<AdminCompany>>(`${BASE_URL}/companies?${query}`);
  },

  async getCompany(id: string): Promise<AdminCompany> {
    return apiClient.get<AdminCompany>(`${BASE_URL}/companies/${id}`);
  },

  async updateCompanySubscription(id: string, data: AdminUpdateSubscription): Promise<AdminCompany> {
    return apiClient.put<AdminCompany>(`${BASE_URL}/companies/${id}/subscription`, data);
  },

  async deleteCompany(id: string): Promise<void> {
    return apiClient.delete(`${BASE_URL}/companies/${id}`);
  },

  async restoreCompany(id: string): Promise<void> {
    return apiClient.post(`${BASE_URL}/companies/${id}/restore`);
  },

  // User endpoints
  async getUsers(filter: AdminUserFilter): Promise<PagedResult<AdminUser>> {
    const query = buildQueryString(filter);
    return apiClient.get<PagedResult<AdminUser>>(`${BASE_URL}/users?${query}`);
  },

  async getUser(id: string): Promise<AdminUser> {
    return apiClient.get<AdminUser>(`${BASE_URL}/users/${id}`);
  },

  async updateUser(id: string, data: AdminUpdateUser): Promise<AdminUser> {
    return apiClient.put<AdminUser>(`${BASE_URL}/users/${id}`, data);
  },

  async changeUserPassword(id: string, data: AdminChangePassword): Promise<void> {
    return apiClient.put(`${BASE_URL}/users/${id}/password`, data);
  },

  async changeUserRole(id: string, data: AdminChangeRole): Promise<void> {
    return apiClient.put(`${BASE_URL}/users/${id}/role`, data);
  },

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`${BASE_URL}/users/${id}`);
  },

  async restoreUser(id: string): Promise<void> {
    return apiClient.post(`${BASE_URL}/users/${id}/restore`);
  },

  // Montage endpoints
  async getMontages(filter: AdminMontageFilter): Promise<PagedResult<AdminMontage>> {
    const query = buildQueryString(filter);
    return apiClient.get<PagedResult<AdminMontage>>(`${BASE_URL}/montages?${query}`);
  },

  async getMontage(id: string): Promise<AdminMontage> {
    return apiClient.get<AdminMontage>(`${BASE_URL}/montages/${id}`);
  },

  async createMontage(data: AdminCreateMontage): Promise<AdminMontage> {
    return apiClient.post<AdminMontage>(`${BASE_URL}/montages`, data);
  },

  async updateMontage(id: string, data: AdminCreateMontage): Promise<AdminMontage> {
    return apiClient.put<AdminMontage>(`${BASE_URL}/montages/${id}`, data);
  },

  async deleteMontage(id: string): Promise<void> {
    return apiClient.delete(`${BASE_URL}/montages/${id}`);
  },
};
