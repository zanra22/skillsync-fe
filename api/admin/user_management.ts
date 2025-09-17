import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

// TypeScript interfaces for GraphQL responses
interface UserStats {
  totalUsers: number;
  activeUsers: number;
  instructorUsers: number;
  newlyRegisteredUsers: number;
  suspendedUsers: number;
  blockedUsers: number;
  emailVerifiedUsers: number;
  premiumUsers: number;
  lastUpdated: string;
}

interface UserStatsResponse {
  admin: {
    userStats: UserStats;
  };
}

interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
  accountStatus: string;
  isActive: boolean;
  isSuspended: boolean;
  isBlocked: boolean;
  isPremium: boolean;
  isEmailVerified: boolean;
  dateJoined: string;
  lastLogin?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  accountAgeDays: number;
  isNewlyRegistered: boolean;
}

interface PaginatedUsersResponse {
  admin: {
    paginatedUsers: {
      users: AdminUser[];
      totalCount: number;
      totalPages: number;
      currentPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

// GraphQL Queries
export const GET_ADMIN_USER_STATS = gql`
  query GetAdminUserStats($newlyRegisteredDays: Int = 30) {
    admin {
      userStats(newlyRegisteredDays: $newlyRegisteredDays) {
        totalUsers
        activeUsers
        instructorUsers
        newlyRegisteredUsers
        suspendedUsers
        blockedUsers
        emailVerifiedUsers
        premiumUsers
        lastUpdated
      }
    }
  }
`;

export const GET_ADMIN_USERS_PAGINATED = gql`
  query GetAdminUsersPaginated(
    $filters: UserFilterInput
    $pagination: PaginationInput
  ) {
    admin {
      paginatedUsers(filters: $filters, pagination: $pagination) {
        users {
          id
          email
          username
          role
          accountStatus
          isActive
          isSuspended
          isBlocked
          isPremium
          isEmailVerified
          dateJoined
          lastLogin
          firstName
          lastName
          displayName
          accountAgeDays
          isNewlyRegistered
        }
        totalCount
        totalPages
        currentPage
        pageSize
        hasNext
        hasPrevious
      }
    }
  }
`;

export const ADMIN_UPDATE_USER = gql`
  mutation AdminUpdateUser($userId: String!, $input: AdminUserUpdateInput!) {
    admin {
      updateUser(userId: $userId, input: $input) {
        success
        message
        user {
          id
          email
          username
          role
          accountStatus
          isActive
          isSuspended
          displayName
        }
      }
    }
  }
`;

export const ADMIN_SUSPEND_USER = gql`
  mutation AdminSuspendUser($userId: String!, $reason: String) {
    admin {
      suspendUser(userId: $userId, reason: $reason) {
        success
        message
        user {
          id
          username
          email
          isActive
          isSuspended
          displayName
        }
      }
    }
  }
`;

// TypeScript interfaces
export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  instructorUsers: number;
  newlyRegisteredUsers: number;
  suspendedUsers: number;
  blockedUsers: number;
  emailVerifiedUsers: number;
  premiumUsers: number;
  lastUpdated: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  username: string;
  role: string;
  accountStatus: string;
  isActive: boolean;
  isSuspended: boolean;
  isBlocked: boolean;
  isPremium: boolean;
  isEmailVerified: boolean;
  dateJoined: string;
  lastLogin?: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  accountAgeDays: number;
  isNewlyRegistered: boolean;
}

export interface AdminUserUpdateInput {
  email?: string;
  username?: string;
  role?: string;
  accountStatus?: string;
  isActive?: boolean;
  isSuspended?: boolean;
  isBlocked?: boolean;
  isPremium?: boolean;
}

export interface UserFilterInput {
  search?: string;
  role?: string;
  accountStatus?: string;
  isActive?: boolean;
  isPremium?: boolean;
  isEmailVerified?: boolean;
}

export interface PaginationInput {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

// Apollo Client Hooks
export const useAdminUserStats = (newlyRegisteredDays: number = 30) => {
  return useQuery<UserStatsResponse>(GET_ADMIN_USER_STATS, {
    variables: { newlyRegisteredDays },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
};

export const useAdminUsersPaginated = (
  filters?: UserFilterInput,
  pagination?: PaginationInput
) => {
  return useQuery<PaginatedUsersResponse>(GET_ADMIN_USERS_PAGINATED, {
    variables: { filters, pagination },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
};

export const useAdminUpdateUser = () => {
  return useMutation(ADMIN_UPDATE_USER, {
    refetchQueries: [GET_ADMIN_USERS_PAGINATED, GET_ADMIN_USER_STATS],
    errorPolicy: 'all',
  });
};

export const useAdminSuspendUser = () => {
  return useMutation(ADMIN_SUSPEND_USER, {
    refetchQueries: [GET_ADMIN_USERS_PAGINATED, GET_ADMIN_USER_STATS],
    errorPolicy: 'all',
  });
};