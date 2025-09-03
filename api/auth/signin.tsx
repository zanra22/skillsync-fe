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

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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

// HTTP client utility
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData: ApiErrorDto = await response.json().catch(() => ({
        error: "Unknown Error",
        message: response.statusText || "An error occurred",
        statusCode: response.status,
        timestamp: new Date().toISOString(),
        path: endpoint,
      }));

      throw new ApiError(
        response.status,
        errorData.message || response.statusText,
        errorData.details
      );
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
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
    return apiClient<SignInResponseDto>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Sign up with email and password
  signUp: async (data: SignUpRequestDto): Promise<SignUpResponseDto> => {
    return apiClient<SignUpResponseDto>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Sign out
  signOut: async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refreshToken");
    
    try {
      await apiClient<void>("/auth/signout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      // Clear tokens even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  // Refresh access token
  refreshToken: async (data: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> => {
    return apiClient<RefreshTokenResponseDto>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequestDto): Promise<ForgotPasswordResponseDto> => {
    return apiClient<ForgotPasswordResponseDto>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequestDto): Promise<ResetPasswordResponseDto> => {
    return apiClient<ResetPasswordResponseDto>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Verify email
  verifyEmail: async (data: VerifyEmailRequestDto): Promise<VerifyEmailResponseDto> => {
    return apiClient<VerifyEmailResponseDto>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Social authentication
  socialAuth: async (data: SocialAuthRequestDto): Promise<SocialAuthResponseDto> => {
    return apiClient<SocialAuthResponseDto>(`/auth/social/${data.provider}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get current user profile
  getProfile: async (): Promise<SignInResponseDto["user"]> => {
    return apiClient<SignInResponseDto["user"]>("/auth/profile");
  },

  // Update user profile
  updateProfile: async (data: Partial<SignInResponseDto["user"]>): Promise<SignInResponseDto["user"]> => {
    return apiClient<SignInResponseDto["user"]>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Change password (for authenticated users)
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    return apiClient<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Token management utilities
export const tokenManager = {
  setTokens: (tokens: SignInResponseDto["tokens"]) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("tokenExpiry", (Date.now() + tokens.expiresIn * 1000).toString());
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem("refreshToken");
  },

  isTokenExpired: (): boolean => {
    const expiry = localStorage.getItem("tokenExpiry");
    if (!expiry) return true;
    
    return Date.now() > parseInt(expiry);
  },

  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
  },
};

export { ApiError };