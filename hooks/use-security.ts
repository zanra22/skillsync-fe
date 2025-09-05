"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook for automatic token refresh
 * Refreshes access token every 4 minutes (before 5-minute expiry)
 */
export function useTokenRefresh() {
  const { refreshToken, isAuthenticated, logout } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const performRefresh = useCallback(async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      const success = await refreshToken();
      if (!success) {
        console.warn('Token refresh failed - logging out user');
        await logout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refreshToken, logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval if user is not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up automatic refresh every 4 minutes (240 seconds)
    // This is 1 minute before the 5-minute token expiry
    intervalRef.current = setInterval(performRefresh, 4 * 60 * 1000);

    // Cleanup on unmount or auth change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, performRefresh]);

  // Also refresh on window focus (user might have been away)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && !isRefreshingRef.current) {
        performRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, performRefresh]);

  // Refresh on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && !isRefreshingRef.current) {
        performRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, performRefresh]);
}

/**
 * Hook for detecting session hijacking attempts
 * Monitors for suspicious activity patterns
 */
export function useSecurityMonitoring() {
  const { logout } = useAuth();

  useEffect(() => {
    let lastActivity = Date.now();
    let suspiciousActivityCount = 0;

    const checkSuspiciousActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      // If there's been no activity for more than 30 minutes
      // but the page is still active, it might be suspicious
      if (timeSinceLastActivity > 30 * 60 * 1000) {
        suspiciousActivityCount++;
        
        // If multiple suspicious events, logout for security
        if (suspiciousActivityCount > 3) {
          console.warn('Suspicious activity detected - logging out for security');
          logout();
          return;
        }
      }

      lastActivity = now;
    };

    // Monitor user activity
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      lastActivity = Date.now();
      suspiciousActivityCount = Math.max(0, suspiciousActivityCount - 1);
    };

    activities.forEach(activity => {
      document.addEventListener(activity, updateActivity, true);
    });

    // Check for suspicious activity every 5 minutes
    const securityInterval = setInterval(checkSuspiciousActivity, 5 * 60 * 1000);

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, updateActivity, true);
      });
      clearInterval(securityInterval);
    };
  }, [logout]);
}

/**
 * Hook for automatic logout on browser close
 * Ensures tokens are cleared when user closes browser
 */
export function useAutoLogoutOnClose() {
  const { logout } = useAuth();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Attempt to logout (may not complete due to browser closing)
      logout().catch(() => {
        // Ignore errors during page unload
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [logout]);
}
