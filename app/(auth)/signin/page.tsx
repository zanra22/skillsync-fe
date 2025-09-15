"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signInSchema, type SignInFormData } from "@/lib/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import PasswordInput from "@/components/auth/PasswordInput";
import OTPVerification from "@/components/auth/OTPVerification";
import { deviceUtils } from "@/api/auth/otp";
import { useEffect, Suspense, useState } from "react";
import { toast } from "sonner";

const SignInContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMessage = searchParams.get('message');
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Show URL message as toast (for backwards compatibility)
  useEffect(() => {
    if (urlMessage) {
      if (urlMessage.includes('successfully') || urlMessage.includes('created')) {
        toast.success(urlMessage);
      } else {
        toast.info(urlMessage);
      }
      // Clean up URL by replacing without the message parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('message');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [urlMessage]);
  
  // Use AuthContext for secure authentication
  const { login, isLoading, otpRequired, pendingEmail, verifyOTP, resendOTP, clearOTPState, deviceInfo, isAuthenticated, user, isRedirecting: authIsRedirecting } = useAuth();
  
  // Redirect authenticated users immediately
  useEffect(() => {
    if (isAuthenticated && user && !otpRequired) {
      console.log('🔄 User already authenticated, redirecting...', user.role);
      setIsRedirecting(true);
      
      const targetUrl = (user.role === 'super_admin' || user.role === 'admin') ? '/dashboard' : '/user-dashboard';
      
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 100);
    }
  }, [isAuthenticated, user, otpRequired]);
  
  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    console.log('🚀 Form submitted, setting redirecting state...');
    try {
      // Set redirecting state immediately when form is submitted
      setIsRedirecting(true);
      console.log('🔄 Local redirecting state set to true');
      
      await login(data.email, data.password, data.rememberMe);
      console.log('✅ Login completed successfully');
      
      // Don't show any success toast here - let the AuthContext handle it
      // Only show info toast if OTP is required
      if (otpRequired) {
        console.log('📱 OTP required, resetting redirecting state');
        setIsRedirecting(false); // Reset if OTP is required
        toast.info("Verification required", {
          description: "Please check your email for the verification code",
        });
      }
      // Success toast will be shown after successful OTP verification or direct login
    } catch (error: any) {
      // Reset redirecting state on error
      console.log('❌ Login error, resetting redirecting state');
      setIsRedirecting(false);
      // Show error toast
      toast.error("Sign in failed", {
        description: error.message || "Invalid email or password",
      });
      
      if (error.details?.fieldErrors) {
        Object.entries(error.details.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof SignInFormData, {
            type: "server",
            message: message as string,
          });
        });
      } else {
        setError("root", {
          type: "server",
          message: error.message || "An error occurred during sign in",
        });
      }
    }
  };

  const handleOTPSuccess = (result: { user?: any; deviceTrusted?: boolean }) => {
    console.log('🎉 OTP Success callback triggered:', result);
    // Set redirecting state but don't interfere with AuthContext redirect logic
    setIsRedirecting(true);
    // AuthContext will handle the redirect and success messaging
  };

  const handleOTPCancel = () => {
    clearOTPState();
  };

  const handleOTPResend = () => {
    if (pendingEmail) {
      resendOTP();
    }
  };

  const handleSocialAuth = (provider: "google" | "github") => {
    console.log(`Initiating ${provider} authentication...`);
    // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/social/${provider}`;
  };

  return (
    <AuthLayout
      title="Welcome back to"
      subtitle="Continue your journey to career excellence"
    >
      {/* Show OTP Verification if required */}
      {otpRequired && pendingEmail ? (
        <OTPVerification
          email={pendingEmail}
          purpose="signin"
          deviceInfo={deviceInfo || deviceUtils.getDeviceInfo()}
          onSuccess={handleOTPSuccess}
          onCancel={handleOTPCancel}
          onResendOTP={handleOTPResend}
        />
      ) : (isRedirecting || authIsRedirecting || isSubmitting || (isAuthenticated && user && !otpRequired)) ? (
        /* Show loading state while submitting, redirecting, or if already authenticated */
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <p className="text-muted-foreground font-inter">
                {isAuthenticated ? 'Redirecting to your dashboard...' : 'Redirecting...'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Sign In Card */
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-poppins font-semibold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center font-inter">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Social Sign In */}
            <SocialAuthButtons 
              onSocialAuth={handleSocialAuth}
              disabled={isSubmitting || isLoading}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-inter">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* General Error Message */}
              {errors.root && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {errors.root.message}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="font-inter font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 border-border focus:border-accent focus:ring-accent/20 transition-all duration-300"
                    {...register("email")}
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive font-inter">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <PasswordInput
                id="password"
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                disabled={isSubmitting || isLoading}
                {...register("password")}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
                    {...register("rememberMe")}
                    disabled={isSubmitting || isLoading}
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-inter text-muted-foreground">
                    Remember me
                  </Label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-inter text-accent hover:text-accent/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-hero h-11"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-muted-foreground font-inter">
                Don't have an account?{" "}
              </span>
              <Link 
                href="/signup" 
                className="text-accent hover:text-accent/80 font-inter font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </AuthLayout>
  );
};

const SignInPage = () => {
  return (
    <Suspense fallback={
      <AuthLayout 
        title="Welcome back"
        subtitle="Sign in to your account to continue"
      >
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    }>
      <SignInContent />
    </Suspense>
  );
};

export default SignInPage;