import AsyncStorage from '@react-native-async-storage/async-storage';
import AdService from './adService';

// RevenueCat imports - uncomment when ready to use real RevenueCat
// import Purchases, {
//   PurchasesOffering,
//   PurchasesPackage,
//   CustomerInfo,
//   PurchasesError
// } from 'react-native-purchases';

// Configuration imports

// Customer info interface (compatible with both mock and native billing)
interface MockCustomerInfo {
  entitlements: {
    ads_removed?: boolean;
    premium?: boolean;
    lifetime?: boolean;
    // Legacy format for compatibility
    active?: { [key: string]: { isActive: boolean; productIdentifier: string } };
  };
  purchaseHistory?: Array<{
    id: string;
    productId: string;
    purchaseDate: string;
    price: string;
  }>;
}

// Real RevenueCat interfaces (use when switching to real implementation)
interface RealCustomerInfo {
  entitlements: {
    active: { [key: string]: { isActive: boolean; productIdentifier: string } };
  };
}

export interface PurchaseProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
  type: 'remove_ads' | 'premium' | 'lifetime';
}

export interface PurchaseState {
  adsRemoved: boolean;
  premiumActive: boolean;
  lifetimeAccess: boolean;
  purchaseHistory: PurchaseRecord[];
}

export interface PurchaseRecord {
  productId: string;
  purchaseDate: string;
  transactionId: string;
  verified: boolean;
}

class PurchaseService {
  private static instance: PurchaseService;
  private initialized = false;
  private offerings: any[] = []; // Mock offerings
  private customerInfo: MockCustomerInfo | null = null;

  // Configuration - Choose billing implementation
  private readonly USE_REVENUECAT = false; // Set to true to use RevenueCat
  private readonly USE_NATIVE_BILLING = true; // ✅ Using native Google Play Billing

  // RevenueCat API Keys - Android key is configured
  private readonly REVENUECAT_API_KEYS = {
    ios: 'appl_YOUR_IOS_API_KEY_FROM_REVENUECAT', // Add when iOS app is setup
    android: 'goog_HwHtKMOesMjNeJNJnHaMIXcyhnB', // ✅ Real Android API key
  };

  // Product IDs
  private readonly PRODUCT_IDS = {
    REMOVE_ADS: 'remove_ads_forever',
    PREMIUM_MONTHLY: 'premium_monthly',
    PREMIUM_YEARLY: 'premium_yearly',
    LIFETIME_ACCESS: 'lifetime_access',
  };

  private constructor() {}

  public static getInstance(): PurchaseService {
    if (!PurchaseService.instance) {
      PurchaseService.instance = new PurchaseService();
    }
    return PurchaseService.instance;
  }

  // Initialize Purchase Service
  async initialize(): Promise<void> {
    try {
      if (this.USE_REVENUECAT) {
        await this.initializeRevenueCat();
      } else if (this.USE_NATIVE_BILLING) {
        await this.initializeNativeBilling();
      } else {
        await this.initializeMock();
      }

      this.initialized = true;
      const mode = this.USE_REVENUECAT ? 'RevenueCat' : this.USE_NATIVE_BILLING ? 'Native Billing' : 'Mock';
      console.log(`💳 PurchaseService initialized successfully (${mode} mode)`);
    } catch (error) {
      console.error('Failed to initialize PurchaseService:', error);
    }
  }

  // Initialize Real RevenueCat
  private async initializeRevenueCat(): Promise<void> {
    // Uncomment when ready to use real RevenueCat
    /*
    // Get API key for current platform
    const apiKey = Platform.select({
      ios: this.REVENUECAT_API_KEYS.ios,
      android: this.REVENUECAT_API_KEYS.android,
    });

    if (!apiKey || apiKey.includes('YOUR_')) {
      throw new Error('RevenueCat API key not configured for current platform');
    }

    console.log('💳 Initializing RevenueCat with API key:', apiKey.substring(0, 10) + '...');

    // Configure RevenueCat
    await Purchases.configure({ apiKey });

    // Load offerings and customer info
    await this.loadRealOfferings();
    await this.loadRealCustomerInfo();

    console.log('💳 RevenueCat initialized successfully');
    */
    throw new Error('RevenueCat not configured yet. Android API key ready: goog_HwHtKMOesMjNeJNJnHaMIXcyhnB. Please install react-native-purchases and uncomment RevenueCat code.');
  }

