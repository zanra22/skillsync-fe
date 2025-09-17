import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
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
} from "@/types/auth/dto";

// GraphQL Response Types
interface LoginResponse {
  auth: {
    signIn: {
      success: boolean;
      message: string;
      user?: any;
      accessToken?: string;
      refreshToken?: string;
    };
  };
}

interface SignUpResponse {
  auth: {
    signUp: {
      success: boolean;
      message: string;
      user?: any;
      accessToken?: string;
      refreshToken?: string;
    };
  };
}

interface RefreshTokenResponse {
  auth: {
    refreshToken: {
      success: boolean;
      message: string;
      accessToken?: string;
      refreshToken?: string;
    };
  };
}

interface PasswordResetResponse {
  auth: {
    requestPasswordReset: {
      success: boolean;
      message: string;
    };
  };
}

interface ResetPasswordResponse {
  auth: {
    resetPassword: {
      success: boolean;
      message: string;
    };
  };
}

interface ChangePasswordResponse {
  auth: {
    changePassword: {
      success: boolean;
      message: string;
    };
  };
}

interface GetUsersResponse {
  users: {
    users: any[];
  };
}

export class AuthApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

// Helper function to handle Apollo errors
function handleApolloError(error: any): never {
  const message = error.graphQLErrors?.[0]?.message || error.message || "An error occurred";
  const statusCode = error.networkError ? 500 : 400;
  
  throw new AuthApiError(statusCode, message, {
    graphQLErrors: error.graphQLErrors,
    networkError: error.networkError,
  });
}

