import Constants from 'expo-constants';
import { AuthConfig } from '../types/auth';

/**
 * Environment configuration untuk development dan production
 */

interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiUrl: string;
  webUrl: string;
  auth: AuthConfig;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  features: {
    enableAnalytics: boolean;
    enableCrashReporting: boolean;
    enablePerformanceMonitoring: boolean;
    enableOfflineMode: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableRemote: boolean;
  };
}

const isDevelopment = __DEV__;
const isProduction = !__DEV__;

// Base configuration
const baseConfig = {
  isDevelopment,
  isProduction,
  
  // Firebase configuration
  firebase: {
    apiKey: Constants.expoConfig?.extra?.firebaseApiKey || 'your-api-key',
    authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || 'your-project.firebaseapp.com',
    projectId: Constants.expoConfig?.extra?.firebaseProjectId || 'your-project-id',
    storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || 'your-project.appspot.com',
    messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || '123456789',
    appId: Constants.expoConfig?.extra?.firebaseAppId || '1:123456789:web:abcdef',
  },
  
  // Auth configuration
  auth: {
    googleSignIn: {
      webClientId: Constants.expoConfig?.extra?.googleWebClientId || 'your-web-client-id.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    },
    enableFallbacks: true,
    retryAttempts: 3,
    timeoutMs: 30000,
  } as AuthConfig,
};

// Development configuration
const developmentConfig: EnvironmentConfig = {
  ...baseConfig,
  apiUrl: 'http://localhost:3000/api',
  webUrl: 'http://localhost:8081',
  
  features: {
    enableAnalytics: false,
    enableCrashReporting: false,
    enablePerformanceMonitoring: true,
    enableOfflineMode: true,
  },
  
  logging: {
    level: 'debug',
    enableConsole: true,
    enableRemote: false,
  },
};

// Production configuration
const productionConfig: EnvironmentConfig = {
  ...baseConfig,
  apiUrl: 'https://your-api-domain.com/api',
  webUrl: 'https://your-app-domain.com',
  
  features: {
    enableAnalytics: true,
    enableCrashReporting: true,
    enablePerformanceMonitoring: true,
    enableOfflineMode: true,
  },
  
  logging: {
    level: 'error',
    enableConsole: false,
    enableRemote: true,
  },
};

// Export current environment config
export const ENV: EnvironmentConfig = isDevelopment ? developmentConfig : productionConfig;

// Utility functions
export const getApiUrl = (endpoint: string): string => {
  return `${ENV.apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const getWebUrl = (path: string = ''): string => {
  return `${ENV.webUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

export const isFeatureEnabled = (feature: keyof typeof ENV.features): boolean => {
  return ENV.features[feature];
};

export const shouldLog = (level: typeof ENV.logging.level): boolean => {
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(ENV.logging.level);
  const requestedLevelIndex = levels.indexOf(level);
  return requestedLevelIndex >= currentLevelIndex;
};

// Debug helper
export const logEnvironmentInfo = (): void => {
  if (ENV.logging.enableConsole && shouldLog('info')) {
    console.log('🌍 Environment Configuration:', {
      isDevelopment: ENV.isDevelopment,
      isProduction: ENV.isProduction,
      apiUrl: ENV.apiUrl,
      webUrl: ENV.webUrl,
      features: ENV.features,
      logging: ENV.logging,
    });
  }
};

export default ENV;