#!/bin/bash

# Generate Upload Keystore for ClarityFlow Production
# This script creates a keystore for signing production builds

echo "🔐 Generating ClarityFlow Upload Keystore..."

# Configuration
KEYSTORE_NAME="clarityflow-upload-key.keystore"
KEY_ALIAS="clarityflow-upload"
VALIDITY_YEARS=25
KEY_SIZE=2048

# Create android directory if it doesn't exist
mkdir -p android

# Generate keystore
echo "📝 Please provide the following information for your keystore:"
echo ""

keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore android/$KEYSTORE_NAME \
  -alias $KEY_ALIAS \
  -keyalg RSA \
  -keysize $KEY_SIZE \
  -validity $(($VALIDITY_YEARS * 365)) \
  -dname "CN=ClarityFlow, OU=Development, O=ClarityFlow, L=City, ST=State, C=US"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore generated successfully!"
    echo "📁 Location: android/$KEYSTORE_NAME"
    echo "🔑 Alias: $KEY_ALIAS"
    echo ""
    echo "🚨 IMPORTANT SECURITY NOTES:"
    echo "1. Keep this keystore file SECURE and BACKED UP"
    echo "2. Never commit keystore to version control"
    echo "3. Store passwords in a secure password manager"
    echo "4. You'll need this keystore for ALL future app updates"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update android/gradle.properties with your keystore passwords"
    echo "2. Add keystore file to .gitignore"
    echo "3. Run: npm run build:android:production"
    echo ""
else
    echo "❌ Failed to generate keystore"
    exit 1
fi
