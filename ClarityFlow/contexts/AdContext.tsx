import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AdService from '../services/adService';
import PurchaseService, { PurchaseState } from '../services/purchaseService';

interface AdContextType {
  adsRemoved: boolean;
  purchaseState: PurchaseState;
  loading: boolean;
  showInterstitialAd: () => Promise<boolean>;
  showRewardedAd: () => Promise<{ shown: boolean; rewarded: boolean }>;
  removeAds: () => Promise<void>;
  restorePurchases: () => Promise<{ success: boolean; restored: number }>;
  refreshPurchaseState: () => Promise<void>;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

interface AdProviderProps {
  children: ReactNode;
}

export const AdProvider: React.FC<AdProviderProps> = ({ children }) => {
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    adsRemoved: false,
    premiumActive: false,
    lifetimeAccess: false,
    purchaseHistory: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      setLoading(true);
      
      // Initialize services
      await Promise.all([
        AdService.initialize(),
        PurchaseService.initialize(),
      ]);

      // Load initial state
      await refreshPurchaseState();
    } catch (error) {
      console.error('Failed to initialize ad services:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPurchaseState = async () => {
    try {
      const [removed, state] = await Promise.all([
        AdService.areAdsRemoved(),
        PurchaseService.getPurchaseState(),
      ]);

      setAdsRemoved(removed);
      setPurchaseState(state);
    } catch (error) {
      console.error('Failed to refresh purchase state:', error);
    }
  };

  const showInterstitialAd = async (): Promise<boolean> => {
    try {
      if (adsRemoved) {
        return false;
      }
      
      return await AdService.showInterstitialAd();
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      return false;
    }
  };

  const showRewardedAd = async (): Promise<{ shown: boolean; rewarded: boolean }> => {
    try {
      return await AdService.showRewardedAd();
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      return { shown: false, rewarded: false };
    }
  };

  const removeAds = async (): Promise<void> => {
    try {
      await AdService.removeAds();
      await refreshPurchaseState();
    } catch (error) {
      console.error('Failed to remove ads:', error);
    }
  };

  const restorePurchases = async (): Promise<{ success: boolean; restored: number }> => {
    try {
      const result = await PurchaseService.restorePurchases();
      await refreshPurchaseState();
      return result;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return { success: false, restored: 0 };
    }
  };

  const value: AdContextType = {
    adsRemoved,
    purchaseState,
    loading,
    showInterstitialAd,
    showRewardedAd,
    removeAds,
    restorePurchases,
    refreshPurchaseState,
  };

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = (): AdContextType => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};

export default AdContext;
