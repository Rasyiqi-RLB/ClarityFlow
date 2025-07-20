# Google Sign-In Setup untuk ClarityFlow

## Langkah-langkah Setup

### 1. Firebase Console Setup
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project ClarityFlow atau buat project baru
3. Pergi ke **Authentication** > **Sign-in method**
4. Enable **Google** sebagai sign-in provider
5. Tambahkan domain yang diizinkan (localhost untuk development)

### 2. Google Cloud Console Setup
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project yang sama dengan Firebase
3. Pergi ke **APIs & Services** > **Credentials**
4. Buat **OAuth 2.0 Client IDs** untuk:
   - **Android**: Package name `com.clarityflow.app`
   - **iOS**: Bundle ID `com.clarityflow.app`
   - **Web**: Untuk Firebase Authentication

### 3. Download Configuration Files

#### Android
1. Download `google-services.json` dari Firebase Console
2. Letakkan di `android/app/google-services.json`
3. Pastikan package name di file tersebut adalah `com.clarityflow.app`

#### iOS
1. Download `GoogleService-Info.plist` dari Firebase Console
2. Letakkan di `ios/ClarityFlow/GoogleService-Info.plist`
3. Pastikan bundle identifier adalah `com.clarityflow.app`

### 4. Update Firebase Config
Update file `config/firebase.ts` dengan webClientId yang benar:

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});
```

### 5. Testing

#### Development
- Untuk testing di development, pastikan menggunakan debug keystore
- SHA-1 fingerprint harus didaftarkan di Firebase Console

#### Production
- Gunakan release keystore untuk production build
- Daftarkan SHA-1 fingerprint production di Firebase Console

### 6. Troubleshooting

#### Error: "DEVELOPER_ERROR"
- Pastikan SHA-1 fingerprint sudah didaftarkan
- Periksa package name/bundle identifier
- Pastikan google-services.json/GoogleService-Info.plist sudah benar

#### Error: "SIGN_IN_CANCELLED"
- User membatalkan sign-in (normal behavior)

#### Error: "SIGN_IN_REQUIRED"
- User perlu sign-in ulang

#### Error: "NETWORK_ERROR"
- Periksa koneksi internet
- Pastikan Google Play Services tersedia (Android)

### 7. Commands untuk Development

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios
```

### 8. Important Notes

- File `google-services.json` yang disediakan adalah template dan harus diganti dengan file asli dari Firebase Console
- WebClientId di `firebase.ts` harus diganti dengan client ID yang benar
- Untuk production, pastikan menggunakan keystore yang benar dan SHA-1 fingerprint yang sesuai
- Google Sign-In tidak akan bekerja di web platform dengan konfigurasi saat ini

### 9. Security

- Jangan commit file konfigurasi asli ke repository public
- Gunakan environment variables untuk sensitive data
- Pastikan hanya domain yang dipercaya yang didaftarkan di OAuth settings