# 🔧 Firebase API Key Fix Guide

## ❌ **Error yang Terjadi:**
```
Login Gagal: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## 🔍 **Penyebab Masalah:**
- API key Firebase tidak valid atau expired
- Konfigurasi API key tidak sesuai dengan project Firebase
- API key tidak memiliki permission yang tepat

## 🛠️ **Langkah Perbaikan:**

### **1. Dapatkan API Key Baru dari Firebase Console**

1. **Buka Firebase Console:**
   - Kunjungi: https://console.firebase.google.com/
   - Pilih project: `ai-eisenhower-matrix`

2. **Navigasi ke Project Settings:**
   - Klik ⚙️ (Settings) di sidebar kiri
   - Pilih "Project settings"

3. **Scroll ke bagian "Your apps":**
   - Cari aplikasi Web yang sudah ada
   - Atau klik "Add app" → "Web" jika belum ada

4. **Copy konfigurasi Firebase:**
   ```javascript
   const firebaseConfig = {
     apiKey: "NEW_API_KEY_HERE",
     authDomain: "ai-eisenhower-matrix.firebaseapp.com",
     projectId: "ai-eisenhower-matrix",
     storageBucket: "ai-eisenhower-matrix.appspot.com",
     messagingSenderId: "56252020077",
     appId: "NEW_APP_ID_HERE",
     measurementId: "NEW_MEASUREMENT_ID_HERE"
   };
   ```

### **2. Update File .env**

Ganti API key di file `.env`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=NEW_API_KEY_FROM_CONSOLE
EXPO_PUBLIC_FIREBASE_APP_ID=NEW_APP_ID_FROM_CONSOLE
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=NEW_MEASUREMENT_ID_FROM_CONSOLE
```

### **3. Verifikasi Google Cloud Console**

1. **Buka Google Cloud Console:**
   - Kunjungi: https://console.cloud.google.com/
   - Pilih project: `ai-eisenhower-matrix`

2. **Navigasi ke APIs & Services > Credentials:**
   - Periksa API keys yang tersedia
   - Pastikan API key memiliki restrictions yang benar

3. **Enable APIs yang diperlukan:**
   - Firebase Authentication API
   - Cloud Firestore API
   - Firebase Analytics API

### **4. Test Konfigurasi**

Setelah update, restart development server:
```bash
npx expo start --clear
```

## 🔐 **API Key Security Best Practices:**

1. **Restrict API Key:**
   - Set HTTP referrers untuk web app
   - Set bundle ID untuk mobile app

2. **Monitor Usage:**
   - Check quota usage di Google Cloud Console
   - Set up alerts untuk unusual activity

3. **Regular Rotation:**
   - Rotate API keys secara berkala
   - Update semua environments

## 📝 **Checklist Verifikasi:**

- [ ] API key baru dari Firebase Console
- [ ] File .env sudah diupdate
- [ ] Google Cloud APIs sudah enabled
- [ ] API key restrictions sudah diset
- [ ] Development server sudah direstart
- [ ] Login test berhasil

## 🚨 **Jika Masih Error:**

1. **Clear cache:**
   ```bash
   npx expo start --clear
   rm -rf node_modules
   npm install
   ```

2. **Check browser console untuk error details**

3. **Verifikasi network requests di Developer Tools**

4. **Contact Firebase Support jika diperlukan**

---
**Status:** 🔄 Menunggu update API key dari Firebase Console
**Next Step:** Update .env dengan API key yang valid