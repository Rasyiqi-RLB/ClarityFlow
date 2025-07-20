// Environment configuration for ClarityFlow
export const ENV_CONFIG = {
  // AI API Keys (Optional - app will work without these)
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  OPENROUTER_API_KEY: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '',
  
  // App Configuration
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'ClarityFlow',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.clarityflow.app',
  
  // Feature Flags
  ENABLE_AI_FEATURES: true,
  ENABLE_CALENDAR_INTEGRATION: false,
  ENABLE_GOOGLE_DRIVE_BACKUP: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_API_MANAGEMENT: true,
  
  // API Management Configuration
  API_KEY_PREFIX: 'cf_',
  DEFAULT_RATE_LIMIT: 1000,
  PRODUCTION_RATE_LIMIT: 10000,
  API_KEY_EXPIRY_DAYS: 365,
  MAX_API_KEYS_PER_USER: 10,
  
  // Storage Configuration
  STORAGE_PREFIX: 'clarityflow_',
  BACKUP_FILENAME: 'clarityflow_backup.json',
  
  // Analytics Configuration
  ENABLE_ANALYTICS: true,
  ANALYTICS_SAMPLE_RATE: 1.0,
  
  // Security Configuration
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 3600, // seconds
  PASSWORD_MIN_LENGTH: 8,
  ENABLE_2FA: false,
} as const;

// Helper function to check if AI features are available
export const hasAIFeatures = (): boolean => {
  return Boolean(ENV_CONFIG.ENABLE_AI_FEATURES);
};

// Helper function to check if external AI APIs are available
export const hasExternalAI = async (): Promise<boolean> => {
  // Check environment variables first
  if (ENV_CONFIG.GEMINI_API_KEY || ENV_CONFIG.OPENROUTER_API_KEY) {
    return true;
  }
  
  // Check user-configured API keys in AsyncStorage
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const savedConfigs = await AsyncStorage.getItem('api_configs');
    
    if (savedConfigs) {
      const configs = JSON.parse(savedConfigs);
      const hasValidConfig = configs.some((config: any) => 
        config.enabled && config.apiKey && config.apiKey.trim() !== '' &&
        (config.name === 'Gemini' || config.name === 'OpenRouter')
      );
      if (hasValidConfig) return true;
    }
  } catch (error) {
    console.error('Error checking AsyncStorage for API configs:', error);
  }
  
  // Check Firebase Firestore for API keys
  try {
    const hasFirestoreKeys = await checkFirestoreAPIKeys();
    if (hasFirestoreKeys) return true;
  } catch (error) {
    console.error('Error checking Firestore for API configs:', error);
  }
  
  return false;
};

// Synchronous version for backward compatibility (checks only env vars)
export const hasExternalAISync = (): boolean => {
  return Boolean(ENV_CONFIG.GEMINI_API_KEY || ENV_CONFIG.OPENROUTER_API_KEY);
};

// Helper function to get primary AI provider
export const getPrimaryAIProvider = async (): Promise<'gemini' | 'openrouter' | 'none'> => {
  // Check environment variables first
  if (ENV_CONFIG.GEMINI_API_KEY) return 'gemini';
  if (ENV_CONFIG.OPENROUTER_API_KEY) return 'openrouter';
  
  // Check user-configured API keys in AsyncStorage
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const savedConfigs = await AsyncStorage.getItem('api_configs');
    
    if (savedConfigs) {
      const configs = JSON.parse(savedConfigs);
      
      // Prioritize Gemini first, then OpenRouter
      const geminiConfig = configs.find((c: any) => c.name === 'Gemini' && c.enabled && c.apiKey?.trim());
      if (geminiConfig) return 'gemini';
      
      const openrouterConfig = configs.find((c: any) => c.name === 'OpenRouter' && c.enabled && c.apiKey?.trim());
      if (openrouterConfig) return 'openrouter';
    }
  } catch (error) {
    console.error('Error checking AsyncStorage for primary AI provider:', error);
  }
  
  // Check Firebase Firestore for API keys
  try {
    const firestoreProvider = await getFirestorePrimaryProvider();
    if (firestoreProvider !== 'none') return firestoreProvider;
  } catch (error) {
    console.error('Error checking Firestore for primary AI provider:', error);
  }
  
  return 'none';
};

// Synchronous version for backward compatibility (checks only env vars)
export const getPrimaryAIProviderSync = (): 'gemini' | 'openrouter' | 'none' => {
  if (ENV_CONFIG.GEMINI_API_KEY) return 'gemini';
  if (ENV_CONFIG.OPENROUTER_API_KEY) return 'openrouter';
  return 'none';
};

// Helper function to check if API management is enabled
export const hasAPIManagement = (): boolean => {
  return Boolean(ENV_CONFIG.ENABLE_API_MANAGEMENT);
};

// Helper function to check if Google Drive backup is enabled
export const hasGoogleDriveBackup = (): boolean => {
  return Boolean(ENV_CONFIG.ENABLE_GOOGLE_DRIVE_BACKUP);
};

// Helper function to get rate limit based on environment
export const getRateLimit = (environment: 'production' | 'development' | 'staging'): number => {
  return environment === 'production' ? ENV_CONFIG.PRODUCTION_RATE_LIMIT : ENV_CONFIG.DEFAULT_RATE_LIMIT;
};

// Helper function to validate API key format
export const isValidAPIKeyFormat = (key: string): boolean => {
  return key.startsWith(ENV_CONFIG.API_KEY_PREFIX) && key.length >= 32;
};

// Helper function to check Firebase Firestore for API keys
const checkFirestoreAPIKeys = async (): Promise<boolean> => {
  try {
    const { db } = await import('../config/firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    
    const settingsRef = doc(db, 'admin', 'settings');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      const apiKeys = data?.apiKeys;
      
      if (apiKeys && typeof apiKeys === 'object') {
        const hasGemini = apiKeys.gemini && typeof apiKeys.gemini === 'string' && apiKeys.gemini.trim() !== '';
        const hasOpenRouter = apiKeys.openrouter && typeof apiKeys.openrouter === 'string' && apiKeys.openrouter.trim() !== '';
        return hasGemini || hasOpenRouter;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking Firestore API keys:', error);
    return false;
  }
};

// Helper function to get primary AI provider from Firestore
const getFirestorePrimaryProvider = async (): Promise<'gemini' | 'openrouter' | 'none'> => {
  try {
    const { db } = await import('../config/firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    
    const settingsRef = doc(db, 'admin', 'settings');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      const apiKeys = data?.apiKeys;
      
      if (apiKeys && typeof apiKeys === 'object') {
        // Prioritize Gemini first, then OpenRouter
        const hasGemini = apiKeys.gemini && typeof apiKeys.gemini === 'string' && apiKeys.gemini.trim() !== '';
        if (hasGemini) return 'gemini';
        
        const hasOpenRouter = apiKeys.openrouter && typeof apiKeys.openrouter === 'string' && apiKeys.openrouter.trim() !== '';
        if (hasOpenRouter) return 'openrouter';
      }
    }
    
    return 'none';
  } catch (error) {
    console.error('Error getting Firestore primary provider:', error);
    return 'none';
  }
};

// Helper function to generate API key
export const generateAPIKey = (environment: 'production' | 'development' | 'staging'): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const envPrefix = environment === 'production' ? 'prod' : environment === 'staging' ? 'stag' : 'dev';
  let result = `${ENV_CONFIG.API_KEY_PREFIX}${envPrefix}_`;
  
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};