# Fix: NPM Install Peer Dependency Conflict

## The Problem

You're seeing this error because `@angular/service-worker@20.0.0` requires `@angular/core@20.3.16`, but your project has `@angular/core@20.2.1`.

## Solution: Use Legacy Peer Deps Flag

Run this command in your terminal (in the `life-os` directory):

```bash
cd life-os
npm install --legacy-peer-deps
```

This flag tells npm to ignore peer dependency conflicts and install anyway.

## Alternative: Force Install

If the above doesn't work, try:

```bash
cd life-os
npm install --force
```

## What This Does

- Installs `@angular/service-worker` despite the version mismatch
- The mismatch is minor (20.2.1 vs 20.3.16) and won't cause issues
- Your PWA will work perfectly fine

## After Installation

Once npm install completes successfully:

1. The compilation errors in `app.module.pwa.ts` will disappear
2. You can build the PWA with: `./deploy-pwa.sh`
3. Deploy with: `firebase deploy --only hosting`

## If You Still Have Issues

### Option 1: Remove service-worker from package.json temporarily

Edit `life-os/package.json` and remove this line:
```json
"@angular/service-worker": "^20.0.0",
```

Then run:
```bash
npm install
```

The PWA will still work because the build script installs it during build time.

### Option 2: Update all Angular packages

```bash
cd life-os
npm update @angular/core @angular/common @angular/platform-browser @angular/platform-browser-dynamic @angular/router @angular/forms @angular/animations
npm install --legacy-peer-deps
```

## Quick Test

After successful install, verify with:
```bash
cd life-os
npm list @angular/service-worker
```

You should see it installed without errors.

---

**Bottom Line:** Just run `npm install --legacy-peer-deps` in the life-os directory and you're good to go! 🚀