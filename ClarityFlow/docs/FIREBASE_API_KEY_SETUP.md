# Firebase API Key Setup Guide

## ❌ Masalah Saat Ini

Error yang muncul:
```
FirebaseError: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

**Penyebab**: API key yang digunakan masih placeholder/dummy, bukan API key yang valid dari Firebase project.

## 🔧 Cara Memperbaiki

### 1. Buka Firebase Console
- Kunjungi: https://console.firebase.google.com/
- Login dengan akun Google Anda

### 2. Buat atau Pilih Project
- **Jika belum ada project**: Klik "Create a project" dan ikuti langkah-langkahnya
- **Jika sudah ada project**: Pilih project yang ingin digunakan

### 3. Tambahkan Web App
- Di dashboard project, klik ikon "Web" (</>) untuk menambahkan web app
- Berikan nama untuk app (contoh: "ClarityFlow Web")
- **PENTING**: Centang "Also set up Firebase Hosting" jika ingin deploy ke web
- Klik "Register app"

### 4. Salin Konfigurasi Firebase
Setelah registrasi, Anda akan melihat konfigurasi seperti ini:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

### 5. Update File .env
Buka file `.env` dan ganti semua nilai dengan konfigurasi yang benar:

```env
# Firebase Configuration - GANTI DENGAN NILAI YANG BENAR
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
```

### 6. Aktifkan Authentication
- Di Firebase Console, pilih "Authentication" dari menu kiri
- Klik tab "Sign-in method"
- Aktifkan "Email/Password" dan "Google" sebagai provider

### 7. Setup Google Sign-In
- Di tab "Sign-in method", klik "Google"
- Aktifkan Google sign-in
- Pilih support email
- **PENTING**: Salin "Web client ID" yang muncul
- Update `webClientId` di `config/firebase.ts`:

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});
```

### 8. Setup Firestore Database
- Di Firebase Console, pilih "Firestore Database"
- Klik "Create database"
- Pilih "Start in test mode" untuk development
- Pilih lokasi server (pilih yang terdekat dengan user Anda)

### 9. Restart Development Server
Setelah mengupdate konfigurasi:
```bash
# Stop server yang sedang berjalan (Ctrl+C)
# Kemudian restart
npx expo start --clear
```

## 🔒 Keamanan

### Environment Variables
- **JANGAN** commit file `.env` ke repository
- Pastikan `.env` ada di `.gitignore`
- Untuk production, set environment variables di hosting platform

### Firebase Security Rules
Update Firestore rules untuk production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks belong to authenticated users
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🧪 Testing

Setelah setup selesai:
1. Buka aplikasi di browser: `http://localhost:8083`
2. Klik tombol "Sign in with Google"
3. Popup Google OAuth harus muncul
4. Login berhasil tanpa error API key

## 🚨 Troubleshooting

### Error: "API key not valid"
- Pastikan API key di `.env` sudah benar
- Restart development server
- Clear browser cache

### Error: "Project not found"
- Pastikan `projectId` di `.env` sudah benar
- Pastikan project aktif di Firebase Console

### Google Sign-In tidak muncul
- Pastikan Google provider sudah diaktifkan
- Pastikan `webClientId` sudah benar
- Check browser console untuk error lainnya

## 📝 Checklist

- [ ] Buat/pilih Firebase project
- [ ] Tambahkan web app ke project
- [ ] Salin konfigurasi Firebase
- [ ] Update file `.env` dengan nilai yang benar
- [ ] Aktifkan Authentication (Email/Password + Google)
- [ ] Setup Firestore Database
- [ ] Update `webClientId` untuk Google Sign-In
- [ ] Restart development server
- [ ] Test login functionality

---

**Catatan**: Setelah mengikuti panduan ini, Google Sign-In akan berfungsi dengan baik di web platform!