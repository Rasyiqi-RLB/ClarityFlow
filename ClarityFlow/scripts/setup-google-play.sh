#!/bin/bash

# Google Play Console Setup Helper for ClarityFlow
# This script provides step-by-step guidance for Google Play Console setup

echo "🚀 Google Play Console Setup for ClarityFlow"
echo "=============================================="
echo ""

# Check if required files exist
echo "📋 Checking required files..."

required_files=(
    "docs/GOOGLE_PLAY_SETUP.md"
    "store-assets/store-listing.md"
    "store-assets/in-app-products.json"
    "android/gradle.properties.production"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Please ensure all required files are present before proceeding."
    exit 1
fi

echo "✅ All required files found!"
echo ""

# Display setup checklist
echo "📝 Google Play Console Setup Checklist:"
echo ""
echo "1. 🏪 CREATE GOOGLE PLAY CONSOLE APP"
echo "   □ Go to Google Play Console (https://play.google.com/console)"
echo "   □ Click 'Create app'"
echo "   □ App name: ClarityFlow"
echo "   □ Default language: English (United States)"
echo "   □ App or game: App"
echo "   □ Free or paid: Free (with in-app purchases)"
echo "   □ Package name: com.clarityflow.app"
echo ""

echo "2. 📱 APP DETAILS SETUP"
echo "   □ Copy app description from: store-assets/store-listing.md"
echo "   □ Set app category: Productivity"
echo "   □ Add contact email: support@clarityflow.app"
echo "   □ Add privacy policy URL: https://clarityflow.app/privacy-policy"
echo ""

echo "3. 🛍️ IN-APP PRODUCTS SETUP"
echo "   □ Go to Monetize > Products > In-app products"
echo "   □ Create products using: store-assets/in-app-products.json"
echo "   □ Product IDs:"
echo "     - remove_ads_forever (\$2.99)"
echo "     - premium_monthly (\$4.99/month)"
echo "     - premium_yearly (\$39.99/year)"
echo "     - lifetime_access (\$99.99)"
echo ""

echo "4. 🔐 APP SIGNING SETUP"
echo "   □ Go to Release > Setup > App signing"
echo "   □ Choose 'Use Play App Signing'"
echo "   □ Generate upload key using: npm run generate-keystore"
echo "   □ Configure gradle.properties with keystore details"
echo ""

echo "5. 🎨 STORE LISTING"
echo "   □ Go to Store presence > Store listing"
echo "   □ Upload app icon (512x512 PNG)"
echo "   □ Upload feature graphic (1024x500 PNG)"
echo "   □ Upload screenshots (1080x1920 PNG)"
echo "   □ Complete all required fields"
echo ""

echo "6. 📊 CONTENT RATING"
echo "   □ Go to Store presence > Content rating"
echo "   □ Complete questionnaire"
echo "   □ Target audience: Everyone"
echo "   □ Submit for rating"
echo ""

echo "7. 🚀 FIRST RELEASE"
echo "   □ Generate production build: npm run build:android:production"
echo "   □ Go to Release > Testing > Internal testing"
echo "   □ Create new release"
echo "   □ Upload AAB file"
echo "   □ Add release notes"
echo "   □ Review and rollout"
echo ""

echo "📚 HELPFUL RESOURCES:"
echo "   - Setup guide: docs/GOOGLE_PLAY_SETUP.md"
echo "   - Store listing: store-assets/store-listing.md"
echo "   - Product details: store-assets/in-app-products.json"
echo ""

echo "🔧 QUICK COMMANDS:"
echo "   - Generate keystore: npm run generate-keystore"
echo "   - Build production: npm run build:android:production"
echo "   - Clean build: npm run clean:android"
echo ""

echo "💡 TIPS:"
echo "   - Test thoroughly in internal testing before production"
echo "   - Keep keystore file secure and backed up"
echo "   - Review Google Play policies before submission"
echo "   - Set up gradual rollout for production releases"
echo ""

echo "🎯 Ready to start? Follow the checklist above step by step."
echo "   For detailed instructions, see: docs/GOOGLE_PLAY_SETUP.md"
echo ""
