/**
 * Test Apollo Client Integration
 * Run this to verify the Apollo Client setup is working correctly
 */

import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';

// Create a simple Apollo Client for testing
const httpLink = createHttpLink({
  uri: 'http://127.0.0.1:8000/graphql/', // Your Django GraphQL endpoint
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// Simple test query
const TEST_QUERY = gql`
  query TestConnection {
    admin {
      userStats {
        totalUsers
        activeUsers
        instructorUsers
        newlyRegisteredUsers
      }
    }
  }
`;

async function testApolloIntegration() {
  try {
    console.log('🚀 Testing Apollo Client integration...');
    console.log('📡 Connecting to: http://localhost:8000/graphql');
    
    // Test the client connection
    const result = await client.query({
      query: TEST_QUERY,
      fetchPolicy: 'network-only',
    });

    console.log('✅ Apollo Client successfully connected!');
    console.log('📊 User Stats:', JSON.stringify(result.data, null, 2));
    
    return result.data;
  } catch (error) {
    console.error('❌ Apollo Client integration failed:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    
    // Common issues and solutions
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your Django server is running on http://localhost:8000');
    console.log('2. Check that GraphQL endpoint is accessible at /graphql');
    console.log('3. Verify CORS settings allow requests from your frontend');
    console.log('4. Ensure your admin schema is properly configured');
    
    throw error;
  }
}

// Export for testing
export { testApolloIntegration };

// Run the test automatically
testApolloIntegration()
  .then(() => console.log('🎉 Test completed successfully'))
  .catch(() => console.log('💥 Test failed - check troubleshooting steps above'));