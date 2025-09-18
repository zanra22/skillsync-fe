import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple JWT payload parser (client-side safe, no verification)
function parseJWTPayload(token: string): any {
  try {
    // Split the JWT and decode the payload (second part)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode base64url
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.log('⚠️ Failed to parse JWT payload:', error);
    return null;
  }
}

// Extract role from JWT token securely
function getRoleFromToken(token: string): string | null {
  try {
    const payload = parseJWTPayload(token);
    if (!payload) return null;
    
    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.log('⚠️ JWT token is expired');
      return null;
    }
    
    // Look for role in common JWT claim locations
    return payload.role || payload.user_role || payload.scope || null;
  } catch (error) {
    console.log('⚠️ Error extracting role from token:', error);
    return null;
  }
}

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['super_admin', 'admin'], // Admin dashboard - only for super_admin and admin
  '/user-dashboard': ['learner', 'mentor', 'premium_user', 'vip_mentor', 'hr_manager', 'recruiter'], // Regular user dashboard
  '/admin': ['super_admin', 'admin', 'moderator'], // Any admin area
  '/settings': ['super_admin', 'admin', 'moderator', 'learner', 'mentor', 'premium_user', 'vip_mentor', 'hr_manager', 'recruiter'], // All authenticated users
  '/onboarding': ['new_user', 'learner', 'mentor', 'premium_user', 'vip_mentor', 'hr_manager', 'recruiter'], // New users and established users who can access onboarding
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/signin',
  '/signup', 
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/about',
  '/contact',
  '/pricing',
  '/features',
  '/unauthorized',
  '/not-found'
];

// Routes that redirect authenticated users (like signin, signup)
const authRedirectRoutes = ['/signin', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Get authentication token from cookies
  const authToken = request.cookies.get('auth-token')?.value;
  const userRoleFromCookie = request.cookies.get('user-role')?.value;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // SECURITY: Prioritize role from JWT token over cookie for consistency
  let userRole = userRoleFromCookie; // Default to cookie value
  let roleSource = 'cookie';
  
  if (authToken) {
    const roleFromToken = getRoleFromToken(authToken);
    if (roleFromToken) {
      userRole = roleFromToken;
      roleSource = 'jwt-token';
    }
  }
  
  console.log('🔍 Middleware Debug:', { 
    pathname, 
    authToken: !!authToken, 
    userRole,
    roleSource,
    userRoleFromCookie,
    hasAuthCookie: !!request.cookies.get('auth-token'),
    hasRoleCookie: !!request.cookies.get('user-role'),
    isDevelopment,
    allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value]))
  });
  
  const isAuthenticated = !!authToken;
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRedirectRoute = authRedirectRoutes.includes(pathname);

  // In development, be more lenient to prevent hot reload logout issues
  if (isDevelopment && authToken && userRole && userRole !== 'null' && userRole !== 'undefined') {
    console.log('🔧 Development mode: checking role requirements for', pathname);
    // Still check if it's a protected route that needs specific roles
    const requiredRoles = protectedRoutes[pathname as keyof typeof protectedRoutes];
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      console.log('🔒 Role mismatch in dev mode:', { userRole, requiredRoles, pathname });
      
      // Special handling for new_user role - redirect to onboarding instead of blocking
      if (userRole === 'new_user') {
        console.log('🚀 Redirecting new_user to onboarding');
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      
      // For other role mismatches in dev, still block access
      console.log('❌ Access denied due to role mismatch');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    console.log('✅ Development mode: role check passed for', pathname);
    return NextResponse.next();
  }

  // Handle authenticated users trying to access auth pages
  if (isAuthenticated && isAuthRedirectRoute) {
    console.log('🔄 Authenticated user accessing auth page, redirecting...');
    // Redirect based on role
    if (userRole === 'super_admin' || userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (userRole === 'new_user' || !userRole || userRole === 'null' || userRole === 'undefined') {
      // New users or users without roles need onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url));
    } else {
      return NextResponse.redirect(new URL('/user-dashboard', request.url));
    }
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const requiredRoles = protectedRoutes[pathname as keyof typeof protectedRoutes];
  
  if (requiredRoles) {
    console.log('🔐 Protected route accessed:', { pathname, requiredRoles, userRole, isAuthenticated });
    
    // Route requires authentication
    if (!isAuthenticated) {
      console.log('❌ Unauthenticated access to protected route, redirecting to signin');
      // Redirect to signin instead of unauthorized to allow for session restoration
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // Special debug for user-dashboard access
    if (pathname === '/user-dashboard') {
      console.log('🎯 USER-DASHBOARD ACCESS ATTEMPT:', {
        userRole,
        userRoleType: typeof userRole,
        requiredRoles,
        includesUserRole: requiredRoles.includes(userRole || ''),
        roleTrimmed: userRole?.trim(),
        cookieRaw: request.cookies.get('user-role'),
        allCookiesForDebug: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value]))
      });
    }

    // Check if user has required role
    if (userRole && userRole !== 'null' && userRole !== 'undefined' && !requiredRoles.includes(userRole)) {
      console.log('❌ Insufficient role for protected route:', { 
        userRole, 
        requiredRoles, 
        pathname,
        hasRequiredRole: requiredRoles.includes(userRole)
      });
      
      // Special handling for new_user role - redirect to onboarding instead of unauthorized
      if (userRole === 'new_user') {
        console.log('🚀 Redirecting new_user to onboarding');
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Special handling for users with null/undefined roles trying to access onboarding
    if (pathname === '/onboarding' && (!userRole || userRole === 'null' || userRole === 'undefined')) {
      console.log('✅ Allowing null/undefined role user to access onboarding');
      return NextResponse.next();
    }
    
    console.log('✅ Access granted to protected route:', { pathname, userRole });
  }

  // Default fallback for authenticated users accessing root
  if (pathname === '/' && isAuthenticated) {
    console.log('🏠 Authenticated user at root, redirecting based on role...');
    if (userRole === 'super_admin' || userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (userRole === 'new_user' || !userRole || userRole === 'null' || userRole === 'undefined') {
      // New users or users without roles need onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url));
    } else {
      return NextResponse.redirect(new URL('/user-dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
