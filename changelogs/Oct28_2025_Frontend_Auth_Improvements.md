# Changelog - Oct 28, 2025: Frontend Auth & Onboarding Improvements

Summary
-------
This changelog documents a set of UX and auth-related frontend changes made to the Next.js app on Oct 28, 2025. The work improves onboarding completion handling, refines landing-page auth behavior, and hardens the client-side auth flow to match backend security (memory-only access tokens + HTTP-only refresh cookie pattern).

Files changed
-------------
- `app/api/onboarding/complete/route.ts` — onboarding completion API handler (client-side call shape and server contract adjustments).
- `app/onboarding/page.tsx` — onboarding UI flow and skeleton-first UX adjustments when redirecting after creation.
- `components/Hero.tsx` — landing page hero minor layout and CTA changes to respect auth state.
- `components/Navigation.tsx` — navigation items updated to use client-side auth state and conditional links for authenticated users.
- `components/onboarding/ConversationManager.tsx` — conversation flow and progress reporting improved; minor bugfix for message deduplication.
- `context/AuthContext.tsx` — core change: access tokens stored in React memory only; new helper methods for refresh flow and session restoration; logout flow clears memory & triggers backend logout endpoint.

New/untracked files referenced
-----------------------------
- `LANDING_PAGE_AUTH_IMPROVEMENT_OCT16_2025.md` — design notes (untracked in working tree). See repo root for details.

Why these changes
-----------------
- Align frontend auth behavior with backend security: do not create or modify auth cookies from the client; store short-lived access tokens in memory only.
- Reduce accidental persistence of tokens to localStorage/sessionStorage (XSS risk).
- Improve onboarding completion UX so the user sees a skeleton-first dashboard and remaining module generation continues in background (scaffolded on frontend; backend lazy enqueue planned separately).

Developer notes
---------------
- `AuthContext` changes:
  - `accessToken` exists only in React state.
  - `login()` calls backend `auth.login` (GraphQL/REST) which sets HTTP-only `refresh_token` cookie and returns the access token in response. Frontend stores it in memory only.
  - `checkExistingSession()` will call backend refresh flow (no cookie access from JS) to restore access token on page reload.
  - `logout()` calls backend logout endpoint which clears cookies; frontend clears memory state after successful response.

How to test locally
---------------------
1. Start the frontend dev server:

```powershell
cd e:\Projects\skillsync-latest\skillsync-fe
# install if needed (bun) then start
bun install
bun dev
```

2. In another terminal, start backend dev server (if not already running):

```powershell
cd e:\Projects\skillsync-latest\skillsync-be
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

3. Manual test scenarios:
  - Login flow (Remember Me unchecked): login and confirm that `document.cookie` DOES NOT show `refresh_token` (it should be HTTP-only). Confirm `AuthContext` holds `accessToken` only in memory and that a page reload loses the access token but `checkExistingSession()` calls the backend refresh and restores it.
  - Login flow (Remember Me checked): confirm persistent cookie behavior from backend and that session restores after restart.
  - Onboarding complete: trigger onboarding and confirm redirect to dashboard with skeleton modules; check network panel to see subsequent requests to `/api/roadmaps/{id}/generate` or the placeholder endpoint used during this scaffold.
  - Logout: confirm backend clears cookies and frontend clears memory auth state.

Example rapid checks (DevTools):
- Confirm access token is not in localStorage:

```js
localStorage.getItem('accessToken') // should be null
```

- Confirm refresh_token cookie not accessible via JS (HTTP-only):

```js
document.cookie.includes('refresh_token') // should be false
```

Rollback notes
--------------
- Revert the frontend commits that modified the listed files. If you need to rollback quickly:

```powershell
git checkout -- app/api/onboarding/complete/route.ts app/onboarding/page.tsx components/Hero.tsx components/Navigation.tsx components/onboarding/ConversationManager.tsx context/AuthContext.tsx
```

If rollback needed due to backend contract change, coordinate with backend team to ensure refresh/login mutations keep expected response shapes.

Next steps
----------
- Implement backend lazy-enqueue endpoints and worker to complete skeleton-first generation (see backend changelog & plans).
- Add frontend polling or web-socket subscription to show per-module generation progress.
- Add automated e2e tests (Playwright) for onboarding flow and session restoration.
