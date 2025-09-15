// OTP-related DTOs for API communication with the new backend OTP system

// Device fingerprinting for trust management
export interface DeviceInfoDto {
  userAgent: string;
  ipAddress: string;
  deviceName?: string;
}

// Send OTP Request
export interface SendOTPRequestDto {
  email: string;
  purpose: 'signin' | 'signup' | 'password_reset' | 'device_verification';
  deviceInfo: DeviceInfoDto;
}

export interface SendOTPResponseDto {
  success: boolean;
  message: string;
  requiresOtp: boolean; // True if device is not trusted
  verificationLinkSent: boolean;
}

// Verify OTP Request
export interface VerifyOTPRequestDto {
  code: string;
  email: string;
  purpose: 'signin' | 'signup' | 'password_reset' | 'device_verification';
  deviceInfo: DeviceInfoDto;
  trustDevice?: boolean;
}

export interface VerifyOTPResponseDto {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
    accountStatus: 'pending' | 'active';
  };
  deviceTrusted?: boolean;
}

// Verify Email Link Request
export interface VerifyLinkRequestDto {
  token: string;
  purpose: 'signin' | 'signup' | 'password_reset' | 'device_verification';
}

export interface VerifyLinkResponseDto {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
    accountStatus: 'pending' | 'active';
    isPremium: boolean;
  };
  accessToken?: string;
  expiresIn?: number;
}

// Device Trust Check
export interface DeviceTrustCheckRequestDto {
  email: string;
  deviceInfo: DeviceInfoDto;
}

export interface DeviceTrustCheckResponseDto {
  isTrusted: boolean;
  requiresOtp: boolean;
  message: string;
}

// Trusted Device Management
export interface TrustedDeviceDto {
  id: string;
  deviceName: string;
  deviceFingerprint: string;
  ipAddress: string;
  lastUsed: string;
  isActive: boolean;
  createdAt: string;
}

export interface TrustedDevicesResponseDto {
  devices: TrustedDeviceDto[];
}

export interface RevokeTrustedDeviceRequestDto {
  deviceId: string;
}

export interface RevokeTrustedDeviceResponseDto {
  success: boolean;
  message: string;
}
