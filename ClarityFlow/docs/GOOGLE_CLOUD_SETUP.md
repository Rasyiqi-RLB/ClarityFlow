# Setup Google Cloud Console untuk Cloud Backup

## Langkah-langkah Setup:

### 1. Buka Google Cloud Console
- Kunjungi: https://console.cloud.google.com/
- Login dengan akun Google Anda

### 2. Buat atau Pilih Project
- Jika belum ada project, klik "Create Project"
- Beri nama project (contoh: "ClarityFlow")
- Klik "Create"

### 3. Enable Google Drive API
- Di sidebar kiri, pilih "APIs & Services" > "Library"
- Cari "Google Drive API"
- Klik pada "Google Drive API" (bukan Drive Labels atau Drive Activity)
- Klik "Enable"

### 4. Buat Credentials
- Di sidebar kiri, pilih "APIs & Services" > "Credentials"
- Klik "Create Credentials" > "OAuth 2.0 Client IDs"
- Jika diminta, konfigurasi OAuth consent screen terlebih dahulu:
  - Pilih "External" user type
  - Isi nama aplikasi: "ClarityFlow"
  - Isi email support dan developer email
  - Klik "Save and Continue" sampai selesai

### 5. Konfigurasi OAuth 2.0 Client
- Application type: "Web application"
- Name: "ClarityFlow Web Client"
- Authorized JavaScript origins:
  - `http://localhost:8081`
  - `http://localhost:3000`
  - `http://127.0.0.1:8081`
  - `http://127.0.0.1:3000`
- Authorized redirect URIs: (kosongkan untuk sekarang)
- Klik "Create"

### 6. Copy Client ID
- Setelah dibuat, akan muncul popup dengan Client ID
- Copy Client ID yang dimulai dengan angka dan diakhiri dengan `.apps.googleusercontent.com`
- Paste ke file `.env` sebagai `EXPO_PUBLIC_GOOGLE_CLIENT_ID`

### 7. Update Environment Variables
```bash
# Di file .env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

### 8. Update web/env.js
```javascript
// Di file web/env.js
window.ENV = {
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: 'your_client_id_here.apps.googleusercontent.com'
};
```

## Troubleshooting:

### Error: "unauthorized_client"
- Pastikan domain localhost sudah ditambahkan ke authorized origins
- Periksa format Client ID sudah benar

### Error: "popup_blocked"
- Izinkan popup di browser untuk localhost
- Coba disable popup blocker sementara

### Error: "Client ID tidak ditemukan"
- Pastikan environment variable sudah diset dengan benar
- Restart development server setelah mengubah .env

## Testing:
1. Restart development server: `npx expo start --web`
2. Buka aplikasi di browser
3. Masuk ke Account > Cloud Backup
4. Klik "Login ke Google Drive"
5. Harus muncul popup login Google

## Catatan Keamanan:
- Client ID boleh di-expose di frontend (tidak rahasia)
- Jangan share Client Secret jika ada
- Untuk production, tambahkan domain production ke authorized origins