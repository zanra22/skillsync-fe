# 🔐 Secure Role-Based Access Control Guide

## ✅ Why This Approach is More Secure

### **Previous Approach (Middleware + non-HTTP-only cookies):**
```
❌ Middleware checks role from user-role cookie
❌ user-role cookie is NOT HTTP-only
❌ JavaScript can access it (XSS vulnerability)
❌ Malicious code: document.cookie → can steal role
```

### **New Approach (AuthContext + HTTP-only cookies):**
```
✅ Middleware only checks authentication (refresh_token exists)
✅ ALL cookies are HTTP-only (JavaScript cannot access)
✅ Role checks happen in AuthContext (reads from memory)
✅ Malicious code: document.cookie → sees nothing
✅ Access token in React state (cleared on page refresh)
```

---

## 🏗️ Architecture

### **Security Layers:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Middleware (Edge)                                         │
│    - Checks: Is user authenticated? (refresh_token exists)   │
│    - Does NOT check roles                                    │
│    - Redirects unauthenticated users to /signin              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Page Loads                                                │
│    - AuthContext restores session (if refresh_token exists)  │
│    - Calls refreshToken mutation                             │
│    - Gets new access token (stored in memory)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. useRoleGuard Hook (Client-Side)                          │
│    - Reads role from AuthContext (memory)                    │
│    - Checks if user has required role                        │
│    - Redirects if insufficient permissions                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Page Content Renders                                      │
│    - Only if all checks passed                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Examples

### **Example 1: Admin Dashboard (Super Admin + Admin Only)**

```tsx
// app/dashboard/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  // ✅ SECURITY: Only super_admin and admin can access
  useRoleGuard(['super_admin', 'admin']);
  
  const { user, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

---

### **Example 2: User Dashboard (Multiple Roles)**

```tsx
// app/user-dashboard/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';

export default function UserDashboard() {
  // ✅ Allow learners, mentors, premium users, etc.
  useRoleGuard([
    'learner',
    'mentor',
    'premium_user',
    'vip_mentor',
    'hr_manager',
    'recruiter'
  ]);
  
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <p>Your role: {user?.role}</p>
    </div>
  );
}
```

---

### **Example 3: Settings (All Authenticated Users)**

```tsx
// app/settings/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function Settings() {
  // ✅ All authenticated users can access settings
  useRoleGuard([
    'super_admin',
    'admin',
    'moderator',
    'learner',
    'mentor',
    'premium_user',
    'vip_mentor',
    'hr_manager',
    'recruiter'
  ]);
  
  return (
    <div>
      <h1>Settings</h1>
      {/* Settings content */}
    </div>
  );
}
```

---

### **Example 4: Conditional Rendering Based on Role**

```tsx
// app/profile/page.tsx
'use client';

import { useRoleGuard, useHasRole } from '@/hooks/useRoleGuard';

