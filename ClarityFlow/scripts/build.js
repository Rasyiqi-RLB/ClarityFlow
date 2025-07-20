#!/usr/bin/env node

/**
 * Build script for ClarityFlow
 * Handles building for different platforms and environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  appName: 'ClarityFlow',
  version: '1.0.0',
  platforms: ['android', 'ios', 'web'],
  environments: ['development', 'staging', 'production'],
};

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

// Utility functions
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logError = (message) => log(`❌ ${message}`, colors.red);
const logWarning = (message) => log(`⚠️  ${message}`, colors.yellow);
const logInfo = (message) => log(`ℹ️  ${message}`, colors.blue);

const executeCommand = (command, options = {}) => {
  try {
    logInfo(`Executing: ${command}`);
    const result = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
    return result;
  } catch (error) {
    logError(`Command failed: ${command}`);
    logError(error.message);
    process.exit(1);
  }
};

const checkPrerequisites = () => {
  logInfo('Checking prerequisites...');
  
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    logError('package.json not found. Please run this script from the project root.');
    process.exit(1);
  }
  
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    logWarning('node_modules not found. Installing dependencies...');
    executeCommand('npm install');
  }
  
  // Check if Expo CLI is installed
  try {
    execSync('expo --version', { stdio: 'ignore' });
  } catch (error) {
    logWarning('Expo CLI not found. Installing globally...');
    executeCommand('npm install -g @expo/cli');
  }
  
  logSuccess('Prerequisites check completed');
};

const validateEnvironment = (environment) => {
  if (!config.environments.includes(environment)) {
    logError(`Invalid environment: ${environment}`);
    logInfo(`Valid environments: ${config.environments.join(', ')}`);
    process.exit(1);
  }
  
  // Check for environment-specific files
  const envFile = `.env.${environment}`;
  if (fs.existsSync(envFile)) {
    logInfo(`Using environment file: ${envFile}`);
  } else {
    logWarning(`Environment file not found: ${envFile}`);
  }
};

const buildForPlatform = (platform, environment) => {
  logInfo(`Building for ${platform} (${environment})...`);
  
  const buildCommands = {
    android: {
      development: 'expo run:android',
      staging: 'eas build --platform android --profile staging',
      production: 'eas build --platform android --profile production',
    },
    ios: {
      development: 'expo run:ios',
      staging: 'eas build --platform ios --profile staging',
      production: 'eas build --platform ios --profile production',
    },
    web: {
      development: 'expo start --web',
      staging: 'expo export --platform web',
      production: 'expo export --platform web --clear',
    },
  };
  
  const command = buildCommands[platform]?.[environment];
  if (!command) {
    logError(`No build command found for ${platform} ${environment}`);
    return;
  }
  
  executeCommand(command);
  logSuccess(`Build completed for ${platform} (${environment})`);
};

const buildAll = (environment) => {
  logInfo(`Building for all platforms (${environment})...`);
  
  config.platforms.forEach(platform => {
    buildForPlatform(platform, environment);
  });
  
  logSuccess('All builds completed');
};

const createBuildReport = (environment) => {
  const report = {
    appName: config.appName,
    version: config.version,
    environment,
    buildDate: new Date().toISOString(),
    platforms: config.platforms,
    nodeVersion: process.version,
    npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim(),
  };
  
  const reportPath = path.join('builds', `build-report-${environment}-${Date.now()}.json`);
  
  // Ensure builds directory exists
  if (!fs.existsSync('builds')) {
    fs.mkdirSync('builds');
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logSuccess(`Build report saved to: ${reportPath}`);
};

const cleanBuilds = () => {
  logInfo('Cleaning build artifacts...');
  
  const dirsToClean = ['builds', 'dist', '.expo'];
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      logInfo(`Cleaned: ${dir}`);
    }
  });
  
  logSuccess('Clean completed');
};

const runTests = () => {
  logInfo('Running tests...');
  
  try {
    executeCommand('npm test');
    logSuccess('Tests passed');
  } catch (error) {
    logError('Tests failed');
    process.exit(1);
  }
};

const lintCode = () => {
  logInfo('Running linter...');
  
  try {
    executeCommand('npm run lint');
    logSuccess('Linting passed');
  } catch (error) {
    logError('Linting failed');
    process.exit(1);
  }
};

// Main script
const main = () => {
  const args = process.argv.slice(2);
  const command = args[0];
  const platform = args[1];
  const environment = args[2] || 'development';
  
  log(`🚀 ${config.appName} Build Script v${config.version}`, colors.bright);
  
  switch (command) {
    case 'check':
      checkPrerequisites();
      break;
      
    case 'clean':
      cleanBuilds();
      break;
      
    case 'test':
      runTests();
      break;
      
    case 'lint':
      lintCode();
      break;
      
    case 'build':
      checkPrerequisites();
      validateEnvironment(environment);
      
      if (platform) {
        if (!config.platforms.includes(platform)) {
          logError(`Invalid platform: ${platform}`);
          logInfo(`Valid platforms: ${config.platforms.join(', ')}`);
          process.exit(1);
        }
        buildForPlatform(platform, environment);
      } else {
        buildAll(environment);
      }
      
      createBuildReport(environment);
      break;
      
    case 'deploy':
      logInfo('Starting deployment process...');
      checkPrerequisites();
      validateEnvironment(environment);
      runTests();
      lintCode();
      buildAll(environment);
      createBuildReport(environment);
      logSuccess('Deployment completed');
      break;
      
    default:
      log('Usage:', colors.bright);
      log('  node scripts/build.js check                    - Check prerequisites');
      log('  node scripts/build.js clean                    - Clean build artifacts');
      log('  node scripts/build.js test                     - Run tests');
      log('  node scripts/build.js lint                     - Run linter');
      log('  node scripts/build.js build [platform] [env]   - Build for platform/environment');
      log('  node scripts/build.js deploy [env]             - Full deployment process');
      log('');
      log('Platforms:', colors.bright);
      log(`  ${config.platforms.join(', ')}`);
      log('');
      log('Environments:', colors.bright);
      log(`  ${config.environments.join(', ')}`);
      log('');
      log('Examples:', colors.bright);
      log('  node scripts/build.js build android production');
      log('  node scripts/build.js build web staging');
      log('  node scripts/build.js deploy production');
      break;
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  config,
  checkPrerequisites,
  buildForPlatform,
  buildAll,
  cleanBuilds,
  runTests,
  lintCode,
}; 