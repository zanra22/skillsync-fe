import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import {
  SendOTPRequestDto,
  SendOTPResponseDto,
  VerifyOTPRequestDto,
  VerifyOTPResponseDto,
  VerifyLinkRequestDto,
  VerifyLinkResponseDto,
  DeviceTrustCheckRequestDto,
  DeviceTrustCheckResponseDto,
  DeviceInfoDto,
} from "@/types/auth/otp";

// GraphQL Mutations for OTP operations
export const SEND_OTP_MUTATION = gql`
  mutation SendOTP($input: SendOTPInput!, $deviceInfo: DeviceInfoInput) {
    otps {
      sendOtp(input: $input, deviceInfo: $deviceInfo) {
        success
        message
        requiresOtp
        verificationLinkSent
      }
    }
  }
`;

export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOTP($input: VerifyOTPInput!, $deviceInfo: DeviceInfoInput) {
    otps {
      verifyOtp(input: $input, deviceInfo: $deviceInfo) {
        success
        message
        user {
          id
          email
          username
          role
          accountStatus
        }
        deviceTrusted
      }
    }
  }
`;

export const VERIFY_LINK_MUTATION = gql`
  mutation VerifyLink($input: VerifyLinkInput!) {
    otps {
      verifyLink(input: $input) {
        success
        message
        user {
          id
          email
          username
          role
          accountStatus
        }
      }
    }
  }
`;

export const CHECK_DEVICE_TRUST_MUTATION = gql`
  mutation CheckDeviceTrust($input: DeviceInfoInput!, $email: String!) {
    otps {
      checkDeviceTrust(input: $input, email: $email) {
        isTrusted
        requiresOtp
        message
      }
    }
  }