// GraphQL Mutations
export const SIGN_IN_MUTATION = gql`
  mutation SignIn($input: SignInInput!) {
    auth {
      signIn(input: $input) {
        success
        message
        user {
          id
          email
          username
          role
          accountStatus
        }
        accessToken
        refreshToken
      }
    }
  }
`;

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    auth {
      signUp(input: $input) {
        success
        message
        user {
          id
          email
          username
          role
          accountStatus
        }
        accessToken
        refreshToken
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    auth {
      refreshToken(input: $input) {
        success
        message
        accessToken
        refreshToken
      }
    }
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($input: ForgotPasswordInput!) {
    auth {
      requestPasswordReset(input: $input) {
        success
        message
      }
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    auth {
      resetPassword(input: $input) {
        success
        message
      }
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    auth {
      changePassword(input: $input) {
        success
        message
      }
    }
  }
`;

export const GET_USERS_QUERY = gql`
  query GetUsers($filters: UserFiltersInput) {
    users {
      users(filters: $filters) {
        id
        email
        username
        role
        accountStatus
        createdAt
        lastLogin
      }
    }
  }
`;

// Apollo Client Hooks

export const useSignIn = () => {
  const [signInMutation, { loading, error }] = useMutation<LoginResponse>(SIGN_IN_MUTATION, {
    errorPolicy: 'all',
  });

  const signIn = async (data: SignInRequestDto): Promise<SignInResponseDto> => {
    try {
      const variables = {
        input: {
          email: data.email,
          password: data.password,
        },
      };

      const result = await signInMutation({ variables });

      if (!result.data?.auth?.signIn?.success) {
        throw new AuthApiError(401, result.data?.auth?.signIn?.message || "Sign in failed");
      }

      const signInResult = result.data.auth.signIn;
      
      return {
        user: signInResult.user,
        tokens: {
          accessToken: signInResult.accessToken || '',
          refreshToken: signInResult.refreshToken || '',
          expiresIn: 3600 // default 1 hour
        },
        message: signInResult.message,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleApolloError(error);
      }
      throw error;
    }
  };

  return {
    signIn,
    loading,
    error: error ? new AuthApiError(500, error.message) : null,
  };
};

export const useSignUp = () => {
  const [signUpMutation, { loading, error }] = useMutation<SignUpResponse>(SIGN_UP_MUTATION, {
    errorPolicy: 'all',
  });

  const signUp = async (data: SignUpRequestDto): Promise<SignUpResponseDto> => {
    try {
      const variables = {
        input: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
          confirmPassword: data.confirmPassword,
          acceptTerms: data.acceptTerms,
        },
      };

      const result = await signUpMutation({ variables });

      if (!result.data?.auth?.signUp?.success) {
        throw new AuthApiError(400, result.data?.auth?.signUp?.message || "Sign up failed");
      }

      const signUpResult = result.data.auth.signUp;
      
      return {
        user: signUpResult.user,
        message: signUpResult.message,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleApolloError(error);
      }
      throw error;
    }
  };

  return {
    signUp,
    loading,
    error: error ? new AuthApiError(500, error.message) : null,
  };
};

export const useLogout = () => {
  const logout = async (): Promise<{ message: string }> => {
    try {
      // Clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      
      return { message: "Logged out successfully" };
    } catch (error: any) {
      console.warn("Logout API failed, but local tokens cleared:", error?.message || "Unknown error");
      return { message: "Logged out successfully" };
    }
  };

  return {
    logout,
    loading: false,
    error: null,
  };
};

export const useRefreshToken = () => {
  const [refreshTokenMutation, { loading, error }] = useMutation<RefreshTokenResponse>(REFRESH_TOKEN_MUTATION, {
    errorPolicy: 'all',
  });

  const refreshToken = async (data: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> => {
    try {
      const variables = {
        input: {
          refreshToken: data.refreshToken,
        },
      };

      const result = await refreshTokenMutation({ variables });

      if (!result.data?.auth?.refreshToken?.success) {
        throw new AuthApiError(401, result.data?.auth?.refreshToken?.message || "Token refresh failed");
      }

      const refreshResult = result.data.auth.refreshToken;
      
      return {
        accessToken: refreshResult.accessToken || '',
        refreshToken: refreshResult.refreshToken || '',
        expiresIn: 3600, // default 1 hour
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleApolloError(error);
      }
      throw error;
    }
  };

  return {
    refreshToken,
    loading,
    error: error ? new AuthApiError(500, error.message) : null,
  };
};

export const useRequestPasswordReset = () => {
  const [requestPasswordResetMutation, { loading, error }] = useMutation<PasswordResetResponse>(REQUEST_PASSWORD_RESET_MUTATION, {
    errorPolicy: 'all',
  });

  const requestPasswordReset = async (data: ForgotPasswordRequestDto): Promise<ForgotPasswordResponseDto> => {
    try {
      const variables = {
        input: {
          email: data.email,
        },
      };

      const result = await requestPasswordResetMutation({ variables });

      if (!result.data?.auth?.requestPasswordReset?.success) {
        throw new AuthApiError(400, result.data?.auth?.requestPasswordReset?.message || "Password reset request failed");
      }

      return { message: result.data.auth.requestPasswordReset.message };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleApolloError(error);
      }
      throw error;
    }
  };

  return {
    requestPasswordReset,
    loading,
    error: error ? new AuthApiError(500, error.message) : null,
  };
};

export const useResetPassword = () => {
  const [resetPasswordMutation, { loading, error }] = useMutation<ResetPasswordResponse>(RESET_PASSWORD_MUTATION, {
    errorPolicy: 'all',
  });

  const resetPassword = async (data: ResetPasswordRequestDto): Promise<ResetPasswordResponseDto> => {
    try {
      const variables = {
        input: {
          token: data.token,
          password: data.password,
        },
      };

      const result = await resetPasswordMutation({ variables });

      if (!result.data?.auth?.resetPassword?.success) {
        throw new AuthApiError(400, result.data?.auth?.resetPassword?.message || "Password reset failed");
      }

      return { message: result.data.auth.resetPassword.message };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleApolloError(error);
      }
      throw error;
    }
  };

  return {
    resetPassword,
    loading,
    error: error ? new AuthApiError(500, error.message) : null,
  };
};

export const useChangePassword = () => {
  const [changePasswordMutation, { loading, error }] = useMutation<ChangePasswordResponse>(CHANGE_PASSWORD_MUTATION, {
    errorPolicy: 'all',
  });

  const changePassword = async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    try {
      const variables = {
        input: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      };

      const result = await changePasswordMutation({ variables });

      if (!result.data?.auth?.changePassword?.success) {
        throw new AuthApiError(400, result.data?.auth?.changePassword?.message || "Password change failed");
      }

      return { message: result.data.auth.changePassword.message };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleApolloError(error);
      }
      throw error;
    }
  };

  return {
    changePassword,
    loading,
    error: error ? new AuthApiError(500, error.message) : null,
  };
};

export const useGetUsers = () => {
  const { data, loading, error, refetch } = useQuery<GetUsersResponse>(GET_USERS_QUERY, {
    errorPolicy: 'all',
  });

  const getUsers = async (filters?: any) => {
    try {
      const result = await refetch({ filters });
      const users = result.data?.users?.users;
      return users || [];
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleApolloError(error);
      }
      throw error;
    }
  };

  return {
    users: data?.users?.users || [],
    getUsers,
    loading,
    error: error ? new AuthApiError(500, error.message) : null,
  };
};

export const useGetProfile = () => {
  const { data, loading, error, refetch } = useQuery<GetUsersResponse>(GET_USERS_QUERY, {
    errorPolicy: 'all',
  });

  const getProfile = async () => {
    try {
      const result = await refetch();
      return {
        success: true,
        profile: result.data?.users?.users?.[0] || null,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleApolloError(error);
      }
      throw error;
    }
  };

  return {
    profile: data?.users?.users?.[0] || null,
    getProfile,
    loading,
    error: error ? new AuthApiError(500, error.message) : null,
  };
};

// Legacy compatibility - creates an API object that matches your current authApi interface
export const authApi = {
  signIn: async (data: SignInRequestDto) => {
    throw new AuthApiError(501, "Use useSignIn hook instead of authApi.signIn");
  },
  signUp: async (data: SignUpRequestDto) => {
    throw new AuthApiError(501, "Use useSignUp hook instead of authApi.signUp");
  },
  logout: async () => {
    throw new AuthApiError(501, "Use useLogout hook instead of authApi.logout");
  },
  refreshToken: async (data: RefreshTokenRequestDto) => {
    throw new AuthApiError(501, "Use useRefreshToken hook instead of authApi.refreshToken");
  },
  requestPasswordReset: async (data: ForgotPasswordRequestDto) => {
    throw new AuthApiError(501, "Use useRequestPasswordReset hook instead of authApi.requestPasswordReset");
  },
  resetPassword: async (data: ResetPasswordRequestDto) => {
    throw new AuthApiError(501, "Use useResetPassword hook instead of authApi.resetPassword");
  },
  getUsers: async (filters?: any) => {
    throw new AuthApiError(501, "Use useGetUsers hook instead of authApi.getUsers");
  },
  getProfile: async () => {
    throw new AuthApiError(501, "Use useGetProfile hook instead of authApi.getProfile");
  },
};

export { AuthApiError as default };