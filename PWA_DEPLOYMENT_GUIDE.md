# PWA Deployment Guide for Dharmayuga Life OS

This guide will help you build and deploy your Ionic app as a Progressive Web App (PWA) for testing on mobile devices.

## Prerequisites

- Node.js and npm installed
- Firebase project set up
- Backend server running (or deployed)

## Step 1: Install Dependencies

```bash
cd life-os
npm install
```

This will install the `@angular/service-worker` package that was added to package.json.

## Step 2: Update Environment Configuration

Before building, ensure your environment files have the correct API endpoints:

**life-os/src/environments/environment.prod.ts:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.com/api', // Update with your deployed backend URL
  firebase: {
    // Your Firebase config
  }
};
```

## Step 3: Build the PWA

Build the production version with service worker enabled:

```bash
cd life-os
npm run build -- --configuration production
```

This will create an optimized build in the `www/` directory with:
- Service worker (`ngsw-worker.js`)
- Web manifest (`manifest.webmanifest`)
- Optimized assets

## Step 4: Test Locally

To test the PWA locally, you need to serve it over HTTPS. You can use:

### Option A: Using http-server with SSL

```bash
# Install http-server globally if you haven't
npm install -g http-server

# Serve the www directory
cd life-os/www
http-server -p 8080 -c-1
```

Then access: `http://localhost:8080`

### Option B: Using Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting (from project root)
firebase init hosting

# Select your Firebase project
# Set public directory to: life-os/www
# Configure as single-page app: Yes
# Set up automatic builds: No

# Deploy
firebase deploy --only hosting
```

Your app will be available at: `https://your-project.web.app`

## Step 5: Deploy to Other Hosting Services

### Netlify

1. Create a `netlify.toml` in the project root:

```toml
[build]
  command = "cd life-os && npm install && npm run build -- --configuration production"
  publish = "life-os/www"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Connect your GitHub repository to Netlify
3. Deploy automatically on push

### Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Create `vercel.json` in the project root:

```json
{
  "buildCommand": "cd life-os && npm install && npm run build -- --configuration production",
  "outputDirectory": "life-os/www",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

3. Deploy:
```bash
vercel
```

## Step 6: Testing on Mobile Devices

### Android

1. Open Chrome on your Android device
2. Navigate to your deployed URL (e.g., `https://your-project.web.app`)
3. Tap the menu (three dots) → "Add to Home screen"
4. The app will install as a PWA

### iOS (iPhone/iPad)

1. Open Safari on your iOS device
2. Navigate to your deployed URL
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Tap "Add"

## Step 7: Verify PWA Features

After installation, verify:

- ✅ App opens in standalone mode (no browser UI)
- ✅ App icon appears on home screen
- ✅ Splash screen shows on launch
- ✅ Offline functionality works (try airplane mode)
- ✅ App can be re-opened from home screen

## PWA Features Included

### Service Worker
- Caches app shell for offline access
- Caches assets (images, fonts, etc.)
- Network-first strategy for API calls
- Automatic updates when new version is deployed

### Web Manifest
- App name: "Dharmayuga - Life OS"
- Theme color: #3880ff
- Display mode: standalone
- Icons: 192x192 and 512x512

### Offline Support
- App shell loads offline
- Previously viewed content available offline
- Graceful degradation for network requests

## Troubleshooting

### Service Worker Not Registering

1. Ensure you're serving over HTTPS (required for service workers)
2. Check browser console for errors
3. Verify `ngsw-worker.js` is in the `www/` directory

### PWA Not Installing

1. Ensure manifest.webmanifest is accessible
2. Check that icons exist in assets/icon/
3. Verify HTTPS is enabled
4. Clear browser cache and try again

### Updates Not Showing

Service workers cache aggressively. To force an update:

1. Increment version in `package.json`
2. Rebuild and redeploy
3. Users will get update on next app launch

## Backend Deployment

Don't forget to deploy your backend! Options include:

### Heroku
```bash
cd backend
heroku create your-app-name
git push heroku main
```

### Google Cloud Run
```bash
cd backend
gcloud run deploy --source .
```

### Railway
1. Connect GitHub repository
2. Select backend directory
3. Deploy automatically

## Environment Variables

Remember to set these in your hosting platform:

**Backend:**
- `GEMINI_API_KEY`
- Firebase service account credentials

**Frontend:**
- Firebase configuration (usually in environment files)
- API URL pointing to deployed backend

## Testing Checklist

- [ ] App builds without errors
- [ ] Service worker registers successfully
- [ ] Manifest is accessible
- [ ] App installs on Android
- [ ] App installs on iOS
- [ ] Offline mode works
- [ ] API calls work with deployed backend
- [ ] Firebase authentication works
- [ ] Push notifications work (if implemented)
- [ ] App updates properly

## Next Steps

1. Set up continuous deployment (GitHub Actions, etc.)
2. Configure custom domain
3. Set up analytics
4. Monitor service worker updates
5. Test on various devices and browsers

## Useful Commands

```bash
# Build for production
npm run build -- --configuration production

# Serve locally
http-server www -p 8080

# Deploy to Firebase
firebase deploy --only hosting

# Check service worker status
# Open DevTools → Application → Service Workers
```

## Resources

- [Angular Service Worker Guide](https://angular.io/guide/service-worker-intro)
- [Ionic PWA Toolkit](https://ionicframework.com/docs/angular/pwa)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)

---

**Note:** The service worker only works in production builds. Development builds will not have PWA functionality.