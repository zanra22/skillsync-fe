"use client";
import { useState, useEffect } from "react";
import { authApi } from "@/api/auth/signin";

export default function AuthTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setAccessToken(localStorage.getItem("accessToken"));
  }, []);

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await authApi.signIn({
        email: "admin1@gmail.com", // Using the test credentials
        password: "123",
        rememberMe: true,
      });

      setResult(response);
      console.log("Login successful:", response);
      
      // Store the access token in localStorage
      if (response.tokens.accessToken) {
        localStorage.setItem("accessToken", response.tokens.accessToken);
        localStorage.setItem("tokenExpiry", (Date.now() + response.tokens.expiresIn * 1000).toString());
        console.log("✅ Access token stored in localStorage");
      }
      
      // Update local token state
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    } catch (err: any) {
      setError(err.message);
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const testUsers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // First test the GraphQL endpoint directly
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
      setResult(data);
      console.log("Users query result:", data);
    } catch (err: any) {
      setError(err.message);
      console.error("Users query failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenExpiry");
    setAccessToken(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Authentication Test</h1>
      
      <div className="grid gap-4 mb-8">
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
        >
          {loading ? "Testing Login..." : "Test Login"}
        </button>
        
        <button
          onClick={testUsers}
          disabled={loading || !accessToken}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
        >
          {loading ? "Testing Users Query..." : "Test Users Query"}
        </button>
        
        <button
          onClick={clearTokens}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md"
        >
          Clear Tokens
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <strong>Access Token:</strong>
          <p className="text-sm text-gray-600 break-all">
            {isClient ? (accessToken || "None") : "Loading..."}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-gray-100 p-4 rounded-md">
            <strong>Result:</strong>
            <pre className="text-sm mt-2 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
