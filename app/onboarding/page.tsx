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
    console.log('Onboarding page effect triggered');
    console.log('  isLoading:', isLoading);
    console.log('  user:', user);
    console.log('  onboarding_completed:', user?.profile?.onboarding_completed);

    // If we're still loading the initial auth state, wait
    if (isLoading) {
      console.log('  Still loading, waiting...');
      return;
    }

    // Only redirect if user definitely has completed onboarding
    if (user && user.profile && user.profile.onboarding_completed === true) {
      console.log('  User already completed onboarding, redirecting...');
      const targetUrl = (user.role === 'super_admin' || user.role === 'admin') ? '/dashboard' : '/user-dashboard';
      console.log('  Redirect target:', targetUrl);
      router.push(targetUrl);
      return;
    }

    console.log('  User needs onboarding, staying on page');
  }, [isLoading, user, router]);

  const handleOnboardingComplete = async (extractedData: ExtractedData) => {
    try {
      setIsGeneratingRoadmap(true);

      // Require valid authentication
      if (!isAuthenticated || !user) {
        console.error('Authentication required');
        throw new Error('Authentication required. Please sign in again.');
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

      console.log('Submitting onboarding data:', onboardingData);
      console.log('Auth state before request:', {
        isAuthenticated,
        hasUser: !!user,
        userRole: user?.role,
        tokenExpiringSoon: isTokenExpiringSoon(),
      });

      // Call Next.js API route (proper architecture)
      let response;
      try {
        console.log('Calling API route to complete onboarding...');

        response = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(onboardingData),
          credentials: 'include',
        });
        console.log('Fetch completed successfully');
      } catch (fetchError) {
        console.error('Fetch failed:', fetchError);
        throw fetchError;
      }

      console.log('Frontend received response status:', response.status);
      console.log('Frontend received response ok:', response.ok);

      // Parse API response
      const result = await response.json();
      console.log('API result:', result);

      if (!result || !result.success) {
        console.error('Onboarding failed:', result?.message);

        // If it's an authentication error, try to refresh token and retry once
        if (result?.message?.includes('Authentication') || result?.message?.includes('Unauthorized')) {
          console.log('Got authentication error, attempting token refresh and retry...');
          const refreshSuccessful = await refreshToken();
          if (refreshSuccessful) {
            console.log('Token refresh successful, retrying request...');

            // Retry the API request
            const retryResponse = await fetch('/api/onboarding/complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(onboardingData),
              credentials: 'include',
            });

            const retryResult = await retryResponse.json();

            if (!retryResult || !retryResult.success) {
              console.error('Retry also failed:', retryResult?.message);
              throw new Error(`Failed to complete onboarding after retry: ${retryResult?.message || 'Unknown error'}`);
            }

            // Use retry result
            console.log('Onboarding completed successfully after retry');
            // result will be reassigned below
          } else {
            console.error('Token refresh failed');
            throw new Error('Authentication failed. Please sign in again.');
          }
        } else {
          throw new Error(`Failed to complete onboarding: ${result?.message || 'Unknown error'}`);
        }
      }

      // result is already parsed from response above
      console.log('Onboarding completed successfully:', result);
      console.log('Backend response details:', {
        hasUser: !!result.user,
        userObject: result.user,
        userRole: result.user?.role,
        hasAccessToken: !!result.access_token,
        tokenExpiresIn: result.expires_in,
        fullResult: result
      });

      // SECURITY: Handle fresh access token with updated role
      if (result.access_token) {
        console.log('Fresh access token received - updating authentication');

        // Store the fresh token securely (HttpOnly cookie will be set by backend)
        // This access token contains the updated role for immediate use
        console.log('New token expires in:', result.expires_in, 'seconds');

        // The backend has already set the secure HTTP-only cookies
        // We don't need to manually set auth cookies - they're handled server-side
        console.log('Authentication refreshed with updated role');
      } else {
        console.log('No fresh token received - using existing authentication');
      }

      // Update the user role cookie with the new role from backend
      if (result.user && result.user.role) {
        const isSecure = window.location.protocol === 'https:';
        const secureFlag = isSecure ? '; secure' : '';
        const newRole = result.user.role;

        console.log('Updating user role cookie from backend response:', newRole);

        // Clear the old cookie first
        document.cookie = `user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}; samesite=strict`;

        // Set the new cookie
        document.cookie = `user-role=${newRole}; path=/; max-age=86400${secureFlag}; samesite=strict`;

        // Verify the cookie was set
        const cookieValue = document.cookie.split('; ')
          .find(row => row.startsWith('user-role='))
          ?.split('=')[1];
        console.log('Cookie verification - user-role now set to:', cookieValue);

        // Longer delay to ensure cookie is processed
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('No user role found in backend response. Cannot update cookie.');
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

      console.log('Redirecting to:', targetUrl, 'with role:', result.user?.role);

      // Force a hard navigation to ensure middleware sees the updated cookie
      window.location.href = `${targetUrl}?welcome=true&roadmap=${result.roadmapId || ''}`;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: typeof error,
        error
      });

      // Handle error - could show toast or error message
      setIsGeneratingRoadmap(false);

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
