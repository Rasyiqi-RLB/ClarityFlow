#!/bin/bash

# Build ClarityFlow for Production Release
# This script builds a signed APK/AAB for Google Play Store

set -e

echo "🚀 Building ClarityFlow for Production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if keystore exists
if [ ! -f "android/clarityflow-upload-key.keystore" ]; then
    echo "❌ Error: Upload keystore not found!"
    echo "Please run: ./scripts/generate-keystore.sh first"
    exit 1
fi

# Check if gradle.properties is configured
if ! grep -q "CLARITYFLOW_UPLOAD_STORE_PASSWORD" android/gradle.properties; then
    echo "❌ Error: gradle.properties not configured for production"
    echo "Please copy android/gradle.properties.production to android/gradle.properties"
    echo "And update with your actual keystore passwords"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

echo "🔨 Building production APK..."
cd android
./gradlew assembleRelease
cd ..

echo "📱 Building production AAB (Android App Bundle)..."
cd android
./gradlew bundleRelease
cd ..

# Check if builds were successful
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"

if [ -f "$APK_PATH" ] && [ -f "$AAB_PATH" ]; then
    echo ""
    echo "✅ Production builds completed successfully!"
    echo ""
    echo "📁 Build outputs:"
    echo "   APK: $APK_PATH"
    echo "   AAB: $AAB_PATH"
    echo ""
    echo "📊 File sizes:"
    echo "   APK: $(du -h "$APK_PATH" | cut -f1)"
    echo "   AAB: $(du -h "$AAB_PATH" | cut -f1)"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Test the APK on a real device"
    echo "2. Upload the AAB to Google Play Console"
    echo "3. Configure store listing and in-app products"
    echo "4. Submit for review"
    echo ""
else
    echo "❌ Build failed! Check the logs above for errors."
    exit 1
fi
