# Starting the Frontend Development Server

## Quick Start (Copy & Paste)

### Windows (PowerShell or CMD)

```bash
cd e:\Projects\skillsync-latest\skillsync-fe
npm run dev
```

Or with Bun:

```bash
cd e:\Projects\skillsync-latest\skillsync-fe
bun run dev
```

### Linux/Mac

```bash
cd skillsync-latest/skillsync-fe
npm run dev
```

---

## Prerequisites

- **Node.js** >= 18.x installed (`node --version`)
- **npm** or **bun** installed
- **Backend running** on http://127.0.0.1:8000
- **Environment variables** set in `.env.local`

---

## What You Should See

```
▲ Next.js 15.1.0

- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

---

## Verify Frontend is Running

### In Browser
Visit: http://localhost:3000

You should see:
- SkillSync landing page/login page
- No console errors
- No 404 errors in Network tab

### Check Backend Connection

Open your browser DevTools (F12):

**Network Tab**:
- Refresh page
- Look for GraphQL requests
- Should see requests to `http://127.0.0.1:8000/graphql/`
- Responses should be 200 OK or with expected data

**Console Tab**:
- Should NOT see CORS errors
- Should NOT see "Cannot reach GraphQL endpoint"

---

## Environment Configuration

Frontend configuration is in `.env.local`:

```
NEXT_PUBLIC_GRAPHQL_API_URL=http://127.0.0.1:8000/graphql/
```

If you need to change the backend URL:

1. Edit `.env.local`
2. Save the file
3. Refresh browser (Ctrl+R or Cmd+R)
4. Frontend should reconnect

---

## Directory Structure

```
skillsync-fe/
├── app/                    # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx           # Home page
│   ├── (auth)/            # Auth routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── onboarding/
│   └── dashboard/         # User dashboard
├── components/            # React components
├── context/              # React Context (state management)
├── hooks/                # Custom React hooks
├── api/                  # API client setup
├── lib/                  # Utilities
├── .env.local           # Environment variables (local)
├── next.config.ts       # Next.js config
└── package.json         # Dependencies
```

---

## Common Issues

### Issue: "Port 3000 already in use"

```bash
# Find process using port 3000
netstat -ano | findstr :3000      # Windows
lsof -i :3000                      # Mac/Linux

# Kill it
taskkill /PID <PID> /F             # Windows
kill -9 <PID>                      # Mac/Linux

# Or use different port
npm run dev -- -p 3001
```

### Issue: "CORS error" or "Cannot reach GraphQL endpoint"

```
Error: "Access to XMLHttpRequest... blocked by CORS policy"
```

**Solution**:
1. Verify backend is running: http://127.0.0.1:8000/graphql/
2. Check `.env.local` has correct URL
3. Restart frontend: Stop (Ctrl+C) and run `npm run dev` again
4. Clear browser cache: DevTools → Network → Clear

### Issue: "Module not found" errors

```bash
# Install dependencies
npm install
# or
bun install

# Clear cache
rm -rf .next node_modules
npm install
npm run dev
```

### Issue: "Next.js won't start"

```bash
# Check Node.js version
node --version  # Should be 18+

# Update npm
npm install -g npm@latest

# Clean and reinstall
rm -rf node_modules
npm install
npm run dev
```

---

## Development Features

### Hot Reload
Changes to files are automatically reflected in the browser without refresh.

### Fast Refresh
React component changes update without losing state.

### TypeScript
Full TypeScript support for type safety.

---

## Testing the Connection

### Manually Test GraphQL Query

In browser console (F12 → Console):

```javascript
// Test API connection
fetch('http://127.0.0.1:8000/graphql/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `
  })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.log('Error:', e))
```

**Expected Result**:
```javascript
{
  data: {
    __schema: {
      types: [... list of GraphQL types ...]
    }
  }
}
```

---

## Build for Production

```bash
npm run build
npm run start
```

This creates an optimized production build and starts a production server.

---

## Useful Commands

### Development Server
```bash
npm run dev          # Start dev server with hot reload
```

### Production Build
```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Testing
```bash
npm test            # Run tests (if configured)
```

### Code Quality
```bash
npm run lint        # Check code style
npm run type-check  # Check TypeScript types
```

---

## Debugging Tips

### Enable Verbose Logging

```bash
# With debug flag
npm run dev -- --debug

# Or set environment variable
DEBUG=* npm run dev
```

### Check Console
- Open DevTools (F12)
- Click "Console" tab
- Look for errors in red
- Network requests show in "Network" tab

### Check Network Requests

In DevTools → Network tab:
1. Refresh page
2. Look for requests to `localhost:3000` (frontend)
3. Look for requests to `127.0.0.1:8000` (backend)
4. Check response status codes

---

## Performance Optimization

### First Load
- Expect 2-3 seconds initially
- Subsequent loads should be <500ms

### Slow Page Issues
1. Check Network tab for slow requests
2. Check DevTools Performance tab
3. Check backend logs for slow queries

---

## Stopping the Server

**Windows/Mac/Linux**:
- Press `CTRL + C` in the terminal

Or kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
pkill -f "next dev"
```

---

## Next Steps

1. **Verify Backend is Running**
   - Open http://127.0.0.1:8000/graphql/ in another browser tab
   - Should load GraphQL Playground

2. **Test Frontend**
   - Open http://localhost:3000
   - Check for any errors in DevTools console

3. **Test Onboarding**
   - Sign up as new user
   - Complete onboarding flow
   - Generate lessons

---

## File to Check When Debugging

If you need to modify backend URL or API configuration:

```
skillsync-fe/
├── .env.local                        # Environment variables
├── app/layout.tsx                    # Root layout (with Apollo Client)
└── lib/apolloClient.ts              # GraphQL client setup
```

---

**Status**: Frontend Ready ✅

Next: Start Backend + Frontend and test integration!
