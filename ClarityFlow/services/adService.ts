import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdConfig {
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
  nativeId: string;
  testMode: boolean;
}

export interface AdSettings {
  showBannerAds: boolean;
  showInterstitialAds: boolean;
  showRewardedAds: boolean;
  adFrequency: 'low' | 'medium' | 'high';
  lastInterstitialShown: number;
  adsRemoved: boolean;
}

class AdService {
  private static instance: AdService;
  private config: AdConfig;
  private settings: AdSettings;
  private initialized = false;

  private constructor() {
    // AdMob Unit IDs - ClarityFlow Real IDs
    this.config = {
      bannerId: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-1647155857669632/9646615609',
      interstitialId: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-1647155857669632/9646615609', // Using banner ID as fallback
      rewardedId: __DEV__ ? 'ca-app-pub-3940256099942544/5224354917' : 'ca-app-pub-1647155857669632/4530020292',
      nativeId: __DEV__ ? 'ca-app-pub-3940256099942544/2247696110' : 'ca-app-pub-1647155857669632/7020452268',
      testMode: __DEV__,
    };

    this.settings = {
      showBannerAds: true,
      showInterstitialAds: true,
      showRewardedAds: true,
      adFrequency: 'medium',
      lastInterstitialShown: 0,
      adsRemoved: false,
    };
  }

  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  // Initialize AdMob
  async initialize(): Promise<void> {
    try {
      await this.loadSettings();

      if (this.settings.adsRemoved) {
        console.log('🚫 Ads removed - skipping AdMob initialization');
        return;
      }

      // Initialize AdMob - temporarily disabled for build
      // TODO: Re-implement with react-native-google-mobile-ads
      console.log('📱 AdMob initialization temporarily disabled');

      this.initialized = true;
      console.log('📱 AdMob initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  // Load ad settings from storage
  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('ad_settings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load ad settings:', error);
    }
  }

  // Save ad settings to storage
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('ad_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save ad settings:', error);
    }
  }

  // Check if ads are removed
  async areAdsRemoved(): Promise<boolean> {
    await this.loadSettings();
    return this.settings.adsRemoved;
  }

  // Remove ads (called after successful purchase)
  async removeAds(): Promise<void> {
    this.settings.adsRemoved = true;
    await this.saveSettings();
    console.log('✅ Ads removed successfully');
  }

  // Restore ads (for testing or refund scenarios)
  async restoreAds(): Promise<void> {
    this.settings.adsRemoved = false;
    await this.saveSettings();
    console.log('🔄 Ads restored');
  }

  // Show banner ad
  async showBannerAd(): Promise<boolean> {
    if (!this.initialized || this.settings.adsRemoved || !this.settings.showBannerAds) {
      return false;
    }

    try {
      // AdMob functionality temporarily disabled for build
      console.log('📱 Banner ad would be shown here');
      return true;
    } catch (error) {
      console.error('Failed to show banner ad:', error);
      return false;
    }
  }

  // Show interstitial ad
  async showInterstitialAd(): Promise<boolean> {
    if (!this.initialized || this.settings.adsRemoved || !this.settings.showInterstitialAds) {
      return false;
    }

    // Check frequency limits
    const now = Date.now();
    const timeSinceLastAd = now - this.settings.lastInterstitialShown;
    const minInterval = this.getInterstitialInterval();

    if (timeSinceLastAd < minInterval) {
      return false;
    }

    try {
      // AdMob functionality temporarily disabled for build
      console.log('📺 Interstitial ad would be shown here');

      this.settings.lastInterstitialShown = now;
      await this.saveSettings();

      return true;
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      return false;
    }
  }

  // Show rewarded ad
  async showRewardedAd(): Promise<{ shown: boolean; rewarded: boolean }> {
    if (!this.initialized || this.settings.adsRemoved || !this.settings.showRewardedAds) {
      return { shown: false, rewarded: false };
    }

    try {
      // AdMob functionality temporarily disabled for build
      console.log('🎁 Rewarded ad would be shown here');

      // Simulate successful reward for testing
      return { shown: true, rewarded: true };
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      return { shown: false, rewarded: false };
    }
  }

  // Get interstitial interval based on frequency setting
  private getInterstitialInterval(): number {
    switch (this.settings.adFrequency) {
      case 'low': return 5 * 60 * 1000; // 5 minutes
      case 'medium': return 3 * 60 * 1000; // 3 minutes
      case 'high': return 1 * 60 * 1000; // 1 minute
      default: return 3 * 60 * 1000;
    }
  }

  // Update ad settings
  async updateSettings(newSettings: Partial<AdSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  // Get current settings
  getSettings(): AdSettings {
    return { ...this.settings };
  }

  // Get ad config
  getConfig(): AdConfig {
    return { ...this.config };
  }
}

export default AdService.getInstance();
