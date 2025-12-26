# SkillSync Frontend - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Ensure the following environment variables are set in Vercel:

```
NEXT_PUBLIC_GRAPHQL_API_URL=https://skillsync-graphql-e2dpdxhgebeqhhhk.southeastasia-01.azurewebsites.net
```

### 2. Build Configuration
- **Framework**: Next.js
- **Build Command**: `npm run build` (uses turbopack)
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 20.x or higher

### 3. Recent Changes to Commit
The following files have been modified and need to be committed:
- `app/(main)/user-dashboard/page.tsx` - Dashboard improvements
- `app/globals.css` - Global styling updates
- `bun.lock` - Dependency lock file
- `package.json` - Package updates
- `tsconfig.json` - TypeScript configuration
- `components/ProgressRing.tsx` - New component (untracked)
- `components/layouts/` - New layout components (untracked)

## 🚀 Deployment Steps

### Step 1: Commit and Push Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: dashboard improvements and layout enhancements

- Enhanced user dashboard with progress tracking
- Added ProgressRing component for visual feedback
- Improved layout components structure
- Updated global styles for better UX
- Updated dependencies and TypeScript configuration"

# Push to remote repository
git push origin master
```

### Step 2: Vercel Deployment

Since you already have a Vercel project set up:

1. **Automatic Deployment** (Recommended):
   - Once you push to the `master` branch, Vercel will automatically detect the changes
   - A new deployment will be triggered automatically
   - Monitor the deployment at: https://vercel.com/dashboard

2. **Manual Deployment** (Alternative):
   ```bash
   # Install Vercel CLI if not already installed
   npm install -g vercel

   # Login to Vercel
   vercel login

   # Deploy to production
   vercel --prod
   ```

### Step 3: Verify Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Ensure `NEXT_PUBLIC_GRAPHQL_API_URL` is set to:
   ```
   https://skillsync-graphql-e2dpdxhgebeqhhhk.southeastasia-01.azurewebsites.net
   ```
4. Make sure it's enabled for **Production**, **Preview**, and **Development** environments

### Step 4: Post-Deployment Verification

After deployment completes, verify the following:

1. **Homepage loads correctly**
   - Visit your production URL
   - Check that all assets load properly

2. **Authentication works**
   - Test sign-in functionality
   - Verify cookies are being set correctly
   - Check that JWT tokens are working

3. **Dashboard functionality**
   - Navigate to user dashboard
   - Verify all components render correctly
   - Test progress tracking features

4. **API connectivity**
   - Open browser DevTools → Network tab
   - Verify GraphQL requests are going to the correct backend URL
   - Check for any CORS errors

5. **Mobile responsiveness**
   - Test on different screen sizes
   - Verify layouts adapt correctly

## 🔍 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript errors are resolved

### Environment Variables Not Working
- Prefix must be `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing environment variables
- Clear Vercel cache if needed

### CORS Errors
- Verify backend allows your Vercel domain
- Check backend CORS configuration
- Ensure credentials are included in requests

### Authentication Issues
- Verify cookies are being set with correct domain
- Check that backend URL is correct
- Ensure HTTPS is used in production

## 📊 Monitoring

After deployment, monitor:
- **Vercel Analytics**: Track page views and performance
- **Error Tracking**: Check Vercel logs for runtime errors
- **Performance**: Monitor Core Web Vitals
- **API Response Times**: Check GraphQL query performance

## 🔄 Rollback Plan

If issues occur:
1. Go to Vercel dashboard
2. Navigate to **Deployments**
3. Find the last working deployment
4. Click **Promote to Production**

## 📝 Notes

- The frontend uses Next.js 16.0.10 with React 19
- Build uses Turbopack for faster builds
- Apollo Client handles GraphQL communication
- Cookies are used for authentication (HTTP-only)
- Production backend is hosted on Azure

## 🎯 Next Steps After Deployment

1. Test all critical user flows
2. Monitor error rates in first 24 hours
3. Gather user feedback
4. Plan next iteration of features
