# 🚀 Environment Variables untuk Deployment Expo

## ❓ **Pertanyaan: Apakah Expo tetap pakai .env ketika deploy?**

**Jawaban Singkat:** Ya dan Tidak - tergantung jenis deployment.

---

## 📱 **Expo Development vs Production**

### **Development (Local)** 🛠️
- ✅ **Menggunakan `.env`** - File dibaca otomatis
- ✅ **Hot reload** - Perubahan .env langsung terdeteksi
- ✅ **Metro bundler** - Memproses environment variables

### **Production (Build/Deploy)** 🏭
- ❌ **TIDAK menggunakan `.env`** - File tidak di-bundle
- ✅ **Build-time variables** - Nilai di-embed saat build
- ✅ **Platform-specific** - Berbeda untuk setiap platform

---

## 🔄 **Cara Kerja Environment Variables di Expo**

### **Development Mode**
```bash
# .env file dibaca
npm start
# atau
npx expo start
```

### **Production Build**
```bash
# Environment variables di-embed ke dalam bundle
npx expo build:web
# atau
eas build --platform all
```

---

## 🎯 **Deployment Strategies**

### **1. Expo Web (Hosting Static)** 🌐

#### **Build Process:**
```bash
# Build untuk production
npx expo export:web

# Environment variables dari .env di-embed ke build
# File .env TIDAK di-upload ke hosting
```

#### **Deployment:**
- ✅ Firebase Hosting
- ✅ Vercel
- ✅ Netlify
- ✅ GitHub Pages

#### **Environment Variables:**
```env
# .env (development)
EXPO_PUBLIC_FIREBASE_API_KEY=dev-key-123

# Production: Set di hosting platform
# Vercel: Environment Variables dashboard
# Netlify: Site settings > Environment variables
# Firebase: firebase functions:config:set
```

### **2. Expo Application Services (EAS)** 📱

#### **Configuration:**
```json
// eas.json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_API_KEY": "dev-key-123"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_API_KEY": "prod-key-456"
      }
    }
  }
}
```

#### **Build Commands:**
```bash
# Development build
eas build --profile development

# Production build
eas build --profile production
```

### **3. Expo Classic Build** 📦

#### **app.json Configuration:**
```json
{
  "expo": {
    "extra": {
      "firebaseApiKey": "prod-key-456"
    }
  }
}
```

#### **Access in Code:**
```typescript
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY
};
```

---

## 🔐 **Security Best Practices**

### **Environment Variables Types** 🛡️

#### **Public Variables (Safe for Client)**
```env
# Prefix dengan EXPO_PUBLIC_
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=clarityflow-xxx
EXPO_PUBLIC_APP_VERSION=1.0.0
```

#### **Private Variables (Server Only)**
```env
# JANGAN gunakan di React Native!
FIREBASE_ADMIN_KEY=secret-key  # ❌ BAHAYA
DATABASE_PASSWORD=secret       # ❌ BAHAYA
```

### **Firebase Security** 🔥

#### **API Key bukan Secret** ✅
```typescript
// Firebase API Key AMAN untuk public
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxx", // ✅ OK
  authDomain: "project.firebaseapp.com",
  projectId: "project-id"
};
```

#### **Security melalui Rules** 🛡️
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Hanya user yang login bisa akses data mereka
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📋 **Rekomendasi untuk ClarityFlow**

### **Current Setup** ✅
```env
# .env (development)
EXPO_PUBLIC_FIREBASE_API_KEY=your-dev-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=clarityflow-dev.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=clarityflow-dev
```

### **Production Setup** 🚀

#### **Option 1: EAS Build (Recommended)**
```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_API_KEY": "AIzaSyPROD...",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "clarityflow-prod"
      }
    }
  }
}
```

#### **Option 2: Multiple .env Files**
```bash
# .env.development
EXPO_PUBLIC_FIREBASE_PROJECT_ID=clarityflow-dev

# .env.production
EXPO_PUBLIC_FIREBASE_PROJECT_ID=clarityflow-prod
```

#### **Option 3: Platform Environment Variables**
```typescript
// config/firebase.ts
const getFirebaseConfig = () => {
  if (__DEV__) {
    // Development config
    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      projectId: "clarityflow-dev"
    };
  } else {
    // Production config
    return {
      apiKey: "AIzaSyPROD...",
      projectId: "clarityflow-prod"
    };
  }
};
```

---

## 🚀 **Deployment Checklist**

### **Pre-Deployment** ✅
- [ ] Buat Firebase project terpisah untuk production
- [ ] Setup environment variables untuk production
- [ ] Test build lokal dengan production config
- [ ] Verify Firebase rules untuk production

### **Web Deployment** 🌐
```bash
# 1. Build untuk web
npx expo export:web

# 2. Deploy ke hosting
# Firebase Hosting:
firebase deploy --only hosting

# Vercel:
vercel --prod

# Netlify:
netlify deploy --prod
```

### **Mobile Deployment** 📱
```bash
# 1. Build dengan EAS
eas build --platform all --profile production

# 2. Submit ke stores
eas submit --platform all
```

---

## 🔍 **Debugging Environment Variables**

### **Check Variables in App**
```typescript
// components/DebugInfo.tsx (development only)
export const DebugInfo = () => {
  if (!__DEV__) return null;
  
  return (
    <View>
      <Text>API Key: {process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.slice(0, 10)}...</Text>
      <Text>Project ID: {process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}</Text>
    </View>
  );
};
```

### **Build-time Verification**
```bash
# Check if variables are embedded
npx expo export:web
grep -r "EXPO_PUBLIC" dist/
```

---

## 📝 **Summary**

### **Development** 🛠️
- ✅ Gunakan `.env` file
- ✅ Hot reload otomatis
- ✅ Easy debugging

### **Production** 🏭
- ❌ `.env` file tidak di-bundle
- ✅ Variables di-embed saat build
- ✅ Platform-specific configuration
- ✅ Security melalui Firebase rules

### **Best Practice** 🎯
1. **Development**: Gunakan `.env`
2. **Production**: Gunakan EAS build profiles atau platform env vars
3. **Security**: Semua Firebase API keys aman untuk public
4. **Separation**: Pisahkan dev dan prod Firebase projects

---

**Kesimpulan: Expo menggunakan .env untuk development, tapi untuk production menggunakan build-time environment variables yang di-embed ke dalam bundle.** 🚀