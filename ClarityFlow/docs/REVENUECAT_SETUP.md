# RevenueCat Setup Guide for ClarityFlow

## 📋 **Overview**

ClarityFlow currently uses a mock implementation for in-app purchases. This guide will help you set up real RevenueCat integration for production.

## 🚀 **Step 1: Create RevenueCat Account**

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Sign up for a free account
3. Create a new project for ClarityFlow

## 📱 **Step 2: Configure App in RevenueCat**

### **Add Your App**
1. In RevenueCat dashboard, click "Add App"
2. Enter app details:
   - **App Name**: ClarityFlow
   - **Bundle ID**: Your app's bundle identifier
   - **Platform**: iOS and/or Android

### **Get API Keys**
1. Go to **Project Settings** → **API Keys**
2. Copy your API keys:
   - **iOS**: `appl_xxxxxxxxxx`
   - **Android**: `goog_xxxxxxxxxx`

## 🛍️ **Step 3: Configure Products**

### **Create Products in App Store Connect / Google Play Console**

#### **iOS (App Store Connect):**
1. Go to App Store Connect
2. Navigate to your app → **Features** → **In-App Purchases**
3. Create products:
   - **Remove Ads Forever**: `remove_ads_forever` (Non-Consumable)
   - **Premium Monthly**: `premium_monthly` (Auto-Renewable Subscription)
   - **Premium Yearly**: `premium_yearly` (Auto-Renewable Subscription)
   - **Lifetime Access**: `lifetime_access` (Non-Consumable)

#### **Android (Google Play Console):**
1. Go to Google Play Console
2. Navigate to your app → **Monetize** → **Products** → **In-app products**
3. Create the same products with same IDs

### **Add Products to RevenueCat**
1. In RevenueCat dashboard, go to **Products**
2. Click **Add Product**
3. Add each product with the same IDs from stores

### **Create Entitlements**
1. Go to **Entitlements** in RevenueCat
2. Create entitlements:
   - **ads_removed**: For remove ads products
   - **premium**: For premium features
   - **lifetime**: For lifetime access

### **Create Offerings**
1. Go to **Offerings** in RevenueCat
2. Create a default offering
3. Add your products to the offering

## 🔧 **Step 4: Update ClarityFlow Code**

### **1. Install Dependencies**
```bash
npm install react-native-purchases
# For Expo managed workflow:
npx expo install react-native-purchases
```

### **2. Update API Keys**
In `services/purchaseService.ts`, update:

```typescript
private readonly REVENUECAT_CONFIG = {
  ios: 'appl_YOUR_ACTUAL_IOS_API_KEY',
  android: 'goog_YOUR_ACTUAL_ANDROID_API_KEY',
};
```

### **3. Enable RevenueCat**
Change this line in `purchaseService.ts`:
```typescript
private readonly USE_REAL_REVENUECAT = true; // Change from false to true
```

### **4. Uncomment RevenueCat Code**
Uncomment all the RevenueCat import statements and method implementations in `purchaseService.ts`.

## 🧪 **Step 5: Testing**

### **Test Environment**
1. RevenueCat automatically provides sandbox testing
2. Use test accounts for iOS/Android
3. Test all purchase flows

### **Test Scenarios**
- [ ] Purchase remove ads
- [ ] Purchase premium subscription
- [ ] Restore purchases
- [ ] Cancel subscription
- [ ] Expired subscription handling

## 📊 **Step 6: Analytics & Webhooks**

### **Setup Webhooks (Optional)**
1. In RevenueCat dashboard, go to **Integrations** → **Webhooks**
2. Add your server endpoint for purchase events
3. Handle webhook events in your backend

### **Analytics Integration**
RevenueCat provides built-in analytics, or integrate with:
- Firebase Analytics
- Amplitude
- Mixpanel

## 🔒 **Step 7: Security**

### **Server-Side Validation**
For production, implement server-side receipt validation:
1. Set up webhook endpoints
2. Validate purchases on your server
3. Grant/revoke access based on validation

## 📝 **Current Implementation Status**

### **✅ Ready (Mock Implementation)**
- Purchase flow UI
- Product management
- Purchase history
- Restore purchases
- Error handling

### **✅ Partially Configured**
- ✅ **Android API Key**: `goog_HwHtKMOesMjNeJNJnHaMIXcyhnB`
- ✅ **Package Name**: `com.clarityflow.app`
- ✅ **RevenueCat Project**: ClarityFlow setup complete

### **🔄 Still Needs Configuration**
- iOS API key (when iOS app is added to RevenueCat)
- Product IDs in Google Play Console
- Entitlements configuration in RevenueCat
- Real purchase validation

## 🚨 **Important Notes**

1. **Test Thoroughly**: Always test in sandbox before production
2. **Handle Errors**: Implement proper error handling for network issues
3. **User Experience**: Provide clear feedback during purchase process
4. **Compliance**: Follow App Store and Google Play guidelines
5. **Privacy**: Update privacy policy to mention in-app purchases

## 📞 **Support**

- **RevenueCat Docs**: https://docs.revenuecat.com/
- **RevenueCat Support**: https://community.revenuecat.com/
- **Apple Guidelines**: https://developer.apple.com/in-app-purchase/
- **Google Guidelines**: https://developer.android.com/google/play/billing

## 🎯 **Quick Start Checklist**

- [ ] Create RevenueCat account
- [ ] Add app to RevenueCat
- [ ] Get API keys
- [ ] Create products in stores
- [ ] Add products to RevenueCat
- [ ] Create entitlements
- [ ] Create offerings
- [ ] Update API keys in code
- [ ] Enable RevenueCat in code
- [ ] Uncomment RevenueCat implementations
- [ ] Test in sandbox
- [ ] Deploy to production

---

**Current Status**: Mock implementation active. Follow this guide to enable real RevenueCat integration.