  // Initialize Native Google Play Billing
  private async initializeNativeBilling(): Promise<void> {
    try {
      const { nativeBillingService } = await import('./nativeBillingService');

      // Initialize native billing service
      await nativeBillingService.initialize();

      // Load user entitlements
      const entitlements = nativeBillingService.getEntitlements();

      // Update mock customer info with real entitlements
      this.customerInfo = {
        entitlements: {
          ads_removed: entitlements.adsRemoved,
          premium: entitlements.premium,
          lifetime: entitlements.lifetime,
          active: {}, // Initialize for compatibility
        },
        purchaseHistory: [], // Will be populated from actual purchases
      };

      console.log('💳 Native billing initialized successfully');
      console.log('User entitlements:', entitlements);
    } catch (error) {
      console.error('Failed to initialize native billing:', error);
      throw error;
    }
  }

  // Refresh entitlements from native billing
  private async refreshNativeEntitlements(): Promise<void> {
    try {
      const { nativeBillingService } = await import('./nativeBillingService');
      const entitlements = nativeBillingService.getEntitlements();

      // Update customer info with fresh entitlements
      if (this.customerInfo) {
        this.customerInfo.entitlements = {
          ads_removed: entitlements.adsRemoved,
          premium: entitlements.premium,
          lifetime: entitlements.lifetime,
        };
      }

      console.log('🔄 Entitlements refreshed:', entitlements);
    } catch (error) {
      console.error('Failed to refresh entitlements:', error);
    }
  }

  // Initialize Mock Implementation
  private async initializeMock(): Promise<void> {
    console.log('💳 PurchaseService initializing (Mock mode)...');

    // Load mock offerings and customer info
    await this.loadOfferings();
    await this.loadCustomerInfo();

    console.log('💳 Mock PurchaseService initialized successfully');
  }

  // Load available offerings (Mock)
  private async loadOfferings(): Promise<void> {
    try {
      // Mock offerings - replace with actual RevenueCat when ready
      this.offerings = [
        {
          identifier: 'default',
          availablePackages: [
            {
              product: {
                identifier: this.PRODUCT_IDS.REMOVE_ADS,
                title: 'Remove Ads Forever',
                description: 'Remove all advertisements from ClarityFlow',
                priceString: '$2.99',
                price: 2.99,
                currencyCode: 'USD'
              }
            }
          ]
        }
      ];
      console.log('📦 Loaded mock offerings:', this.offerings.length);
    } catch (error) {
      console.error('Failed to load offerings:', error);
    }
  }

  // Load customer info (Mock)
  private async loadCustomerInfo(): Promise<void> {
    try {
      // Mock customer info - replace with actual RevenueCat when ready
      this.customerInfo = {
        entitlements: {
          active: {}
        }
      };
      console.log('👤 Mock customer info loaded');
    } catch (error) {
      console.error('Failed to load customer info:', error);
    }
  }

  // Load Real RevenueCat Offerings
  private async loadRealOfferings(): Promise<void> {
    // Uncomment when ready to use real RevenueCat
    /*
    try {
      const offerings = await Purchases.getOfferings();
      this.offerings = Object.values(offerings.all);
      console.log('📦 Loaded RevenueCat offerings:', this.offerings.length);
    } catch (error) {
      console.error('Failed to load RevenueCat offerings:', error);
    }
    */
  }

  // Load Real RevenueCat Customer Info
  private async loadRealCustomerInfo(): Promise<void> {
    // Uncomment when ready to use real RevenueCat
    /*
    try {
      this.customerInfo = await Purchases.getCustomerInfo();
      console.log('👤 RevenueCat customer info loaded');
    } catch (error) {
      console.error('Failed to load RevenueCat customer info:', error);
    }
    */
  }

  // Get available products
  async getProducts(): Promise<PurchaseProduct[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const products: PurchaseProduct[] = [];

    try {
      for (const offering of this.offerings) {
        for (const pkg of offering.availablePackages) {
          const product = pkg.product;
          products.push({
            id: product.identifier,
            title: product.title,
            description: product.description,
            price: product.priceString,
            priceAmountMicros: product.price * 1000000, // Convert to micros
            priceCurrencyCode: product.currencyCode,
            type: this.getProductType(product.identifier),
          });
        }
      }
    } catch (error) {
      console.error('Failed to get products:', error);
    }

    return products;
  }

  // Get product type from ID
  private getProductType(productId: string): 'remove_ads' | 'premium' | 'lifetime' {
    if (productId.includes('remove_ads')) return 'remove_ads';
    if (productId.includes('lifetime')) return 'lifetime';
    return 'premium';
  }

