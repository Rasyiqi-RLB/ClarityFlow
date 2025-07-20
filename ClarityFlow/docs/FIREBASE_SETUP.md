# Firebase Authentication Setup Guide

## Overview
ClarityFlow sekarang menggunakan Firebase Authentication untuk sistem login dan registrasi yang aman dan scalable.

## Setup Instructions

### 1. Firebase Console Setup
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
4. Aktifkan Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set rules untuk development (optional)

### 2. Environment Configuration
1. Copy `.env.example` ke `.env`
2. Isi kredensial Firebase dari Project Settings > General > Your apps
3. Pastikan semua variabel environment terisi dengan benar

### 3. Firestore Security Rules (Optional)
Untuk development, Anda bisa menggunakan rules berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow admins to read all users
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Features Implemented

### Authentication Service
- ✅ User Registration dengan email/password
- ✅ User Login dengan email/password
- ✅ User Logout
- ✅ Get Current User
- ✅ Role-based access (admin/member)
- ✅ Profile management
- ✅ Error handling untuk berbagai kasus

### UI Components
- ✅ Login Screen dengan validasi
- ✅ Register Screen dengan validasi
- ✅ Account Screen dengan user info
- ✅ Navigation antar screens
- ✅ Loading states dan error handling

### User Data Structure
```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  createdAt: Date;
  lastLoginAt?: Date;
}
```

## Testing

### Manual Testing
1. Jalankan aplikasi: `npm start`
2. Test registrasi user baru
3. Test login dengan kredensial yang benar
4. Test logout functionality
5. Verify user data tersimpan di Firestore

### Error Scenarios
- Email sudah terdaftar
- Email format tidak valid
- Password terlalu lemah
- Network errors
- Invalid credentials

## Migration dari Mock Auth

Sistem authentication sebelumnya menggunakan mock data. Sekarang:
- Data user tersimpan di Firestore
- Authentication state persistent
- Real-time sync dengan Firebase
- Secure password handling

## Next Steps

1. **Email Verification**: Implementasi verifikasi email
2. **Password Reset**: Fitur reset password
3. **Social Login**: Google, Facebook login
4. **Profile Pictures**: Upload dan manage avatar
5. **Admin Panel**: Management user untuk admin

## Troubleshooting

### Common Issues
1. **Firebase not initialized**: Pastikan .env file sudah benar
2. **Network errors**: Check internet connection
3. **Permission denied**: Verify Firestore rules
4. **Invalid credentials**: Check email/password format

### Debug Tips
- Check console logs untuk error details
- Verify Firebase project configuration
- Test dengan Firebase Auth emulator untuk development

## Security Best Practices

- ✅ Environment variables untuk sensitive data
- ✅ Client-side validation
- ✅ Server-side validation via Firebase
- ✅ Role-based access control
- ✅ Secure password requirements
- ⏳ Rate limiting (Firebase handles this)
- ⏳ Email verification
- ⏳ Password reset functionality

---

**Note**: Pastikan untuk tidak commit file `.env` ke repository. File ini sudah ditambahkan ke `.gitignore`.