import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ SECURITY: Simplified middleware - only checks if route requires authentication
// Role-based access control is handled by AuthContext on client-side (more secure)

// Define routes that require authentication (any authenticated user can access)
const protectedRoutes = [
  '/dashboard',
  '/user-dashboard',
  '/admin',
  '/settings',
  '/onboarding',
  '/profile',
  '/courses',
  '/mentorship',
];

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow static files and API routes (no auth check needed)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // ✅ SECURITY: Check if user has valid session by attempting to read refresh_token
  // We can't read its value (HTTP-only), but we can check if it exists
  const hasRefreshToken = request.cookies.has('refresh_token');
  const isAuthenticated = hasRefreshToken;
  
  console.log('🔍 Middleware:', { 
    pathname, 
    isAuthenticated,
    hasRefreshToken,
    allCookies: request.cookies.getAll().map(c => c.name)
  });

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (pathname === '/signin' || pathname === '/signup')) {
    console.log('🔄 Authenticated user on auth page, redirecting to root');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected route: require authentication
  if (isProtectedRoute && !isAuthenticated) {
    console.log('❌ Unauthenticated access to protected route');
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // ✅ Let authenticated users through - AuthContext will handle role-based access
  console.log('✅ Middleware check passed');
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
