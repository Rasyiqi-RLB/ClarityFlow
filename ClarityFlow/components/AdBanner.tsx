import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import AdService from '../services/adService';

interface AdBannerProps {
  size?: 'banner' | 'largeBanner' | 'mediumRectangle' | 'fullBanner' | 'leaderboard' | 'smartBannerPortrait' | 'smartBannerLandscape';
  position?: 'top' | 'bottom';
  style?: any;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  size = 'banner', 
  position = 'bottom',
  style 
}) => {
  const { colors } = useTheme();
  const [shouldShowAd, setShouldShowAd] = useState(false);
  const [adConfig, setAdConfig] = useState(AdService.getConfig());

  useEffect(() => {
    checkAdStatus();
  }, []);

  const checkAdStatus = async () => {
    try {
      const adsRemoved = await AdService.areAdsRemoved();
      const canShowBanner = await AdService.showBannerAd();
      
      setShouldShowAd(!adsRemoved && canShowBanner);
    } catch (error) {
      console.error('Failed to check ad status:', error);
      setShouldShowAd(false);
    }
  };

  const handleAdFailedToLoad = (error: any) => {
    console.error('Banner ad failed to load:', error);
    setShouldShowAd(false);
  };

  const handleAdLoaded = () => {
    console.log('📱 Banner ad loaded successfully');
  };

  if (!shouldShowAd) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      position === 'top' ? styles.topPosition : styles.bottomPosition,
      { backgroundColor: colors.background.primary },
      style
    ]}>
      {/* AdMob Banner temporarily disabled for build */}
      <View style={styles.banner}>
        <Text style={{ color: colors.text.secondary, fontSize: 12, textAlign: 'center' }}>
          Ad Space (Temporarily Disabled)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  topPosition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bottomPosition: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  banner: {
    backgroundColor: 'transparent',
  },
});

export default AdBanner;
