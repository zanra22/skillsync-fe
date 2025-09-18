/**
 * Development helper for authentication persistence during hot reloads
 * This helps maintain authentication state during development to reduce friction
 */

const DEV_AUTH_KEY = 'skillsync-dev-auth-state';

export interface DevAuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  timestamp: number;
}

export const devAuthHelper = {
  /**
   * Save auth state to localStorage for development persistence
   */
  save: (isAuthenticated: boolean, userRole: string | null) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const state: DevAuthState = {
        isAuthenticated,
        userRole,
        timestamp: Date.now()
      };
      localStorage.setItem(DEV_AUTH_KEY, JSON.stringify(state));
    }
  },

  /**
   * Restore auth state from localStorage (development only)
   * Returns null if not in development or state is too old (>1 hour)
   */
  restore: (): DevAuthState | null => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        const stored = localStorage.getItem(DEV_AUTH_KEY);
        if (stored) {
          const state: DevAuthState = JSON.parse(stored);
          // Check if state is less than 1 hour old
          const maxAge = 60 * 60 * 1000; // 1 hour
          if (Date.now() - state.timestamp < maxAge) {
            return state;
          }
        }
      } catch (error) {
        console.warn('Failed to restore dev auth state:', error);
      }
    }
    return null;
  },

  /**
   * Clear stored auth state
   */
  clear: () => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      localStorage.removeItem(DEV_AUTH_KEY);
    }
  },

  /**
   * Check if we're in development mode
   */
  isDevelopment: () => process.env.NODE_ENV === 'development'
};