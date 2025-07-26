#!/usr/bin/env node

/**
 * Script untuk memeriksa konfigurasi Firebase dan Google Sign-In
 * Jalankan dengan: node scripts/check-firebase-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Firebase Configuration...\n');

// 1. Check .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env file found');
  
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName} found`);
    } else {
      console.log(`❌ ${varName} missing`);
    }
  });
} else {
  console.log('❌ .env file not found');
}

// 2. Check google-services.json
const googleServicesPath = path.join(__dirname, '..', 'google-services.json');
if (fs.existsSync(googleServicesPath)) {
  console.log('\n✅ google-services.json found');
  
  try {
    const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
    const projectId = googleServices.project_info?.project_id;
    const packageName = googleServices.client?.[0]?.client_info?.android_client_info?.package_name;
    const webClientId = googleServices.client?.[0]?.oauth_client?.[0]?.client_id;
    
    console.log(`📱 Package Name: ${packageName}`);
    console.log(`🔑 Project ID: ${projectId}`);
    console.log(`🌐 Web Client ID: ${webClientId}`);
    
    if (packageName === 'com.clarityflow.app') {
      console.log('✅ Package name is correct');
    } else {
      console.log('❌ Package name should be: com.clarityflow.app');
    }
  } catch (error) {
    console.log('❌ Error parsing google-services.json:', error.message);
  }
} else {
  console.log('❌ google-services.json not found');
}

// 3. Check app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
if (fs.existsSync(appJsonPath)) {
  console.log('\n✅ app.json found');
  
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const androidPackage = appJson.expo?.android?.package;
    const iosBundleId = appJson.expo?.ios?.bundleIdentifier;
    
    console.log(`📱 Android Package: ${androidPackage}`);
    console.log(`🍎 iOS Bundle ID: ${iosBundleId}`);
    
    if (androidPackage === 'com.clarityflow.app' && iosBundleId === 'com.clarityflow.app') {
      console.log('✅ Package identifiers are correct');
    } else {
      console.log('❌ Package identifiers should be: com.clarityflow.app');
    }
  } catch (error) {
    console.log('❌ Error parsing app.json:', error.message);
  }
}

console.log('\n🔧 Firebase Console Setup Instructions:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Select project: ai-eisenhower-matrix');
console.log('3. Go to Authentication > Sign-in method');
console.log('4. Enable Google sign-in');
console.log('5. Add authorized domains:');
console.log('   - localhost');
console.log('   - 127.0.0.1');
console.log('   - Your production domain');
console.log('6. Go to Google Cloud Console > OAuth consent screen');
console.log('7. Add authorized domains and test users');
console.log('8. Verify Web Client ID matches in all configurations');

console.log('\n🚀 If DEVELOPER_ERROR persists:');
console.log('1. Check Firebase Console > Authentication > Settings');
console.log('2. Verify authorized domains include your current domain');
console.log('3. Check Google Cloud Console > Credentials');
console.log('4. Ensure OAuth 2.0 client is configured for web application');
console.log('5. Add JavaScript origins: http://localhost:8081, http://127.0.0.1:8081');
