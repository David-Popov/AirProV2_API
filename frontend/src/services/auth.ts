import { apiClient } from './api';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  AuthUser 
} from '@/types';

export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data, false);
    
    // Store token in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('token_expiration', response.token_expiration);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  /**
   * Register new user with company
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data, false);
    
    // Store token in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('token_expiration', response.token_expiration);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser> {
    return apiClient.get<AuthUser>('/auth/me');
  },

  /**
   * Check if email is available
   */
  async checkEmail(email: string): Promise<{ available: boolean }> {
    return apiClient.get<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`, false);
  },

  /**
   * Logout - clear local storage
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiration');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('token_expiration');
    
    if (!token || !expiration) {
      return false;
    }
    
    // Check if token is expired
    const expirationDate = new Date(expiration);
    if (expirationDate <= new Date()) {
      this.logout();
      return false;
    }
    
    return true;
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): AuthUser | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return null;
    }
    
    try {
      return JSON.parse(userJson) as AuthUser;
    } catch {
      return null;
    }
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },
};
