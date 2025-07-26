import { getAnalytics, isSupported } from 'firebase/analytics';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  GoogleAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Note: Google Sign-In module import moved to FirebaseAuthService

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCOklyr-gdlT9LQbyYku-m3rvW8ZNe60I4",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "ai-eisenhower-matrix.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "ai-eisenhower-matrix",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "56252020077",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:56252020077:web:620af7e347ccd66c779664",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KZB0BX7L3K"
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

  if (missingKeys.length > 0) {
    console.warn('Missing Firebase configuration keys:', missingKeys);
  }

  return missingKeys.length === 0;
};

// Initialize Firebase app (only once) with better error handling
let app: FirebaseApp;
try {
  if (getApps().length === 0) {
    if (validateConfig()) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized successfully');
    } else {
      console.warn('Firebase configuration incomplete, using fallback');
      // Use fallback config that won't crash
      app = initializeApp({
        apiKey: firebaseConfig.apiKey || "fallback-key",
        authDomain: firebaseConfig.authDomain || "fallback.firebaseapp.com",
        projectId: firebaseConfig.projectId || "fallback-project",
        appId: firebaseConfig.appId || "fallback-app-id"
      });
    }
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase app instance');
  }
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  // Create a minimal app instance to prevent crashes
  try {
    app = initializeApp({
      apiKey: "minimal-fallback-key",
      authDomain: "minimal-fallback.firebaseapp.com",
      projectId: "minimal-fallback-project",
      appId: "minimal-fallback-app"
    });
    console.log('Firebase fallback app created');
  } catch (fallbackError) {
    console.error('Even fallback Firebase init failed:', fallbackError);
    throw new Error('Firebase initialization completely failed');
  }
}

// Initialize Firebase Auth
let auth: Auth;

try {
  auth = getAuth(app);
  console.log('Firebase Auth initialized successfully');

  // Note: The AsyncStorage warning in Expo Go is expected and will not appear in production builds.
  // Firebase v11 automatically detects and uses AsyncStorage when available in production.
  // In Expo Go, some persistence features are limited, but this doesn't affect functionality.

} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
  // Fallback
  auth = getAuth(app);
}

// Initialize Firebase Analytics (only on web platform and when enabled)
let analytics: any = null;
if (Platform.OS === 'web') {
  // Import environment config to check if analytics is enabled
  import('./environment').then(({ ENV }) => {
    if (ENV.features.enableAnalytics) {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log('Firebase Analytics initialized successfully');
        }
      }).catch((error) => {
        console.log('Analytics not supported:', error);
      });
    } else {
      console.log('Firebase Analytics disabled by environment configuration');
    }
  }).catch((error) => {
    console.log('Failed to load environment config:', error);
  });
}

// Note: Google Sign-In configuration handled in FirebaseAuthService to avoid duplication

// Initialize Firestore
const db = getFirestore(app);
console.log('Firestore initialized successfully');

// Development emulator setup (uncomment for local development)
// if (__DEV__ && Platform.OS !== 'web') {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     console.log('Connected to Firebase emulators');
//   } catch (error) {
//     console.log('Emulator connection failed:', error);
//   }
// }

// Utility function to safely get analytics instance
export const getAnalyticsInstance = () => {
  if (Platform.OS !== 'web') {
    return null;
  }

  // Check if analytics should be enabled
  try {
    const { ENV } = require('./environment');
    if (!ENV.features.enableAnalytics) {
      return null;
    }
  } catch (error) {
    console.log('Could not check analytics configuration:', error);
    return null;
  }

  return analytics;
};

export { analytics, app, auth, db, GoogleAuthProvider };
export default app;