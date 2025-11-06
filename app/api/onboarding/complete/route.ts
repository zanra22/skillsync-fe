import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface OnboardingRequest {
  role: string;
  firstName: string;
  lastName: string;
  bio?: string;
  industry?: string;
  careerStage?: string;
  currentRole?: string;
  transitionTimeline?: string;
  goals?: Array<{
    skillName: string;
    description: string;
    targetSkillLevel: string;
    priority: number;
  }>;
  preferences?: {
    learningStyle?: string;
    timeCommitment?: string;
    notifications?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('Processing onboarding completion request...');
    console.log('Request method:', request.method);
    console.log('Request URL:', request.url);

    // Get cookies
    const cookieHeader = request.headers.get('cookie');
    const requestCookies = request.cookies;
    const nextCookies = await cookies();

    console.log('Looking for auth-token in cookies...');
    console.log('Available cookie names:', Array.from(requestCookies).map(([key]) => key));

    // Try to extract auth-token with multiple fallback mechanisms
    let authToken: string | undefined;
    let userRole: string | undefined;

    // Method 1: Try Next.js cookies() API first (most reliable in production)
    try {
      const authCookie = nextCookies.get('auth-token');
      const roleCookie = nextCookies.get('user-role');
      authToken = authCookie?.value;
      userRole = roleCookie?.value;

      if (authToken) {
        console.log('Found auth-token via cookies() API');
      }
    } catch (error) {
      console.log('cookies() API failed:', error);
    }

    // Method 2: Try request.cookies (Next.js request object)
    if (!authToken) {
      authToken = requestCookies.get('auth-token')?.value;
      userRole = requestCookies.get('user-role')?.value;

      if (authToken) {
        console.log('Found auth-token via request.cookies');
      }
    }

    // Method 3: Parse cookie header directly
    if (!authToken && cookieHeader) {
      console.log('Trying direct cookie header parsing...');

      const cookiePairs = cookieHeader.split(';').map(c => c.trim());
      for (const pair of cookiePairs) {
        const [name, value] = pair.split('=', 2);
        if (name === 'auth-token' && !authToken) {
          authToken = value;
          console.log('Extracted auth-token from header');
        }
        if (name === 'user-role' && !userRole) {
          userRole = value;
          console.log('Extracted user-role from header:', userRole);
        }
      }
    }

    // If still no auth token, try token refresh as last resort
    if (!authToken) {
      console.log('No auth-token found - attempting token refresh');

      // Try to get refresh token using all available methods
      let refreshToken = requestCookies.get('refresh_token')?.value;
      if (!refreshToken) {
        try {
          refreshToken = nextCookies.get('refresh_token')?.value;
        } catch (error) {
          console.log('nextCookies refresh_token access failed:', error);
        }
      }

      if (refreshToken) {
        // Use GraphQL mutation for token refresh
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

        const tokenRefreshResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader || '',
          },
          credentials: 'include', // 🔑 CRITICAL: Send HTTP-only cookies to backend
          body: JSON.stringify({
            query: refreshMutation,
            variables: {
              refreshToken: refreshToken
            }
          }),
        });

        if (tokenRefreshResponse.ok) {
          const result = await tokenRefreshResponse.json();
          const tokenData = result.data?.auth?.refreshToken;

          if (tokenData?.success && tokenData?.accessToken) {
            authToken = tokenData.accessToken;
            console.log('Token refresh successful');
          } else {
            console.log('Token refresh failed:', tokenData?.message || 'Unknown error');

            // Clear cookies and return 401
            const response = NextResponse.json(
              {
                success: false,
                message: 'Authentication failed - invalid refresh token',
                needsLogin: true
              },
              { status: 401 }
            );

            // Clear authentication cookies
            const cookieOptions = {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const,
              path: '/',
              expires: new Date(0)
            };

            response.cookies.set('auth-token', '', cookieOptions);
            response.cookies.set('user-role', '', cookieOptions);
            response.cookies.set('refresh_token', '', cookieOptions);

            return response;
          }
        } else {
          console.log('GraphQL token refresh request failed:', tokenRefreshResponse.status);

          return NextResponse.json(
            {
              success: false,
              message: 'Token refresh request failed'
            },
            { status: 401 }
          );
        }
      } else {
        console.log('No refresh token available');
        return NextResponse.json(
          {
            success: false,
            message: 'No authentication tokens available'
          },
          { status: 401 }
        );
      }
    }

    console.log('Auth token found');

    if (!authToken) {
      console.log('Final check: No auth token available');

      return NextResponse.json(
        { error: 'Authentication required - no auth token found' },
        { status: 401 }
      );
    }

    // Get the request body
    let body: OnboardingRequest;
    try {
      const rawBody = await request.text();
      console.log('Raw request body length:', rawBody.length);

      if (!rawBody || rawBody.trim().length === 0) {
        console.log('Empty request body received');

        return NextResponse.json(
          {
            success: false,
            message: 'No onboarding data provided'
          },
          { status: 400 }
        );
      } else {
        body = JSON.parse(rawBody);
        console.log('Onboarding data received:', {
          ...body,
          goals: body.goals ? `${body.goals.length} goals` : 'no goals'
        });
      }
    } catch (parseError) {
      console.log('Failed to parse request body:', parseError);
      console.log('Request content-type:', request.headers.get('content-type'));

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data format'
        },
        { status: 400 }
      );
    }

    // Prepare GraphQL mutation for onboarding completion
    const completeOnboardingMutation = `
      mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
        onboarding {
          completeOnboarding(input: $input) {
            success
            message
            user {
              id
              email
              firstName
              lastName
              role
              bio
            }
            roadmaps {
              skillName
              description
              totalDuration
              difficultyLevel
              steps {
                title
                description
                estimatedDuration
                difficulty
                resources
                skillsCovered
              }
            }
            accessToken
            expiresIn
          }
        }
      }
    `;

    const variables = {
      input: {
        role: body.role,
        firstName: body.firstName,
        lastName: body.lastName,
        bio: body.bio || '',
        industry: body.industry || '',
        careerStage: body.careerStage || '',
        currentRole: body.currentRole || '',
        transitionTimeline: body.transitionTimeline || '',
        goals: (body.goals || []).map(goal => ({
          skillName: goal.skillName,
          description: goal.description,
          targetSkillLevel: goal.targetSkillLevel,
          priority: goal.priority
        })),
        preferences: body.preferences ? {
          learningStyle: body.preferences.learningStyle,
          timeCommitment: body.preferences.timeCommitment
        } : null
      }
    };

    console.log('Forwarding to GraphQL backend...');

    // Make the GraphQL request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://127.0.0.1:8000/graphql/';

    // Prepare headers, filtering out undefined values
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const graphqlResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: headers,
      credentials: 'include', // 🔑 CRITICAL: Send HTTP-only cookies to backend
      body: JSON.stringify({
        query: completeOnboardingMutation,
        variables: variables
      }),
    });

    if (!graphqlResponse.ok) {
      console.log('GraphQL request failed:', graphqlResponse.status, graphqlResponse.statusText);
      throw new Error(`GraphQL request failed: ${graphqlResponse.status}`);
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

    const onboardingResult = result.data?.onboarding?.completeOnboarding;

    if (!onboardingResult?.success) {
      console.log('Onboarding completion failed:', onboardingResult?.message);
      return NextResponse.json(
        {
          success: false,
          message: onboardingResult?.message || 'Onboarding completion failed'
        },
        { status: 400 }
      );
    }

    console.log('Onboarding completed successfully');

    // Backend already set HTTP-only cookies
    // Backend returns accessToken in GraphQL response for frontend to store in memory
    if (onboardingResult.accessToken) {
      console.log('Fresh access token received from backend');
      console.log('Token expires in:', onboardingResult.expiresIn, 'seconds');
    } else {
      console.log('No fresh token in backend response');
    }

    // Return the response with tokens for frontend to handle
    const response = NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: onboardingResult.user,
      roadmaps: onboardingResult.roadmaps,
      accessToken: onboardingResult.accessToken,
      expiresIn: onboardingResult.expiresIn
    });

    return response;

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
