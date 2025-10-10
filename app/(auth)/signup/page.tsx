"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, ArrowRight, User, CheckCircle } from "lucide-react";
import Link from "next/link";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import PasswordInput from "@/components/auth/PasswordInput";
import OTPVerification from "@/components/auth/OTPVerification";
import { deviceUtils } from "@/api/auth/otp";
import { getDashboardUrl } from "@/lib/auth-redirect";

const SignUpPage = () => {
  const router = useRouter();
  
  // Use AuthContext for secure authentication
  const { signup, isLoading, otpRequired, pendingEmail, verifyOTP, resendOTP, clearOTPState, deviceInfo, isAuthenticated, user } = useAuth();
  
  // Add success state to prevent signup form flash
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [otpFlowStarted, setOtpFlowStarted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Debug logging for authentication state
  useEffect(() => {
    console.log('🔍 SignUp Page Auth State:', {
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      otpRequired,
      isLoading,
      isRedirecting
    });
  }, [isAuthenticated, user, otpRequired, isLoading, isRedirecting]);
  
  // Redirect authenticated users immediately
  useEffect(() => {
    // Wait for loading to complete before checking
    if (isLoading) {
      console.log('⏳ Still loading auth state, waiting...');
      return;
    }
    
    if (isAuthenticated && user && !otpRequired) {
      console.log('🔄 User already authenticated on signup page, redirecting...', user.role);
      setIsRedirecting(true);
      
      // Use the centralized redirect utility
      const targetUrl = getDashboardUrl(user);
      console.log('🎯 Redirecting authenticated user to:', targetUrl);
      
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 100);
    }
  }, [isAuthenticated, user, otpRequired, isLoading]);
  
  // Check for persistent verification success flag
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const persistentSuccess = sessionStorage.getItem('signup-verification-success');
      if (persistentSuccess === 'true') {
        console.log('🔄 Found persistent verification success flag');
        setVerificationSuccess(true);
      }
    }
  }, []);
  
  // Track when OTP flow starts to prevent form flash
  useEffect(() => {
    if (otpRequired && pendingEmail) {
      console.log('📱 OTP flow started - preventing form flash');
      setOtpFlowStarted(true);
    }
  }, [otpRequired, pendingEmail]);
  
  // Clean up success flag when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('signup-verification-success');
      }
    };
  }, []);
  
  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    clearErrors,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await signup(data);
      
      // Set flag for useEffect to handle redirect if OTP not required
      localStorage.setItem('justSignedUp', 'true');
      
    } catch (error: any) {
      // Show error toast
      toast.error("Sign up failed", {
        description: error.message || "An error occurred during sign up",
      });
      
      // Handle specific field errors from backend
      if (error.details?.fieldErrors) {
        Object.entries(error.details.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof SignUpFormData, {
            type: "server",
            message: message as string,
          });
        });
      } else {
        // Handle general error
        setError("root", {
          type: "server",
          message: error.message || "An error occurred during sign up",
        });
      }
    }
  };

  const handleOTPSuccess = (result: { user?: any; deviceTrusted?: boolean }) => {
    console.log('🎉 OTP Success - Setting verification success state');
    
    // Show success toast
    toast.success("Welcome! Your account has been verified successfully.", {
      description: result.deviceTrusted ? "This device has been marked as trusted." : undefined,
    });
    
    // Set persistent flag in sessionStorage to ensure success state persists
    sessionStorage.setItem('signup-verification-success', 'true');
    
    // Set success state to show loading screen - this should prevent any form rendering
    setVerificationSuccess(true);
    console.log('✅ Verification success state set to true');
    
    // Don't clear OTP state immediately - let AuthContext handle it
    // This prevents race conditions
    console.log('⏳ Letting AuthContext handle OTP state clearing and redirect');
    
    // The AuthContext will handle the automatic signin and redirect
    // No additional redirect needed here as AuthContext does it
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
    // window.location.href = `${process.env.NEXT_PUBLIC_GRAPHQL_API_URL}/auth/social/${provider}`;
  };

  // Handle redirect when OTP is not required (signup completed successfully)
  useEffect(() => {
    // DISABLED: Let AuthContext handle all redirects after OTP verification
    // This prevents interfering with the OTP verification flow
    return;
    
    // Only redirect to signin if OTP was never required (non-signup flow)
    // For signup with OTP, the AuthContext handles the redirect after verification
    const pendingSignupData = localStorage.getItem('pending-signup');
    console.log('🔍 Signup useEffect check:', {
      isLoading,
      otpRequired,
      pendingEmail,
      pendingSignupData: !!pendingSignupData,
      hasJustSignedUp: !!localStorage.getItem('justSignedUp')
    });
    
    if (!isLoading && !otpRequired && !pendingEmail && !pendingSignupData) {
      const hasJustSignedUp = localStorage.getItem('justSignedUp');
      if (hasJustSignedUp) {
        console.log('🔄 Redirecting to signin (no OTP flow)');
        localStorage.removeItem('justSignedUp');
        toast.success("Account created successfully!", {
          description: "Please check your email to verify your account.",
        });
        router.push("/signin");
      }
    }
  }, [isLoading, otpRequired, pendingEmail, router]);

  console.log('🔍 Signup render state:', {
    verificationSuccess,
    otpRequired,
    pendingEmail: !!pendingEmail,
    isLoading,
    hasPersistentSuccess: typeof window !== 'undefined' ? sessionStorage.getItem('signup-verification-success') === 'true' : false,
    otpFlowStarted
  });

  // Check if we should show success screen (either from state or sessionStorage)
  const shouldShowSuccess = verificationSuccess || (typeof window !== 'undefined' && sessionStorage.getItem('signup-verification-success') === 'true');
  
  // Check if we should show OTP screen
  const shouldShowOTP = otpRequired && pendingEmail;
  
  // Check if we should show signup form (only if no OTP flow has started and no success)
  const shouldShowSignupForm = !shouldShowSuccess && !shouldShowOTP && !otpFlowStarted && !isRedirecting;

  // Show redirecting state for authenticated users
  if (isRedirecting) {
    return (
      <AuthLayout
        title="Already Signed In"
        subtitle="Redirecting you to your dashboard"
      >
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-accent animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-poppins font-semibold text-foreground">You're already signed in!</h2>
              <p className="text-muted-foreground font-inter mt-2">
                Redirecting you to your dashboard...
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Join"
      subtitle="Start your journey to career excellence"
    >
      {/* Show success screen after verification */}
      {shouldShowSuccess ? (
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-poppins font-semibold text-foreground">Welcome to SkillSync!</h2>
              <p className="text-muted-foreground font-inter mt-2">
                Setting up your personalized learning experience...
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>
      ) : 
      /* Show OTP Verification if required */
      shouldShowOTP ? (
        <OTPVerification
          email={pendingEmail}
          purpose="signup"
          deviceInfo={deviceInfo || deviceUtils.getDeviceInfo()}
          onSuccess={handleOTPSuccess}
          onCancel={handleOTPCancel}
          onResendOTP={handleOTPResend}
        />
      ) : 
      /* Show signup form only if no OTP flow started */
      shouldShowSignupForm ? (
        /* Sign Up Card */
        /* Sign Up Card */
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-poppins font-semibold text-center flex items-center justify-center gap-2">
              <User className="h-6 w-6" />
              Create Account
            </CardTitle>
            <CardDescription className="text-center font-inter">
              Join SkillSync and start your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Social Sign Up */}
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
                  Or create with email
                </span>
              </div>
            </div>

            {/* Sign Up Form */}
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
                placeholder="Create a password"
                error={errors.password?.message}
                disabled={isSubmitting || isLoading}
                {...register("password")}
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                disabled={isSubmitting || isLoading}
                {...register("confirmPassword")}
              />

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  onCheckedChange={(checked) => {
                    setValue("acceptTerms", checked === true);
                    if (checked) {
                      clearErrors("acceptTerms");
                    }
                  }}
                  disabled={isSubmitting || isLoading}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor="acceptTerms" 
                    className="text-sm font-inter text-muted-foreground cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-accent hover:text-accent/80">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-accent hover:text-accent/80">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive font-inter">
                  {errors.acceptTerms.message}
                </p>
              )}

              <Button 
                type="submit" 
                className="w-full btn-hero h-11"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-muted-foreground font-inter">
                Already have an account?{" "}
              </span>
              <Link 
                href="/signin" 
                className="text-accent hover:text-accent/80 font-inter font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Loading fallback */
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="text-muted-foreground font-inter mt-4">Loading...</p>
          </CardContent>
        </Card>
      )}
    </AuthLayout>
  );
};

export default SignUpPage;
