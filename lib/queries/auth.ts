import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi, tokenManager, ApiError } from "@/api/auth/signin";
import {
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  VerifyEmailRequestDto,
  SocialAuthRequestDto,
} from "@/types/auth/dto";

// Query keys for cache management
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
  user: (id: string) => [...authKeys.all, "user", id] as const,
};

// Auth context type for user state management
export interface AuthContextType {
  user: SignInResponseDto["user"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Sign in mutation
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignInRequestDto) => authApi.signIn(data),
    onSuccess: (response) => {
      // Store tokens
      tokenManager.setTokens(response.tokens);
      
      // Update user cache
      queryClient.setQueryData(authKeys.profile(), response.user);
      
      // Show success message
      toast.success("Welcome back!", {
        description: "You have been signed in successfully.",
      });
    },
    onError: (error: ApiError) => {
      toast.error("Sign in failed", {
        description: error.message || "Please check your credentials and try again.",
      });
    },
  });
}

// Sign up mutation
export function useSignUp() {
  return useMutation({
    mutationFn: (data: SignUpRequestDto) => authApi.signUp(data),
    onSuccess: (response) => {
      toast.success("Account created successfully!", {
        description: "Please check your email to verify your account.",
      });
    },
    onError: (error: ApiError) => {
      toast.error("Sign up failed", {
        description: error.message || "Please try again with different information.",
      });
    },
  });
}

// Sign out mutation
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.removeQueries({ queryKey: authKeys.all });
      
      // Clear tokens
      tokenManager.clearTokens();
      
      toast.success("Signed out successfully");
    },
    onError: () => {
      // Still clear tokens and cache even if API call fails
      queryClient.removeQueries({ queryKey: authKeys.all });
      tokenManager.clearTokens();
      
      toast.info("You have been signed out");
    },
  });
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequestDto) => authApi.forgotPassword(data),
    onSuccess: () => {
      toast.success("Reset link sent!", {
        description: "Please check your email for password reset instructions.",
      });
    },
    onError: (error: ApiError) => {
      toast.error("Failed to send reset link", {
        description: error.message || "Please try again later.",
      });
    },
  });
}

// Reset password mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequestDto) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successfully!", {
        description: "You can now sign in with your new password.",
      });
    },
    onError: (error: ApiError) => {
      toast.error("Password reset failed", {
        description: error.message || "Please try again or request a new reset link.",
      });
    },
  });
}

// Verify email mutation
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (data: VerifyEmailRequestDto) => authApi.verifyEmail(data),
    onSuccess: () => {
      toast.success("Email verified successfully!", {
        description: "Your account is now active.",
      });
    },
    onError: (error: ApiError) => {
      toast.error("Email verification failed", {
        description: error.message || "Please try again or request a new verification link.",
      });
    },
  });
}

// Social auth mutation
export function useSocialAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SocialAuthRequestDto) => authApi.socialAuth(data),
    onSuccess: (response) => {
      // Store tokens
      tokenManager.setTokens(response.tokens);
      
      // Update user cache
      queryClient.setQueryData(authKeys.profile(), response.user);
      
      // Show appropriate message
      if (response.isNewUser) {
        toast.success("Welcome to SkillSync!", {
          description: "Your account has been created successfully.",
        });
      } else {
        toast.success("Welcome back!", {
          description: "You have been signed in successfully.",
        });
      }
    },
    onError: (error: ApiError) => {
      toast.error("Authentication failed", {
        description: error.message || "Please try again.",
      });
    },
  });
}

// User profile query
export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
    enabled: !!tokenManager.getAccessToken() && !tokenManager.isTokenExpired(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof ApiError && error.statusCode === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SignInResponseDto["user"]>) => 
      authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update the profile cache
      queryClient.setQueryData(authKeys.profile(), updatedUser);
      
      toast.success("Profile updated successfully!");
    },
    onError: (error: ApiError) => {
      toast.error("Failed to update profile", {
        description: error.message || "Please try again later.",
      });
    },
  });
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully!", {
        description: "Your account is now more secure.",
      });
    },
    onError: (error: ApiError) => {
      toast.error("Failed to change password", {
        description: error.message || "Please check your current password and try again.",
      });
    },
  });
}

// Resend verification mutation
export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
    onSuccess: () => {
      toast.success("Verification email sent!", {
        description: "Please check your email for the verification link.",
      });
    },
    onError: (error: ApiError) => {
      toast.error("Failed to send verification email", {
        description: error.message || "Please try again later.",
      });
    },
  });
}

// Custom hook to get authentication status
export function useAuth(): AuthContextType {
  const { data: user, isLoading } = useProfile();
  
  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
  };
}
