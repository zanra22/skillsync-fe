"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SecureAuthTestPage() {
  const { 
    user, 
    accessToken, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout 
  } = useAuth();
  
  const [loginLoading, setLoginLoading] = useState(false);
  const [usersResult, setUsersResult] = useState<any>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <h1 className="text-3xl font-bold mb-8">🔒 Secure Authentication Test</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Security Features:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Access tokens stored in memory (React state)</li>
          <li>✅ Refresh tokens in HTTP-only cookies</li>
          <li>✅ No localStorage usage</li>
          <li>✅ Automatic session cleanup on page refresh</li>
        </ul>
      </div>

      <div className="grid gap-4 mb-8">
        {!isAuthenticated ? (
          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
          >
            {loginLoading ? "Logging in..." : "🔑 Login with Memory Storage"}
          </button>
        ) : (
          <>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md"
            >
              🚪 Logout
            </button>
            
            <button
              onClick={testUsersQuery}
              disabled={usersLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
            >
              {usersLoading ? "Testing Users Query..." : "🔍 Test Protected Query"}
            </button>
          </>
        )}
      </div>

      {/* Authentication Status */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Authentication Status</h3>
            <p className={`text-sm ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Access Token</h3>
            <p className="text-sm text-gray-600">
              {accessToken ? '🔐 Token in Memory' : '🚫 No Token'}
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
          <h3 className="font-semibold mb-2">🔒 Security Notes:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Refresh the page to see how tokens are automatically cleared from memory</li>
            <li>Check browser DevTools → Application → Local Storage (should be empty)</li>
            <li>Only refresh token persists in HTTP-only cookies (not accessible via JS)</li>
            <li>Access token automatically expires and requires refresh</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
