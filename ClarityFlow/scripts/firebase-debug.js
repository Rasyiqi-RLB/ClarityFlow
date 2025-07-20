// Firebase Configuration Debug Script
// Jalankan script ini untuk memverifikasi konfigurasi Firebase

console.log('🔍 Firebase Configuration Debug');
console.log('================================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('EXPO_PUBLIC_FIREBASE_API_KEY:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing');
console.log('EXPO_PUBLIC_FIREBASE_PROJECT_ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
console.log('EXPO_PUBLIC_FIREBASE_APP_ID:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing');

// Check API key format
const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
console.log('\n🔑 API Key Analysis:');
if (apiKey) {
  console.log('Length:', apiKey.length);
  console.log('Starts with AIza:', apiKey.startsWith('AIza') ? '✅ Valid format' : '❌ Invalid format');
  console.log('Contains special chars:', /[^A-Za-z0-9_-]/.test(apiKey) ? '⚠️ Yes' : '✅ No');
  console.log('First 10 chars:', apiKey.substring(0, 10) + '...');
} else {
  console.log('❌ API Key not found');
}

// Test Firebase initialization
console.log('\n🔥 Firebase Initialization Test:');
try {
  // Import Firebase config
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCOklyr-gdlT9LQbyYku-m3rvW8ZNe60I4",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "ai-eisenhower-matrix.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "ai-eisenhower-matrix",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "56252020077",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:56252020077:web:620af7e347ccd66c779664",
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KZB0BX7L3K"
  };

  console.log('Config object created:', '✅ Success');
  
  // Validate required fields
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length === 0) {
    console.log('All required fields present:', '✅ Success');
  } else {
    console.log('Missing fields:', '❌', missingFields.join(', '));
  }

} catch (error) {
  console.log('❌ Error:', error.message);
}

// Recommendations
console.log('\n💡 Recommendations:');
console.log('1. Get new API key from Firebase Console');
console.log('2. Update .env file with new credentials');
console.log('3. Restart development server');
console.log('4. Test authentication again');

console.log('\n🔗 Useful Links:');
console.log('Firebase Console: https://console.firebase.google.com/');
console.log('Google Cloud Console: https://console.cloud.google.com/');
console.log('Project: ai-eisenhower-matrix');

export default function debugFirebaseConfig() {
  return {
    status: 'debug_complete',
    timestamp: new Date().toISOString()
  };
}