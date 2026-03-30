
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5209/api';

import { extractErrorMessage } from '../lib/utils';

// C-4: Module-level promise ensures only one token refresh is in-flight at a time.
// All concurrent 401 responses share the same refresh attempt instead of each
// triggering an independent call (which would exhaust the single-use refresh token).
let refreshPromise: Promise<void> | null = null;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleErrorResponse<T>(response: Response, retryOriginalRequest: () => Promise<T>): Promise<T> {
    if (response.status === 401) {
      const token        = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (token && refreshToken) {
        try {
          if (response.url.includes('/auth/refresh-token')) {
            throw new Error('Refresh token expired');
          }

          // C-4: Deduplicate concurrent refresh calls with a shared promise.
          if (!refreshPromise) {
            refreshPromise = (async () => {
              const authService = (await import('./auth')).authService;
              await authService.refreshToken(token, refreshToken);
            })().finally(() => {
              refreshPromise = null;
            });
          }

          await refreshPromise;
          return retryOriginalRequest();
        } catch (error) {
          const authService = (await import('./auth')).authService;
          authService.logout();
          // M-5: Dispatch a custom event so AuthContext can handle the navigation
          // via React Router instead of a full page reload.
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          throw error;
        }
      } else {
        const authService = (await import('./auth')).authService;
        authService.logout();
        if (!window.location.pathname.includes('/login')) {
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
      }
    }

    let errorData: unknown;
    try {
      const text = await response.text();
      errorData = text ? JSON.parse(text) : null;
    } catch {
      errorData = null;
    }

    const message = extractErrorMessage(errorData);
    throw new Error(message);
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const makeRequest = async (): Promise<T> => {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: this.getHeaders(includeAuth),
        });

        if (!response.ok) {
          return this.handleErrorResponse(response, makeRequest);
        }

        if (response.status === 204) {
          return {} as T;
        }

        return response.json();
    };

    return makeRequest();
  }

  async post<T, D = unknown>(endpoint: string, data?: D, includeAuth: boolean = true): Promise<T> {
    const makeRequest = async (): Promise<T> => {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.getHeaders(includeAuth),
          body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
           return this.handleErrorResponse(response, makeRequest);
        }

        if (response.status === 204) {
          return {} as T;
        }

        return response.json();
    };

    return makeRequest();
  }

  async put<T, D = unknown>(endpoint: string, data?: D, includeAuth: boolean = true): Promise<T> {
    const makeRequest = async (): Promise<T> => {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'PUT',
          headers: this.getHeaders(includeAuth),
          body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
          return this.handleErrorResponse(response, makeRequest);
        }

        if (response.status === 204) {
          return {} as T;
        }

        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);
    };

    return makeRequest();
  }

  async patch<T, D = unknown>(endpoint: string, data?: D, includeAuth: boolean = true): Promise<T> {
    const makeRequest = async (): Promise<T> => {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'PATCH',
          headers: this.getHeaders(includeAuth),
          body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
          return this.handleErrorResponse(response, makeRequest);
        }

        if (response.status === 204) {
          return {} as T;
        }

        return response.json();
    };

    return makeRequest();
  }

  async delete(endpoint: string, includeAuth: boolean = true): Promise<void> {
    const makeRequest = async (): Promise<void> => {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'DELETE',
          headers: this.getHeaders(includeAuth),
        });

        if (!response.ok) {
          return this.handleErrorResponse(response, makeRequest);
        }
    };

    return makeRequest();
  }

  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string | number>,
    includeAuth: boolean = true
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers: HeadersInit = {};
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const makeRequest = async (): Promise<T> => {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          return this.handleErrorResponse(response, makeRequest);
        }

        return response.json();
    };

    return makeRequest();
  }

  async uploadFiles<T>(
    endpoint: string,
    files: File[],
    additionalData?: Record<string, string | number>,
    includeAuth: boolean = true
  ): Promise<T> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers: HeadersInit = {};
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const makeRequest = async (): Promise<T> => {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          return this.handleErrorResponse(response, makeRequest);
        }

        return response.json();
    };

    return makeRequest();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

