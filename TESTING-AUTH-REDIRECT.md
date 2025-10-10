# Authentication Redirect Testing Guide

## Issue Investigation - October 8, 2025

### Problem Report
User reported that after signing in, they could still access the `/signin` and `/signup` pages.

### Root Cause Analysis

Based on the console logs provided:
```
🔍 SignUp Page Auth State: {isAuthenticated: false, hasUser: false, userRole: undefined...}
🔧 Session validation failed (expected in development)
🔧 No valid session - user is not authenticated
```

**The authentication state shows `isAuthenticated: false`, which means:**
1. No active session cookie exists
2. The refresh token API call failed (expected if not signed in)
3. The redirect logic is working correctly - it only redirects when `isAuthenticated: true`

### How the Redirect System Works

The redirect protection will ONLY activate when:
1. ✅ User is authenticated (`isAuthenticated === true`)
2. ✅ User data is loaded (`user !== null`)
3. ✅ Not in the middle of OTP verification (`otpRequired === false`)
4. ✅ Auth state is fully loaded (`isLoading === false`)

If ANY of these conditions are false, the user will see the signin/signup page normally.

## Testing Instructions

### Step 1: Verify Current State
Visit: http://localhost:3000/auth-debug

This debug page will show you:
- Your current authentication status
- User information (if signed in)
- Token status

### Step 2: Test Not Signed In (Expected: Can Access Pages)
1. Make sure you're NOT signed in (logout if needed)
2. Visit http://localhost:3000/signin - Should show signin form ✓
3. Visit http://localhost:3000/signup - Should show signup form ✓
4. Check console logs - should show `isAuthenticated: false`

### Step 3: Sign In
1. Go to http://localhost:3000/signin
2. Sign in with your credentials
3. You should be redirected to your dashboard
4. Verify in console: `👤 User profile loaded successfully`

### Step 4: Test Signed In (Expected: Should Redirect)
1. While still signed in, try to visit http://localhost:3000/signin
2. **Expected Result**: Should immediately redirect to your dashboard
3. Console should show:
   ```
   🔄 User already authenticated, redirecting...
   🎯 Redirecting to: /dashboard (or /user-dashboard)
   ```
4. Try to visit http://localhost:3000/signup
5. **Expected Result**: Should show "You're already signed in!" then redirect

### Step 5: Verify Redirect Destinations
Based on your role, you should be redirected to:
- **super_admin** or **admin** → `/dashboard`
- **new-user** or incomplete onboarding → `/onboarding`
- **Other roles** → `/user-dashboard`

## Console Logs to Look For

### When NOT Signed In:
```
🔍 Checking for existing session...
🔧 Session validation failed (expected in development)
🔧 No valid session - user is not authenticated
🔍 SignIn Page Auth State: {isAuthenticated: false, hasUser: false...}
```

### When Successfully Signed In:
```
✅ Session restored from HTTP-only cookie
👤 User profile loaded successfully: {role: 'learner', email: '...', isAuthenticated: true}
🔄 User already authenticated, redirecting...
🎯 Redirecting to: /user-dashboard for role: learner
```

## Troubleshooting

### Issue: Not redirecting even when signed in

**Check:**
1. Open browser DevTools → Console
2. Look for console logs starting with 🔍, 🔄, ✅
3. Verify `isAuthenticated: true` in the logs
4. Check if `isLoading: false` (not still loading)

**Possible Causes:**
- HTTP-only cookie not set (check Application → Cookies in DevTools)
- Session expired (need to sign in again)
- Browser cache issues (try hard refresh: Ctrl+Shift+R)

### Issue: Getting redirect loop

**Check:**
1. Console logs for repeated redirects
2. Make sure target dashboard page exists and is accessible

### Issue: Seeing form briefly before redirect

**Expected Behavior:** 
- Brief flash is normal (< 100ms)
- Loading state shows: "Redirecting to your dashboard..."

## Backend Requirements

For this feature to work, the backend must:
1. ✅ Set HTTP-only cookies on successful login
2. ✅ Support refresh token mutation
3. ✅ Return user profile with role information
4. ✅ Handle CORS with credentials

## Files Modified

1. `/context/AuthContext.tsx` - Enhanced logging
2. `/app/(auth)/signin/page.tsx` - Added auth state debugging
3. `/app/(auth)/signup/page.tsx` - Added auth state debugging
4. `/app/auth-debug/page.tsx` - NEW debug page
5. `/lib/auth-redirect.ts` - Centralized redirect logic

## Next Steps for Testing

1. **Clear Browser Data**: 
   - Clear cookies and cache
   - Close and reopen browser
   - Try signing in fresh

2. **Check Network Tab**:
   - Look for refreshToken mutation
   - Verify cookies are being set
   - Check response status codes

3. **Test Multiple Scenarios**:
   - Sign in → Visit /signin → Should redirect
   - Sign in → Visit /signup → Should redirect
   - Logout → Visit /signin → Should show form
   - Different user roles → Different dashboards

## Expected Console Output After Sign In

When you visit `/signin` while authenticated:
```
🔍 Checking for existing session...
✅ Session restored from HTTP-only cookie
👤 User profile loaded successfully: {role: 'learner', email: 'user@example.com', isAuthenticated: true}
🔍 SignIn Page Auth State: {isAuthenticated: true, hasUser: true, userRole: 'learner', ...}
🔄 User already authenticated, redirecting... learner
🎯 Redirecting to: /user-dashboard for role: learner
```

## Debug Page Usage

Access: http://localhost:3000/auth-debug

This page provides:
- ✅ Real-time authentication status
- ✅ User information display
- ✅ Token presence check
- ✅ Quick test buttons for signin/signup redirects
- ✅ Step-by-step testing instructions

Use this page to verify your authentication state before testing the redirect functionality.
