# 🚨 URGENT: Firebase API Key Invalid - Panduan Perbaikan

## ❌ **Error Saat Ini:**
```
Login Gagal: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## 🔍 **Analisis Masalah:**
- API key `AIzaSyCOklyr-gdlT9LQbyYku-m3rvW8ZNe60I4` tidak valid
- Kemungkinan API key expired atau tidak dikonfigurasi dengan benar
- Perlu mendapatkan API key baru dari Firebase Console

## 🛠️ **LANGKAH PERBAIKAN SEGERA:**

### **Step 1: Buka Firebase Console**
1. Kunjungi: https://console.firebase.google.com/
2. Login dengan akun Google yang memiliki akses ke project
3. Pilih project: **ai-eisenhower-matrix**

### **Step 2: Dapatkan Konfigurasi Web App**
1. Di Firebase Console, klik ⚙️ **Settings** (pojok kiri bawah)
2. Pilih **Project settings**
3. Scroll ke bagian **"Your apps"**
4. Cari aplikasi Web (ikon `</>`), atau klik **"Add app"** → **"Web"** jika belum ada
5. Klik pada aplikasi Web yang ada
6. Copy **seluruh konfigurasi** yang ditampilkan:

```javascript
const firebaseConfig = {
  apiKey: "COPY_API_KEY_DARI_SINI",
  authDomain: "ai-eisenhower-matrix.firebaseapp.com",
  projectId: "ai-eisenhower-matrix",
  storageBucket: "ai-eisenhower-matrix.appspot.com",
  messagingSenderId: "56252020077",
  appId: "COPY_APP_ID_DARI_SINI",
  measurementId: "COPY_MEASUREMENT_ID_DARI_SINI"
};
```

### **Step 3: Update File .env**
Ganti isi file `.env` dengan konfigurasi baru:

```env
# Firebase Configuration (ai-eisenhower-matrix project) - UPDATED
EXPO_PUBLIC_FIREBASE_API_KEY=PASTE_NEW_API_KEY_HERE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-eisenhower-matrix.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ai-eisenhower-matrix
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=56252020077
EXPO_PUBLIC_FIREBASE_APP_ID=PASTE_NEW_APP_ID_HERE
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=PASTE_NEW_MEASUREMENT_ID_HERE

# Google Drive API Configuration
EXPO_PUBLIC_GOOGLE_DRIVE_API_KEY=PASTE_NEW_API_KEY_HERE
EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=56252020077-v5jknflvp7msmpi9kg0bvc478epf8lhe.apps.googleusercontent.com
```

### **Step 4: Restart Development Server**
```bash
# Stop current server (Ctrl+C)
# Then restart with clear cache
npx expo start --clear
```

## 🔐 **Verifikasi Google Cloud Console (Opsional)**

Jika masih error, periksa di Google Cloud Console:

1. Kunjungi: https://console.cloud.google.com/
2. Pilih project: **ai-eisenhower-matrix**
3. Navigasi ke: **APIs & Services** → **Credentials**
4. Periksa API keys yang tersedia
5. Pastikan API key memiliki restrictions yang benar untuk domain Anda

## 🧪 **Test Setelah Update**

1. Restart development server
2. Buka aplikasi di browser
3. Coba login dengan email/password
4. Periksa console browser untuk error

## 📋 **Checklist:**

- [ ] Buka Firebase Console
- [ ] Copy konfigurasi web app yang baru
- [ ] Update file .env dengan API key baru
- [ ] Restart development server dengan --clear
- [ ] Test login functionality
- [ ] Verifikasi tidak ada error di console

## 🆘 **Jika Masih Error:**

1. **Clear semua cache:**
   ```bash
   npx expo start --clear
   rm -rf node_modules
   npm install
   npx expo start
   ```

2. **Periksa browser console untuk detail error**

3. **Pastikan domain sudah ditambahkan di Firebase Authentication settings**

---

**⏰ Status:** Menunggu update API key dari Firebase Console  
**🎯 Priority:** HIGH - Login tidak berfungsi  
**📞 Contact:** Firebase Support jika diperlukan