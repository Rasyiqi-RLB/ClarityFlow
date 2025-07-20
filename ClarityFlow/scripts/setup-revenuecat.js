#!/usr/bin/env node

/**
 * RevenueCat Setup Script for ClarityFlow
 * 
 * This script helps you set up RevenueCat integration by:
 * 1. Validating your configuration
 * 2. Updating config files with your API keys
 * 3. Enabling RevenueCat in the code
 * 4. Providing next steps
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CONFIG_FILE = path.join(__dirname, '../config/purchaseConfig.ts');
const PURCHASE_SERVICE_FILE = path.join(__dirname, '../services/purchaseService.ts');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  log('\n🚀 ClarityFlow RevenueCat Setup', 'cyan');
  log('=====================================', 'cyan');
  
  log('\nThis script will help you set up RevenueCat integration.', 'bright');
  log('Make sure you have:', 'yellow');
  log('✓ Created a RevenueCat account', 'green');
  log('✓ Added your app to RevenueCat', 'green');
  log('✓ Got your API keys from RevenueCat dashboard', 'green');
  log('✓ Created products in App Store/Google Play', 'green');
  log('✓ Added products to RevenueCat', 'green');
  
  const proceed = await question('\nDo you want to continue? (y/n): ');
  if (proceed.toLowerCase() !== 'y') {
    log('Setup cancelled.', 'yellow');
    rl.close();
    return;
  }

  // Get API keys
  log('\n📱 API Keys Setup', 'blue');
  log('Get these from: https://app.revenuecat.com/apps', 'cyan');
  
  const iosApiKey = await question('\nEnter your iOS API key (appl_...): ');
  const androidApiKey = await question('Enter your Android API key (goog_...): ');
  
  // Validate API keys
  if (!iosApiKey.startsWith('appl_') || !androidApiKey.startsWith('goog_')) {
    log('\n❌ Invalid API keys format!', 'red');
    log('iOS keys should start with "appl_"', 'yellow');
    log('Android keys should start with "goog_"', 'yellow');
    rl.close();
    return;
  }

  // Update config file
  log('\n📝 Updating configuration...', 'blue');
  
  try {
    let configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
    
    // Update API keys
    configContent = configContent.replace(
      /ios: 'appl_YOUR_IOS_API_KEY_FROM_REVENUECAT'/,
      `ios: '${iosApiKey}'`
    );
    configContent = configContent.replace(
      /android: 'goog_YOUR_ANDROID_API_KEY_FROM_REVENUECAT'/,
      `android: '${androidApiKey}'`
    );
    
    // Enable RevenueCat
    configContent = configContent.replace(
      /export const USE_REAL_REVENUECAT = false;/,
      'export const USE_REAL_REVENUECAT = true;'
    );
    
    fs.writeFileSync(CONFIG_FILE, configContent);
    log('✓ Configuration updated successfully!', 'green');
    
  } catch (error) {
    log(`❌ Failed to update configuration: ${error.message}`, 'red');
    rl.close();
    return;
  }

  // Ask about uncommenting RevenueCat code
  log('\n🔧 Code Setup', 'blue');
  const uncommentCode = await question('Do you want to uncomment RevenueCat imports and code? (y/n): ');
  
  if (uncommentCode.toLowerCase() === 'y') {
    try {
      let serviceContent = fs.readFileSync(PURCHASE_SERVICE_FILE, 'utf8');
      
      // Uncomment imports
      serviceContent = serviceContent.replace(
        /\/\/ import Purchases, \{/g,
        'import Purchases, {'
      );
      serviceContent = serviceContent.replace(
        /\/\/   (PurchasesOffering|PurchasesPackage|CustomerInfo|PurchasesError)/g,
        '  $1'
      );
      serviceContent = serviceContent.replace(
        /\/\/ \} from 'react-native-purchases';/,
        '} from \'react-native-purchases\';'
      );
      
      // Uncomment method implementations (this is more complex, so we'll provide instructions)
      
      fs.writeFileSync(PURCHASE_SERVICE_FILE, serviceContent);
      log('✓ RevenueCat imports uncommented!', 'green');
      
    } catch (error) {
      log(`❌ Failed to update service file: ${error.message}`, 'red');
    }
  }

  // Next steps
  log('\n🎯 Next Steps', 'magenta');
  log('=============', 'magenta');
  log('1. Install RevenueCat package:', 'bright');
  log('   npm install react-native-purchases', 'cyan');
  log('   # or for Expo:', 'cyan');
  log('   npx expo install react-native-purchases', 'cyan');
  
  log('\n2. Manually uncomment RevenueCat method implementations in:', 'bright');
  log('   services/purchaseService.ts', 'cyan');
  log('   (Look for /* ... */ blocks in loadRealOfferings and loadRealCustomerInfo)', 'yellow');
  
  log('\n3. Test in development:', 'bright');
  log('   - RevenueCat provides sandbox testing automatically', 'cyan');
  log('   - Use test accounts for iOS/Android', 'cyan');
  
  log('\n4. Configure products in RevenueCat dashboard:', 'bright');
  log('   - Create entitlements: ads_removed, premium, lifetime', 'cyan');
  log('   - Create offerings with your products', 'cyan');
  log('   - Match product IDs with your store products', 'cyan');
  
  log('\n5. Test all purchase flows:', 'bright');
  log('   - Purchase remove ads', 'cyan');
  log('   - Purchase premium subscription', 'cyan');
  log('   - Restore purchases', 'cyan');
  log('   - Handle errors and edge cases', 'cyan');
  
  log('\n📚 Documentation:', 'bright');
  log('   - RevenueCat docs: https://docs.revenuecat.com/', 'cyan');
  log('   - Setup guide: docs/REVENUECAT_SETUP.md', 'cyan');
  
  log('\n✅ Setup completed!', 'green');
  log('Your RevenueCat configuration has been updated.', 'bright');
  
  rl.close();
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});

// Run the script
main().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
