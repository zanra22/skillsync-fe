"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, User, Mail, Shield } from "lucide-react";
import Link from "next/link";

export default function AuthDebugPage() {
  const { isAuthenticated, user, isLoading, accessToken } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Authentication Debug Panel
            </CardTitle>
            <CardDescription>
              Check your current authentication status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Authentication Status */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <h3 className="font-semibold">Authentication Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Checking..." : isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAuthenticated ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
              }`}>
                {isAuthenticated ? "SIGNED IN" : "SIGNED OUT"}
              </div>
            </div>

            {/* User Information */}
            {user && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Name</span>
                    </div>
                    <p className="text-sm">{user.firstName} {user.lastName}</p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Role</span>
                    </div>
                    <p className="text-sm font-mono">{user.role}</p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Email Verified</span>
                    </div>
                    <p className="text-sm">{user.emailVerified ? "Yes" : "No"}</p>
                  </div>
                </div>

                {user.profile && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Profile</h4>
                    <div className="text-sm space-y-1">
                      <p>Onboarding Completed: {user.profile.onboarding_completed ? "Yes" : "No"}</p>
                      <p>Onboarding Step: {user.profile.onboarding_step || "N/A"}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Access Token Status */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Access Token</h4>
              <p className="text-sm text-muted-foreground">
                {accessToken ? "Present ✓" : "Not available"}
              </p>
            </div>

            {/* Test Links */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Test Authentication Redirects</h3>
              <p className="text-sm text-muted-foreground">
                If you're signed in, these pages should redirect you to your dashboard:
              </p>
              <div className="flex gap-3">
                <Link href="/signin">
                  <Button variant="outline">Go to Sign In Page</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline">Go to Sign Up Page</Button>
                </Link>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-400">💡 How to Test</h4>
              <ol className="text-sm text-blue-600 dark:text-blue-300 space-y-2 list-decimal list-inside">
                <li>If you're <strong>NOT signed in</strong>: You should be able to access /signin and /signup normally</li>
                <li>If you're <strong>SIGNED IN</strong>: Clicking the buttons above should redirect you to your dashboard</li>
                <li>Try signing in first, then come back to this page and test the buttons</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
