import { apiClient } from './api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthUser,
  MessageResponse
} from '@/types';

export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data, false);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('token_expiration', response.token_expiration);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  /**
   * Register new user with company (no auto-login — email confirmation required)
   */
  async register(data: RegisterRequest): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/register', data, false);
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser> {
    return apiClient.get<AuthUser>('/auth/me');
  },

  /**
   * Refresh token
   */
  async refreshToken(token: string, refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh-token', {
      token,
      refresh_token: refreshToken
    }, false);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('token_expiration', response.token_expiration);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },



  /**
   * Confirm email address after registration
   */
  async confirmEmail(userId: string, token: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/confirm-email', { user_id: userId, token }, false);
  },

  /**
   * Resend email confirmation link
   */
  async resendConfirmation(email: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/resend-confirmation', { email }, false);
  },

  /**
   * Request password reset link
   */
  async forgotPassword(email: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/forgot-password', { email }, false);
  },

  /**
   * Reset password with token from email
   */
  async resetPassword(email: string, token: string, newPassword: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/reset-password', {
      email,
      token,
      new_password: newPassword,
    }, false);
  },

  /**
   * Change password for authenticated user
   */
  async changePassword(newPassword: string, confirmPassword: string): Promise<MessageResponse> {
    return apiClient.put<MessageResponse>('/auth/change-password', {
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
  },

  /**
   * Request email change (sends confirmation to new email)
   */
  async requestEmailChange(newEmail: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/change-email/request', { new_email: newEmail });
  },

  /**
   * Confirm email change using token from email
   */
  async confirmEmailChange(userId: string, newEmail: string, token: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/change-email/confirm', {
      user_id: userId,
      new_email: newEmail,
      token,
    }, false);
  },

  /**
   * Check if email is available
   */
  async checkEmail(email: string): Promise<{ available: boolean }> {
    return apiClient.get<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`, false);
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    phone_number?: string;
  }): Promise<AuthUser> {
    return apiClient.put<AuthUser>('/auth/profile', data);
  },

  /**
   * Logout - clear local storage
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
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

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },
};
