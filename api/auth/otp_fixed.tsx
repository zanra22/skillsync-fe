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

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const GRAPHQL_ENDPOINT = `${API_BASE_URL}/graphql/`;

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

// GraphQL client utility for OTP operations
async function otpGraphqlClient<T>(
  query: string,
  variables?: Record<string, any>,
  accessToken?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    if (!response.ok) {
      throw new OTPApiError(
        response.status,
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      const errorMessage = data.errors.map((err: any) => err.message).join(", ");
      throw new OTPApiError(400, errorMessage, data.errors);
    }

    return data.data;
  } catch (error) {
    if (error instanceof OTPApiError) {
      throw error;
    }
    
    console.error("GraphQL request failed:", error);
    throw new OTPApiError(
      500,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
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

// OTP API service
export const otpApi = {
  // Send OTP code
  sendOTP: async (data: SendOTPRequestDto): Promise<SendOTPResponseDto> => {
    const mutation = `
      mutation SendOTP($input: SendOTPInput!, $deviceInfo: DeviceInfoInput) {
        sendOtp(input: $input, deviceInfo: $deviceInfo) {
          success
          message
          requiresOtp
          verificationLinkSent
        }
      }
    `;

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

    const result = await otpGraphqlClient<{
      sendOtp: {
        success: boolean;
        message: string;
        requiresOtp: boolean;
        verificationLinkSent: boolean;
      };
    }>(mutation, variables);

    if (!result.sendOtp.success) {
      throw new OTPApiError(400, result.sendOtp.message);
    }

    return {
      success: result.sendOtp.success,
      message: result.sendOtp.message,
      requiresOtp: result.sendOtp.requiresOtp,
      verificationLinkSent: result.sendOtp.verificationLinkSent,
    };
  },

  // Verify OTP code
  verifyOTP: async (data: VerifyOTPRequestDto): Promise<VerifyOTPResponseDto> => {
    const mutation = `
      mutation VerifyOTP($input: VerifyOTPInput!, $deviceInfo: DeviceInfoInput) {
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
    `;

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

    const result = await otpGraphqlClient<{
      verifyOtp: {
        success: boolean;
        message: string;
        user?: any;
        deviceTrusted: boolean;
      };
    }>(mutation, variables);

    if (!result.verifyOtp.success) {
      throw new OTPApiError(400, result.verifyOtp.message);
    }

    return {
      success: result.verifyOtp.success,
      message: result.verifyOtp.message,
      user: result.verifyOtp.user,
      deviceTrusted: result.verifyOtp.deviceTrusted,
    };
  },

  // Verify email link
  verifyLink: async (data: VerifyLinkRequestDto): Promise<VerifyLinkResponseDto> => {
    const mutation = `
      mutation VerifyLink($input: VerifyLinkInput!) {
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
    `;

    const variables = {
      input: {
        token: data.token,
        purpose: data.purpose,
      },
    };

    const result = await otpGraphqlClient<{
      verifyLink: {
        success: boolean;
        message: string;
        user?: any;
      };
    }>(mutation, variables);

    if (!result.verifyLink.success) {
      throw new OTPApiError(400, result.verifyLink.message);
    }

    return {
      success: result.verifyLink.success,
      message: result.verifyLink.message,
      user: result.verifyLink.user,
    };
  },

  // Check device trust status
  checkDeviceTrust: async (data: DeviceTrustCheckRequestDto): Promise<DeviceTrustCheckResponseDto> => {
    const mutation = `
      mutation CheckDeviceTrust($input: DeviceInfoInput!, $email: String!) {
        checkDeviceTrust(input: $input, email: $email) {
          isTrusted
          requiresOtp
          message
        }
      }
    `;

    const variables = {
      input: {
        userAgent: data.deviceInfo.userAgent,
        ipAddress: data.deviceInfo.ipAddress,
        deviceName: data.deviceInfo.deviceName,
      },
      email: data.email,
    };

    const result = await otpGraphqlClient<{
      checkDeviceTrust: {
        isTrusted: boolean;
        requiresOtp: boolean;
        message: string;
      };
    }>(mutation, variables);

    return {
      isTrusted: result.checkDeviceTrust.isTrusted,
      requiresOtp: result.checkDeviceTrust.requiresOtp,
      message: result.checkDeviceTrust.message,
    };
  },
};

export { deviceUtils as default };
