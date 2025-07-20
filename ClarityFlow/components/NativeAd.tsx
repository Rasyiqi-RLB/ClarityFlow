import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAds } from '../contexts/AdContext';

interface NativeAdProps {
  style?: any;
  type?: 'productivity_tip' | 'app_recommendation' | 'feature_highlight';
}

const NativeAd: React.FC<NativeAdProps> = ({ 
  style,
  type = 'productivity_tip'
}) => {
  const { colors, getFontSize } = useTheme();
  const { adsRemoved } = useAds();
  const [adContent, setAdContent] = useState<any>(null);

  useEffect(() => {
    if (!adsRemoved) {
      loadNativeAd();
    }
  }, [adsRemoved]);

  const loadNativeAd = () => {
    // Mock native ad content - replace with real native ad implementation
    const mockAds = {
      productivity_tip: {
        title: "💡 Productivity Tip",
        description: "Try the Pomodoro Technique: Work for 25 minutes, then take a 5-minute break. This can boost your focus and productivity!",
        icon: "💡",
        actionText: "Learn More",
        sponsored: true
      },
      app_recommendation: {
        title: "📱 Recommended App",
        description: "Focus Timer Pro - Advanced Pomodoro timer with analytics and team collaboration features.",
        icon: "📱",
        actionText: "Download",
        sponsored: true
      },
      feature_highlight: {
        title: "⭐ Pro Feature",
        description: "Unlock advanced analytics to track your productivity patterns and optimize your workflow.",
        icon: "⭐",
        actionText: "Upgrade",
        sponsored: false
      }
    };

    setAdContent(mockAds[type]);
  };

  const handleAdClick = () => {
    console.log('Native ad clicked:', type);
    // Handle ad click - open URL, show modal, etc.
  };

  if (adsRemoved || !adContent) {
    return null;
  }

  const dynamicStyles = {
    container: {
      backgroundColor: colors.background.secondary,
      borderColor: colors.border.primary,
    },
    title: {
      color: colors.text.primary,
      fontSize: getFontSize(16),
    },
    description: {
      color: colors.text.secondary,
      fontSize: getFontSize(14),
    },
    actionButton: {
      backgroundColor: colors.primary,
    },
    actionText: {
      color: colors.text.inverse,
      fontSize: getFontSize(14),
    },
    sponsoredText: {
      color: colors.text.tertiary,
      fontSize: getFontSize(12),
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container, style]}>
      {/* Ad Label */}
      {adContent.sponsored && (
        <View style={styles.adLabel}>
          <Text style={[styles.sponsoredText, dynamicStyles.sponsoredText]}>
            Sponsored
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>{adContent.icon}</Text>
          <Text style={[styles.title, dynamicStyles.title]}>
            {adContent.title}
          </Text>
        </View>

        <Text style={[styles.description, dynamicStyles.description]}>
          {adContent.description}
        </Text>

        <TouchableOpacity
          style={[styles.actionButton, dynamicStyles.actionButton]}
          onPress={handleAdClick}
        >
          <Text style={[styles.actionText, dynamicStyles.actionText]}>
            {adContent.actionText}
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={16} 
            color={colors.text.inverse} 
            style={styles.actionIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  adLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sponsoredText: {
    fontWeight: '500',
  },
  content: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  description: {
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontWeight: '600',
    marginRight: 4,
  },
  actionIcon: {
    marginLeft: 4,
  },
});

export default NativeAd;
