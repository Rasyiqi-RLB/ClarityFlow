import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { PlatformInfo } from '../types/auth';

/**
 * Utility functions untuk platform detection dan capability checking
 */

export const getPlatformInfo = (): PlatformInfo => {
  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  const isExpoGo = Constants.appOwnership === 'expo';
  
  // Check if Google Sign-In module is actually available
  let hasGoogleSignInModule = false;
  if (!isWeb && !isExpoGo) {
    try {
      require('@react-native-google-signin/google-signin');
      hasGoogleSignInModule = true;
    } catch (error) {
      hasGoogleSignInModule = false;
    }
  }
  
  const canUseGoogleSignIn = isWeb || (isMobile && !isExpoGo && hasGoogleSignInModule);

  return {
    isWeb,
    isMobile,
    isExpoGo,
    canUseGoogleSignIn,
  };
};

export const isRunningInExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

export const canUseNativeModules = (): boolean => {
  return !isRunningInExpoGo();
};

export const getRecommendedAuthMethod = (): string => {
  const platformInfo = getPlatformInfo();
  
  if (platformInfo.isWeb) {
    return 'web-google-signin';
  }
  
  if (platformInfo.isExpoGo) {
    return 'development-build-required';
  }
  
  return 'native-google-signin';
};

export const getAuthErrorMessage = (error: any): string => {
  const platformInfo = getPlatformInfo();
  
  if (error.message?.includes('RNGoogleSignin') || error.message?.includes('TurboModuleRegistry')) {
    if (platformInfo.isExpoGo) {
      return 'Google Sign-In tidak tersedia di Expo Go. Silakan gunakan development build atau akses melalui web browser.';
    }
    return 'Google Sign-In module tidak ditemukan. Pastikan aplikasi dikompilasi dengan native dependencies yang tepat.';
  }
  
  if (error.message?.includes('Network')) {
    return 'Koneksi internet bermasalah. Silakan periksa koneksi Anda dan coba lagi.';
  }
  
  if (error.message?.includes('popup')) {
    return 'Popup sign-in diblokir. Silakan izinkan popup untuk domain ini atau gunakan redirect method.';
  }
  
  return error.message || 'Terjadi kesalahan yang tidak diketahui.';
};

export const shouldShowWebFallback = (): boolean => {
  const platformInfo = getPlatformInfo();
  return platformInfo.isExpoGo && !platformInfo.isWeb;
};

export const getWebUrl = (): string => {
  // Dalam development, gunakan localhost
  if (__DEV__) {
    return 'http://localhost:8081';
  }
  
  // Dalam production, gunakan URL yang sesuai
  return 'https://your-app-domain.com';
};

/**
 * Log platform information untuk debugging
 */
export const logPlatformInfo = (): void => {
  const platformInfo = getPlatformInfo();
  console.log('Platform Info:', {
    ...platformInfo,
    appOwnership: Constants.appOwnership,
    platform: Platform.OS,
    isDev: __DEV__,
  });
};