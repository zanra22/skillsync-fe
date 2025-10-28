# Frontend Auth & Onboarding Changes Guide

Purpose
-------
This guide documents the frontend changes made to support the updated secure authentication flow and onboarding UX. It explains the files modified, the motivations, and how to reproduce and test the changes locally.

Files modified (summary)
------------------------
- `context/AuthContext.tsx` — central auth state changes; access token stored in memory only; new helpers for refresh and session restoration; improved logout flow.
- `app/api/onboarding/complete/route.ts` — client-side API call shapes and handlers that interact with backend onboarding completion endpoint.
- `app/onboarding/page.tsx` — onboarding UI updates and skeleton-first behavior (redirect patterns, showing skeleton modules while background generation runs).
- `components/Hero.tsx` — CTA and auth-aware UI changes.
- `components/Navigation.tsx` — conditional navigation links based on `AuthContext` state.
- `components/onboarding/ConversationManager.tsx` — conversation flow fixes and progress reporting for onboarding steps.

Design decisions & rationale
---------------------------
1. Memory-only access token
   - Access tokens are short-lived and therefore stored only in React state to reduce XSS surface area.
   - Refresh tokens remain HTTP-only cookies set by the backend; frontend never writes or reads these cookies.

2. Session restoration
   - On initial page load, the app calls a backend `refresh` endpoint that reads the `refresh_token` cookie (HTTP-only) and returns a new access token.
   - This keeps JS from needing to access cookies directly and conforms to secure token rotation patterns.

3. Skeleton-first onboarding UX
   - After onboarding completion, the frontend writes a skeleton roadmap to the UI and returns quickly to the user.
   - Remaining module/lesson generation continues in the background (backend worker path planned separately). Frontend will poll or subscribe to progress updates.

How to reproduce the changes locally
-----------------------------------
1. Start backend dev server (ensure migrations applied):

```powershell
cd e:\Projects\skillsync-latest\skillsync-be
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

2. Start frontend dev server:

```powershell
cd e:\Projects\skillsync-latest\skillsync-fe
bun install
bun dev
```

3. Walkthrough
   - Visit `/auth/login` and perform login. Verify that the login request returns an access token and that `document.cookie` does not show `refresh_token` (HTTP-only).
   - Reload the page to confirm that `AuthContext` calls `checkExistingSession()` which triggers the backend refresh flow to restore the access token in memory.
   - Complete onboarding; you should be redirected to the dashboard with skeleton modules. Use the network tab to inspect background job requests or placeholder requests from the frontend.

Code snippets & examples
------------------------
AuthContext usage example (consumer):

```tsx
import { useAuth } from '../context/AuthContext'

export default function ProfileButton() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Link href="/auth/login">Login</Link>

  return <button>{user?.email}</button>
}
```

Quick test for cookie invisibility (DevTools Console):

```js
// should be false because refresh_token cookie is HTTP-only
document.cookie.includes('refresh_token')
```

Rollback and coordination notes
------------------------------
- If the backend contract (login/refresh response shapes) changes, update `AuthContext` accordingly.
- Coordinate with backend devs: ensure `auth.login` returns access token in response, and `auth.refresh` returns a fresh access token while rotating the refresh cookie.

Recommended follow-ups
----------------------
1. Add automated E2E Playwright tests for:
   - Login + page reload restoring session
   - Onboarding flow + redirect + skeleton behavior

2. Implement backend lazy-enqueue and a worker to process module generation, then wire frontend polling or websockets for real-time progress.

3. Add internal docs linking backend security patterns: `skillsync-be/notes/guides/Hybrid_AI_Refactor_Guide.md` and `AI_Client_Abstraction.md` to cross-reference auth patterns for the full stack.

Change log entry file
---------------------
This guide was created alongside `changelogs/Oct28_2025_Frontend_Auth_Improvements.md` for release notes and developer onboarding.