export default function Profile() {
  // All authenticated users can access profile
  useRoleGuard([
    'super_admin', 'admin', 'moderator',
    'learner', 'mentor', 'premium_user',
    'vip_mentor', 'hr_manager', 'recruiter'
  ]);
  
  // Check specific permissions for UI elements
  const isAdmin = useHasRole(['super_admin', 'admin']);
  const isMentor = useHasRole(['mentor', 'vip_mentor']);

  return (
    <div>
      <h1>Profile</h1>
      
      {/* Show admin panel only to admins */}
      {isAdmin && (
        <section>
          <h2>Admin Controls</h2>
          <button>Manage Users</button>
        </section>
      )}
      
      {/* Show mentor features only to mentors */}
      {isMentor && (
        <section>
          <h2>Mentorship Dashboard</h2>
          <button>View Mentees</button>
        </section>
      )}
      
      {/* Everyone sees this */}
      <section>
        <h2>General Settings</h2>
        <button>Edit Profile</button>
      </section>
    </div>
  );
}
```

---

### **Example 5: Onboarding (Special Case)**

```tsx
// app/onboarding/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function Onboarding() {
  // ✅ New users and anyone who needs to complete onboarding
  useRoleGuard([
    'new-user',  // New users who haven't completed onboarding
    'learner',   // Existing users can also access to update preferences
    'mentor',
    'premium_user',
    'vip_mentor',
    'hr_manager',
    'recruiter'
  ]);
  
  return (
    <div>
      <h1>Complete Your Profile</h1>
      {/* Onboarding steps */}
    </div>
  );
}
```

---

## 🔄 How Session Restoration Works

### **Flow:**

1. **User visits protected page** (e.g., `/user-dashboard`)

2. **Middleware checks:**
   ```typescript
   const hasRefreshToken = request.cookies.has('refresh_token');
   if (!hasRefreshToken) {
     redirect('/signin'); // No session
   }
   // Has refresh_token, allow through
   ```

3. **Page loads, AuthContext runs:**
   ```typescript
   useEffect(() => {
     checkExistingSession(); // Tries to restore session
   }, []);
   ```

4. **checkExistingSession calls refreshToken mutation:**
   ```typescript
   // Backend reads HTTP-only refresh_token cookie
   // Returns new access token
   // Frontend stores in React state (memory)
   setAuthState(prev => ({
     ...prev,
     accessToken: newToken,
     isAuthenticated: true
   }));
   ```

5. **useRoleGuard checks role:**
   ```typescript
   const userRole = user.role; // From memory
   if (!allowedRoles.includes(userRole)) {
     redirect('/unauthorized');
   }
   // Role matches, render page
   ```

---

## 🧪 Testing

### **Test 1: Verify ALL Cookies Are HTTP-Only**

After login, check DevTools → Application → Cookies:

```
✅ refresh_token: HttpOnly ✓
✅ client_fp: HttpOnly ✓
✅ fp_hash: HttpOnly ✓
❌ NO user-role cookie (removed for security)
```

### **Test 2: Verify JavaScript Cannot Access Auth Data**

Open Console and try:
```javascript
// Try to read cookies
document.cookie;
// Should NOT show: refresh_token, client_fp, fp_hash

// Try to read from storage
localStorage.getItem('accessToken');  // null
sessionStorage.getItem('accessToken'); // null

// ✅ ALL auth data is secure!
```

### **Test 3: Verify Role-Based Access**

1. **Login as learner**
2. **Try to access `/dashboard` (admin only)**
3. **Expected:** Redirected to `/unauthorized`
4. **Console shows:** `❌ useRoleGuard: Insufficient permissions`

---

## 📊 Security Comparison

| Feature | Old (Middleware) | New (AuthContext) |
|---------|-----------------|-------------------|
| **refresh_token** | HTTP-only ✅ | HTTP-only ✅ |
| **access_token** | Memory ✅ | Memory ✅ |
| **user-role** | Cookie (NOT HTTP-only) ❌ | Memory ✅ |
| **XSS Protection** | Medium ⚠️ | High ✅ |
| **Middleware Access** | Yes | No (auth check only) |
| **Client-Side Access** | Partial (role exposed) | Full (all in memory) |
| **Token Theft Risk** | Medium (role cookie) | Low (all secure) |

---

## 🎯 Migration Checklist

### **Backend Changes:**
- [x] Remove `user-role` cookie from `secure_utils.py`
- [x] Keep `refresh_token`, `client_fp`, `fp_hash` HTTP-only
- [x] OTP verification returns `access_token`

### **Frontend Changes:**
- [x] Simplify middleware (only auth check, no role check)
- [x] Create `useRoleGuard` hook
- [x] Create `useHasRole` helper
- [ ] Update protected pages to use `useRoleGuard`

### **Pages to Update:**
- [ ] `/app/dashboard/page.tsx` - Add `useRoleGuard(['super_admin', 'admin'])`
- [ ] `/app/user-dashboard/page.tsx` - Add `useRoleGuard([...])`
- [ ] `/app/admin/page.tsx` - Add role guard
- [ ] `/app/settings/page.tsx` - Add role guard
- [ ] `/app/onboarding/page.tsx` - Add role guard

---

## 🚀 Next Steps

1. **Restart backend server** (apply secure_utils.py changes)
2. **Clear browser cookies** (remove old user-role cookie)
3. **Test login flow** (verify NO user-role cookie set)
4. **Update protected pages** (add useRoleGuard hooks)
5. **Test role-based access** (try accessing unauthorized pages)

---

## ✅ Final Security Checklist

After implementation:
- [ ] ALL cookies are HTTP-only (no exceptions)
- [ ] JavaScript cannot read auth data (`document.cookie` shows nothing)
- [ ] Access token only in React state (cleared on refresh)
- [ ] Role checks happen client-side (AuthContext)
- [ ] Middleware only checks authentication (not roles)
- [ ] XSS attacks cannot steal auth credentials

---

*Secure by Design - October 8, 2025*
