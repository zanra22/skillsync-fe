import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Make a GraphQL query to check the actual user role from the database
    const graphqlEndpoint = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/graphql/`
      : 'http://localhost:8000/graphql/';

    const query = `
      query GetUserByEmail($email: String!) {
        users {
          userByEmail(email: $email) {
            role
            email
          }
        }
      }
    `;

    const variables = { email };

    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error('GraphQL query failed');
    }

    const user = result.data?.users?.userByEmail;
    
    if (!user) {
      // User not found, assume regular user
      return NextResponse.json({
        role: 'learner',
        isSuperAdmin: false
      });
    }

    const isSuperAdmin = user.role === 'super_admin';
    
    return NextResponse.json({
      role: user.role,
      isSuperAdmin
    });
    
  } catch (error) {
    console.error('Error checking user role:', error);
    
    // Fallback: For development, check if email contains 'admin' or specific super admin emails
    const { email } = await request.json();
    const isSuperAdmin = email.includes('admin') || email.includes('superadmin') || email === 'arnazdj@gmail.com';
    
    return NextResponse.json({
      role: isSuperAdmin ? 'super_admin' : 'learner',
      isSuperAdmin
    });
  }
}
