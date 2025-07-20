import Constants from 'expo-constants';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
    Auth,
    getAuth,
    GoogleAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Conditional import for Google Sign-In to avoid TurboModule errors in Expo Go
let GoogleSignin: any = null;
try {
  if (Platform.OS !== 'web') {
    const isExpoGo = Constants.appOwnership === 'expo';

    if (!isExpoGo) {
      GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    }
  }
} catch (error: any) {
  console.log('Google Sign-In module not available in firebase config:', error.message);
}

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

// Initialize Firebase app (only once)
let app: FirebaseApp;
if (getApps().length === 0) {
  if (validateConfig()) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    throw new Error('Firebase configuration is incomplete');
  }
} else {
  app = getApps()[0];
}

// Initialize Firebase Auth
let auth: Auth;
try {
  auth = getAuth(app);
  console.log('Firebase Auth initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
  // Fallback to basic auth
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

// Configure Google Sign-In
if (Platform.OS !== 'web' && GoogleSignin) {
  try {
    const isExpoGo = Constants.appOwnership === 'expo';

    if (!isExpoGo) {
      GoogleSignin.configure({
        webClientId: '56252020077-v5jknflvp7msmpi9kg0bvc478epf8lhe.apps.googleusercontent.com', // Web client ID for ai-eisenhower-matrix project
        offlineAccess: true,
      });
      console.log('Google Sign-In configured successfully in firebase config');
    } else {
      console.log('Running in Expo Go - Google Sign-In configuration skipped in firebase config');
    }
  } catch (configError) {
    console.error('Error configuring Google Sign-In in firebase config:', configError);
  }
} else if (Platform.OS !== 'web') {
  console.log('Google Sign-In module not available in firebase config - skipping configuration');
}

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