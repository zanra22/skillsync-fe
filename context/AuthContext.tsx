"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, tokenManager } from '@/api/auth/signin';
import { otpApi, deviceUtils } from '@/api/auth/otp';
import type { SignInResponseDto, SignUpRequestDto } from '@/types/auth/dto';
import type { DeviceInfoDto, VerifyOTPResponseDto } from '@/types/auth/otp';

interface AuthState {
  user: SignInResponseDto['user'] | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokenExpiresAt: number | null;
  // OTP-related state
  otpRequired: boolean;
  pendingEmail: string | null;
  pendingPurpose: 'signin' | 'signup' | 'password_reset' | 'device_verification' | null;
  deviceInfo: DeviceInfoDto | null;
  // Redirect state
  isRedirecting: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (data: SignUpRequestDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: Partial<SignInResponseDto['user']>) => void;
  isTokenExpiringSoon: () => boolean;
  // OTP-related methods
  sendOTP: (email: string, purpose: 'signin' | 'signup' | 'password_reset' | 'device_verification') => Promise<void>;
  verifyOTP: (otpCode: string, trustDevice?: boolean) => Promise<VerifyOTPResponseDto>;
  resendOTP: () => Promise<void>;
  checkDeviceTrust: (email: string) => Promise<boolean>;
  clearOTPState: () => void;
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
    // OTP-related state
    otpRequired: false,
    pendingEmail: null,
    pendingPurpose: null,
    deviceInfo: null,
    // Redirect state
    isRedirecting: false,
  });

  // Helper function to check if user is super admin
  const checkIfSuperAdmin = async (email: string): Promise<boolean> => {
    try {
      console.log('🔍 Checking if super admin for email:', email);
      // This would typically be an API call to check user role
      // For now, we'll implement a basic check
      const response = await fetch('/api/auth/check-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Super admin check result:', data);
        return data.role === 'super_admin';
      }
      console.log('❌ Super admin check failed - response not ok');
      return false;
    } catch (error) {
      console.error('Error checking super admin status:', error);
      // For development, assume certain emails are super admin
      const fallbackResult = email.includes('admin') || email.includes('superadmin') || email === 'arnazdj@gmail.com';
      console.log('🔧 Fallback super admin check:', fallbackResult);
      return fallbackResult;
    }
  };

  // Helper function for role-based redirects
  const redirectBasedOnRole = (role: string) => {
    console.log('🎯 Attempting redirect for role:', role);
    if (typeof window !== 'undefined') {
      let targetUrl = '';
      if (role === 'super_admin' || role === 'admin') {
        targetUrl = '/dashboard';
      } else {
        targetUrl = '/user-dashboard';
      }
      console.log('🔄 Redirecting to:', targetUrl);
      console.log('🔍 Current URL before redirect:', window.location.href);
      console.log('🔍 Current pathname:', window.location.pathname);
      
      // Use a slight delay to ensure cookies and state are fully set
      setTimeout(() => {
        console.log('🚀 Executing redirect to:', targetUrl);
        console.log('🍪 Cookies at redirect time:', document.cookie);
        
        try {
          // Force redirect using window.location.href
          window.location.href = targetUrl;
          console.log('✅ Redirect initiated successfully');
        } catch (error) {
          console.error('❌ Redirect error:', error);
          // Fallback: try using window.location.replace
          try {
            window.location.replace(targetUrl);
            console.log('✅ Fallback redirect successful');
          } catch (fallbackError) {
            console.error('❌ Fallback redirect failed:', fallbackError);
          }
        }
      }, 100); // Reduced delay for immediate redirect
    }
  };

  // Helper function to clear auth cookies
  const clearAuthCookies = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    }
  };

  // Initialize device info on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const deviceInfo = deviceUtils.getDeviceInfo();
      setAuthState(prev => ({ ...prev, deviceInfo }));
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      console.log('🔍 Checking for existing session...');
      
      const response = await authApi.refreshToken({ refreshToken: '' });
      
      if (response.accessToken) {
        console.log('✅ Session restored from HTTP-only cookie');
        
        const expiresAt = Date.now() + (response.expiresIn * 1000);
        
        setAuthState(prev => ({ 
          ...prev, 
          accessToken: response.accessToken,
          tokenExpiresAt: expiresAt,
          isAuthenticated: true
        }));
        
        try {
          const userProfile = await authApi.getProfile(response.accessToken);
          
          setAuthState(prev => ({
            ...prev,
            user: userProfile,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            tokenExpiresAt: expiresAt,
          }));
          
          console.log('✅ User profile loaded successfully');
        } catch (profileError) {
          console.error('❌ Failed to load user profile:', profileError);
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
      console.log('🔐 Starting login process...', { email, rememberMe });
      
      // STEP 1: First validate credentials by attempting login
      console.log('🔑 Validating credentials...');
      try {
        const credentialValidation = await authApi.signIn({
          email,
          password,
          rememberMe,
        });
        console.log('✅ Credentials valid, checking if OTP required...');
        
        // STEP 2: Now check if OTP is required for this user
        if (authState.deviceInfo) {
          const deviceTrustCheck = await otpApi.checkDeviceTrust({
            email,
            deviceInfo: authState.deviceInfo,
          });

          // For super_admin, ALWAYS require OTP regardless of device trust
          const isSuperAdmin = await checkIfSuperAdmin(email);
          const requiresOtp = deviceTrustCheck.requiresOtp || isSuperAdmin;

          console.log('🔍 Device trust check:', { 
            email,
            requiresOtp: deviceTrustCheck.requiresOtp, 
            isSuperAdmin, 
            finalRequiresOtp: requiresOtp,
            deviceInfo: authState.deviceInfo
          });

          if (requiresOtp) {
            console.log('📱 OTP required, sending OTP...');
            
            // STEP 3: Send OTP only after credentials are validated
            const otpResponse = await otpApi.sendOTP({
              email,
              purpose: 'signin',
              deviceInfo: authState.deviceInfo,
            });

            console.log('📧 OTP sent, storing pending login...');
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              otpRequired: true,
              pendingEmail: email,
              pendingPurpose: 'signin',
            }));
            
            // Store login credentials temporarily for post-OTP login
            console.log('💾 Storing pending login credentials...');
            sessionStorage.setItem('pending-login', JSON.stringify({ email, password, rememberMe }));
            console.log('💾 Stored pending login data');
            
            // Don't throw error, just set OTP required state
            return;
          }
        }

        // STEP 4: If no OTP required, complete login directly
        console.log('✅ No OTP required, completing login...');
        const expiresAt = Date.now() + (credentialValidation.tokens.expiresIn * 1000);

        // Set auth cookies for middleware
        console.log('🍪 Setting auth cookies...');
        const isSecure = window.location.protocol === 'https:';
        const secureFlag = isSecure ? '; secure' : '';
        document.cookie = `auth-token=${credentialValidation.tokens.accessToken}; path=/; max-age=${credentialValidation.tokens.expiresIn}${secureFlag}; samesite=strict`;
        document.cookie = `user-role=${credentialValidation.user.role}; path=/; max-age=${credentialValidation.tokens.expiresIn}${secureFlag}; samesite=strict`;

        setAuthState(prev => ({
          ...prev,
          user: credentialValidation.user,
          accessToken: credentialValidation.tokens.accessToken,
          isAuthenticated: true,
          isLoading: false,
          tokenExpiresAt: expiresAt,
          otpRequired: false,
          pendingEmail: null,
          pendingPurpose: null,
          isRedirecting: true, // Set redirecting immediately
        }));

        console.log('🚀 Direct login successful, redirecting...', credentialValidation.user.role);
        
        // Show success toast for direct login
        if (typeof window !== 'undefined') {
          const { toast } = await import('sonner');
          toast.success("Signed in successfully!");
        }
        
        // Immediate redirect to prevent UI flash
        redirectBasedOnRole(credentialValidation.user.role);
        
      } catch (credentialError) {
        console.error('❌ Credential validation failed:', credentialError);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        throw credentialError; // This will show the invalid credentials error
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signup = async (data: SignUpRequestDto) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await authApi.signUp(data);
      
      // After successful signup, send OTP for account verification
      if (authState.deviceInfo) {
        const otpResponse = await otpApi.sendOTP({
          email: data.email,
          purpose: 'signup',
          deviceInfo: authState.deviceInfo,
        });

        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          otpRequired: true,
          pendingEmail: data.email,
          pendingPurpose: 'signup',
        }));
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
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
      // Clear auth cookies
      clearAuthCookies();
      
      // Clear session storage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('pending-login');
      }

      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        tokenExpiresAt: null,
        otpRequired: false,
        pendingEmail: null,
        pendingPurpose: null,
        deviceInfo: authState.deviceInfo, // Keep device info
        isRedirecting: false,
      });

      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
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
    const timeUntilExpiry = authState.tokenExpiresAt - Date.now();
    return timeUntilExpiry < 60 * 1000; // 1 minute
  };

  // OTP-related methods
  const sendOTP = async (email: string, purpose: 'signin' | 'signup' | 'password_reset' | 'device_verification') => {
    if (!authState.deviceInfo) {
      throw new Error('Device information not available');
    }

    try {
      const response = await otpApi.sendOTP({
        email,
        purpose,
        deviceInfo: authState.deviceInfo,
      });

      setAuthState(prev => ({
        ...prev,
        otpRequired: true,
        pendingEmail: email,
        pendingPurpose: purpose,
      }));
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (otpCode: string, trustDevice: boolean = false) => {
    if (!authState.pendingEmail || !authState.pendingPurpose || !authState.deviceInfo) {
      throw new Error('Invalid OTP session');
    }

    console.log('🔐 Starting OTP verification...', { 
      email: authState.pendingEmail, 
      purpose: authState.pendingPurpose 
    });

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await otpApi.verifyOTP({
        code: otpCode,
        email: authState.pendingEmail,
        purpose: authState.pendingPurpose,
        deviceInfo: authState.deviceInfo,
        trustDevice: trustDevice || authState.pendingPurpose === 'signup', // Auto-trust device for signup
      });

      console.log('✅ OTP API response:', response);

      if (response.success) {
        // Clear OTP state
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          otpRequired: false,
          pendingEmail: null,
          pendingPurpose: null,
        }));

        console.log('🧹 OTP state cleared, processing signin...');

        // Handle post-OTP login for signin purpose
        if (authState.pendingPurpose === 'signin') {
          console.log('🔄 Processing post-OTP signin...');
          const pendingLogin = sessionStorage.getItem('pending-login');
          console.log('📦 Pending login data:', pendingLogin);
          
          if (pendingLogin) {
            const { email, password, rememberMe } = JSON.parse(pendingLogin);
            sessionStorage.removeItem('pending-login');
            
            console.log('🔑 Completing login process...');
            // Complete the login process
            const loginResponse = await authApi.signIn({
              email,
              password,
              rememberMe,
            });

            console.log('✅ Login response:', loginResponse);
            const expiresAt = Date.now() + (loginResponse.tokens.expiresIn * 1000);

            // Set auth cookies for middleware
            console.log('🍪 Setting auth cookies...');
            const isSecure = window.location.protocol === 'https:';
            const secureFlag = isSecure ? '; secure' : '';
            const cookieOptions = `path=/; max-age=${loginResponse.tokens.expiresIn}${secureFlag}; samesite=strict`;
            
            document.cookie = `auth-token=${loginResponse.tokens.accessToken}; ${cookieOptions}`;
            document.cookie = `user-role=${loginResponse.user.role}; ${cookieOptions}`;
            
            console.log('🍪 Auth cookies set:', {
              token: !!loginResponse.tokens.accessToken,
              role: loginResponse.user.role
            });

            setAuthState(prev => ({
              ...prev,
              user: loginResponse.user,
              accessToken: loginResponse.tokens.accessToken,
              isAuthenticated: true,
              isLoading: false,
              tokenExpiresAt: expiresAt,
              isRedirecting: true, // Set redirecting immediately
            }));

            console.log('✅ Auth state updated:', {
              user: loginResponse.user,
              role: loginResponse.user.role,
              isAuthenticated: true
            });

            // Show success toast for OTP-verified login
            if (typeof window !== 'undefined') {
              const { toast } = await import('sonner');
              toast.success("Signed in successfully!");
            }

            console.log('🚀 Redirecting based on role:', loginResponse.user.role);
            // Role-based redirect
            try {
              redirectBasedOnRole(loginResponse.user.role);
            } catch (redirectError) {
              console.error('❌ Redirect error:', redirectError);
            }
          } else {
            console.log('❌ No pending login data found');
            // If no pending login, still redirect based on user role if we have it
            if (response.user?.role) {
              console.log('🔄 Attempting redirect with OTP response user:', response.user.role);
              redirectBasedOnRole(response.user.role);
            }
          }
        }
        
        return response;
      } else {
        console.log('❌ OTP verification failed:', response.message);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const resendOTP = async () => {
    if (!authState.pendingEmail || !authState.pendingPurpose) {
      throw new Error('No pending OTP session');
    }

    await sendOTP(authState.pendingEmail, authState.pendingPurpose);
  };

  const checkDeviceTrust = async (email: string): Promise<boolean> => {
    if (!authState.deviceInfo) {
      return false;
    }

    try {
      const response = await otpApi.checkDeviceTrust({
        email,
        deviceInfo: authState.deviceInfo,
      });

      return response.isTrusted;
    } catch (error) {
      return false;
    }
  };

  const clearOTPState = () => {
    setAuthState(prev => ({
      ...prev,
      otpRequired: false,
      pendingEmail: null,
      pendingPurpose: null,
    }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    refreshToken,
    updateUser,
    isTokenExpiringSoon,
    sendOTP,
    verifyOTP,
    resendOTP,
    checkDeviceTrust,
    clearOTPState,
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
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-lg font-inter text-muted-foreground">Loading...</div>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to unauthorized page
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-lg text-red-600 font-inter">Redirecting to sign in...</div>
        </div>
      );
    }

    // Check role-based access
    if (allowedRoles && user) {
      console.log('🔍 withAuth: Checking role access', {
        userRole: user.role,
        allowedRoles,
        hasValidRole: user.role && allowedRoles.includes(user.role),
        user
      });

      if (!user.role || !allowedRoles.includes(user.role)) {
        console.log('❌ withAuth: Role check failed!', {
          userRole: user.role,
          allowedRoles,
          hasRole: user.role ? allowedRoles.includes(user.role) : false
        });
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized';
        }
        return (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-lg text-red-600 font-inter">Access denied. Redirecting...</div>
          </div>
        );
      }
    }

    console.log('✅ withAuth: Access granted!', {
      isAuthenticated,
      userRole: user?.role,
      allowedRoles,
      user
    });

    return <Component {...props} />;
  };
}

// Higher-order component specifically for admin routes
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return withAuth(Component, ['super_admin', 'admin']);
}

// Higher-order component specifically for super admin routes
export function withSuperAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return withAuth(Component, ['super_admin']);
}
