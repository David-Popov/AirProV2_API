import { apiClient } from './api';
import type { 
  Employee, 
  CreateEmployeeRequest
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
  }
};
