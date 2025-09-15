"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Home, LogIn, ShieldX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Unauthorized() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-amber-500/20 to-red-500/20 rounded-full flex items-center justify-center">
              <ShieldX className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-3xl font-poppins font-bold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">
                401 - Unauthorized
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2 font-inter">
                You don't have permission to access this resource.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm font-inter">
                {isAuthenticated 
                  ? "You don't have the required permissions for this page." 
                  : "Please sign in to your account or contact an administrator if you believe this is an error."
                }
              </p>
            </div>
            
            <div className="space-y-3">
              {isAuthenticated ? (
                <Button 
                  asChild 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium transition-all duration-200"
                >
                  <Link href={user?.role === 'super_admin' || user?.role === 'admin' ? '/dashboard' : '/user-dashboard'}>
                    <Shield className="w-4 h-4 mr-2" />
                    Go to Your Dashboard
                  </Link>
                </Button>
              ) : (
                <Button 
                  asChild 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all duration-200"
                >
                  <Link href="/signin">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                asChild
                className="w-full border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="text-center">
                <p className="text-slate-500 text-xs font-inter mb-2">
                  Don't have an account?
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  <Link href="/signup">
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
