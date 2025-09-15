"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Clock, Shield, Smartphone, RefreshCw } from "lucide-react";
import { otpApi, deviceUtils, OTPApiError } from "@/api/auth/otp";
import { DeviceInfoDto } from "@/types/auth/otp";
import { useAuth } from "@/context/AuthContext";

interface OTPVerificationProps {
  email: string;
  purpose: 'signin' | 'signup' | 'password_reset' | 'device_verification';
  onSuccess: (result: { user?: any; deviceTrusted?: boolean }) => void;
  onCancel: () => void;
  onResendOTP: () => void;
  deviceInfo: DeviceInfoDto;
}

const OTPVerification = ({
  email,
  purpose,
  onSuccess,
  onCancel,
  onResendOTP,
  deviceInfo,
}: OTPVerificationProps) => {
  const { verifyOTP: contextVerifyOTP } = useAuth();
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;
  
  // Refs for OTP input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP expiration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Allow resend after 60 seconds
  useEffect(() => {
    const resendTimer = setTimeout(() => {
      setCanResend(true);
    }, 60000); // 1 minute

    return () => clearTimeout(resendTimer);
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle pasted content
      const pastedCode = value.slice(0, 6).split('');
      const newOtpCode = [...otpCode];
      
      pastedCode.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtpCode[index + i] = char;
        }
      });
      
      setOtpCode(newOtpCode);
      
      // Focus next empty field or last field
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (/^\d?$/.test(value)) {
      const newOtpCode = [...otpCode];
      newOtpCode[index] = value;
      setOtpCode(newOtpCode);

      // Auto-focus next field
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Clear error when user types
      if (error) {
        setError('');
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP code
  const handleVerifyOTP = async () => {
    const code = otpCode.join('');
    
    if (code.length !== 6) {
      setError('Please enter a complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use AuthContext's verifyOTP for signin to handle post-login flow
      if (purpose === 'signin') {
        const result = await contextVerifyOTP(code, trustDevice);
        
        if (result.success) {
          // Don't show toast here - AuthContext will handle success messaging and redirect
          onSuccess({
            user: result.user,
            deviceTrusted: result.deviceTrusted,
          });
        } else {
          toast.error("Verification failed", {
            description: result.message,
          });
          setError(result.message);
          setAttempts(prev => prev + 1);
          
          // Clear the input fields on error
          setOtpCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      } else {
        // For other purposes (signup, password_reset, etc.), use direct API call
        const result = await otpApi.verifyOTP({
          code,
          email,
          purpose,
          deviceInfo,
          trustDevice,
        });

        if (result.success) {
          toast.success("OTP verified successfully!");
          onSuccess({
            user: result.user,
            deviceTrusted: result.deviceTrusted,
          });
        } else {
          toast.error("Verification failed", {
            description: result.message,
          });
          setError(result.message);
          setAttempts(prev => prev + 1);
          
          // Clear the input fields on error
          setOtpCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (error) {
      if (error instanceof OTPApiError) {
        toast.error("Verification failed", {
          description: error.message,
        });
        setError(error.message);
        setAttempts(prev => prev + 1);
        
        // Clear the input fields on error
        setOtpCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setCanResend(false);
    setTimeLeft(600); // Reset timer
    setAttempts(0); // Reset attempts
    setError('');
    setOtpCode(['', '', '', '', '', '']);
    
    try {
      await onResendOTP();
      toast.success("New OTP sent!", {
        description: "Please check your email for the new verification code.",
      });
    } catch (error) {
      toast.error("Failed to resend OTP", {
        description: "Please try again in a moment.",
      });
      setCanResend(true);
    }
  };

  const isMaxAttemptsReached = attempts >= maxAttempts;
  const codeComplete = otpCode.every(digit => digit !== '');

  return (
    <Card className="w-full max-w-md mx-auto bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <CardTitle className="text-2xl font-poppins">Verify Your Identity</CardTitle>
        <CardDescription className="font-inter">
          We've sent a 6-digit verification code to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer and Status */}
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired'}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center">
            {error}
            {isMaxAttemptsReached && (
              <div className="mt-2 text-xs">
                Maximum attempts reached. Please request a new code.
              </div>
            )}
          </div>
        )}

        {/* OTP Input Fields */}
        <div className="space-y-4">
          <Label className="text-center block font-inter font-medium">
            Enter Verification Code
          </Label>
          <div className="flex justify-center space-x-2">
            {otpCode.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-bold border-2 focus:border-accent focus:ring-accent/20"
                disabled={isLoading || isMaxAttemptsReached}
                autoComplete="off"
              />
            ))}
          </div>
        </div>

        {/* Trust Device Option */}
        {purpose === 'signin' && (
          <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
            <input
              type="checkbox"
              id="trustDevice"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
              disabled={isLoading}
            />
            <Label htmlFor="trustDevice" className="text-sm font-inter flex items-center">
              <Smartphone className="w-4 h-4 mr-1 text-muted-foreground" />
              Trust this device for 30 days
            </Label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleVerifyOTP}
            className="w-full btn-hero h-11"
            disabled={!codeComplete || isLoading || isMaxAttemptsReached}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              className="font-inter"
            >
              Cancel
            </Button>

            <Button
              variant="ghost"
              onClick={handleResendOTP}
              disabled={!canResend || isLoading}
              className="font-inter text-accent hover:text-accent/80"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Resend Code
            </Button>
          </div>
        </div>

        {/* Alternative Verification */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground font-inter">
            Didn't receive the code? Check your spam folder or
          </p>
          <Button variant="link" className="text-xs text-accent hover:text-accent/80 font-inter">
            <Mail className="w-3 h-3 mr-1" />
            Try email verification link instead
          </Button>
        </div>

        {/* Attempt Counter */}
        {attempts > 0 && (
          <div className="text-center text-xs text-muted-foreground">
            Attempts remaining: {maxAttempts - attempts}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OTPVerification;
