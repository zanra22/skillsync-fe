"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import Brand from "@/components/Brand";
import Logo from "@/components/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-poppins font-bold">
            <span className="text-white block">{title}</span>
            <Brand />
          </h1>
          <p className="text-white/80 font-inter text-lg mt-4">
            {subtitle}
          </p>
        </div>

        {children}

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
}
