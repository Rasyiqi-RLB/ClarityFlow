#!/usr/bin/env node

/**
 * Firebase API Key Validator
 * Script untuk memvalidasi API key Firebase yang baru
 */

const https = require('https');

// Fungsi untuk memvalidasi format API key
function validateApiKeyFormat(apiKey) {
  console.log('🔍 Validating API Key Format...');
  
  if (!apiKey) {
    console.log('❌ API Key is empty or undefined');
    return false;
  }
  
  if (!apiKey.startsWith('AIza')) {
    console.log('❌ API Key should start with "AIza"');
    return false;
  }
  
  if (apiKey.length < 30) {
    console.log('❌ API Key seems too short (should be ~39 characters)');
    return false;
  }
  
  if (!/^[A-Za-z0-9_-]+$/.test(apiKey)) {
    console.log('❌ API Key contains invalid characters');
    return false;
  }
  
  console.log('✅ API Key format is valid');
  return true;
}

// Fungsi untuk test API key dengan Firebase
function testApiKey(apiKey, projectId) {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing API Key with Firebase...');
    
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const postData = JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123',
      returnSecureToken: true
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 400 && response.error) {
            if (response.error.message.includes('API_KEY_INVALID') || 
                response.error.message.includes('API key not valid')) {
              console.log('❌ API Key is invalid');
              resolve(false);
            } else if (response.error.message.includes('EMAIL_EXISTS') ||
                      response.error.message.includes('WEAK_PASSWORD') ||
                      response.error.message.includes('INVALID_EMAIL')) {
              console.log('✅ API Key is valid (Firebase responded with expected error)');
              resolve(true);
            } else {
              console.log('⚠️ API Key might be valid, but got unexpected error:', response.error.message);
              resolve(true);
            }
          } else if (res.statusCode === 200) {
            console.log('✅ API Key is valid (test signup successful)');
            resolve(true);
          } else {
            console.log('⚠️ Unexpected response:', res.statusCode, data);
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Error parsing response:', error.message);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Network error:', error.message);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

// Main validation function
async function validateFirebaseConfig() {
  console.log('🔥 Firebase Configuration Validator');
  console.log('=====================================\n');
  
  // Read from environment or use fallback
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCOklyr-gdlT9LQbyYku-m3rvW8ZNe60I4';
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'ai-eisenhower-matrix';
  
  console.log('📋 Configuration:');
  console.log('Project ID:', projectId);
  console.log('API Key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  console.log('');
  
  // Step 1: Validate format
  const formatValid = validateApiKeyFormat(apiKey);
  if (!formatValid) {
    console.log('\n❌ API Key format validation failed');
    return false;
  }
  
  // Step 2: Test with Firebase
  const apiValid = await testApiKey(apiKey, projectId);
  
  console.log('\n📊 Validation Results:');
  console.log('Format Valid:', formatValid ? '✅' : '❌');
  console.log('API Valid:', apiValid ? '✅' : '❌');
  
  if (formatValid && apiValid) {
    console.log('\n🎉 Firebase configuration is valid!');
    console.log('You can now use this API key for authentication.');
    return true;
  } else {
    console.log('\n🚨 Firebase configuration has issues!');
    console.log('Please get a new API key from Firebase Console.');
    return false;
  }
}

// Run validation if called directly
if (require.main === module) {
  validateFirebaseConfig().catch(console.error);
}

module.exports = { validateFirebaseConfig, validateApiKeyFormat, testApiKey };