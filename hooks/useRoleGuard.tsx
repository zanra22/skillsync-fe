// hooks/useRoleGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * ✅ SECURE: Role-based access control hook
 * 
 * Use this in protected pages to ensure only authorized roles can access.
 * More secure than middleware because:
 * - Reads role from memory-stored accessToken (not cookies)
 * - All auth cookies remain HTTP-only
 * - No XSS vulnerability from non-HTTP-only cookies
 * 
 * @example
 * ```tsx
 * // In a page component:
 * export default function AdminDashboard() {
 *   useRoleGuard(['super_admin', 'admin']); // Only admins can access
 *   return <div>Admin Dashboard</div>;
 * }
 * ```
 */
export function useRoleGuard(allowedRoles: string[]) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Not authenticated - redirect to signin
    if (!isAuthenticated || !user) {
      console.log('🔐 useRoleGuard: Not authenticated, redirecting to signin');
      router.push('/signin');
      return;
    }

    // Check role
    const userRole = user.role;
    
    if (!allowedRoles.includes(userRole)) {
      console.log('❌ useRoleGuard: Insufficient permissions', {
        userRole,
        allowedRoles,
        page: window.location.pathname
      });
      
      // Special case: new-user should go to onboarding
      if (userRole === 'new-user') {
        console.log('🚀 Redirecting new-user to onboarding');
        router.push('/onboarding');
        return;
      }
      
      // Other roles without permission go to unauthorized
      router.push('/unauthorized');
      return;
    }

    console.log('✅ useRoleGuard: Access granted', { userRole, allowedRoles });
  }, [user, isAuthenticated, isLoading, allowedRoles, router]);
}

/**
 * Check if user has specific role (doesn't redirect, just returns boolean)
 * 
 * @example
 * ```tsx
 * const isAdmin = useHasRole(['super_admin', 'admin']);
 * return isAdmin ? <AdminPanel /> : <UserPanel />;
 * ```
 */
export function useHasRole(roles: string[]): boolean {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) return false;
  
  return roles.includes(user.role);
}

/**
 * Get user's role (returns null if not authenticated)
 */
export function useUserRole(): string | null {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) return null;
  
  return user.role;
}
