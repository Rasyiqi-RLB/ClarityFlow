# Google Play Console Setup Helper for ClarityFlow
# Simple version for Windows PowerShell

Write-Host ""
Write-Host "Google Play Console Setup for ClarityFlow" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if required files exist
Write-Host "Checking required files..." -ForegroundColor Yellow

$requiredFiles = @(
    "docs\GOOGLE_PLAY_SETUP.md",
    "store-assets\store-listing.md", 
    "store-assets\in-app-products.json",
    "android\gradle.properties.production"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please ensure all required files are present before proceeding." -ForegroundColor Red
    exit 1
}

Write-Host "All required files found!" -ForegroundColor Green
Write-Host ""

# Display setup checklist
Write-Host "Google Play Console Setup Checklist:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. CREATE GOOGLE PLAY CONSOLE APP" -ForegroundColor White
Write-Host "   - Go to Google Play Console (https://play.google.com/console)" -ForegroundColor Gray
Write-Host "   - Click 'Create app'" -ForegroundColor Gray
Write-Host "   - App name: ClarityFlow" -ForegroundColor Gray
Write-Host "   - Default language: English (United States)" -ForegroundColor Gray
Write-Host "   - App or game: App" -ForegroundColor Gray
Write-Host "   - Free or paid: Free (with in-app purchases)" -ForegroundColor Gray
Write-Host "   - Package name: com.clarityflow.app" -ForegroundColor Gray
Write-Host ""

Write-Host "2. APP DETAILS SETUP" -ForegroundColor White
Write-Host "   - Copy app description from: store-assets\store-listing.md" -ForegroundColor Gray
Write-Host "   - Set app category: Productivity" -ForegroundColor Gray
Write-Host "   - Add contact email: support@clarityflow.app" -ForegroundColor Gray
Write-Host "   - Add privacy policy URL: https://clarityflow.app/privacy-policy" -ForegroundColor Gray
Write-Host ""

Write-Host "3. IN-APP PRODUCTS SETUP" -ForegroundColor White
Write-Host "   - Go to Monetize > Products > In-app products" -ForegroundColor Gray
Write-Host "   - Create products using: store-assets\in-app-products.json" -ForegroundColor Gray
Write-Host "   - Product IDs:" -ForegroundColor Gray
Write-Host "     * remove_ads_forever ($2.99)" -ForegroundColor Gray
Write-Host "     * premium_monthly ($4.99/month)" -ForegroundColor Gray
Write-Host "     * premium_yearly ($39.99/year)" -ForegroundColor Gray
Write-Host "     * lifetime_access ($99.99)" -ForegroundColor Gray
Write-Host ""

Write-Host "4. APP SIGNING SETUP" -ForegroundColor White
Write-Host "   - Go to Release > Setup > App signing" -ForegroundColor Gray
Write-Host "   - Choose 'Use Play App Signing'" -ForegroundColor Gray
Write-Host "   - Generate upload key using: npm run generate-keystore" -ForegroundColor Gray
Write-Host "   - Configure gradle.properties with keystore details" -ForegroundColor Gray
Write-Host ""

Write-Host "5. STORE LISTING" -ForegroundColor White
Write-Host "   - Go to Store presence > Store listing" -ForegroundColor Gray
Write-Host "   - Upload app icon (512x512 PNG)" -ForegroundColor Gray
Write-Host "   - Upload feature graphic (1024x500 PNG)" -ForegroundColor Gray
Write-Host "   - Upload screenshots (1080x1920 PNG)" -ForegroundColor Gray
Write-Host "   - Complete all required fields" -ForegroundColor Gray
Write-Host ""

Write-Host "6. CONTENT RATING" -ForegroundColor White
Write-Host "   - Go to Store presence > Content rating" -ForegroundColor Gray
Write-Host "   - Complete questionnaire" -ForegroundColor Gray
Write-Host "   - Target audience: Everyone" -ForegroundColor Gray
Write-Host "   - Submit for rating" -ForegroundColor Gray
Write-Host ""

Write-Host "7. FIRST RELEASE" -ForegroundColor White
Write-Host "   - Generate production build: npm run build:android:production" -ForegroundColor Gray
Write-Host "   - Go to Release > Testing > Internal testing" -ForegroundColor Gray
Write-Host "   - Create new release" -ForegroundColor Gray
Write-Host "   - Upload AAB file" -ForegroundColor Gray
Write-Host "   - Add release notes" -ForegroundColor Gray
Write-Host "   - Review and rollout" -ForegroundColor Gray
Write-Host ""

Write-Host "HELPFUL RESOURCES:" -ForegroundColor Cyan
Write-Host "   - Setup guide: docs\GOOGLE_PLAY_SETUP.md" -ForegroundColor Gray
Write-Host "   - Store listing: store-assets\store-listing.md" -ForegroundColor Gray
Write-Host "   - Product details: store-assets\in-app-products.json" -ForegroundColor Gray
Write-Host ""

Write-Host "QUICK COMMANDS:" -ForegroundColor Cyan
Write-Host "   - Generate keystore: npm run generate-keystore" -ForegroundColor Gray
Write-Host "   - Build production: npm run build:android:production" -ForegroundColor Gray
Write-Host "   - Clean build: npm run clean:android" -ForegroundColor Gray
Write-Host ""

Write-Host "TIPS:" -ForegroundColor Cyan
Write-Host "   - Test thoroughly in internal testing before production" -ForegroundColor Gray
Write-Host "   - Keep keystore file secure and backed up" -ForegroundColor Gray
Write-Host "   - Review Google Play policies before submission" -ForegroundColor Gray
Write-Host "   - Set up gradual rollout for production releases" -ForegroundColor Gray
Write-Host ""

Write-Host "Ready to start? Follow the checklist above step by step." -ForegroundColor Green
Write-Host "For detailed instructions, see: docs\GOOGLE_PLAY_SETUP.md" -ForegroundColor Green
Write-Host ""
