import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Token refresh API route called');

    // Get cookies
    const cookieHeader = request.headers.get('cookie');
    const requestCookies = request.cookies;
    const nextCookies = await cookies();

    console.log('Looking for refresh_token in cookies...');
    console.log('Available cookie names:', Array.from(requestCookies).map(([key]) => key));

    // Try to extract refresh_token with multiple fallback mechanisms
    let refreshToken: string | undefined;

    // Method 1: Try Next.js cookies() API first (most reliable in production)
    try {
      const refreshCookie = nextCookies.get('refresh_token');
      refreshToken = refreshCookie?.value;

      if (refreshToken) {
        console.log('Found refresh_token via cookies() API');
      }
    } catch (error) {
      console.log('cookies() API failed:', error);
    }

    // Method 2: Try request.cookies (Next.js request object)
    if (!refreshToken) {
      refreshToken = requestCookies.get('refresh_token')?.value;

      if (refreshToken) {
        console.log('Found refresh_token via request.cookies');
      }
    }

    // Method 3: Parse cookie header directly
    if (!refreshToken && cookieHeader) {
      console.log('Trying direct cookie header parsing...');

      const cookiePairs = cookieHeader.split(';').map(c => c.trim());
      for (const pair of cookiePairs) {
        const [name, value] = pair.split('=', 2);
        if (name === 'refresh_token' && !refreshToken) {
          refreshToken = value;
          console.log('Extracted refresh_token from header');
        }
      }
    }

    if (!refreshToken) {
      console.log('No refresh_token found in cookies');
      return NextResponse.json(
        {
          success: false,
          message: 'No refresh token available'
        },
        { status: 401 }
      );
    }

    console.log('Refresh token found, calling backend...');

    // GraphQL mutation for token refresh
    const refreshMutation = `
      mutation RefreshToken($refreshToken: String) {
        auth {
          refreshToken(refreshToken: $refreshToken) {
            success
            message
            accessToken
            expiresIn
          }
        }
      }
    `;

    const backendUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://127.0.0.1:8000/graphql/';

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const graphqlResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: headers,
      credentials: 'include', // 🔑 CRITICAL: Send HTTP-only cookies to backend
      body: JSON.stringify({
        query: refreshMutation,
        variables: {
          refreshToken: refreshToken
        }
      }),
    });

    if (!graphqlResponse.ok) {
      console.log('GraphQL request failed:', graphqlResponse.status, graphqlResponse.statusText);
      return NextResponse.json(
        {
          success: false,
          message: `Token refresh request failed: ${graphqlResponse.status}`
        },
        { status: graphqlResponse.status }
      );
    }

    const result = await graphqlResponse.json();
    console.log('GraphQL response received');

    if (result.errors) {
      console.log('GraphQL errors:', result.errors);
      return NextResponse.json(
        {
          success: false,
          message: 'GraphQL errors occurred',
          errors: result.errors
        },
        { status: 400 }
      );
    }

    const tokenData = result.data?.auth?.refreshToken;

    if (!tokenData?.success) {
      console.log('Token refresh failed:', tokenData?.message);
      return NextResponse.json(
        {
          success: false,
          message: tokenData?.message || 'Token refresh failed'
        },
        { status: 401 }
      );
    }

    console.log('Token refresh successful');

    // Extract Set-Cookie headers from backend response
    const backendSetCookies = graphqlResponse.headers.get('set-cookie');

    // Create response with the new access token
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: tokenData.accessToken,
      expiresIn: tokenData.expiresIn
    });

    // Forward Set-Cookie headers from backend to client
    if (backendSetCookies) {
      console.log('Forwarding Set-Cookie headers from backend');
      response.headers.set('Set-Cookie', backendSetCookies);
    } else {
      console.log('⚠️ No Set-Cookie headers in backend response');
    }

    return response;

  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during token refresh'
      },
      { status: 500 }
    );
  }
}
