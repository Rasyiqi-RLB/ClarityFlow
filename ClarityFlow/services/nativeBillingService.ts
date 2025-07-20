import RNIap, {
  Product,
  Subscription,
  ProductPurchase,
  SubscriptionPurchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Product IDs - must match Google Play Console
export const PRODUCT_IDS = {
  REMOVE_ADS: 'remove_ads_forever',
  LIFETIME: 'lifetime_access',
} as const;

export const SUBSCRIPTION_IDS = {
  MONTHLY: 'premium_monthly',
  YEARLY: 'premium_yearly',
} as const;

// User entitlements
export interface UserEntitlements {
  adsRemoved: boolean;
  premium: boolean;
  lifetime: boolean;
}

// Purchase state
export interface PurchaseState {
  products: Product[];
  subscriptions: Subscription[];
  entitlements: UserEntitlements;
  isLoading: boolean;
  error: string | null;
}

class NativeBillingService {
  private initialized = false;
  private products: Product[] = [];
  private subscriptions: Subscription[] = [];
  private entitlements: UserEntitlements = {
    adsRemoved: false,
    premium: false,
    lifetime: false,
  };

  // Storage keys
  private readonly STORAGE_KEYS = {
    ENTITLEMENTS: 'user_entitlements',
    PURCHASES: 'user_purchases',
  };

  /**
   * Initialize the billing service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('💳 Initializing Native Billing Service...');

      // Initialize connection to billing service
      await RNIap.initConnection();
      console.log('✅ Billing connection established');

      // Load products and subscriptions
      await this.loadProducts();
      await this.loadSubscriptions();

      // Restore previous purchases
      await this.restorePurchases();

      // Setup purchase listeners
      this.setupPurchaseListeners();

      this.initialized = true;
      console.log('💳 Native Billing Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize billing service:', error);
      throw error;
    }
  }

  /**
   * Load available products from store
   */
  private async loadProducts(): Promise<void> {
    try {
      const productIds = Object.values(PRODUCT_IDS);
      this.products = await RNIap.getProducts(productIds);
      console.log('📦 Loaded products:', this.products.length);
    } catch (error) {
      console.error('Failed to load products:', error);
      this.products = [];
    }
  }

  /**
   * Load available subscriptions from store
   */
  private async loadSubscriptions(): Promise<void> {
    try {
      const subscriptionIds = Object.values(SUBSCRIPTION_IDS);
      this.subscriptions = await RNIap.getSubscriptions(subscriptionIds);
      console.log('📦 Loaded subscriptions:', this.subscriptions.length);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      this.subscriptions = [];
    }
  }

  /**
   * Setup purchase event listeners
   */
  private setupPurchaseListeners(): void {
    // Listen for successful purchases
    purchaseUpdatedListener((purchase: ProductPurchase | SubscriptionPurchase) => {
      console.log('✅ Purchase successful:', purchase.productId);
      this.handlePurchaseSuccess(purchase);
    });

    // Listen for purchase errors
    purchaseErrorListener((error: PurchaseError) => {
      console.error('❌ Purchase error:', error);
      this.handlePurchaseError(error);
    });
  }

  /**
   * Handle successful purchase
   */
  private async handlePurchaseSuccess(purchase: ProductPurchase | SubscriptionPurchase): Promise<void> {
    try {
      // Update entitlements based on purchase
      await this.updateEntitlements(purchase);

      // Acknowledge the purchase (required for Google Play)
      if (Platform.OS === 'android') {
        await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
      }

      // Finish the transaction
      await RNIap.finishTransaction(purchase);

      console.log('✅ Purchase processed successfully:', purchase.productId);
    } catch (error) {
      console.error('Failed to process purchase:', error);
    }
  }

  /**
   * Handle purchase error
   */
  private handlePurchaseError(error: PurchaseError): void {
    console.error('Purchase failed:', error.message);
    // You can show user-friendly error messages here
  }

  /**
   * Update user entitlements based on purchase
   */
  private async updateEntitlements(purchase: ProductPurchase | SubscriptionPurchase): Promise<void> {
    const productId = purchase.productId;

    // Update entitlements based on product
    switch (productId) {
      case PRODUCT_IDS.REMOVE_ADS:
        this.entitlements.adsRemoved = true;
        break;
      case PRODUCT_IDS.LIFETIME:
        this.entitlements.adsRemoved = true;
        this.entitlements.premium = true;
        this.entitlements.lifetime = true;
        break;
      case SUBSCRIPTION_IDS.MONTHLY:
      case SUBSCRIPTION_IDS.YEARLY:
        this.entitlements.adsRemoved = true;
        this.entitlements.premium = true;
        break;
    }

    // Save entitlements to storage
    await this.saveEntitlements();
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Billing service not initialized');
    }

    try {
      console.log('🛒 Purchasing product:', productId);
      await RNIap.requestPurchase(productId);
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Purchase a subscription
   */
  async purchaseSubscription(subscriptionId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Billing service not initialized');
    }

    try {
      console.log('🛒 Purchasing subscription:', subscriptionId);
      await RNIap.requestSubscription(subscriptionId);
    } catch (error) {
      console.error('Subscription purchase failed:', error);
      throw error;
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<void> {
    try {
      console.log('🔄 Restoring purchases...');

      // Get available purchases
      const purchases = await RNIap.getAvailablePurchases();
      console.log('Found purchases:', purchases.length);

      // Process each purchase
      for (const purchase of purchases) {
        await this.updateEntitlements(purchase);
      }

      // Load saved entitlements
      await this.loadEntitlements();

      console.log('✅ Purchases restored successfully');
    } catch (error) {
      console.error('Failed to restore purchases:', error);
    }
  }

  /**
   * Save entitlements to storage
   */
  private async saveEntitlements(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.ENTITLEMENTS,
        JSON.stringify(this.entitlements)
      );
    } catch (error) {
      console.error('Failed to save entitlements:', error);
    }
  }

  /**
   * Load entitlements from storage
   */
  private async loadEntitlements(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEYS.ENTITLEMENTS);
      if (saved) {
        this.entitlements = { ...this.entitlements, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load entitlements:', error);
    }
  }

  /**
   * Get current user entitlements
   */
  getEntitlements(): UserEntitlements {
    return { ...this.entitlements };
  }

  /**
   * Get available products
   */
  getProducts(): Product[] {
    return [...this.products];
  }

  /**
   * Get available subscriptions
   */
  getSubscriptions(): Subscription[] {
    return [...this.subscriptions];
  }

  /**
   * Check if user has specific entitlement
   */
  hasEntitlement(entitlement: keyof UserEntitlements): boolean {
    return this.entitlements[entitlement];
  }

  /**
   * Cleanup and disconnect
   */
  async cleanup(): Promise<void> {
    try {
      await RNIap.endConnection();
      this.initialized = false;
      console.log('💳 Billing service disconnected');
    } catch (error) {
      console.error('Failed to cleanup billing service:', error);
    }
  }
}

// Export singleton instance
export const nativeBillingService = new NativeBillingService();
export default nativeBillingService;
