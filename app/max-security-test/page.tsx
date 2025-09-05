"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTokenRefresh, useSecurityMonitoring, useAutoLogoutOnClose } from "@/hooks/use-security";

export default function MaxSecurityAuthTestPage() {
  const { 
    user, 
    accessToken, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout,
    tokenExpiresAt,
    isTokenExpiringSoon
  } = useAuth();
  
  // Enable all automatic security features
  useTokenRefresh();
  useSecurityMonitoring();
  useAutoLogoutOnClose();
  
  const [loginLoading, setLoginLoading] = useState(false);
  const [usersResult, setUsersResult] = useState<any>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('');

  // Update time until token expiry every second
  useEffect(() => {
    if (!tokenExpiresAt) {
      setTimeUntilExpiry('');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = tokenExpiresAt - now;
      
      if (timeLeft <= 0) {
        setTimeUntilExpiry('Expired');
      } else {
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        setTimeUntilExpiry(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tokenExpiresAt]);

  const handleLogin = async () => {
    setLoginLoading(true);
    setError(null);
    
    try {
      await login("admin1@gmail.com", "123", true);
    } catch (err: any) {
      setError(err.message);
      console.error("Login failed:", err);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUsersResult(null);
      setError(null);
    } catch (err: any) {
      console.error("Logout error:", err);
    }
  };

  const testUsersQuery = async () => {
    if (!accessToken) {
      setError("No access token available");
      return;
    }

    setUsersLoading(true);
    setError(null);
    setUsersResult(null);

    try {
      const response = await fetch("http://localhost:8000/graphql/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          query: `
            query GetUsers {
              users {
                users {
                  id
                  email
                  username
                  role
                  accountStatus
                }
              }
            }
          `,
        }),
      });

      const data = await response.json();
      setUsersResult(data);
      console.log("Users query result:", data);
    } catch (err: any) {
      setError(err.message);
      console.error("Users query failed:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl">Loading authentication state...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">🛡️ Maximum Security Authentication Test</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🔒 Enhanced Security Features:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Access tokens in memory only (5-minute expiry)</li>
          <li>✅ Refresh tokens in HTTP-only cookies</li>
          <li>✅ Automatic token refresh every 4 minutes</li>
          <li>✅ Token rotation on every refresh</li>
          <li>✅ Client fingerprinting validation</li>
          <li>✅ Rate limiting protection</li>
          <li>✅ Security monitoring & suspicious activity detection</li>
          <li>✅ Auto-logout on browser close</li>
        </ul>
      </div>

      <div className="grid gap-4 mb-8">
        {!isAuthenticated ? (
          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
          >
            {loginLoading ? "Logging in..." : "🔐 Login with Maximum Security"}
          </button>
        ) : (
          <>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md"
            >
              🚪 Secure Logout
            </button>
            
            <button
              onClick={testUsersQuery}
              disabled={usersLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
            >
              {usersLoading ? "Testing Protected Query..." : "🔍 Test Protected Query"}
            </button>
          </>
        )}
      </div>

      {/* Enhanced Authentication Status */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Authentication Status</h3>
            <p className={`text-sm ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Access Token</h3>
            <p className={`text-sm ${accessToken ? 'text-green-600' : 'text-gray-600'}`}>
              {accessToken ? '🔐 Token in Memory' : '🚫 No Token'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Token Expiry</h3>
            <p className={`text-sm ${isTokenExpiringSoon() ? 'text-orange-600' : 'text-green-600'}`}>
              {timeUntilExpiry ? `⏰ ${timeUntilExpiry}` : '⏰ No active token'}
            </p>
          </div>
        </div>

        {user && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold mb-2">👤 Current User</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Name:</strong> {user.firstName}</div>
              <div><strong>Role:</strong> {user.role}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {usersResult && (
          <div className="bg-gray-100 p-4 rounded-md">
            <strong>🔍 Protected Query Result:</strong>
            <pre className="text-sm mt-2 overflow-auto max-h-96">
              {JSON.stringify(usersResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">🛡️ Security Test Instructions:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li><strong>Token Expiry Test:</strong> Watch the timer count down - token will auto-refresh at 1 minute</li>
            <li><strong>Rate Limiting Test:</strong> Try logging in with wrong credentials 6 times quickly</li>
            <li><strong>Session Hijacking Test:</strong> Check browser DevTools for fingerprint validation</li>
            <li><strong>Auto-Logout Test:</strong> Leave page open for 30+ minutes with no activity</li>
            <li><strong>Browser Close Test:</strong> Close browser and reopen - should require re-authentication</li>
            <li><strong>Cookie Security Test:</strong> Check DevTools → Application → Cookies for HttpOnly flags</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2">🎯 Security Achievements Unlocked:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <span className="bg-green-200 px-2 py-1 rounded">🔐 Memory-Only Tokens</span>
            <span className="bg-green-200 px-2 py-1 rounded">🍪 HTTP-Only Cookies</span>
            <span className="bg-green-200 px-2 py-1 rounded">🔄 Token Rotation</span>
            <span className="bg-green-200 px-2 py-1 rounded">👆 Fingerprinting</span>
            <span className="bg-green-200 px-2 py-1 rounded">⏱️ Short Expiry</span>
            <span className="bg-green-200 px-2 py-1 rounded">🚫 Rate Limiting</span>
            <span className="bg-green-200 px-2 py-1 rounded">🔍 Activity Monitoring</span>
            <span className="bg-green-200 px-2 py-1 rounded">🚪 Auto-Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
