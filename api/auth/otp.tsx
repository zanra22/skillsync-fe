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
const API_BASE_URL = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "https://skillsync-graphql-e2dpdxhgebeqhhhk.southeastasia-01.azurewebsites.net";
const GRAPHQL_ENDPOINT = API_BASE_URL;

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
      otps: {
        sendOtp: {
          success: boolean;
          message: string;
          requiresOtp: boolean;
          verificationLinkSent: boolean;
        };
      };
    }>(mutation, variables);

    if (!result.otps.sendOtp.success) {
      throw new OTPApiError(400, result.otps.sendOtp.message);
    }

    return {
      success: result.otps.sendOtp.success,
      message: result.otps.sendOtp.message,
      requiresOtp: result.otps.sendOtp.requiresOtp,
      verificationLinkSent: result.otps.sendOtp.verificationLinkSent,
    };
  },

  // Verify OTP code
  verifyOTP: async (data: VerifyOTPRequestDto): Promise<VerifyOTPResponseDto> => {
    const mutation = `
      mutation VerifyOTP($input: VerifyOTPInput!, $deviceInfo: DeviceInfoInput) {
        otps {
          verifyOtp(input: $input, deviceInfo: $deviceInfo) {
            success
            message
            user {
              id
              email
              username
              firstName
              lastName
              role
              accountStatus
              profile {
                onboardingCompleted
              }
            }
            deviceTrusted
            accessToken
          }
        }
      }
    `;

    const variables = {
      input: {
        code: data.code,
        email: data.email,
        purpose: data.purpose,
        trustDevice: data.trustDevice || false,
        rememberMe: data.rememberMe || false, // Pass Remember Me flag to backend
      },
      deviceInfo: data.deviceInfo ? {
        userAgent: data.deviceInfo.userAgent,
        ipAddress: data.deviceInfo.ipAddress,
        deviceName: data.deviceInfo.deviceName,
      } : undefined,
    };

    console.log('🔍 OTP API - verifyOTP variables:', JSON.stringify(variables, null, 2));

    const result = await otpGraphqlClient<{
      otps: {
        verifyOtp: {
          success: boolean;
          message: string;
          user?: any;
          deviceTrusted: boolean;
          accessToken?: string;
        };
      };
    }>(mutation, variables);

    if (!result.otps.verifyOtp.success) {
      throw new OTPApiError(400, result.otps.verifyOtp.message);
    }

    return {
      success: result.otps.verifyOtp.success,
      message: result.otps.verifyOtp.message,
      user: result.otps.verifyOtp.user,
      deviceTrusted: result.otps.verifyOtp.deviceTrusted,
      accessToken: result.otps.verifyOtp.accessToken,
    };
  },

  // Verify email link
  verifyLink: async (data: VerifyLinkRequestDto): Promise<VerifyLinkResponseDto> => {
    const mutation = `
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

    const variables = {
      input: {
        token: data.token,
        purpose: data.purpose,
      },
    };

    const result = await otpGraphqlClient<{
      otps: {
        verifyLink: {
          success: boolean;
          message: string;
          user?: any;
        };
      };
    }>(mutation, variables);

    if (!result.otps.verifyLink.success) {
      throw new OTPApiError(400, result.otps.verifyLink.message);
    }

    return {
      success: result.otps.verifyLink.success,
      message: result.otps.verifyLink.message,
      user: result.otps.verifyLink.user,
    };
  },

  // Check device trust status
  checkDeviceTrust: async (data: DeviceTrustCheckRequestDto): Promise<DeviceTrustCheckResponseDto> => {
    const mutation = `
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

    const variables = {
      input: {
        userAgent: data.deviceInfo.userAgent,
        ipAddress: data.deviceInfo.ipAddress,
        deviceName: data.deviceInfo.deviceName,
      },
      email: data.email,
    };

    const result = await otpGraphqlClient<{
      otps: {
        checkDeviceTrust: {
          isTrusted: boolean;
          requiresOtp: boolean;
          message: string;
        };
      };
    }>(mutation, variables);

    return {
      isTrusted: result.otps.checkDeviceTrust.isTrusted,
      requiresOtp: result.otps.checkDeviceTrust.requiresOtp,
      message: result.otps.checkDeviceTrust.message,
    };
  },
};

export { deviceUtils as default };
