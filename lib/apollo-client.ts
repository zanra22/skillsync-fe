import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// HTTP link for GraphQL endpoint
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "https://skillsync-graphql-e2dpdxhgebeqhhhk.southeastasia-01.azurewebsites.net",
  credentials: 'include', // ✅ CRITICAL: Send cookies with every request
});

// Auth link to include authorization headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from localStorage or wherever you store it
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    }
  }
});

// Error link for handling GraphQL and network errors
const errorLink = onError((errorResponse: any) => {
  if (errorResponse.graphQLErrors) {
    errorResponse.graphQLErrors.forEach((error: any) => {
      console.error(
        `[GraphQL error]: Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`,
      );
    });
  }

  if (errorResponse.networkError) {
    console.error(`[Network error]: ${errorResponse.networkError}`);
    
    // Handle authentication errors
    if (errorResponse.networkError.statusCode === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }
  }
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([
    errorLink,
    authLink,
    httpLink,
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      // Configure caching policies for admin queries
      Query: {
        fields: {
          admin: {
            merge: true,
          },
        },
      },
      AdminUserDetailType: {
        // Use id as the cache key
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Helper function to clear cache and logout
export const clearCacheAndLogout = () => {
  apolloClient.clearStore();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  }
};

export default apolloClient;