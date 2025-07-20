# 🚀 ClarityFlow Production Setup Guide

## 📋 **Quick Start Checklist**

### **✅ Prerequisites**
- [ ] Google Play Console account
- [ ] RevenueCat account (already configured)
- [ ] Android development environment
- [ ] Java/Keytool installed

### **🔧 Setup Commands**
```bash
# 1. View Google Play setup guide
npm run setup-google-play

# 2. Generate production keystore
npm run generate-keystore

# 3. Configure gradle.properties
cp android/gradle.properties.production android/gradle.properties
# Edit with your keystore passwords

# 4. Build production APK/AAB
npm run build:android:production

# 5. Test production build
# Install APK on device and test all features
```

## 📱 **App Configuration**

### **App Details**
- **Name**: ClarityFlow
- **Package**: `com.clarityflow.app`
- **Version**: 1.0.0
- **Target SDK**: 34 (Android 14)
- **Min SDK**: 21 (Android 5.0)

### **Billing Integration Options**
- ✅ **RevenueCat Ready**: Android API key configured
- ✅ **Native Billing Ready**: react-native-iap structure prepared
- ✅ **Package Name**: `com.clarityflow.app`
- 📖 **Decision Guide**: See `docs/BILLING_OPTIONS.md`

## 🛍️ **In-App Products**

### **Product Configuration**
| Product ID | Type | Price | Description |
|------------|------|-------|-------------|
| `remove_ads_forever` | One-time | $2.99 | Remove all ads |
| `premium_monthly` | Subscription | $4.99/month | Premium features |
| `premium_yearly` | Subscription | $39.99/year | Premium (33% savings) |
| `lifetime_access` | One-time | $99.99 | Lifetime premium |

### **Entitlements**
- `ads_removed`: Remove advertisements
- `premium`: All premium features
- `lifetime`: Lifetime access

## 🔐 **Security & Signing**

### **Keystore Management**
```bash
# Generate keystore (one-time setup)
npm run generate-keystore

# Location: android/clarityflow-upload-key.keystore
# Alias: clarityflow-upload
# Keep passwords secure!
```

### **Important Security Notes**
- 🚨 **Never commit keystore to git**
- 🔒 **Store passwords securely**
- 💾 **Backup keystore file**
- 🔑 **Same keystore for all updates**

## 🏪 **Google Play Console Setup**

### **Step 1: Create App**
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app: "ClarityFlow"
3. Package name: `com.clarityflow.app`
4. Category: Productivity

### **Step 2: App Details**
- Copy descriptions from `store-assets/store-listing.md`
- Upload app icon (512x512 PNG)
- Upload feature graphic (1024x500 PNG)
- Add screenshots (1080x1920 PNG)

### **Step 3: In-App Products**
1. Go to Monetize > Products > In-app products
2. Create products using `store-assets/in-app-products.json`
3. Set exact Product IDs and prices
4. Configure subscriptions with free trials

### **Step 4: App Signing**
1. Go to Release > Setup > App signing
2. Choose "Use Play App Signing"
3. Upload your upload certificate

### **Step 5: Content Rating**
1. Complete content rating questionnaire
2. Target audience: Everyone
3. Submit for rating

## 🚀 **Build & Release Process**

### **Development Build**
```bash
# Clean previous builds
npm run clean:android

# Build debug APK
npx expo run:android
```

### **Production Build**
```bash
# Build signed production files
npm run build:android:production

# Outputs:
# - android/app/build/outputs/apk/release/app-release.apk
# - android/app/build/outputs/bundle/release/app-release.aab
```

### **Testing Production Build**
1. Install APK on real device
2. Test all core features
3. Test in-app purchases (sandbox)
4. Verify RevenueCat integration
5. Check performance and stability

### **Release to Google Play**
1. Upload AAB to Google Play Console
2. Add release notes
3. Start with Internal Testing
4. Gradually rollout to production

## 📊 **Monitoring & Analytics**

### **RevenueCat Dashboard**
- Monitor subscription metrics
- Track conversion rates
- Analyze user behavior
- Manage entitlements

### **Google Play Console**
- App performance metrics
- Crash reports and ANRs
- User reviews and ratings
- Financial reports

## 🔧 **Troubleshooting**

### **Common Build Issues**
```bash
# Clean everything
npm run clean:android
rm -rf node_modules
npm install

# Gradle issues
cd android
./gradlew clean
./gradlew --stop
```

### **Keystore Issues**
- Ensure keystore path is correct in gradle.properties
- Check passwords are properly set
- Verify keystore file exists and is readable

### **RevenueCat Issues**
- Verify API key is correct
- Check package name matches
- Ensure products are created in Google Play
- Test with sandbox environment first

## 📚 **Documentation**

### **Detailed Guides**
- `docs/GOOGLE_PLAY_SETUP.md` - Complete Google Play setup
- `docs/REVENUECAT_SETUP.md` - RevenueCat configuration
- `store-assets/store-listing.md` - Store listing content
- `store-assets/in-app-products.json` - Product configuration

### **Scripts**
- `scripts/setup-google-play.sh` - Setup guidance
- `scripts/generate-keystore.sh` - Keystore generation
- `scripts/build-production.sh` - Production build

## 🎯 **Production Checklist**

### **Before First Release**
- [ ] Keystore generated and secured
- [ ] Google Play Console app created
- [ ] All in-app products configured
- [ ] Store listing completed
- [ ] Content rating obtained
- [ ] Privacy policy published
- [ ] Production build tested
- [ ] RevenueCat integration verified

### **For Each Release**
- [ ] Version code incremented
- [ ] Release notes written
- [ ] Production build generated
- [ ] Testing completed
- [ ] AAB uploaded to Google Play
- [ ] Gradual rollout configured

## 🆘 **Support**

### **Getting Help**
- Check documentation in `docs/` folder
- Review troubleshooting section above
- Test in development environment first
- Use Google Play Console help resources

### **Contact**
- **Development**: Check GitHub issues
- **RevenueCat**: RevenueCat support docs
- **Google Play**: Google Play Console help

---

**Ready to launch ClarityFlow? Follow this guide step by step for a successful production deployment! 🚀**
