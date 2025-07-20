# 🔥 Firebase Setup Checklist

## ✅ **Yang Sudah Selesai**
- ✅ Firebase configuration files
- ✅ Authentication service implementation
- ✅ UI components (Login, Register, Account)
- ✅ Navigation setup
- ✅ Error handling
- ✅ Development server running

---

## 🎯 **Yang Perlu Dilakukan Selanjutnya**

### **1. Setup Firebase Project** 🔴 **WAJIB**

#### **Step 1: Buat Project Firebase**
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau "Tambah project"
3. Masukkan nama project: `ClarityFlow` (atau nama lain)
4. Enable Google Analytics (opsional)
5. Klik "Create project"

#### **Step 2: Setup Authentication**
1. Di Firebase Console, pilih project Anda
2. Klik "Authentication" di sidebar kiri
3. Klik tab "Sign-in method"
4. Enable "Email/Password"
5. Klik "Save"

#### **Step 3: Setup Firestore Database**
1. Klik "Firestore Database" di sidebar
2. Klik "Create database"
3. Pilih "Start in test mode" (untuk development)
4. Pilih lokasi: **asia-southeast1 (Singapore)** atau **asia-southeast2 (Jakarta)**
5. Klik "Done"

#### **Step 4: Get Firebase Config**
1. Klik ⚙️ (Settings) > "Project settings"
2. Scroll ke "Your apps"
3. Klik "Add app" > pilih "Web" (🌐)
4. Masukkan app nickname: `ClarityFlow Web`
5. **JANGAN** check "Firebase Hosting"
6. Klik "Register app"
7. **COPY** config object yang muncul

#### **Step 5: Update Environment Variables**
1. Buka file `.env` di project
2. Replace placeholder values dengan config dari Firebase:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=clarityflow-xxx.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=clarityflow-xxx
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=clarityflow-xxx.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```
3. **SAVE** file `.env`
4. **RESTART** development server:
   ```bash
   # Stop current server (Ctrl+C)
   npm start
   ```

---

### **2. Deploy Security Rules** 🟡 **RECOMMENDED**

#### **Option A: Manual (Easy)**
1. Di Firebase Console > Firestore Database
2. Klik tab "Rules"
3. Copy content dari file `firestore.rules`
4. Paste ke editor
5. Klik "Publish"

#### **Option B: Firebase CLI (Advanced)**
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

---

### **3. Test Authentication** 🧪 **VERIFY**

1. **Restart Development Server**
   ```bash
   npm start
   ```

2. **Open App**
   - Web: http://localhost:8081
   - Mobile: Scan QR code dengan Expo Go

3. **Test Registration**
   - Go to Account tab
   - Click "Daftar Akun Baru"
   - Fill form dengan email valid
   - Click "Daftar"
   - Should show success message

4. **Test Login**
   - Click "Masuk di sini"
   - Use same email/password
   - Should redirect to Account tab
   - Should show user profile

5. **Test Logout**
   - In Account tab, scroll down
   - Click "Logout"
   - Should return to login screen

---

## 🚨 **Troubleshooting**

### **Error: "Firebase not configured"**
- ✅ Check `.env` file has correct values
- ✅ Restart development server
- ✅ Clear Metro cache: `npx expo start --clear`

### **Error: "Email already in use"**
- ✅ Normal behavior - use different email
- ✅ Or check Firebase Console > Authentication > Users

### **Error: "Network request failed"**
- ✅ Check internet connection
- ✅ Check Firebase project is active
- ✅ Check API key is correct

### **Error: "Permission denied"**
- ✅ Deploy Firestore rules
- ✅ Check rules allow authenticated users

---

## 📱 **Platform Testing**

### **Web Browser** 🌐
- ✅ Open http://localhost:8081
- ✅ Test all auth flows

### **iOS Simulator** 📱
- ✅ Install Expo Go from App Store
- ✅ Scan QR code
- ✅ Test auth flows

### **Android Emulator** 🤖
- ✅ Install Expo Go from Play Store
- ✅ Scan QR code
- ✅ Test auth flows

---

## 🎉 **Success Criteria**

You'll know everything works when:
- ✅ No console errors
- ✅ Can register new users
- ✅ Can login/logout
- ✅ User data appears in Firebase Console
- ✅ Account tab shows user profile
- ✅ Navigation works smoothly

---

## 📞 **Need Help?**

If you encounter issues:
1. Check console for error messages
2. Verify Firebase config in `.env`
3. Check Firebase Console for project status
4. Restart development server
5. Clear Metro cache

---

**Status: Ready for Firebase Setup** 🚀

*Complete the steps above to activate Firebase authentication!*