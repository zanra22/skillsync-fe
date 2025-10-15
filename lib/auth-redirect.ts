/**
 * Authentication Redirect Utility
 * Handles role-based redirects for authenticated users
 */

import type { SignInResponseDto } from '@/types/auth/dto';

export type UserRole = SignInResponseDto['user']['role'];

/**
 * Get the appropriate dashboard URL based on user role and onboarding status
 */
export function getDashboardUrl(user: SignInResponseDto['user']): string {
  // Admin and super admin go to admin dashboard
  if (user.role === 'super_admin' || user.role === 'admin') {
    return '/dashboard';
  }
  
  // New users or users who haven't completed onboarding go to onboarding
  // BUGFIX: Backend uses 'new_user' (underscore), not 'new-user' (hyphen)
  if (user.role === 'new_user' || (user.profile && user.profile.onboarding_completed === false)) {
    return '/onboarding';
  }
  
  // All other authenticated users go to user dashboard
  return '/user-dashboard';
}

/**
 * Check if current path is an auth page (signin/signup)
 */
export function isAuthPage(pathname: string): boolean {
  return pathname === '/signin' || pathname === '/signup';
}

/**
 * Redirect authenticated user to their appropriate dashboard
 * Returns true if redirect was initiated, false otherwise
 */
export function redirectAuthenticatedUser(
  user: SignInResponseDto['user'] | null,
  isAuthenticated: boolean,
  currentPath?: string
): boolean {
  // Only redirect if user is authenticated and on an auth page
  if (!isAuthenticated || !user) {
    return false;
  }
  
  // If currentPath is provided and it's not an auth page, don't redirect
  if (currentPath && !isAuthPage(currentPath)) {
    return false;
  }
  
  const targetUrl = getDashboardUrl(user);
  console.log('🔄 Redirecting authenticated user to:', targetUrl, 'from role:', user.role);
  
  // Use window.location.href for full page redirect
  window.location.href = targetUrl;
  return true;
}

/**
 * Get user-friendly role name for display
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    'new_user': 'New User',  // BUGFIX: Changed from 'new-user' to match backend
    'learner': 'Learner',
    'mentor': 'Mentor',
    'admin': 'Administrator',
    'super_admin': 'Super Administrator',
    'moderator': 'Moderator',
    'hr_manager': 'HR Manager',
    'recruiter': 'Recruiter',
    'premium_user': 'Premium User',
    'vip_mentor': 'VIP Mentor',
  };
  
  return roleNames[role] || role;
}
