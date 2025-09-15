import {
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
  SocialAuthRequestDto,
  SocialAuthResponseDto,
  ApiErrorDto,
} from "@/types/auth/dto";

// Base API configuration - Updated to use GraphQL endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const GRAPHQL_ENDPOINT = `${API_BASE_URL}/graphql`;

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// GraphQL client utility
async function graphqlClient<T>(
  query: string,
  variables?: Record<string, any>,
  accessToken?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add auth token if provided
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      credentials: "include", // Important for HTTP-only cookies
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    if (!response.ok) {
      throw new ApiError(
        response.status,
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();

    // Handle GraphQL errors
    if (result.errors && result.errors.length > 0) {
      const error = result.errors[0];
      throw new ApiError(
        400,
        error.message || "GraphQL Error",
        { graphqlErrors: result.errors }
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    throw new ApiError(
      0,
      "Network error. Please check your connection and try again."
    );
  }
}

// Authentication API service
export const authApi = {
  // Sign in with email and password
  signIn: async (data: SignInRequestDto): Promise<SignInResponseDto> => {
    const mutation = `
      mutation Login($input: LoginInput!) {
        auth {
          login(input: $input) {
            success
            message
            user {
              id
              email
              username
              role
              accountStatus
              isPremium
            }
            accessToken
            expiresIn
          }
        }
      }
    `;

    const variables = {
      input: {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      },
    };

    const result = await graphqlClient<{
      auth: {
        login: {
          success: boolean;
          message: string;
          user: any;
          accessToken: string;
          expiresIn: number;
        };
      };
    }>(mutation, variables);

    const loginResult = result.auth.login;

    if (!loginResult.success) {
      throw new ApiError(401, loginResult.message);
    }

    // Transform backend response to match frontend DTO
    const signInResponse = {
      user: {
        id: loginResult.user.id,
        email: loginResult.user.email,
        firstName: loginResult.user.username, // Using username as firstName for now
        lastName: "", // Backend doesn't have lastName yet
        avatar: undefined,
        emailVerified: loginResult.user.accountStatus === "active",
        role: loginResult.user.role, // Use the actual role from backend
        createdAt: new Date().toISOString(), // Placeholder
        updatedAt: new Date().toISOString(), // Placeholder
      },
      tokens: {
        accessToken: loginResult.accessToken,
        refreshToken: "", // Stored in HTTP-only cookie
        expiresIn: loginResult.expiresIn,
      },
      message: loginResult.message,
    };

    // Automatically store tokens - Remove localStorage usage
    // Note: Tokens will be managed by AuthContext in memory
    // tokenManager.setTokens(signInResponse.tokens);

    return signInResponse;
  },

  // Sign up with email and password
  signUp: async (data: SignUpRequestDto): Promise<SignUpResponseDto> => {
    const mutation = `
      mutation SignUp($input: SignupInput!) {
        auth {
          signUp(input: $input) {
            success
            message
            user {
              id
              email
              username
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        acceptTerms: data.acceptTerms,
      },
    };

    const result = await graphqlClient<{
      auth: {
        signUp: {
          success: boolean;
          message: string;
          user: any;
        };
      };
    }>(mutation, variables);

    const signUpResult = result.auth.signUp;

    if (!signUpResult.success) {
      throw new ApiError(400, signUpResult.message);
    }

    return {
      user: {
        id: signUpResult.user.id,
        email: signUpResult.user.email,
        firstName: data.firstName,
        lastName: data.lastName,
        emailVerified: false,
      },
      message: signUpResult.message,
    };
  },

  // Sign out
  signOut: async (): Promise<void> => {
    const mutation = `
      mutation Logout {
        auth {
          logout {
            success
            message
          }
        }
      }
    `;

    try {
      await graphqlClient<{
        auth: {
          logout: {
            success: boolean;
            message: string;
          };
        };
      }>(mutation);
    } finally {
      // Clear tokens even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenExpiry");
    }
  },

  // Refresh access token
  refreshToken: async (data: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> => {
    const mutation = `
      mutation RefreshToken {
        auth {
          refreshToken {
            success
            message
            accessToken
            expiresIn
          }
        }
      }
    `;

    const result = await graphqlClient<{
      auth: {
        refreshToken: {
          success: boolean;
          message: string;
          accessToken: string;
          expiresIn: number;
        };
      };
    }>(mutation);

    const refreshResult = result.auth.refreshToken;

    if (!refreshResult.success) {
      throw new ApiError(401, refreshResult.message);
    }

    return {
      accessToken: refreshResult.accessToken,
      refreshToken: "", // Stored in HTTP-only cookie
      expiresIn: refreshResult.expiresIn,
    };
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequestDto): Promise<ForgotPasswordResponseDto> => {
    const mutation = `
      mutation RequestPasswordReset($email: String!) {
        auth {
          requestPasswordReset(email: $email) {
            success
            message
          }
        }
      }
    `;

    const variables = { email: data.email };

    const result = await graphqlClient<{
      auth: {
        requestPasswordReset: {
          success: boolean;
          message: string;
        };
      };
    }>(mutation, variables);

    const resetResult = result.auth.requestPasswordReset;

    if (!resetResult.success) {
      throw new ApiError(400, resetResult.message);
    }

    return { message: resetResult.message };
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequestDto): Promise<ResetPasswordResponseDto> => {
    const mutation = `
      mutation ResetPassword($uid: String!, $token: String!, $newPassword: String!) {
        auth {
          resetPassword(uid: $uid, token: $token, newPassword: $newPassword) {
            success
            message
          }
        }
      }
    `;

    // Extract uid and token from the reset token (assuming format: uid-token)
    const [uid, token] = data.token.split('-');

    const variables = {
      uid,
      token,
      newPassword: data.password,
    };

    const result = await graphqlClient<{
      auth: {
        resetPassword: {
          success: boolean;
          message: string;
        };
      };
    }>(mutation, variables);

    const resetResult = result.auth.resetPassword;

    if (!resetResult.success) {
      throw new ApiError(400, resetResult.message);
    }

    return { message: resetResult.message };
  },

  // Verify email
  verifyEmail: async (data: VerifyEmailRequestDto): Promise<VerifyEmailResponseDto> => {
    // This would need to be implemented in your backend
    throw new ApiError(501, "Email verification not implemented yet");
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ message: string }> => {
    // This would need to be implemented in your backend
    throw new ApiError(501, "Resend verification not implemented yet");
  },

  // Social authentication
  socialAuth: async (data: SocialAuthRequestDto): Promise<SocialAuthResponseDto> => {
    // This would need to be implemented in your backend
    throw new ApiError(501, "Social authentication not implemented yet");
  },

  // Get current user profile
  getProfile: async (accessToken?: string): Promise<SignInResponseDto["user"]> => {
    const query = `
      query GetUsers {
        users {
          users {
            id
            email
            username
            role
            accountStatus
            isPremium
          }
        }
      }
    `;

    const result = await graphqlClient<{
      users: {
        users: any[];
      };
    }>(query, {}, accessToken);

    const users = result.users.users;

    if (!users || users.length === 0) {
      throw new ApiError(404, "No users found");
    }

    // For now, we'll return the first user - in a real app, you'd identify the current user
    const user = users[0];

    return {
      id: user.id,
      email: user.email,
      firstName: user.username,
      lastName: "",
      avatar: undefined,
      emailVerified: user.accountStatus === "active",
      role: user.role, // Use the actual role from backend
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  // Update user profile
  updateProfile: async (data: Partial<SignInResponseDto["user"]>): Promise<SignInResponseDto["user"]> => {
    // This would need to be implemented in your backend
    throw new ApiError(501, "Profile update not implemented yet");
  },

  // Change password (for authenticated users)
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }, accessToken?: string): Promise<{ message: string }> => {
    const mutation = `
      mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
        auth {
          changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
            success
            message
          }
        }
      }
    `;

    const variables = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    const result = await graphqlClient<{
      auth: {
        changePassword: {
          success: boolean;
          message: string;
        };
      };
    }>(mutation, variables, accessToken);

    const changeResult = result.auth.changePassword;

    if (!changeResult.success) {
      throw new ApiError(400, changeResult.message);
    }

    return { message: changeResult.message };
  },
};

// Token management utilities - Updated for memory-only storage
export const tokenManager = {
  // Note: These functions are kept for backward compatibility
  // but tokens should be managed by AuthContext in memory
  
  setTokens: (tokens: SignInResponseDto["tokens"]) => {
    console.warn("tokenManager.setTokens is deprecated. Use AuthContext instead.");
  },

  getAccessToken: (): string | null => {
    console.warn("tokenManager.getAccessToken is deprecated. Use AuthContext instead.");
    return null;
  },

  getRefreshToken: (): string | null => {
    // Refresh token is in HTTP-only cookie, not accessible via JavaScript
    return null;
  },

  isTokenExpired: (): boolean => {
    console.warn("tokenManager.isTokenExpired is deprecated. Use AuthContext instead.");
    return true;
  },

  clearTokens: () => {
    console.warn("tokenManager.clearTokens is deprecated. Use AuthContext instead.");
    // Note: HTTP-only cookies will be cleared by the logout API call
  },

  // This function is still useful for the AuthContext
  refreshTokenIfNeeded: async (): Promise<string | null> => {
    try {
      const response = await authApi.refreshToken({ refreshToken: "" });
      return response.accessToken;
    } catch (error) {
      return null;
    }
  },
};

export { ApiError };