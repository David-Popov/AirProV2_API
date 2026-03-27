import { apiClient } from './api';
import type {
  Employee,
  CreateEmployeeRequest,
  EmployeeLimits
} from '@/types';

export const employeeService = {
  /**
   * Get all employees for the current manager's company
   */
  async getAll(): Promise<Employee[]> {
    return apiClient.get<Employee[]>('/manager/employees');
  },

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee> {
    return apiClient.get<Employee>(`/manager/employees/${id}`);
  },

  /**
   * Create new employee
   */
  async create(data: CreateEmployeeRequest): Promise<Employee> {
    return apiClient.post<Employee>('/manager/employees', data);
  },

  /**
   * Update employee
   */
  async update(id: string, data: Partial<CreateEmployeeRequest>): Promise<Employee> {
    return apiClient.put<Employee>(`/manager/employees/${id}`, data);
  },

  /**
   * Delete employee
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/manager/employees/${id}`);
  },

  /**
   * Get employee limits for current company
   */
  async getLimits(): Promise<EmployeeLimits> {
    return apiClient.get<EmployeeLimits>('/manager/employee-limits');
  },

  /**
   * Activate employee
   */
  async activate(id: string): Promise<void> {
    return apiClient.post(`/manager/employees/${id}/activate`);
  },

  /**
   * Deactivate employee
   */
  async deactivate(id: string): Promise<void> {
    return apiClient.post(`/manager/employees/${id}/deactivate`);
  },

  /**
   * Activate 6-month trial period for the company
   */
  async activateTrial(): Promise<void> {
    return apiClient.post('/manager/activate-trial');
  },

  async deleteAccountAndCompany(): Promise<void> {
    return apiClient.delete('/manager/account');
  }
};
