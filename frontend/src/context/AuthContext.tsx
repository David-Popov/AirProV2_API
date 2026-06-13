import { logger } from '@/lib/logger'
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { authService } from '@/services';
import { safeStorage } from '@/lib/safe-storage';
import type { AuthUser, LoginRequest, RegisterRequest, AuthResponse, MessageResponse } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<MessageResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            const fetchedUser = await authService.getCurrentUser();
            setUser(fetchedUser);
            safeStorage.set('user', JSON.stringify(fetchedUser));
          }
        }
      } catch (error) {
        logger.error('Failed to initialize auth:', error instanceof Error ? error.message : String(error));
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  useEffect(() => {
    const handleSessionExpired = () => logout();
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [logout]);

  const login = useCallback(async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await authService.login(data);
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<MessageResponse> => {
    return authService.register(data);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const fetchedUser = await authService.getCurrentUser();
      setUser(fetchedUser);
      safeStorage.set('user', JSON.stringify(fetchedUser));
    } catch (error) {
      logger.error('Failed to refresh user:', error instanceof Error ? error.message : String(error));
      logout();
    }
  }, [logout]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }), [user, isLoading, login, register, logout, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
