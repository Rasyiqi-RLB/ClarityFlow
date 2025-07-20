import { nativeBillingService, UserEntitlements, PRODUCT_IDS, SUBSCRIPTION_IDS } from './nativeBillingService';
import { AdService } from './adService';

export interface PurchaseProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  type: 'remove_ads' | 'premium' | 'lifetime';
}

export interface PurchaseHistory {
  adsRemoved: boolean;
  premiumActive: boolean;
  lifetimeAccess: boolean;
  purchaseHistory: Array<{
    id: string;
    productId: string;
    purchaseDate: string;
    price: string;
  }>;
}

class PurchaseServiceNative {
  private initialized = false;

  /**
   * Initialize the purchase service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('💳 Initializing Native Purchase Service...');
      
      // Initialize native billing service
      await nativeBillingService.initialize();
      
      this.initialized = true;
      console.log('✅ Native Purchase Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize purchase service:', error);
      throw error;
    }
  }

  /**
   * Get available products for purchase
   */
  async getProducts(): Promise<PurchaseProduct[]> {
    if (!this.initialized) {
      throw new Error('Purchase service not initialized');
    }

    try {
      const products = nativeBillingService.getProducts();
      const subscriptions = nativeBillingService.getSubscriptions();
      
      const purchaseProducts: PurchaseProduct[] = [];

      // Add one-time products
      for (const product of products) {
        purchaseProducts.push({
          id: product.productId,
          title: product.title || this.getProductTitle(product.productId),
          description: product.description || this.getProductDescription(product.productId),
          price: product.localizedPrice || product.price,
          type: this.getProductType(product.productId),
        });
      }

      // Add subscriptions
      for (const subscription of subscriptions) {
        purchaseProducts.push({
          id: subscription.productId,
          title: subscription.title || this.getProductTitle(subscription.productId),
          description: subscription.description || this.getProductDescription(subscription.productId),
          price: subscription.localizedPrice || subscription.price,
          type: 'premium',
        });
      }

      return purchaseProducts;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: 'Purchase service not initialized' };
    }

    try {
      console.log(`🛒 Purchasing product: ${productId}`);

      // Determine if it's a subscription or one-time product
      if (productId === SUBSCRIPTION_IDS.MONTHLY || productId === SUBSCRIPTION_IDS.YEARLY) {
        await nativeBillingService.purchaseSubscription(productId);
      } else {
        await nativeBillingService.purchaseProduct(productId);
      }

      console.log('✅ Purchase successful:', productId);
      return { success: true };
    } catch (error) {
      console.error('Purchase failed:', error);
      return { success: false, error: 'Purchase failed' };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: 'Purchase service not initialized' };
    }

    try {
      console.log('🔄 Restoring purchases...');
      await nativeBillingService.restorePurchases();
      console.log('✅ Purchases restored successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return { success: false, error: 'Failed to restore purchases' };
    }
  }

  /**
   * Get user's purchase history and entitlements
   */
  async getPurchaseHistory(): Promise<PurchaseHistory> {
    if (!this.initialized) {
      throw new Error('Purchase service not initialized');
    }

    try {
      const entitlements = nativeBillingService.getEntitlements();
      
      return {
        adsRemoved: entitlements.adsRemoved,
        premiumActive: entitlements.premium,
        lifetimeAccess: entitlements.lifetime,
        purchaseHistory: [], // TODO: Implement purchase history tracking
      };
    } catch (error) {
      console.error('Failed to get purchase history:', error);
      return {
        adsRemoved: false,
        premiumActive: false,
        lifetimeAccess: false,
        purchaseHistory: [],
      };
    }
  }

  /**
   * Check if user has specific entitlement
   */
  hasEntitlement(entitlement: 'ads_removed' | 'premium' | 'lifetime'): boolean {
    if (!this.initialized) return false;

    const entitlements = nativeBillingService.getEntitlements();
    
    switch (entitlement) {
      case 'ads_removed':
        return entitlements.adsRemoved;
      case 'premium':
        return entitlements.premium;
      case 'lifetime':
        return entitlements.lifetime;
      default:
        return false;
    }
  }

  /**
   * Get user entitlements
   */
  getEntitlements(): UserEntitlements {
    if (!this.initialized) {
      return { adsRemoved: false, premium: false, lifetime: false };
    }

    return nativeBillingService.getEntitlements();
  }

  /**
   * Helper: Get product title
   */
  private getProductTitle(productId: string): string {
    switch (productId) {
      case PRODUCT_IDS.REMOVE_ADS:
        return 'Remove Ads Forever';
      case PRODUCT_IDS.LIFETIME:
        return 'ClarityFlow Lifetime Premium';
      case SUBSCRIPTION_IDS.MONTHLY:
        return 'ClarityFlow Premium (Monthly)';
      case SUBSCRIPTION_IDS.YEARLY:
        return 'ClarityFlow Premium (Yearly)';
      default:
        return 'Unknown Product';
    }
  }

  /**
   * Helper: Get product description
   */
  private getProductDescription(productId: string): string {
    switch (productId) {
      case PRODUCT_IDS.REMOVE_ADS:
        return 'Remove all advertisements and enjoy a clean, distraction-free experience.';
      case PRODUCT_IDS.LIFETIME:
        return 'One-time purchase for lifetime access to all premium features.';
      case SUBSCRIPTION_IDS.MONTHLY:
        return 'Unlock all premium features with monthly subscription.';
      case SUBSCRIPTION_IDS.YEARLY:
        return 'Get the best value with yearly premium access. 33% savings!';
      default:
        return 'Premium feature for ClarityFlow';
    }
  }

  /**
   * Helper: Get product type
   */
  private getProductType(productId: string): 'remove_ads' | 'premium' | 'lifetime' {
    if (productId.includes('remove_ads')) return 'remove_ads';
    if (productId.includes('lifetime')) return 'lifetime';
    return 'premium';
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    try {
      await nativeBillingService.cleanup();
      this.initialized = false;
      console.log('💳 Purchase service cleaned up');
    } catch (error) {
      console.error('Failed to cleanup purchase service:', error);
    }
  }
}

// Export singleton instance
export const purchaseServiceNative = new PurchaseServiceNative();
export default purchaseServiceNative;
