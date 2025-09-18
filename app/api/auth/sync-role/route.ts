import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Syncing user role from database...');
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Get cookies
    const cookieHeader = request.headers.get('cookie');
    const requestCookies = request.cookies;
    const nextCookies = await cookies();
    
    // Try to extract auth-token
    let authToken: string | undefined;
    
    try {
      const authCookie = nextCookies.get('auth-token');
      authToken = authCookie?.value;
    } catch (error) {
      console.log('⚠️ cookies() API failed:', error);
    }
    
    if (!authToken) {
      authToken = requestCookies.get('auth-token')?.value;
    }
    
    if (!authToken && cookieHeader) {
      const cookiePairs = cookieHeader.split(';').map(c => c.trim());
      for (const pair of cookiePairs) {
        const [name, value] = pair.split('=', 2);
        if (name === 'auth-token' && !authToken) {
          authToken = value;
        }
      }
    }
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'No authentication token found' },
        { status: 401 }
      );
    }
    
    // GraphQL query to get current user info
    const getUserQuery = `
      query GetCurrentUser {
        users {
          me {
            id
            email
            role
            profile {
              firstName
              lastName
              onboardingCompleted
            }
          }
        }
      }
    `;
    
    const backendUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://127.0.0.1:8000/graphql/';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    if (isDevelopment) {
      headers['X-Dev-User-ID'] = 'sDV6TZHZjT';
      headers['X-Dev-Mode'] = 'true';
    }
    
    const graphqlResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        query: getUserQuery
      }),
    });
    
    if (!graphqlResponse.ok) {
      console.log('❌ GraphQL request failed:', graphqlResponse.status, graphqlResponse.statusText);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch user data' },
        { status: 500 }
      );
    }
    
    const result = await graphqlResponse.json();
    console.log('📦 GraphQL response:', JSON.stringify(result, null, 2));
    
    if (result.errors) {
      console.log('❌ GraphQL errors:', result.errors);
      return NextResponse.json(
        { success: false, message: 'GraphQL errors occurred', errors: result.errors },
        { status: 400 }
      );
    }
    
    const userData = result.data?.users?.me;
    
    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User data not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Current user role from database:', userData.role);
    
    // Update the user-role cookie with the current role from database
    const response = NextResponse.json({
      success: true,
      message: 'Role synced successfully',
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        profile: userData.profile
      }
    });
    
    // Set the updated role cookie
    response.cookies.set('user-role', userData.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    console.log('🍪 Updated user-role cookie to:', userData.role);
    
    return response;
    
  } catch (error) {
    console.error('❌ Error syncing role:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}