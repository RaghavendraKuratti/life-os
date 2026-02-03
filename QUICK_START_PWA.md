# Quick Start: Deploy PWA for Mobile Testing

Follow these simple steps to get your Dharmayuga app running on your mobile device.

## Option 1: Quick Deploy with Firebase (Recommended)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Build and Deploy
```bash
# Make the script executable (first time only)
chmod +x deploy-pwa.sh

# Run the deployment script
./deploy-pwa.sh

# Deploy to Firebase
firebase deploy --only hosting
```

### Step 4: Access on Mobile
1. Firebase will give you a URL like: `https://your-project.web.app`
2. Open this URL on your mobile device
3. **Android**: Chrome → Menu → "Add to Home screen"
4. **iOS**: Safari → Share → "Add to Home Screen"

---

## Option 2: Manual Build

### Step 1: Install Dependencies
```bash
cd life-os
npm install
```

### Step 2: Build for Production
```bash
npm run build -- --configuration production
```

### Step 3: Test Locally
```bash
cd www
npx http-server -p 8080
```

Visit: `http://localhost:8080`

### Step 4: Deploy to Any Host

Upload the `life-os/www` folder to:
- **Netlify**: Drag and drop the `www` folder
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Push to gh-pages branch
- **Any static host**: Upload `www` folder contents

---

## Testing on Mobile

### Android (Chrome)
1. Open the deployed URL in Chrome
2. Tap the menu (⋮) → "Add to Home screen"
3. Tap "Add"
4. App icon appears on home screen
5. Tap to open in standalone mode

### iOS (Safari)
1. Open the deployed URL in Safari
2. Tap the Share button (□↑)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen
6. Tap to open in standalone mode

---

## What You Get

✅ **Offline Support**: App works without internet  
✅ **Home Screen Icon**: Installs like a native app  
✅ **Standalone Mode**: No browser UI  
✅ **Fast Loading**: Cached assets  
✅ **Auto Updates**: New versions deploy automatically  
✅ **Push Notifications**: (if configured)  

---

## Troubleshooting

### "Add to Home Screen" not showing?
- Ensure you're using HTTPS (required for PWA)
- Try clearing browser cache
- Make sure manifest.webmanifest is accessible

### Service Worker not working?
- Service workers only work in production builds
- Must be served over HTTPS
- Check browser console for errors

### App not updating?
- Service workers cache aggressively
- Close and reopen the app
- Or clear app data and reinstall

---

## Quick Commands Reference

```bash
# Build PWA
cd life-os && npm run build -- --configuration production

# Deploy to Firebase
firebase deploy --only hosting

# Test locally
cd life-os/www && npx http-server -p 8080

# Check build size
du -sh life-os/www

# View service worker status
# Open DevTools → Application → Service Workers
```

---

## Next Steps

1. ✅ Deploy backend to production
2. ✅ Update API URLs in environment files
3. ✅ Test all features on mobile
4. ✅ Set up custom domain (optional)
5. ✅ Configure analytics (optional)

---

**Need help?** Check the full [PWA_DEPLOYMENT_GUIDE.md](PWA_DEPLOYMENT_GUIDE.md) for detailed instructions.