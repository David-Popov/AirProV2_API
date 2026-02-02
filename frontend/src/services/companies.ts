import { apiClient } from './api';
import type { 
  Company, 
  CompanyUser,
  CreateCompanyRequest, 
  UpdateCompanyRequest,
  CreateCompanyUserRequest,
  UpdateSubscriptionRequest,
  PagedList
} from '@/types';

export const companyService = {
  /**
   * Get all companies
   */
  async getAll(pageNumber = 1, pageSize = 10): Promise<PagedList<Company>> {
    return apiClient.get<PagedList<Company>>(`/Companies?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  },

  /**
   * Get active companies
   */
  async getActive(pageNumber = 1, pageSize = 10): Promise<PagedList<Company>> {
    return apiClient.get<PagedList<Company>>(`/Companies/active?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  },

  /**
   * Get company by ID
   */
  async getById(id: string): Promise<Company> {
    return apiClient.get<Company>(`/Companies/${id}`);
  },

  /**
   * Get company by BULSTAT
   */
  async getByBulstat(bulstat: string): Promise<Company> {
    return apiClient.get<Company>(`/Companies/bulstat/${bulstat}`);
  },

  /**
   * Create new company
   */
  async create(data: CreateCompanyRequest): Promise<Company> {
    return apiClient.post<Company>('/Companies', data);
  },

  /**
   * Update company
   */
  async update(id: string, data: UpdateCompanyRequest): Promise<void> {
    return apiClient.put<void>(`/Companies/${id}`, data);
  },

  /**
   * Delete company
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/Companies/${id}`);
  },

  /**
   * Get company users
   */
  async getUsers(companyId: string): Promise<CompanyUser[]> {
    return apiClient.get<CompanyUser[]>(`/Companies/${companyId}/users`);
  },

  /**
   * Create user for company
   */
  async createUser(companyId: string, data: CreateCompanyUserRequest): Promise<CompanyUser> {
    return apiClient.post<CompanyUser>(`/Companies/${companyId}/users`, data);
  },

  /**
   * Update company subscription
   */
  async updateSubscription(companyId: string, data: UpdateSubscriptionRequest): Promise<void> {
    return apiClient.put<void>(`/Companies/${companyId}/subscription`, data);
  },

  /**
   * Renew subscription for company and all users
   */
  async renewSubscription(companyId: string): Promise<void> {
    return apiClient.post<void>(`/Companies/${companyId}/subscription/renew`);
  },

  /**
   * Check and expire trial subscriptions (admin only)
   */
  async checkTrialSubscriptions(): Promise<void> {
    return apiClient.post<void>('/Companies/subscriptions/check-trials');
  }
};
