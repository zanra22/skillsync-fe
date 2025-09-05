// Simple GraphQL test script for browser console

async function testGraphQLConnection() {
  try {
    const response = await fetch("http://localhost:8000/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        query: `
          query Health {
            health
          }
        `,
      }),
    });

    const data = await response.json();
    console.log("GraphQL Health Check:", data);
    return data;
  } catch (error) {
    console.error("GraphQL Connection Error:", error);
    return { error: error.message };
  }
}

async function testLogin() {
  try {
    const response = await fetch("http://localhost:8000/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        query: `
          mutation Login($input: LoginInput!) {
            auth {
              login(input: $input) {
                success
                message
                user {
                  id
                  email
                  username
                  role
                }
                accessToken
                expiresIn
              }
            }
          }
        `,
        variables: {
          input: {
            email: "admin1@gmail.com",
            password: "123",
            rememberMe: true,
          },
        },
      }),
    });

    const data = await response.json();
    console.log("Login Test:", data);
    
    if (data.data?.auth?.login?.accessToken) {
      localStorage.setItem("accessToken", data.data.auth.login.accessToken);
      console.log("✅ Access token stored in localStorage");
    }
    
    return data;
  } catch (error) {
    console.error("Login Test Error:", error);
    return { error: error.message };
  }
}

// Export functions for browser console use
window.testGraphQLConnection = testGraphQLConnection;
window.testLogin = testLogin;

console.log("🚀 GraphQL Test Functions Loaded!");
console.log("Run testGraphQLConnection() to test basic connection");
console.log("Run testLogin() to test authentication");
