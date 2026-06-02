import { apiClient } from './api';
import { safeStorage } from '@/lib/safe-storage';
import type { ReportedProblem, ProblemCategory } from '@/types';

const BASE_URL = '/ReportedProblems';

export const problemReportsService = {
  /**
   * Create a new problem report with optional screenshot
   */
  async createProblemReport(
    category: ProblemCategory,
    description: string,
    screenshot?: File
  ): Promise<ReportedProblem> {
    const formData = new FormData();
    formData.append('category', String(category));
    formData.append('description', description);
    
    if (screenshot) {
      formData.append('screenshot', screenshot);
    }

    const token = safeStorage.get('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${apiClient.getBaseUrl()}${BASE_URL}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to create problem report');
    }

    return response.json();
  },

  /**
   * Get all problem reports (Admin only)
   */
  async getAllProblemReports(): Promise<ReportedProblem[]> {
    return apiClient.get<ReportedProblem[]>(BASE_URL);
  },

  /**
   * Get a specific problem report by ID (Admin only)
   */
  async getProblemReportById(id: string): Promise<ReportedProblem> {
    return apiClient.get<ReportedProblem>(`${BASE_URL}/${id}`);
  },

  /**
   * Fetch the screenshot as a blob URL (authenticated)
   */
  async getScreenshotBlobUrl(id: string): Promise<string> {
    const token = safeStorage.get('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${apiClient.getBaseUrl()}${BASE_URL}/${id}/screenshot`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to load screenshot');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  /**
   * Mark a problem as reviewed (deletes it) - Admin only
   */
  async deleteProblemReport(id: string): Promise<void> {
    return apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Get available problem categories
   */
  async getCategories(): Promise<Array<{ value: number; name: string }>> {
    return apiClient.get<Array<{ value: number; name: string }>>(`${BASE_URL}/categories`);
  },
};
