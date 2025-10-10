"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, tokenManager } from '@/api/auth/signin';
import { otpApi, deviceUtils } from '@/api/auth/otp';
import type { SignInResponseDto, SignUpRequestDto } from '@/types/auth/dto';
import type { DeviceInfoDto, VerifyOTPResponseDto } from '@/types/auth/otp';
import { devAuthHelper } from '@/lib/dev-auth-helper';

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

  // Helper function to check if user needs onboarding
  const needsOnboarding = (user: any): boolean => {
    console.log('🔍 Checking if user needs onboarding:', {
      user,
      role: user?.role,
      roleType: typeof user?.role,
      firstName: user?.firstName,
      lastName: user?.lastName,
      profile: user?.profile
    });
    
    // Check if user has completed onboarding based on profile data
    // For new users without names or profile, they need onboarding
    
    // If user has role 'new-user', no role, null role, or undefined role, they definitely need onboarding
    if (!user.role || user.role === 'new-user' || user.role === null || user.role === 'null' || user.role === 'undefined') {
      console.log('✅ User needs onboarding: no valid role');
      return true;
    }
    
    // Check if user has a profile with onboarding_completed flag
    if (user.profile && user.profile.onboarding_completed) {
      console.log('✅ User has completed onboarding based on profile');
      return false;
    }
    
    // If user has names and role but no profile data, assume they need onboarding
    // This handles the transition period for existing users
    const firstName = user.firstName || user.username?.split(' ')[0] || '';
    const lastName = user.lastName || user.username?.split(' ')[1] || '';
    
    // If user has empty names (new signup flow), they definitely need onboarding
    if (!firstName || !lastName) {
      console.log('✅ User needs onboarding: missing names');
      return true;
    }
    
    // If we don't have profile data but user has names and role, check if profile exists
    // This is a fallback for users who might have completed onboarding but we don't have profile data
    const needsIt = !user.profile;
    console.log(`${needsIt ? '✅' : '❌'} User ${needsIt ? 'needs' : 'does not need'} onboarding: profile check`);
    return needsIt;
  };

  // Helper function for role-based redirects
  const redirectBasedOnRole = (user: any) => {
    console.log('🎯 Attempting redirect for user:', user);
    if (typeof window !== 'undefined') {
      let targetUrl = '';
      
      // Check if user needs onboarding first
      if (needsOnboarding(user)) {
        console.log('📝 User needs onboarding, redirecting to onboarding flow');
        targetUrl = '/onboarding';
      } else if (user.role === 'super_admin' || user.role === 'admin') {
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
    // ✅ SECURITY: Backend handles all cookie clearing via SecureTokenManager
    // Frontend no longer sets or clears auth cookies manually
    console.log('🔐 Cookie clearing handled by backend (secure)');
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
    // In development, try to restore immediately from localStorage first
    if (devAuthHelper.isDevelopment()) {
      const devState = devAuthHelper.restore();
      if (devState && devState.isAuthenticated) {
        console.log('🔧 Hot reload detected, restoring auth state immediately');
        setAuthState(prev => ({ 
          ...prev, 
          isAuthenticated: true,
          isLoading: false // Set to false immediately to prevent redirects
        }));
      }
    }
    
    // Add a small delay to allow other initialization to complete
    const timer = setTimeout(() => {
      checkExistingSession();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const checkExistingSession = async () => {
    try {
      console.log('🔍 Checking for existing session...');
      
      // ✅ SECURITY: Use ONLY HTTP-only refresh_token cookie (backend-managed)
      // No longer check frontend auth-token cookie
      console.log('🔐 Attempting session restore via HTTP-only refresh token...');
      
      // In development, try to restore from dev helper first
      const devState = devAuthHelper.restore();
      if (devState && devState.isAuthenticated) {
        console.log('🔧 Found dev auth state, attempting to validate...');
      }
      
      // In development, add more retry logic for hot reload scenarios
      let retryCount = 0;
      const maxRetries = devAuthHelper.isDevelopment() ? 2 : 1; // Reduced retries
      
      while (retryCount < maxRetries) {
        try {
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
              
              // Save to dev helper for hot reload persistence
              devAuthHelper.save(true, userProfile.role);
              
              console.log('👤 User profile loaded successfully:', {
                role: userProfile.role,
                email: userProfile.email,
                isAuthenticated: true
              });
              return; // Success, exit retry loop
              
            } catch (profileError) {
              console.error('❌ Error fetching user profile:', profileError);
              // Clear invalid session
              devAuthHelper.clear();
              setAuthState(prev => ({
                ...prev,
                user: null,
                accessToken: null,
                isAuthenticated: false,
                isLoading: false,
                tokenExpiresAt: null,
              }));
              return;
            }
          } else {
            // No valid session
            break;
          }
        } catch (error) {
          // In development, don't spam console with expected errors
          if (devAuthHelper.isDevelopment() && retryCount === maxRetries - 1) {
            console.log('🔧 Session validation failed (expected in development)');
          } else if (!devAuthHelper.isDevelopment()) {
            console.log(`🔄 Session check attempt ${retryCount + 1}/${maxRetries} failed:`, error);
          }
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
      
      // No session found after all retries
      if (devAuthHelper.isDevelopment()) {
        console.log('🔧 No valid session - user is not authenticated');
      } else {
        console.log('ℹ️ No existing session found - user needs to sign in');
      }
      devAuthHelper.clear();
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        isAuthenticated: false,
        user: null
      }));
      
    } catch (error) {
      console.error('❌ Session check failed:', error);
      devAuthHelper.clear();
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null 
      }));
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

        // ✅ SECURITY: Store accessToken ONLY in memory (React state)
        // Backend already set HTTP-only refresh_token cookie
        console.log('🔐 Storing access token in memory only (secure)');

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
        redirectBasedOnRole(credentialValidation.user);
        
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

        // Store signup credentials for post-OTP authentication
        console.log('💾 Storing pending signup credentials...');
        sessionStorage.setItem('pending-signup', JSON.stringify({ 
          email: data.email, 
          password: data.password 
        }));

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
    console.log('🚪 Logout initiated from AuthContext...');
    
    try {
      console.log('� Calling backend logout API...');
      
      // Call backend logout mutation to clear HTTP-only cookies
      await authApi.signOut();
      
      console.log('✅ Backend logout API completed successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Continue with cleanup even if backend call fails
    } finally {
      console.log('🧹 Clearing AuthContext state...');
      
      // Clear all auth state
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

      console.log('✅ Auth state cleared');

      // Force a full page reload to clear all state and allow middleware to see cleared cookies
      if (typeof window !== 'undefined') {
        console.log('🔄 Forcing full page reload to signin...');
        // Use replace to prevent back button from showing authenticated state
        window.location.replace('/signin');
      }
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing access token...');
      
      // In development mode, check if we have a refresh token at all
      if (process.env.NODE_ENV === 'development') {
        const cookieHeader = document.cookie;
        const hasRefreshToken = cookieHeader.includes('refresh_token=');
        
        if (!hasRefreshToken) {
          console.log('❌ Token refresh failed: No refresh token provided');
          console.log('🔧 Development mode: Cookies may not be accessible to client-side JS');
          console.log('⚠️ Not logging out - server-side authentication may still be valid');
          return false; // Don't logout, just return false
        }
        
        // For development, let server-side handle the refresh token validation
        console.log('🔧 Development mode: Deferring refresh token validation to server-side');
        return false; // Let the API route handle it
      }
      
      // In production, use direct GraphQL call (not available in development due to cookie restrictions)
      const refreshMutation = `
        mutation RefreshToken {
          auth {
            refreshToken {
              success
              message
              accessToken
              expiresIn
            }
          }
        }
      `;
      
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://127.0.0.1:8000/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          query: refreshMutation
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        const tokenData = result.data?.auth?.refreshToken;
        
        if (tokenData?.success && tokenData?.accessToken) {
          const expiresAt = Date.now() + ((tokenData.expiresIn || 3600) * 1000);
          
          setAuthState(prev => ({
            ...prev,
            accessToken: tokenData.accessToken,
            tokenExpiresAt: expiresAt,
            isAuthenticated: true
          }));
          
          console.log('✅ Token refreshed successfully');
          return true;
        }
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

      // Retrieve remember_me from sessionStorage for signin purpose
      let rememberMe = false;
      if (authState.pendingPurpose === 'signin') {
        try {
          const pendingLogin = sessionStorage.getItem('pending-login');
          console.log('🔍 Raw pending-login data:', pendingLogin);
          if (pendingLogin) {
            const loginData = JSON.parse(pendingLogin);
            rememberMe = loginData.rememberMe || false;
            console.log('📝 Retrieved rememberMe from pending login:', rememberMe, 'Type:', typeof rememberMe);
            console.log('📦 Full login data:', loginData);
          } else {
            console.warn('⚠️ No pending-login data found in sessionStorage');
          }
        } catch (error) {
          console.error('❌ Error reading pending-login data:', error);
        }
      }

      console.log('🚀 Calling verifyOTP with rememberMe:', rememberMe);

      const response = await otpApi.verifyOTP({
        code: otpCode,
        email: authState.pendingEmail,
        purpose: authState.pendingPurpose,
        deviceInfo: authState.deviceInfo,
        trustDevice: trustDevice || authState.pendingPurpose === 'signup', // Auto-trust device for signup
        rememberMe: rememberMe, // Pass rememberMe to backend for cookie duration
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

        console.log('🧹 OTP state cleared');

        // Handle post-OTP login for signin purpose
        if (authState.pendingPurpose === 'signin' && response.accessToken) {
          console.log('🔄 Processing post-OTP signin with access token from backend...');
          
          // ✅ Backend already returned access token and set HTTP-only cookies
          // No need to call signin again - just store the access token in memory
          const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes (default access token lifetime)

          // ✅ SECURITY: Store accessToken ONLY in memory (React state)
          // Backend already set HTTP-only refresh_token cookie during OTP verification
          console.log('🔐 Storing access token in memory only (secure)');

          setAuthState(prev => ({
            ...prev,
            user: response.user as any, // Backend returns simplified user from OTP, will fetch full user data later
            accessToken: response.accessToken || null,
            isAuthenticated: true,
            isLoading: false,
            tokenExpiresAt: expiresAt,
            isRedirecting: true,
          }));

          console.log('✅ Auth state updated:', {
            user: response.user,
            role: response.user?.role,
            isAuthenticated: true
          });

          // Show success toast for OTP-verified login
          if (typeof window !== 'undefined') {
            const { toast } = await import('sonner');
            toast.success("Signed in successfully!");
          }

          // Clean up pending login data
          sessionStorage.removeItem('pending-login');

          console.log('🚀 Redirecting based on role:', response.user?.role);
          // Role-based redirect
          if (response.user) {
            try {
              redirectBasedOnRole(response.user);
            } catch (redirectError) {
              console.error('❌ Redirect error:', redirectError);
            }
          }
        }
        
        // Handle post-OTP signup verification
        if (authState.pendingPurpose === 'signup') {
          console.log('🔄 Processing post-OTP signup...');
          
          try {
            // Get stored signup credentials
            const pendingSignup = sessionStorage.getItem('pending-signup');
            console.log('📦 Pending signup data:', !!pendingSignup);
            
            if (pendingSignup) {
              const { email, password } = JSON.parse(pendingSignup);
              sessionStorage.removeItem('pending-signup');
              
              console.log('🔑 Completing signup authentication...', { email });
              
              // Add a small delay to ensure backend has processed the account activation
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Complete the authentication process by signing in
              const loginResponse = await authApi.signIn({
                email,
                password,
                rememberMe: false, // Default for new signups
              });

              console.log('✅ Signup authentication response:', loginResponse);
              const expiresAt = Date.now() + (loginResponse.tokens.expiresIn * 1000);

              // ✅ SECURITY: Store accessToken ONLY in memory (React state)
              // Backend already set HTTP-only refresh_token cookie
              console.log('🔐 Storing access token in memory only (secure)');

              setAuthState(prev => ({
                ...prev,
                user: loginResponse.user,
                accessToken: loginResponse.tokens.accessToken,
                isAuthenticated: true,
                isLoading: false,
                tokenExpiresAt: expiresAt,
                isRedirecting: true,
              }));

              console.log('✅ Auth state updated for new user:', {
                user: loginResponse.user,
                role: loginResponse.user.role,
                isAuthenticated: true
              });

              // Show success toast
              if (typeof window !== 'undefined') {
                const { toast } = await import('sonner');
                toast.success("Account verified successfully! Welcome to SkillSync!");
              }

              console.log('🚀 Redirecting new user based on profile:', loginResponse.user);
              // Always redirect new users to onboarding after successful signup
              if (typeof window !== 'undefined') {
                console.log('🔄 Direct redirect to onboarding for new user');
                window.location.href = '/onboarding';
              }
              
            } else {
              console.log('❌ No pending signup data found');
              // Fallback: redirect to onboarding without auth (this might cause issues)
              if (typeof window !== 'undefined') {
                const { toast } = await import('sonner');
                toast.success("Account verified! Please sign in to continue.");
                window.location.href = '/signin?message=account-verified';
              }
            }
            
          } catch (error) {
            console.error('❌ Error processing signup authentication:', error);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            
            // Show specific error message
            if (typeof window !== 'undefined') {
              const { toast } = await import('sonner');
              if (error instanceof Error && error.message.includes('pending verification')) {
                toast.error("Account activation is still in progress. Please try again in a moment.");
                // Retry after a delay
                setTimeout(async () => {
                  try {
                    const pendingSignup = sessionStorage.getItem('pending-signup');
                    if (pendingSignup) {
                      const { email, password } = JSON.parse(pendingSignup);
                      const retryResponse = await authApi.signIn({ email, password, rememberMe: false });
                      // Handle successful retry...
                      window.location.reload();
                    }
                  } catch (retryError) {
                    console.error('Retry failed:', retryError);
                    toast.error("Please try signing in manually.");
                    window.location.href = '/signin?message=account-verified';
                  }
                }, 3000);
              } else {
                toast.error("Authentication failed. Please sign in manually.");
                window.location.href = '/signin?message=account-verified';
              }
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
