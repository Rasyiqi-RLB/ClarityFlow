/**
 * Purchase Configuration for ClarityFlow
 * 
 * This file contains all configuration for in-app purchases and RevenueCat.
 * Update these values when setting up production RevenueCat integration.
 */

import { Platform } from 'react-native';

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

/**
 * Set to true when you're ready to use real RevenueCat
 * Set to false to use mock implementation for development
 */
export const USE_REAL_REVENUECAT = false;

// ============================================================================
// REVENUECAT API KEYS
// ============================================================================

/**
 * RevenueCat API Keys
 * Get these from: https://app.revenuecat.com/apps
 *
 * ✅ CONFIGURED: Real API keys from RevenueCat dashboard
 */
export const REVENUECAT_API_KEYS = {
  ios: 'appl_YOUR_IOS_API_KEY_FROM_REVENUECAT', // Add iOS key when you setup iOS app
  android: 'goog_HwHtKMOesMjNeJNJnHaMIXcyhnB', // ✅ Real Android API key
};

/**
 * App Configuration for RevenueCat
 */
export const APP_CONFIG = {
  bundleId: 'com.clarityflow.app',
  packageName: 'com.clarityflow.app',
  appName: 'ClarityFlow',
} as const;

/**
 * Get the appropriate API key for current platform
 */
export const getRevenueCatApiKey = (): string | null => {
  return Platform.select({
    ios: REVENUECAT_API_KEYS.ios,
    android: REVENUECAT_API_KEYS.android,
  }) || null;
};

// ============================================================================
// PRODUCT CONFIGURATION
// ============================================================================

/**
 * Product IDs - These should match your App Store/Google Play products
 */
export const PRODUCT_IDS = {
  REMOVE_ADS: 'remove_ads_forever',
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly',
  LIFETIME_ACCESS: 'lifetime_access',
} as const;

/**
 * Entitlement IDs - These should match your RevenueCat entitlements
 */
export const ENTITLEMENT_IDS = {
  ADS_REMOVED: 'ads_removed',
  PREMIUM: 'premium',
  LIFETIME: 'lifetime',
} as const;

/**
 * Offering IDs - These should match your RevenueCat offerings
 */
export const OFFERING_IDS = {
  DEFAULT: 'default',
  PREMIUM: 'premium_offering',
} as const;

// ============================================================================
// MOCK DATA CONFIGURATION
// ============================================================================

/**
 * Mock products for development/testing
 */
export const MOCK_PRODUCTS = [
  {
    id: PRODUCT_IDS.REMOVE_ADS,
    title: 'Remove Ads Forever',
    description: 'Remove all advertisements from ClarityFlow permanently',
    price: '$2.99',
    priceAmountMicros: 2990000,
    priceCurrencyCode: 'USD',
    type: 'remove_ads' as const,
  },
  {
    id: PRODUCT_IDS.PREMIUM_MONTHLY,
    title: 'Premium Monthly',
    description: 'Access all premium features with monthly subscription',
    price: '$4.99',
    priceAmountMicros: 4990000,
    priceCurrencyCode: 'USD',
    type: 'premium' as const,
  },
  {
    id: PRODUCT_IDS.PREMIUM_YEARLY,
    title: 'Premium Yearly',
    description: 'Access all premium features with yearly subscription (Save 50%)',
    price: '$29.99',
    priceAmountMicros: 29990000,
    priceCurrencyCode: 'USD',
    type: 'premium' as const,
  },
  {
    id: PRODUCT_IDS.LIFETIME_ACCESS,
    title: 'Lifetime Access',
    description: 'One-time purchase for lifetime access to all features',
    price: '$49.99',
    priceAmountMicros: 49990000,
    priceCurrencyCode: 'USD',
    type: 'lifetime' as const,
  },
];

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Feature flags for purchase-related features
 */
export const PURCHASE_FEATURES = {
  ENABLE_RESTORE_PURCHASES: true,
  ENABLE_FAMILY_SHARING: true,
  ENABLE_PROMO_CODES: true,
  ENABLE_SUBSCRIPTION_MANAGEMENT: true,
  SHOW_PURCHASE_HISTORY: true,
} as const;

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate configuration before using RevenueCat
 */
export const validateRevenueCatConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (USE_REAL_REVENUECAT) {
    // Check API keys
    const apiKey = getRevenueCatApiKey();
    if (!apiKey || apiKey.includes('YOUR_')) {
      errors.push('RevenueCat API key not configured properly');
    }

    // Check if RevenueCat is imported (this would be checked at runtime)
    // errors.push('RevenueCat package not imported - uncomment imports in purchaseService.ts');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get product type from product ID
 */
export const getProductType = (productId: string): 'remove_ads' | 'premium' | 'lifetime' => {
  if (productId.includes('remove_ads')) return 'remove_ads';
  if (productId.includes('lifetime')) return 'lifetime';
  return 'premium';
};

/**
 * Check if product is subscription
 */
export const isSubscriptionProduct = (productId: string): boolean => {
  return productId.includes('monthly') || productId.includes('yearly');
};

/**
 * Get entitlement ID for product
 */
export const getEntitlementForProduct = (productId: string): string => {
  switch (productId) {
    case PRODUCT_IDS.REMOVE_ADS:
      return ENTITLEMENT_IDS.ADS_REMOVED;
    case PRODUCT_IDS.LIFETIME_ACCESS:
      return ENTITLEMENT_IDS.LIFETIME;
    case PRODUCT_IDS.PREMIUM_MONTHLY:
    case PRODUCT_IDS.PREMIUM_YEARLY:
      return ENTITLEMENT_IDS.PREMIUM;
    default:
      return ENTITLEMENT_IDS.PREMIUM;
  }
};

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

export const PurchaseConfig = {
  USE_REAL_REVENUECAT,
  REVENUECAT_API_KEYS,
  PRODUCT_IDS,
  ENTITLEMENT_IDS,
  OFFERING_IDS,
  MOCK_PRODUCTS,
  PURCHASE_FEATURES,
  getRevenueCatApiKey,
  validateRevenueCatConfig,
  getProductType,
  isSubscriptionProduct,
  getEntitlementForProduct,
} as const;

export default PurchaseConfig;