`;

// Response Types
interface SendOTPResponse {
  otps: {
    sendOtp: {
      success: boolean;
      message: string;
      requiresOtp: boolean;
      verificationLinkSent: boolean;
    };
  };
}

interface VerifyOTPResponse {
  otps: {
    verifyOtp: {
      success: boolean;
      message: string;
      user?: any;
      deviceTrusted: boolean;
    };
  };
}

interface VerifyLinkResponse {
  otps: {
    verifyLink: {
      success: boolean;
      message: string;
      user?: any;
    };
  };
}

interface CheckDeviceTrustResponse {
  otps: {
    checkDeviceTrust: {
      isTrusted: boolean;
      requiresOtp: boolean;
      message: string;
    };
  };
}

export class OTPApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "OTPApiError";
  }
}

// Helper function to handle Apollo errors
function handleOTPError(error: any): never {
  const message = error.graphQLErrors?.[0]?.message || error.message || "An error occurred";
  const statusCode = error.networkError ? 500 : 400;
  
  throw new OTPApiError(statusCode, message, {
    graphQLErrors: error.graphQLErrors,
    networkError: error.networkError,
  });
}

// Device utilities for fingerprinting and info collection
export const deviceUtils = {
  getDeviceInfo(): DeviceInfoDto {
    const userAgent = navigator.userAgent;
    const ipAddress = "0.0.0.0"; // Will be set by server
    const deviceName = this.getDeviceName(userAgent);

    return {
      userAgent,
      ipAddress,
      deviceName,
    };
  },

  getDeviceName(userAgent: string): string {
    // Simple device detection
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPhone/.test(userAgent)) return "iPhone";
      if (/iPad/.test(userAgent)) return "iPad";
      if (/Android/.test(userAgent)) return "Android Device";
      return "Mobile Device";
    }
    
    if (/Windows/.test(userAgent)) return "Windows PC";
    if (/Mac/.test(userAgent)) return "Mac";
    if (/Linux/.test(userAgent)) return "Linux PC";
    
    return "Unknown Device";
  },
};

// Apollo Client Hooks for OTP Operations

export const useSendOTP = () => {
  const [sendOTPMutation, { loading, error }] = useMutation<SendOTPResponse>(SEND_OTP_MUTATION, {
    errorPolicy: 'all',
  });

  const sendOTP = async (data: SendOTPRequestDto): Promise<SendOTPResponseDto> => {
    try {
      const variables = {
        input: {
          email: data.email,
          purpose: data.purpose,
        },
        deviceInfo: data.deviceInfo ? {
          userAgent: data.deviceInfo.userAgent,
          ipAddress: data.deviceInfo.ipAddress,
          deviceName: data.deviceInfo.deviceName,
        } : undefined,
      };

      const result = await sendOTPMutation({ variables });

      if (!result.data?.otps?.sendOtp?.success) {
        throw new OTPApiError(400, result.data?.otps?.sendOtp?.message || "Send OTP failed");
      }

      return {
        success: result.data.otps.sendOtp.success,
        message: result.data.otps.sendOtp.message,
        requiresOtp: result.data.otps.sendOtp.requiresOtp,
        verificationLinkSent: result.data.otps.sendOtp.verificationLinkSent,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleOTPError(error);
      }
      throw error;
    }
  };

  return {
    sendOTP,
    loading,
    error: error ? new OTPApiError(500, error.message) : null,
  };
};

export const useVerifyOTP = () => {
  const [verifyOTPMutation, { loading, error }] = useMutation<VerifyOTPResponse>(VERIFY_OTP_MUTATION, {
    errorPolicy: 'all',
  });

  const verifyOTP = async (data: VerifyOTPRequestDto): Promise<VerifyOTPResponseDto> => {
    try {
      const variables = {
        input: {
          code: data.code,
          email: data.email,
          purpose: data.purpose,
          trustDevice: data.trustDevice || false,
        },
        deviceInfo: data.deviceInfo ? {
          userAgent: data.deviceInfo.userAgent,
          ipAddress: data.deviceInfo.ipAddress,
          deviceName: data.deviceInfo.deviceName,
        } : undefined,
      };

      const result = await verifyOTPMutation({ variables });

      if (!result.data?.otps?.verifyOtp?.success) {
        throw new OTPApiError(400, result.data?.otps?.verifyOtp?.message || "Verify OTP failed");
      }

      return {
        success: result.data.otps.verifyOtp.success,
        message: result.data.otps.verifyOtp.message,
        user: result.data.otps.verifyOtp.user,
        deviceTrusted: result.data.otps.verifyOtp.deviceTrusted,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleOTPError(error);
      }
      throw error;
    }
  };

  return {
    verifyOTP,
    loading,
    error: error ? new OTPApiError(500, error.message) : null,
  };
};

export const useVerifyLink = () => {
  const [verifyLinkMutation, { loading, error }] = useMutation<VerifyLinkResponse>(VERIFY_LINK_MUTATION, {
    errorPolicy: 'all',
  });

  const verifyLink = async (data: VerifyLinkRequestDto): Promise<VerifyLinkResponseDto> => {
    try {
      const variables = {
        input: {
          token: data.token,
          purpose: data.purpose,
        },
      };

      const result = await verifyLinkMutation({ variables });

      if (!result.data?.otps?.verifyLink?.success) {
        throw new OTPApiError(400, result.data?.otps?.verifyLink?.message || "Verify link failed");
      }

      return {
        success: result.data.otps.verifyLink.success,
        message: result.data.otps.verifyLink.message,
        user: result.data.otps.verifyLink.user,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleOTPError(error);
      }
      throw error;
    }
  };

  return {
    verifyLink,
    loading,
    error: error ? new OTPApiError(500, error.message) : null,
  };
};

export const useCheckDeviceTrust = () => {
  const [checkDeviceTrustMutation, { loading, error }] = useMutation<CheckDeviceTrustResponse>(CHECK_DEVICE_TRUST_MUTATION, {
    errorPolicy: 'all',
  });

  const checkDeviceTrust = async (data: DeviceTrustCheckRequestDto): Promise<DeviceTrustCheckResponseDto> => {
    try {
      const variables = {
        input: {
          userAgent: data.deviceInfo.userAgent,
          ipAddress: data.deviceInfo.ipAddress,
          deviceName: data.deviceInfo.deviceName,
        },
        email: data.email,
      };

      const result = await checkDeviceTrustMutation({ variables });

      return {
        isTrusted: result.data?.otps?.checkDeviceTrust?.isTrusted || false,
        requiresOtp: result.data?.otps?.checkDeviceTrust?.requiresOtp || true,
        message: result.data?.otps?.checkDeviceTrust?.message || "Device trust check completed",
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        handleOTPError(error);
      }
      throw error;
    }
  };

  return {
    checkDeviceTrust,
    loading,
    error: error ? new OTPApiError(500, error.message) : null,
  };
};

// Legacy compatibility - creates an API object that matches your current otpApi interface
export const otpApi = {
  sendOTP: async (data: SendOTPRequestDto) => {
    throw new OTPApiError(501, "Use useSendOTP hook instead of otpApi.sendOTP");
  },
  verifyOTP: async (data: VerifyOTPRequestDto) => {
    throw new OTPApiError(501, "Use useVerifyOTP hook instead of otpApi.verifyOTP");
  },
  verifyLink: async (data: VerifyLinkRequestDto) => {
    throw new OTPApiError(501, "Use useVerifyLink hook instead of otpApi.verifyLink");
  },
  checkDeviceTrust: async (data: DeviceTrustCheckRequestDto) => {
    throw new OTPApiError(501, "Use useCheckDeviceTrust hook instead of otpApi.checkDeviceTrust");
  },
};

export { deviceUtils as default };