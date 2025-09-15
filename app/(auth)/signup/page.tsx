"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import PasswordInput from "@/components/auth/PasswordInput";
import OTPVerification from "@/components/auth/OTPVerification";
import { deviceUtils } from "@/api/auth/otp";

const SignUpPage = () => {
  const router = useRouter();
  
  // Use AuthContext for secure authentication
  const { signup, isLoading, otpRequired, pendingEmail, verifyOTP, resendOTP, clearOTPState, deviceInfo } = useAuth();
  
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
      firstName: "",
      lastName: "",
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
    // Show success toast
    toast.success("Welcome! Your account has been verified successfully.", {
      description: result.deviceTrusted ? "This device has been marked as trusted." : undefined,
    });
    // Let the AuthContext handle role-based redirect instead of hardcoded '/dashboard'
    // The OTP verification in AuthContext should handle the redirect properly
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

  // Handle redirect when OTP is not required (signup completed successfully)
  useEffect(() => {
    if (!isLoading && !otpRequired && !pendingEmail) {
      // If we just completed signup without needing OTP, redirect to signin
      const hasJustSignedUp = localStorage.getItem('justSignedUp');
      if (hasJustSignedUp) {
        localStorage.removeItem('justSignedUp');
        toast.success("Account created successfully!", {
          description: "Please check your email to verify your account.",
        });
        router.push("/signin");
      }
    }
  }, [isLoading, otpRequired, pendingEmail, router]);

  return (
    <AuthLayout
      title="Join"
      subtitle="Start your journey to career excellence"
    >
      {/* Show OTP Verification if required */}
      {otpRequired && pendingEmail ? (
        <OTPVerification
          email={pendingEmail}
          purpose="signup"
          deviceInfo={deviceInfo || deviceUtils.getDeviceInfo()}
          onSuccess={handleOTPSuccess}
          onCancel={handleOTPCancel}
          onResendOTP={handleOTPResend}
        />
      ) : (
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
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-inter font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all duration-300"
                    {...register("firstName")}
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive font-inter">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-inter font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all duration-300"
                    {...register("lastName")}
                    disabled={isSubmitting || isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive font-inter">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

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
      )}
    </AuthLayout>
  );
};

export default SignUpPage;
