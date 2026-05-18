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

  // Stable logout so it can be used in other callbacks and the event listener
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // Initialise auth state from storage on mount
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
        // L-5: Log only the message, not the full error object, to avoid leaking
        // stack traces or internal API details in production devtools.
        console.error('Failed to initialize auth:', error instanceof Error ? error.message : String(error));
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  // M-5: Listen for the auth:session-expired event dispatched by the API client
  // when a token refresh fails. Clears auth state so ProtectedRoute redirects
  // to /login via React Router instead of a full page reload.
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
      console.error('Failed to refresh user:', error instanceof Error ? error.message : String(error));
      logout();
    }
  }, [logout]);

  // L-4: Only include state values in the deps array — the stable callbacks
  // (login, register, logout, refreshUser) are wrapped in useCallback with
  // stable deps and do not need to be listed here.
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
