"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, tokenManager } from '@/api/auth/signin';
import type { SignInResponseDto } from '@/types/auth/dto';

interface AuthState {
  user: SignInResponseDto['user'] | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokenExpiresAt: number | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: Partial<SignInResponseDto['user']>) => void;
  isTokenExpiringSoon: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
    tokenExpiresAt: null,
  });

  // Check for existing session on mount (only refresh token from HTTP-only cookie)
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      console.log('🔍 Checking for existing session...');
      
      // Try to refresh token from HTTP-only cookie
      const response = await authApi.refreshToken({ refreshToken: '' });
      
      if (response.accessToken) {
        console.log('✅ Session restored from HTTP-only cookie');
        
        const expiresAt = Date.now() + (response.expiresIn * 1000);
        
        // Set access token first
        setAuthState(prev => ({ 
          ...prev, 
          accessToken: response.accessToken,
          tokenExpiresAt: expiresAt,
          isAuthenticated: true
        }));
        
        // Get user profile with the new token
        try {
          const userProfile = await authApi.getProfile(response.accessToken);
          
          setAuthState({
            user: userProfile,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            tokenExpiresAt: expiresAt,
          });
          
          console.log('✅ User profile loaded successfully');
        } catch (profileError) {
          console.error('❌ Failed to load user profile:', profileError);
          // Even if profile fails, we still have a valid token
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        console.log('ℹ️ No refresh token available');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.log('ℹ️ No existing session found:', error instanceof Error ? error.message : 'Unknown error');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authApi.signIn({
        email,
        password,
        rememberMe,
      });

      const expiresAt = Date.now() + (response.tokens.expiresIn * 1000);

      setAuthState({
        user: response.user,
        accessToken: response.tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
        tokenExpiresAt: expiresAt,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API call success
      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        tokenExpiresAt: null,
      });
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing access token...');
      
      const response = await authApi.refreshToken({ refreshToken: '' });
      
      if (response.accessToken) {
        const expiresAt = Date.now() + (response.expiresIn * 1000);
        
        setAuthState(prev => ({
          ...prev,
          accessToken: response.accessToken,
          tokenExpiresAt: expiresAt,
          isAuthenticated: true
        }));
        
        console.log('✅ Token refreshed successfully');
        return true;
      }
      
      console.log('❌ Token refresh failed - no access token received');
      await logout();
      return false;
    } catch (error) {
      console.error('❌ Token refresh failed:', error instanceof Error ? error.message : 'Unknown error');
      // If refresh fails, logout user
      await logout();
      return false;
    }
  };

  const updateUser = (userData: Partial<SignInResponseDto['user']>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));
  };

  const isTokenExpiringSoon = (): boolean => {
    if (!authState.tokenExpiresAt) return true;
    
    // Check if token expires in the next 1 minute
    const timeUntilExpiry = authState.tokenExpiresAt - Date.now();
    return timeUntilExpiry < 60 * 1000; // 1 minute
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshToken,
    updateUser,
    isTokenExpiringSoon,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login or show unauthorized message
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-600">Please log in to access this page.</div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
