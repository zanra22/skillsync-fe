"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ConversationalOnboarding from '@/components/onboarding/ConversationalOnboarding';
import { ExtractedData } from '@/components/onboarding/ConversationManager';

export default function OnboardingPage() {
  const { user, isAuthenticated, isLoading, refreshToken, isTokenExpiringSoon } = useAuth();
  const router = useRouter();
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Redirect if doesn't need onboarding (only for already established users)
  useEffect(() => {
    // PERSIST LOGS: Save to localStorage for debugging
    const onboardingPageDebug = {
      timestamp: new Date().toISOString(),
      page: 'onboarding',
      isLoading,
      user: user,
      hasUser: !!user,
      hasProfile: !!(user && user.profile),
      onboardingCompleted: user?.profile?.onboarding_completed,
      willRedirect: !!(user && user.profile && user.profile.onboarding_completed === true),
    };
    localStorage.setItem('DEBUG_onboarding_page', JSON.stringify(onboardingPageDebug, null, 2));
    
    console.log('🏠 ONBOARDING PAGE EFFECT TRIGGERED');
    console.log('  ⏳ isLoading:', isLoading);
    console.log('  👤 user:', user);
    console.log('  📋 user.profile:', user?.profile);
    console.log('  ✅ onboarding_completed:', user?.profile?.onboarding_completed);
    
    // If we're still loading the initial auth state, wait
    if (isLoading) {
      console.log('  ⏳ Still loading, waiting...');
      return;
    }
    
    // Only redirect if user definitely has completed onboarding
    if (user && user.profile && user.profile.onboarding_completed === true) {
      // User has already completed onboarding
      console.log('  🔄 User already completed onboarding, redirecting...');
      const targetUrl = (user.role === 'super_admin' || user.role === 'admin') ? '/dashboard' : '/user-dashboard';
      console.log('  🎯 Redirect target:', targetUrl);
      router.push(targetUrl);
      return;
    }
    
    console.log('  ✅ User needs onboarding, staying on page');
  }, [isLoading, user, router]);

  const handleOnboardingComplete = async (extractedData: ExtractedData) => {
    try {
      setIsGeneratingRoadmap(true);

      // In development, if we don't have proper auth state but we're on the onboarding page,
      // it means the middleware bypass is working but auth context failed
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Always attempt proper authentication flow first
      let authCheckPassed = false;
      
      if (isAuthenticated && user) {
        console.log('✅ Authentication state is valid, proceeding normally');
        authCheckPassed = true;
      } else if (!isDevelopment) {
        // In production, we must have valid auth - fail immediately
        console.error('❌ No valid authentication in production mode');
        throw new Error('Authentication required. Please sign in again.');
      } else {
        // Development mode: Try to refresh token first
        console.log('� Development mode: Attempting token refresh...');
        try {
          const tokenRefreshed = await refreshToken();
          if (tokenRefreshed && isAuthenticated) {
            console.log('✅ Token refresh succeeded in development');
            authCheckPassed = true;
          } else {
            console.log('⚠️ Token refresh failed in development mode');
          }
        } catch (error) {
          console.log('⚠️ Token refresh error in development:', error);
        }
      }
      
      // Only use development bypass as absolute last resort
      if (!authCheckPassed && isDevelopment) {
        console.warn('🔧 Development mode: Using fallback due to auth issues - this should not happen in production');
      }

      // Transform conversational roles to system roles
      const transformRole = (conversationalRole?: string): string => {
        switch (conversationalRole) {
          case 'student':
            return 'learner';
          case 'professional':
            return 'learner';
          case 'career_changer':
            return 'learner';
          case 'other':
            return 'learner';
          default:
            return 'learner'; // Default to learner for all users completing onboarding
        }
      };

      // Transform extracted data to match backend expectations
      const onboardingData = {
        role: transformRole(extractedData.role),
        firstName: extractedData.firstName || '',
        lastName: extractedData.lastName || '',
        bio: extractedData.bio || '',
        currentRole: extractedData.currentRole || '', // Current profession/role
        industry: extractedData.industry || '',
        careerStage: extractedData.careerStage || 'entry_level', // Use Django choice value
        goals: extractedData.goals || [],
        preferences: {
          learningStyle: extractedData.preferences?.learningStyle || 'mixed',
          timeCommitment: extractedData.preferences?.timeCommitment || 'steady',
          notifications: extractedData.preferences?.notifications ?? true,
        }
      };

      console.log('🚀 Submitting onboarding data:', onboardingData);
      console.log('🍪 Current cookies before request:', document.cookie);
      console.log('🔑 Auth state before request:', {
        isAuthenticated,
        hasUser: !!user,
        userRole: user?.role,
        tokenExpiringSoon: isTokenExpiringSoon(),
        isDevelopment: process.env.NODE_ENV === 'development',
        authCheckPassed
      });

      // Check for auth token specifically
      const hasAuthToken = document.cookie.includes('auth-token');
      console.log('🔍 Auth token in cookies:', hasAuthToken);
      
      if (hasAuthToken) {
        const authTokenMatch = document.cookie.match(/auth-token=([^;]+)/);
        const tokenPreview = authTokenMatch?.[1]?.substring(0, 20) + '...';
        console.log('🔑 Auth token preview:', tokenPreview);
      }

      // For development testing: Check if we have ANY indication of authentication
      // Note: auth-token might be HttpOnly and not visible to JavaScript
      const hasAnyAuthCookies = document.cookie.includes('user-role') || 
                                document.cookie.includes('refresh_token') ||
                                hasAuthToken;
      
      console.log('🔍 Has any auth cookies:', hasAnyAuthCookies);

      // IMPORTANT: Even if frontend can't see cookies, the middleware confirmed authentication
      // So we should proceed with the API call and let server-side validation handle security
      if (!hasAnyAuthCookies && process.env.NODE_ENV === 'development') {
        console.warn('� Development mode: Frontend cannot see auth cookies, but middleware confirms authentication exists');
        console.warn('🔧 This is likely due to HttpOnly cookies or cookie path/domain settings');
        console.warn('� Proceeding with API call - server-side will validate authentication');
      }

      // Always proceed with the API call - let server-side handle authentication validation
      console.log('✅ Proceeding with onboarding completion - server-side will validate authentication');
      console.log('🔧 Note: Frontend cookie detection is for UX only, real security happens server-side');

      // Development simulation ONLY as last resort and with strict conditions
      const shouldUseDevSimulation = isDevelopment && 
                                   !authCheckPassed && 
                                   !isAuthenticated && 
                                   !document.cookie.includes('auth-token') &&
                                   typeof window !== 'undefined' &&
                                   window.location.hostname === 'localhost';
      
      if (false && shouldUseDevSimulation) { // DISABLED: was causing premature redirects
        console.warn('🚨 DEVELOPMENT ONLY: Simulating onboarding completion due to auth failure');
        console.warn('� This code path should NEVER execute in production');
        
        // Additional safety check - ensure we're really in development
        if (process.env.NODE_ENV !== 'development') {
          throw new Error('Development simulation attempted in non-development environment');
        }
        
        // Validate onboarding data before simulation
        if (!onboardingData.role || !onboardingData.firstName) {
          throw new Error('Invalid onboarding data - cannot simulate completion');
        }
        
        console.log('🔧 Development simulation: Creating temporary session...');
        
        // Simulate successful response for development
        const simulatedResult = {
          user: {
            role: onboardingData.role,
            email: 'dev@example.com',
            firstName: onboardingData.firstName,
            lastName: onboardingData.lastName || '',
            id: 'dev-user-id'
          },
          roadmapId: 'dev-roadmap-' + Date.now()
        };
        
        // Set a basic development cookie for the role with clear dev marker
        const devCookie = `user-role=${onboardingData.role}; path=/; max-age=86400`;
        document.cookie = devCookie;
        document.cookie = `dev-mode=true; path=/; max-age=86400`;
        
        console.log('🔧 Development simulation: Setting temporary cookies and redirecting...');
        
        // Redirect after a short delay
        setTimeout(() => {
          const targetUrl = (onboardingData.role === 'super_admin' || onboardingData.role === 'admin') 
            ? '/dashboard' 
            : '/user-dashboard';
          console.log('🔄 Development simulation: Redirecting to:', targetUrl);
          window.location.href = `${targetUrl}?welcome=true&dev-simulation=true`;
        }, 1000);
        
        return;
      }

      // Save onboarding data to backend
      let response;
      try {
        console.log('🚀 Making API call to /api/onboarding/complete...');
        
        // In development, add explicit cache control to ensure fresh request
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (process.env.NODE_ENV === 'development') {
          headers['Cache-Control'] = 'no-cache';
          headers['Pragma'] = 'no-cache';
        }
        
        response = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers,
          body: JSON.stringify(onboardingData),
          credentials: 'include',
          cache: 'no-store', // Ensure fresh request
        });
        console.log('✅ Fetch completed successfully');
      } catch (fetchError) {
        console.error('❌ Fetch failed:', fetchError);
        console.error('🔍 Fetch error details:', {
          message: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
          type: typeof fetchError,
          name: fetchError instanceof Error ? fetchError.name : 'Unknown'
        });
        
        // In development, try to provide better error handling
        if (process.env.NODE_ENV === 'development' && 
            fetchError instanceof Error && 
            fetchError.message === 'Failed to fetch') {
          console.log('🔧 Development mode: This could be an authentication cookie issue');
          console.log('💡 Try refreshing the page and attempting onboarding again');
          
          // For now, show a development message
          alert('Development Mode: API call failed. This may be due to authentication cookie timing. Try refreshing the page and completing onboarding again.');
        }
        
        throw fetchError; // Re-throw to be caught by outer try-catch
      }

      console.log('🔍 Frontend received response status:', response.status);
      console.log('🔍 Frontend received response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ Backend error:', errorData);
        console.error('🔍 Response details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // If it's a 401, try to refresh token and retry once
        if (response.status === 401) {
          console.log('🔄 Got 401, attempting token refresh and retry...');
          const refreshSuccessful = await refreshToken();
          if (refreshSuccessful) {
            console.log('✅ Token refresh successful, retrying request...');
            // Retry the request with refreshed token
            // Retry request - only normal headers
            const retryHeaders: HeadersInit = {
              'Content-Type': 'application/json',
            };
            if (process.env.NODE_ENV === 'development') {
              retryHeaders['Cache-Control'] = 'no-cache';
              retryHeaders['Pragma'] = 'no-cache';
            }

            response = await fetch('/api/onboarding/complete', {
              method: 'POST',
              headers: retryHeaders,
              body: JSON.stringify(onboardingData),
              credentials: 'include',
            });
            
            if (!response.ok) {
              const retryErrorData = await response.json().catch(() => null);
              console.error('❌ Retry also failed:', retryErrorData);
              throw new Error(`Failed to complete onboarding after retry: ${retryErrorData?.message || response.statusText}`);
            }
          } else {
            console.error('❌ Token refresh failed');
            throw new Error('Authentication failed. Please sign in again.');
          }
        } else {
          throw new Error(`Failed to complete onboarding: ${errorData?.message || response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('✅ Onboarding completed successfully:', result);
      console.log('🔍 Backend response details:', {
        hasUser: !!result.user,
        userObject: result.user,
        userRole: result.user?.role,
        hasAccessToken: !!result.access_token,
        tokenExpiresIn: result.expires_in,
        fullResult: result
      });

      // SECURITY: Handle fresh access token with updated role
      if (result.access_token) {
        console.log('🔒 Fresh access token received - updating authentication');
        
        // Store the fresh token securely (HttpOnly cookie will be set by backend)
        // This access token contains the updated role for immediate use
        console.log('🎯 New token expires in:', result.expires_in, 'seconds');
        
        // The backend has already set the secure HTTP-only cookies
        // We don't need to manually set auth cookies - they're handled server-side
        console.log('✅ Authentication refreshed with updated role');
      } else {
        console.log('⚠️ No fresh token received - using existing authentication');
        
        // SECURITY: Token refresh might have failed - check if we should force re-authentication
        if (result.user?.role && result.user.role !== user?.role) {
          console.log('🔒 Role mismatch detected - token refresh may have failed');
          console.log(`🔄 Expected role: ${result.user.role}, Current role: ${user?.role}`);
          
          // In production, this could indicate a security issue
          if (process.env.NODE_ENV !== 'development') {
            console.warn('🚨 SECURITY: Role mismatch in production - forcing re-authentication');
            
            // Force re-authentication to get fresh tokens with correct role
            window.location.href = '/signin?message=role-update-required&returnUrl=' + encodeURIComponent(window.location.pathname);
            return;
          } else {
            console.log('🔧 Development mode: Continuing despite token refresh failure');
          }
        }
      }

      // Update the user role cookie with the new role from backend
      if (result.user && result.user.role) {
        const isSecure = window.location.protocol === 'https:';
        const secureFlag = isSecure ? '; secure' : '';
        const newRole = result.user.role;
        
        console.log('🍪 Updating user role cookie from backend response:', newRole);
        
        // Clear the old cookie first
        document.cookie = `user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}; samesite=strict`;
        
        // Set the new cookie
        document.cookie = `user-role=${newRole}; path=/; max-age=86400${secureFlag}; samesite=strict`;
        
        // Verify the cookie was set
        const cookieValue = document.cookie.split('; ')
          .find(row => row.startsWith('user-role='))
          ?.split('=')[1];
        console.log('🔍 Cookie verification - user-role now set to:', cookieValue);
        
        // Longer delay to ensure cookie is processed
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('❌ No user role found in backend response. Cannot update cookie.');
        console.log('Backend response structure:', {
          result,
          hasUser: !!result.user,
          userKeys: result.user ? Object.keys(result.user) : 'no user object'
        });
      }

      // Redirect to dashboard with success message
      const targetUrl = (result.user?.role === 'super_admin' || result.user?.role === 'admin') 
        ? '/dashboard' 
        : '/user-dashboard';

      console.log('🔄 Redirecting to:', targetUrl, 'with role:', result.user?.role);
      
      // Force a hard navigation to ensure middleware sees the updated cookie
      window.location.href = `${targetUrl}?welcome=true&roadmap=${result.roadmapId || ''}`;
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: typeof error,
        error
      });
      
      // Handle error - could show toast or error message
      setIsGeneratingRoadmap(false);
      
      // In development mode, check if it's a network issue
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: Checking if this is a common development issue...');
        
        // Check if it's a "Failed to fetch" error which could be due to various reasons
        if (error instanceof Error && error.message === 'Failed to fetch') {
          console.log('⚠️ This appears to be a "Failed to fetch" error in development');
          console.log('🔍 Possible causes:');
          console.log('  - Network connectivity issue');
          console.log('  - CORS policy (unlikely for same-origin)');
          console.log('  - Server not responding');
          console.log('  - Authentication cookie issues');
          
          // Show a user-friendly message for development
          alert('Development Error: API call failed. Check the console logs and ensure both servers are running.');
        }
      }
      
      // More user-friendly error handling
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          errorMessage = 'Your session has expired. Please sign in again.';
          // Redirect to signin after a short delay
          setTimeout(() => {
            window.location.href = '/signin?message=session-expired';
          }, 2000);
        } else if (error.message.includes('Failed to complete onboarding')) {
          errorMessage = 'Failed to save your information. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show error to user
      alert(`Onboarding Error: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ConversationalOnboarding 
      onComplete={handleOnboardingComplete}
      isSubmitting={isGeneratingRoadmap}
    />
  );
}