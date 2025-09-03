"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Github, Chrome, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signInSchema, type SignInFormData } from "@/lib/validations/auth";
import { useSignIn } from "@/lib/queries/auth";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";
import Logo from "@/components/Logo";

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  
  // TanStack Query mutation
  const signInMutation = useSignIn();
  
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const onSubmit = async (data: SignInFormData) => {
    try {
      await signInMutation.mutateAsync(data);
      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (error: any) {
      // Handle specific field errors from backend
      if (error.details?.fieldErrors) {
        Object.entries(error.details.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof SignInFormData, {
            type: "server",
            message: message as string,
          });
        });
      }
    }
  };

  const handleSocialAuth = (provider: "google" | "github") => {
    // This would typically redirect to the OAuth provider
    // For now, we'll just show a message
    console.log(`Initiating ${provider} authentication...`);
    // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/social/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-40 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-tertiary/15 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Logo */}
      <Link href="/" className="absolute top-6 left-6 z-10">
        <Logo className="w-12 h-10" />
      </Link>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 hover:bg-white/10 transition-colors z-10"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div className="relative w-5 h-5">
          <Sun
            className={`absolute inset-0 h-5 w-5 text-white transition-all duration-300 ${
              theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          <Moon
            className={`absolute inset-0 h-5 w-5 text-white transition-all duration-300 ${
              theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
            }`}
          />
        </div>
      </Button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-poppins font-bold">
            <span className="text-white block">Welcome back to</span>
            <Brand />
          </h1>
          <p className="text-white/80 font-inter text-lg mt-4">
            Continue your journey to career excellence
          </p>
        </div>

        {/* Sign In Card */}
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
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="w-full border-border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
                onClick={() => handleSocialAuth("github")}
                disabled={isSubmitting || signInMutation.isPending}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
                onClick={() => handleSocialAuth("google")}
                disabled={isSubmitting || signInMutation.isPending}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>

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
                    disabled={isSubmitting || signInMutation.isPending}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive font-inter">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-inter font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 border-border focus:border-accent focus:ring-accent/20 transition-all duration-300"
                    {...register("password")}
                    disabled={isSubmitting || signInMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting || signInMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive font-inter">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
                    {...register("rememberMe")}
                    disabled={isSubmitting || signInMutation.isPending}
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
                disabled={isSubmitting || signInMutation.isPending}
              >
                {isSubmitting || signInMutation.isPending ? (
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

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="text-white/80 hover:text-white font-inter transition-colors inline-flex items-center"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;