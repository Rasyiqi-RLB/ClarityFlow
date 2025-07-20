# Google Sign-In Activation Guide

Error `auth/operation-not-allowed` menunjukkan bahwa Google Sign-In provider belum diaktifkan di Firebase Console.

## Langkah-langkah Aktivasi:

### 1. Buka Firebase Console
- Kunjungi: https://console.firebase.google.com/project/ai-eisenhower-matrix
- Login dengan akun Google yang memiliki akses ke project

### 2. Navigasi ke Authentication
- Di sidebar kiri, klik **Authentication**
- Pilih tab **Sign-in method**

### 3. Aktifkan Google Provider
- Cari **Google** dalam daftar providers
- Klik pada **Google** provider
- Toggle switch untuk **Enable**
- Masukkan informasi yang diperlukan:
  - **Project support email**: Email yang akan ditampilkan ke user
  - **Web SDK configuration**: Otomatis terisi

### 4. Konfigurasi OAuth Consent Screen (Jika Diperlukan)
- Jika diminta, klik **Configure OAuth consent screen**
- Pilih **External** untuk user type (kecuali organisasi internal)
- Isi informasi aplikasi:
  - **App name**: ClarityFlow - Eisenhower Matrix
  - **User support email**: Email yang valid
  - **App logo**: Optional (bisa dilewati)
  - **App domain**: localhost (untuk development)
  - **Developer contact information**: Email developer
- **Scopes**: Pilih email dan profile (default)
- **Test users**: Tambahkan email untuk testing (optional)

### 5. Authorized Domains
Pastikan domain berikut sudah ditambahkan di **Authorized domains**:
- `localhost` (untuk development)
- Domain production Anda (jika ada)

### 6. Save Configuration
- Klik **Save** untuk menyimpan konfigurasi
- Tunggu beberapa menit untuk propagasi

## Verifikasi
Setelah aktivasi:
1. Restart development server
2. Test Google Sign-In di aplikasi
3. Error `auth/operation-not-allowed` seharusnya hilang

## Troubleshooting

### Jika masih error:
1. **Clear browser cache** dan cookies
2. **Restart development server** dengan `--clear` flag
3. **Periksa console logs** untuk error lain
4. **Verifikasi API key** masih valid

### Error lain yang mungkin muncul:
- `auth/unauthorized-domain`: Tambahkan domain ke Authorized domains
- `auth/api-key-not-valid`: Periksa API key di .env file
- `auth/configuration-not-found`: Tunggu propagasi konfigurasi

## Status Saat Ini
- ❌ Google Sign-In provider: **BELUM AKTIF** (Error: auth/operation-not-allowed)
- ✅ Firebase project: **ai-eisenhower-matrix** 
- ✅ API keys: **VALID** (AIzaSyCOklyr-gdlT9LQbyYku-m3rvW8ZNe60I4)
- ✅ Environment variables: **LOADED**
- ✅ Firebase Auth: **INITIALIZED**
- ✅ Firestore: **INITIALIZED**

## Immediate Action Required

**🚨 CRITICAL**: Google Sign-In provider HARUS diaktifkan di Firebase Console

### Quick Fix Steps:
1. **Buka**: https://console.firebase.google.com/project/ai-eisenhower-matrix/authentication/providers
2. **Klik**: Google provider
3. **Toggle**: Enable switch
4. **Isi**: Support email (required)
5. **Save**: Konfigurasi
6. **Restart**: Development server

### Setelah Aktivasi:
```bash
# Restart server untuk menerapkan perubahan
npx expo start --clear --port 8085
```

**Expected Result**: Error `auth/operation-not-allowed` akan hilang dan Google Sign-In berfungsi normal.