  // Purchase product (Native Billing + Mock implementation)
  async purchaseProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: 'Purchase service not initialized' };
    }

    try {
      console.log(`🛒 Purchasing product: ${productId}`);

      if (this.USE_NATIVE_BILLING) {
        // Use native billing service
        const { nativeBillingService } = await import('./nativeBillingService');

        if (productId === 'premium_monthly' || productId === 'premium_yearly') {
          await nativeBillingService.purchaseSubscription(productId);
        } else {
          await nativeBillingService.purchaseProduct(productId);
        }

        // Refresh entitlements after purchase
        await this.refreshNativeEntitlements();

        console.log('✅ Native purchase successful:', productId);
        return { success: true };
      } else {
        // Mock purchase implementation
        // Find the package
        let targetPackage: any = null;

        for (const offering of this.offerings) {
          targetPackage = offering.availablePackages.find(
            (pkg: any) => pkg.product.identifier === productId
          ) || null;
          if (targetPackage) break;
        }

        if (!targetPackage) {
          return { success: false, error: 'Product not found' };
        }

        // Mock purchase - simulate successful purchase
        console.log('🛒 Simulating purchase for:', productId);

        // Update mock customer info
        if (this.customerInfo && this.customerInfo.entitlements.active) {
          this.customerInfo.entitlements.active[productId] = {
            isActive: true,
            productIdentifier: productId
          };
        }

        // Handle successful purchase
        await this.handleSuccessfulPurchase(productId);

        console.log('✅ Mock purchase successful:', productId);
        return { success: true };
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      return { success: false, error: 'Purchase failed' };
    }
  }

  // Handle successful purchase
  private async handleSuccessfulPurchase(productId: string): Promise<void> {
    try {
      // Record purchase
      const purchaseRecord: PurchaseRecord = {
        productId,
        purchaseDate: new Date().toISOString(),
        transactionId: `txn_${Date.now()}`,
        verified: true,
      };

      await this.savePurchaseRecord(purchaseRecord);

      // Apply purchase benefits
      if (productId === this.PRODUCT_IDS.REMOVE_ADS || 
          productId === this.PRODUCT_IDS.LIFETIME_ACCESS) {
        await AdService.removeAds();
      }

      console.log('🎉 Purchase benefits applied for:', productId);
    } catch (error) {
      console.error('Failed to handle successful purchase:', error);
    }
  }

  // Save purchase record
  private async savePurchaseRecord(record: PurchaseRecord): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('purchase_history');
      const history: PurchaseRecord[] = stored ? JSON.parse(stored) : [];
      
      history.push(record);
      
      await AsyncStorage.setItem('purchase_history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save purchase record:', error);
    }
  }

  // Restore purchases (Mock implementation)
  async restorePurchases(): Promise<{ success: boolean; restored: number }> {
    if (!this.initialized) {
      return { success: false, restored: 0 };
    }

    try {
      // Mock restore - check if user has any stored purchases
      const stored = await AsyncStorage.getItem('purchase_history');
      const history: PurchaseRecord[] = stored ? JSON.parse(stored) : [];

      let restoredCount = 0;

      // Restore from purchase history
      for (const record of history) {
        if (record.verified) {
          await this.handleSuccessfulPurchase(record.productId);
          restoredCount++;

          // Update mock customer info
          if (this.customerInfo) {
            this.customerInfo.entitlements.active[record.productId] = {
              isActive: true,
              productIdentifier: record.productId
            };
          }
        }
      }

      console.log('🔄 Mock restored purchases:', restoredCount);
      return { success: true, restored: restoredCount };
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return { success: false, restored: 0 };
    }
  }

  // Check purchase status
  async getPurchaseState(): Promise<PurchaseState> {
    const defaultState: PurchaseState = {
      adsRemoved: false,
      premiumActive: false,
      lifetimeAccess: false,
      purchaseHistory: [],
    };

    try {
      // Load from storage
      const stored = await AsyncStorage.getItem('purchase_history');
      const history: PurchaseRecord[] = stored ? JSON.parse(stored) : [];

      // Check current entitlements
      if (this.customerInfo) {
        const activeEntitlements = this.customerInfo.entitlements.active;
        
        return {
          adsRemoved: await AdService.areAdsRemoved(),
          premiumActive: !!activeEntitlements['premium'],
          lifetimeAccess: !!activeEntitlements['lifetime'],
          purchaseHistory: history,
        };
      }

      return {
        ...defaultState,
        adsRemoved: await AdService.areAdsRemoved(),
        purchaseHistory: history,
      };
    } catch (error) {
      console.error('Failed to get purchase state:', error);
      return defaultState;
    }
  }

  // Get customer info
  getCustomerInfo(): MockCustomerInfo | null {
    return this.customerInfo;
  }

  // Check if specific product is purchased
  async isProductPurchased(productId: string): Promise<boolean> {
    try {
      if (!this.customerInfo) {
        await this.loadCustomerInfo();
      }

      if (!this.customerInfo) return false;

      const activeEntitlements = this.customerInfo.entitlements.active;
      
      // Check by product ID or entitlement
      for (const entitlement of Object.values(activeEntitlements)) {
        if (entitlement.productIdentifier === productId && entitlement.isActive) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to check product purchase status:', error);
      return false;
    }
  }
}

export default PurchaseService.getInstance();
