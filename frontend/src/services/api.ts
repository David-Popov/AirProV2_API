// API Client configuration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5209/api';

// Helper function to extract error messages from various API response formats
function extractErrorMessage(errorData: unknown): string {
  if (!errorData) return 'An error occurred';
  
  // Handle string responses
  if (typeof errorData === 'string') {
    return errorData;
  }
  
  // Handle object responses
  if (typeof errorData === 'object') {
    const err = errorData as Record<string, unknown>;
    
    // Handle { message: "..." }
    if (err.message && typeof err.message === 'string') {
      return err.message;
    }
    
    // Handle { errors: ["...", "..."] } (standard validation errors)
    if (Array.isArray(err.errors)) {
      return err.errors.filter(e => typeof e === 'string').join('. ');
    }
    
    // Handle { errors: { field: ["...", "..."] } } (ASP.NET model validation)
    if (err.errors && typeof err.errors === 'object' && !Array.isArray(err.errors)) {
      const fieldErrors = err.errors as Record<string, string[]>;
      const messages: string[] = [];
      for (const field in fieldErrors) {
        if (Array.isArray(fieldErrors[field])) {
          messages.push(...fieldErrors[field]);
        }
      }
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }
    
    // Handle { error: "..." } 
    if (err.error && typeof err.error === 'string') {
      return err.error;
    }
    
    // Handle ASP.NET Identity errors: [{ description: "..." }, ...]
    if (Array.isArray(errorData)) {
      const descriptions = (errorData as Array<{description?: string}>)
        .filter(e => e.description)
        .map(e => e.description);
      if (descriptions.length > 0) {
        return descriptions.join('. ');
      }
    }
    
    // Handle { title: "...", detail: "..." } (Problem Details)
    if (err.title && typeof err.title === 'string') {
      const detail = err.detail && typeof err.detail === 'string' ? `: ${err.detail}` : '';
      return `${err.title}${detail}`;
    }
  }
  
  return 'An error occurred';
}

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

  private async handleErrorResponse(response: Response): Promise<never> {
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
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async post<T, D = unknown>(endpoint: string, data?: D, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async put<T, D = unknown>(endpoint: string, data?: D, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  async patch<T, D = unknown>(endpoint: string, data?: D, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async delete(endpoint: string, includeAuth: boolean = true): Promise<void> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

