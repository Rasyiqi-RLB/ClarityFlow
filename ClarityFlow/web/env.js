// Environment variables for web platform
window.ENV = {
  EXPO_PUBLIC_FIREBASE_API_KEY: 'AIzaSyCOklyr-gdlT9LQbyYku-m3rvW8ZNe60I4',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'ai-eisenhower-matrix.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'ai-eisenhower-matrix',
  EXPO_PUBLIC_FIREBASE_APP_ID: '1:56252020077:web:32046de038ddd197779664',
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: '56252020077-v5jknflvp7msmpi9kg0bvc478epf8lhe.apps.googleusercontent.com'
};

// Also set process.env for compatibility
if (typeof process !== 'undefined' && process.env) {
  Object.assign(process.env, window.ENV);
}