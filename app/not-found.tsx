"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search, FileX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
              <FileX className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-3xl font-poppins font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                404 - Page Not Found
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2 font-inter">
                The page you're looking for doesn't exist or has been moved.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm font-inter">
                It seems you've ventured into uncharted territory. Let's get you back on track.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all duration-200"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="text-center">
                <p className="text-slate-500 text-xs font-inter mb-2">
                  Need help finding something?
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  <Link href="/search">
                    <Search className="w-3 h-3 mr-1" />
                    Search
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
