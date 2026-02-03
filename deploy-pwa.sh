#!/bin/bash

# Dharmayuga PWA Build and Deploy Script
# This script builds the PWA and deploys it to Firebase Hosting

set -e  # Exit on error

echo "🚀 Starting Dharmayuga PWA Deployment..."
echo ""

# Check if we're in the right directory
if [ ! -d "life-os" ]; then
    echo "❌ Error: life-os directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Navigate to frontend directory
cd life-os

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Enabling PWA service worker..."
# Backup original app.module.ts
cp src/app/app.module.ts src/app/app.module.backup.ts

# Replace with PWA-enabled version
cp src/app/app.module.pwa.ts src/app/app.module.ts

echo ""
echo "🏗️  Building production PWA..."
npm run build -- --configuration production

BUILD_STATUS=$?

# Restore original app.module.ts
echo ""
echo "🔄 Restoring original app.module.ts..."
mv src/app/app.module.backup.ts src/app/app.module.ts

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Go back to root
cd ..

echo ""
echo "📱 PWA build complete!"
echo ""
echo "Next steps:"
echo "1. To deploy to Firebase Hosting, run: firebase deploy --only hosting"
echo "2. To test locally, run: cd life-os/www && npx http-server -p 8080"
echo ""
echo "Your PWA is ready for mobile testing! 🎉"