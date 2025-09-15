"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { otpApi, OTPApiError } from "@/api/auth/otp";
import { useAuth } from "@/context/AuthContext";

const EmailVerification = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  const token = searchParams.get('token');
  const purpose = searchParams.get('purpose') as 'signin' | 'signup' | 'password_reset' | 'device_verification';

  useEffect(() => {
    if (!token || !purpose) {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new one.');
      setIsProcessing(false);
      return;
    }

    verifyEmailLink();
  }, [token, purpose]);

  const verifyEmailLink = async () => {
    try {
      setIsProcessing(true);
      
      const result = await otpApi.verifyLink({
        token: token!,
        purpose: purpose!,
      });

      if (result.success) {
        setStatus('success');
        setMessage(result.message);

        // If this is a signin/signup verification with tokens, log the user in
        if (result.accessToken && result.user) {
          const { user, accessToken, expiresIn } = result;
          
          // Transform user data to match frontend format
          const transformedUser = {
            id: user.id,
            email: user.email,
            firstName: user.username,
            lastName: '',
            avatar: undefined,
            emailVerified: user.accountStatus === 'active',
            role: (user.role === 'super_admin' ? 'admin' : 'user') as 'user' | 'mentor' | 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Update auth context
          // Note: We need to update the auth context directly since we have tokens
          setTimeout(() => {
            // Redirect based on user role instead of hardcoded '/dashboard'
            router.push('/signin?message=' + encodeURIComponent('Email verified! Please sign in to continue.'));
          }, 2000);
        } else {
          // For other purposes, redirect to signin
          setTimeout(() => {
            router.push('/signin?message=' + encodeURIComponent(result.message));
          }, 2000);
        }
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (error) {
      setStatus('error');
      
      if (error instanceof OTPApiError) {
        setMessage(error.message);
      } else {
        setMessage('An unexpected error occurred during verification.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendVerification = () => {
    // Redirect to appropriate page to resend verification
    if (purpose === 'signup') {
      router.push('/signup?resend=true');
    } else {
      router.push('/signin?resend=true');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-accent animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-success" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-destructive" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-accent';
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-destructive';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
    }
  };

  const getActionButton = () => {
    if (status === 'success') {
      return (
        <Button
          onClick={() => router.push('/signin')}
          className="btn-hero w-full"
        >
          Continue to Sign In
        </Button>
      );
    } else if (status === 'error') {
      return (
        <div className="space-y-3">
          <Button
            onClick={handleResendVerification}
            className="btn-primary w-full"
          >
            <Mail className="w-4 h-4 mr-2" />
            Request New Verification
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/signin')}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-neural flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            <div>
              <CardTitle className={`text-2xl font-poppins ${getStatusColor()}`}>
                {getStatusTitle()}
              </CardTitle>
              <CardDescription className="font-inter text-center mt-2">
                {status === 'loading' && 'Please wait while we verify your email address...'}
                {status === 'success' && 'Your email has been successfully verified.'}
                {status === 'error' && 'There was a problem verifying your email.'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg text-center text-sm ${
                status === 'success' 
                  ? 'bg-success/10 text-success border border-success/20' 
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}>
                {message}
              </div>
            )}

            {/* Loading Progress */}
            {status === 'loading' && (
              <div className="space-y-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs text-center text-muted-foreground font-inter">
                  Validating your verification token...
                </p>
              </div>
            )}

            {/* Success/Error Actions */}
            {!isProcessing && getActionButton()}

            {/* Additional Info */}
            {status === 'success' && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground font-inter">
                  🎉 Welcome to SkillSync! Your account is now active.
                </p>
                <p className="text-xs text-muted-foreground font-inter">
                  You'll be redirected automatically in a few seconds.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground font-inter">
                  Common issues:
                </p>
                <ul className="text-xs text-muted-foreground font-inter space-y-1">
                  <li>• Link may have expired (valid for 1 hour)</li>
                  <li>• Link may have already been used</li>
                  <li>• Link may be malformed or incomplete</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
