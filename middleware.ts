import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['super_admin', 'admin'], // Admin dashboard - only for super_admin and admin
  '/user-dashboard': ['learner', 'mentor', 'premium_user', 'vip_mentor', 'hr_manager', 'recruiter'], // Regular user dashboard
  '/admin': ['super_admin', 'admin', 'moderator'], // Any admin area
  '/settings': ['super_admin', 'admin', 'moderator', 'learner', 'mentor', 'premium_user', 'vip_mentor', 'hr_manager', 'recruiter'], // All authenticated users
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
  const userRole = request.cookies.get('user-role')?.value;
  
  console.log('🔍 Middleware Debug:', { 
    pathname, 
    authToken: !!authToken, 
    userRole,
    hasAuthCookie: !!request.cookies.get('auth-token'),
    hasRoleCookie: !!request.cookies.get('user-role'),
    allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value]))
  });
  
  const isAuthenticated = !!authToken;
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRedirectRoute = authRedirectRoutes.includes(pathname);

  // Handle authenticated users trying to access auth pages
  if (isAuthenticated && isAuthRedirectRoute) {
    console.log('🔄 Authenticated user accessing auth page, redirecting...');
    // Redirect based on role
    if (userRole === 'super_admin' || userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
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
      console.log('❌ Unauthenticated access to protected route, redirecting to unauthorized');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Check if user has required role
    if (userRole && !requiredRoles.includes(userRole)) {
      console.log('❌ Insufficient role for protected route:', { 
        userRole, 
        requiredRoles, 
        pathname,
        hasRequiredRole: requiredRoles.includes(userRole)
      });
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    console.log('✅ Access granted to protected route:', { pathname, userRole });
  }

  // Default fallback for authenticated users accessing root
  if (pathname === '/' && isAuthenticated) {
    console.log('🏠 Authenticated user at root, redirecting based on role...');
    if (userRole === 'super_admin' || userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
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
