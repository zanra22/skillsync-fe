// Authentication DTOs for API communication

export interface SignInRequestDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignInResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    emailVerified: boolean;
    role: 'new_user' | 'learner' | 'mentor' | 'admin' | 'super_admin' | 'moderator' | 'hr_manager' | 'recruiter' | 'premium_user' | 'vip_mentor';
    createdAt: string;
    updatedAt: string;
    profile?: {
      onboarding_completed?: boolean;
      onboardingCompleted?: boolean; // Support both naming conventions
      onboarding_step?: string;
    } | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  message: string;
  otpRequired?: boolean; // ✅ NEW: OTP requirement flag from backend
}

export interface SignUpRequestDto {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface SignUpResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    profile?: {
      onboarding_completed?: boolean;
      onboardingCompleted?: boolean; // Support both naming conventions
      onboarding_step?: string;
    } | null;
  };
  message: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  message: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponseDto {
  message: string;
}

export interface VerifyEmailRequestDto {
  token: string;
}

export interface VerifyEmailResponseDto {
  message: string;
}

// Error response DTO
export interface ApiErrorDto {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: Record<string, any>;
}

// Social Auth DTOs
export interface SocialAuthRequestDto {
  provider: 'google' | 'github';
  code: string;
  redirectUri?: string;
}

export interface SocialAuthResponseDto extends SignInResponseDto {
  isNewUser: boolean;
}