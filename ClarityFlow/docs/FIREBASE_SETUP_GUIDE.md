# 🔥 Panduan Setup Firebase untuk ClarityFlow

## 🚀 **Langkah Cepat (5 Menit)**

### **Step 1: Buat Project Firebase** 📝

1. **Buka Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Login dengan Google account

2. **Create New Project**
   ```
   ➤ Klik "Add project" atau "Tambah project"
   ➤ Project name: "ClarityFlow" (atau nama lain)
   ➤ Enable Google Analytics: ✅ (recommended)
   ➤ Klik "Create project"
   ➤ Tunggu sampai selesai (~30 detik)
   ```

### **Step 2: Setup Authentication** 🔐

1. **Enable Email/Password Auth**
   ```
   ➤ Di sidebar kiri, klik "Authentication"
   ➤ Klik tab "Sign-in method"
   ➤ Klik "Email/Password"
   ➤ Toggle "Enable" ✅
   ➤ Klik "Save"
   ```

### **Step 3: Setup Firestore Database** 🗄️

1. **Create Database**
   ```
   ➤ Di sidebar kiri, klik "Firestore Database"
   ➤ Klik "Create database"
   ➤ Security rules: "Start in test mode" ✅
   ➤ Location: "asia-southeast1 (Singapore)" ✅
   ➤ Klik "Done"
   ```

### **Step 4: Get Firebase Config** ⚙️

1. **Add Web App**
   ```
   ➤ Klik ⚙️ (Settings) > "Project settings"
   ➤ Scroll ke "Your apps"
   ➤ Klik "Add app" > pilih Web icon (</>
   ➤ App nickname: "ClarityFlow Web"
   ➤ Firebase Hosting: ❌ (jangan dicentang)
   ➤ Klik "Register app"
   ```

2. **Copy Configuration**
   ```javascript
   // Firebase akan menampilkan config seperti ini:
   const firebaseConfig = {
     apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxx",
     authDomain: "clarityflow-xxxxx.firebaseapp.com",
     projectId: "clarityflow-xxxxx",
     storageBucket: "clarityflow-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```
   **📋 COPY semua nilai ini!**

### **Step 5: Update Environment Variables** 📄

1. **Edit File .env**
   - Buka file `.env` di project ClarityFlow
   - Replace placeholder dengan nilai dari Firebase:

   ```env
   # Ganti dengan nilai dari Firebase Config
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxx
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=clarityflow-xxxxx.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=clarityflow-xxxxx
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=clarityflow-xxxxx.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

2. **Save & Restart**
   ```bash
   # Save file .env
   # Tekan Ctrl+C untuk stop server
   # Restart server:
   npm start
   ```

---

## 🧪 **Test Firebase Connection**

### **Quick Test** ⚡

1. **Open App**
   - Web: http://localhost:8081
   - Mobile: Scan QR code dengan Expo Go

2. **Test Registration**
   ```
   ➤ Go to "Account" tab
   ➤ Klik "Daftar Akun Baru"
   ➤ Isi form:
     - Nama: Test User
     - Email: test@example.com
     - Password: password123
   ➤ Klik "Daftar"
   ➤ Should show: "Registrasi berhasil!"
   ```

3. **Check Firebase Console**
   ```
   ➤ Go to Firebase Console > Authentication > Users
   ➤ Should see: test@example.com ✅
   ➤ Go to Firestore Database > Data
   ➤ Should see: users collection with user data ✅
   ```

4. **Test Login**
   ```
   ➤ Klik "Masuk di sini"
   ➤ Email: test@example.com
   ➤ Password: password123
   ➤ Klik "Masuk"
   ➤ Should redirect to Account tab ✅
   ➤ Should show user profile ✅
   ```

---

## 🛡️ **Deploy Security Rules (Optional)**

### **Manual Deploy (Recommended)** 📝

1. **Copy Rules**
   - Buka file `firestore.rules` di project
   - Copy semua content

2. **Paste to Firebase**
   ```
   ➤ Firebase Console > Firestore Database
   ➤ Klik tab "Rules"
   ➤ Delete existing rules
   ➤ Paste content dari firestore.rules
   ➤ Klik "Publish"
   ```

### **CLI Deploy (Advanced)** 💻

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

---

## 🚨 **Troubleshooting**

### **Common Errors** ❌

#### **"Firebase not configured"**
```bash
# Solution:
1. Check .env file has correct values
2. Restart development server
3. Clear cache: npx expo start --clear
```

#### **"Network request failed"**
```bash
# Solution:
1. Check internet connection
2. Verify Firebase project is active
3. Check API key is correct
```

#### **"Permission denied"**
```bash
# Solution:
1. Deploy Firestore rules
2. Check user is authenticated
3. Verify rules allow user access
```

#### **"Email already in use"**
```bash
# Solution:
1. Use different email for testing
2. Or delete user from Firebase Console
```

### **Debug Steps** 🔍

1. **Check Console Logs**
   - Open browser developer tools
   - Look for Firebase errors

2. **Verify Environment Variables**
   ```javascript
   // Add to any component temporarily:
   console.log('Firebase Config:', {
     apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.slice(0, 10) + '...',
     projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
   });
   ```

3. **Check Firebase Console**
   - Authentication > Users (should show registered users)
   - Firestore > Data (should show user documents)

---

## 📱 **Platform Testing**

### **Web Browser** 🌐
```
✅ Chrome/Firefox/Safari
✅ http://localhost:8081
✅ All auth flows working
```

### **Mobile (Expo Go)** 📱
```
✅ iOS: Download Expo Go from App Store
✅ Android: Download Expo Go from Play Store
✅ Scan QR code from terminal
✅ Test registration/login
```

### **Mobile (Development Build)** 🔧
```bash
# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Install on device
eas install
```

---

## 🎉 **Success Checklist**

You're done when:
- ✅ No console errors
- ✅ Can register new users
- ✅ Can login/logout
- ✅ User data appears in Firebase Console
- ✅ Account tab shows user profile
- ✅ Navigation works smoothly
- ✅ Works on web and mobile

---

## 🚀 **Next Steps**

After Firebase is working:
1. **Deploy to Production** - Setup production Firebase project
2. **Add Features** - Implement task management
3. **Testing** - Add unit and integration tests
4. **Analytics** - Setup Firebase Analytics
5. **Push Notifications** - Add Firebase Messaging

---

## 📞 **Need Help?**

### **Quick Fixes** 🔧
```bash
# Clear everything and restart
npx expo start --clear

# Reset Metro cache
npx expo start --reset-cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **Documentation** 📚
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)

---

**🔥 Firebase Setup Complete! Your app is now powered by Firebase!** 🚀

*Total setup time: ~5 minutes*