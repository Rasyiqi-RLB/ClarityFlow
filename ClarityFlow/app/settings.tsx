import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AdBanner from '../components/AdBanner';
import RemoveAdsModal from '../components/RemoveAdsModal';
import { useAds } from '../contexts/AdContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_COLORS } from '../utils/constants';

export default function SettingsScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode, themeMode, setThemeMode, colors, fontSize, colorScheme, setFontSize, setColorScheme } = useTheme();
  const { adsRemoved, purchaseState, refreshPurchaseState, showRewardedAd } = useAds();
  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      taskReminders: true,
      dailyGoals: true,
      achievements: true,
      sound: true,
    },
    theme: {
      themeMode: themeMode,
      fontSize: fontSize,
      colorScheme: colorScheme,
    },
    privacy: {
      analytics: true,
      crashReports: true,
      dataSync: true,
      biometric: false,
    },
    general: {
      language: language,
      autoBackup: true,
      offlineMode: false,
    }
  });

  const [showFontModal, setShowFontModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRemoveAdsModal, setShowRemoveAdsModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleWatchRewardedAd = async () => {
    try {
      const result = await showRewardedAd();
      if (result.shown && result.rewarded) {
        Alert.alert(
          '🎉 Premium Unlocked!',
          'You now have 1 hour of premium features including:\n\n• Advanced analytics\n• Extra themes\n• Priority sync\n• Extended backup',
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else if (result.shown && !result.rewarded) {
        Alert.alert(
          'Ad Incomplete',
          'Please watch the complete ad to earn premium features.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Ad Not Available',
          'No ads are available right now. Please try again later.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      Alert.alert(
        'Error',
        'Failed to load ad. Please check your internet connection.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    // Handle theme changes through ThemeContext
    if (category === 'theme' && key === 'themeMode') {
      setThemeMode(value);
    } else if (category === 'theme' && key === 'fontSize') {
      setFontSize(value);
    } else if (category === 'theme' && key === 'colorScheme') {
      setColorScheme(value);
    }

    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const SettingSection = ({ title, icon, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{icon} {title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ title, subtitle, value, onToggle, onPress, showArrow = false }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress && !onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingControl}>
        {onToggle && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: THEME_COLORS.gray[300], true: THEME_COLORS.primary }}
            thumbColor={value ? THEME_COLORS.light : THEME_COLORS.gray[500]}
          />
        )}
        {showArrow && (
          <Text style={styles.settingValue}>{value} →</Text>
        )}
      </View>
    </TouchableOpacity>
  );



  const LanguageModal = () => {
    const languages = [
      { key: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
      { key: 'en', label: 'English', flag: '🇺🇸' },
      { key: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
    ];

    return (
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.key}
                style={[
                  styles.modalOption,
                  settings.general.language === lang.key && styles.modalOptionSelected
                ]}
                onPress={async () => {
                  await setLanguage(lang.key as 'id' | 'en' | 'ms');
                  updateSetting('general', 'language', lang.key);
                  setShowLanguageModal(false);
                  Alert.alert(t('common.success'), 'Bahasa telah diubah!');
                }}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={styles.modalOptionText}>{lang.label}</Text>
                </View>
                {settings.general.language === lang.key && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Pengaturan',
      'Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('app_settings');
              setSettings({
                notifications: {
                  enabled: true,
                  taskReminders: true,
                  dailyGoals: true,
                  achievements: true,
                  sound: true,
                },
                theme: {
                  fontSize: 'medium',
                  colorScheme: 'blue',
                },
                privacy: {
                  analytics: true,
                  crashReports: true,
                  dataSync: true,
                  biometric: false,
                },
                general: {
                  language: 'id',
                  autoBackup: true,
                  offlineMode: false,
                }
              });
              Alert.alert('Berhasil', 'Pengaturan telah direset ke default.');
            } catch (error) {
              Alert.alert('Error', 'Gagal mereset pengaturan.');
            }
          }
        }
      ]
    );
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.wrapper}>
      {/* Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerLeft}
          onPress={() => {
            try {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            } catch (error) {
              console.error('Navigation error:', error);
              router.replace('/(tabs)');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Notifications */}
      <SettingSection title={t('settings.notifications')} icon="🔔">
        <SettingItem
          title={t('settings.notifications')}
          subtitle={t('settings.notificationsSubtitle')}
          value={settings.notifications.enabled}
          onToggle={(value: boolean) => updateSetting('notifications', 'enabled', value)}
        />
        <SettingItem
          title={t('common.taskReminders')}
          subtitle={t('settings.taskRemindersSubtitle')}
          value={settings.notifications.taskReminders}
          onToggle={(value: boolean) => updateSetting('notifications', 'taskReminders', value)}
        />
        <SettingItem
          title={t('common.dailyGoals')}
          subtitle={t('settings.dailyGoalsSubtitle')}
          value={settings.notifications.dailyGoals}
          onToggle={(value: boolean) => updateSetting('notifications', 'dailyGoals', value)}
        />
        <SettingItem
          title={t('common.achievements')}
          subtitle={t('settings.achievementsSubtitle')}
          value={settings.notifications.achievements}
          onToggle={(value: boolean) => updateSetting('notifications', 'achievements', value)}
        />
        <SettingItem
          title={t('common.sound')}
          subtitle={t('settings.soundSubtitle')}
          value={settings.notifications.sound}
          onToggle={(value: boolean) => updateSetting('notifications', 'sound', value)}
        />
      </SettingSection>

      {/* Theme & Display */}
      <SettingSection title={t('settings.theme')} icon="🎨">
        <SettingItem
          title={t('settings.fontSize')}
          subtitle={t('settings.fontSizeSubtitle')}
          value={settings.theme.fontSize === 'small' ? 'Kecil' :
                 settings.theme.fontSize === 'medium' ? 'Sedang' :
                 settings.theme.fontSize === 'large' ? 'Besar' : 'Sangat Besar'}
          onPress={() => setShowFontModal(true)}
          showArrow
        />
        <SettingItem
          title={t('settings.colorScheme')}
          subtitle={t('settings.colorSchemeSubtitle')}
          value={settings.theme.colorScheme === 'blue' ? 'Biru' :
                 settings.theme.colorScheme === 'green' ? 'Hijau' :
                 settings.theme.colorScheme === 'purple' ? 'Ungu' :
                 settings.theme.colorScheme === 'orange' ? 'Oranye' : 'Merah'}
          onPress={() => setShowColorModal(true)}
          showArrow
        />
      </SettingSection>

      {/* Privacy & Security */}
      <SettingSection title={t('settings.privacy')} icon="🔒">
        <SettingItem
          title={t('common.analytics')}
          subtitle={t('settings.analyticsSubtitle')}
          value={settings.privacy.analytics}
          onToggle={(value: boolean) => updateSetting('privacy', 'analytics', value)}
        />
        <SettingItem
          title={t('common.crashReports')}
          subtitle={t('settings.crashReportsSubtitle')}
          value={settings.privacy.crashReports}
          onToggle={(value: boolean) => updateSetting('privacy', 'crashReports', value)}
        />
        <SettingItem
          title={t('common.dataSync')}
          subtitle={t('settings.dataSyncSubtitle')}
          value={settings.privacy.dataSync}
          onToggle={(value: boolean) => updateSetting('privacy', 'dataSync', value)}
        />
        <SettingItem
          title={t('common.biometric')}
          subtitle={t('settings.biometricSubtitle')}
          value={settings.privacy.biometric}
          onToggle={(value: boolean) => updateSetting('privacy', 'biometric', value)}
        />
      </SettingSection>

      {/* Remove Ads */}
      {!adsRemoved && (
        <SettingSection title="Remove Ads" icon="🚫">
          <SettingItem
            title="Remove Ads Forever"
            subtitle="Enjoy ClarityFlow without any advertisements"
            value={adsRemoved ? "✅ Ads Removed" : "💰 Purchase"}
            onPress={() => setShowRemoveAdsModal(true)}
            showArrow
          />
        </SettingSection>
      )}

      {/* Purchase Status */}
      {adsRemoved && (
        <SettingSection title="Premium Status" icon="⭐">
          <SettingItem
            title="Ad-Free Experience"
            subtitle="Thank you for supporting ClarityFlow!"
            value="✅ Active"
          />
        </SettingSection>
      )}



      {/* General */}
      <SettingSection title={t('settings.general')} icon="⚙️">
        <SettingItem
          title={t('settings.language')}
          subtitle={t('settings.languageSubtitle')}
          value={settings.general.language === 'id' ? 'Bahasa Indonesia' :
                 settings.general.language === 'en' ? 'English' : 'Bahasa Melayu'}
          onPress={() => setShowLanguageModal(true)}
          showArrow
        />
        <SettingItem
          title={t('settings.backup')}
          subtitle={t('settings.autoBackupSubtitle')}
          value={settings.general.autoBackup}
          onToggle={(value: boolean) => updateSetting('general', 'autoBackup', value)}
        />
        <SettingItem
          title={t('settings.offline')}
          subtitle={t('settings.offlineModeSubtitle')}
          value={settings.general.offlineMode}
          onToggle={(value: boolean) => updateSetting('general', 'offlineMode', value)}
        />
        <SettingItem
          title={t('transliteration.title')}
          subtitle={t('transliteration.settingsDescription')}
          onPress={() => {
            try {
              router.push('/transliteration');
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert(t('common.error'), 'Gagal membuka halaman transliterasi');
            }
          }}
          showArrow
        />
      </SettingSection>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
          <Text style={styles.resetButtonText}>🔄 Reset ke Default</Text>
        </TouchableOpacity>
      </View>

      {/* Font Size Modal */}
      <Modal visible={showFontModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.fontSize')}</Text>
            {[
              { key: 'small', label: 'Kecil', size: 12 },
              { key: 'medium', label: 'Sedang', size: 16 },
              { key: 'large', label: 'Besar', size: 20 },
              { key: 'xlarge', label: 'Sangat Besar', size: 24 },
            ].map((font) => (
              <TouchableOpacity
                key={font.key}
                style={[
                  styles.modalOption,
                  settings.theme.fontSize === font.key && styles.modalOptionSelected
                ]}
                onPress={() => {
                  updateSetting('theme', 'fontSize', font.key);
                  setShowFontModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, { fontSize: font.size }]}>
                  {font.label}
                </Text>
                {settings.theme.fontSize === font.key && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFontModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Color Scheme Modal */}
      <Modal visible={showColorModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.colorScheme')}</Text>
            {[
              { key: 'blue', label: 'Biru', color: '#3B82F6' },
              { key: 'green', label: 'Hijau', color: '#10B981' },
              { key: 'purple', label: 'Ungu', color: '#8B5CF6' },
              { key: 'orange', label: 'Oranye', color: '#F59E0B' },
              { key: 'red', label: 'Merah', color: '#EF4444' },
            ].map((scheme) => (
              <TouchableOpacity
                key={scheme.key}
                style={[
                  styles.modalOption,
                  settings.theme.colorScheme === scheme.key && styles.modalOptionSelected
                ]}
                onPress={() => {
                  updateSetting('theme', 'colorScheme', scheme.key);
                  setShowColorModal(false);
                }}
              >
                <View style={styles.colorOptionContent}>
                  <View style={[styles.colorPreview, { backgroundColor: scheme.color }]} />
                  <Text style={styles.modalOptionText}>{scheme.label}</Text>
                </View>
                {settings.theme.colorScheme === scheme.key && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowColorModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LanguageModal />

      {/* Remove Ads Modal */}
      <RemoveAdsModal
        visible={showRemoveAdsModal}
        onClose={() => setShowRemoveAdsModal(false)}
        onPurchaseSuccess={() => {
          refreshPurchaseState();
          setShowRemoveAdsModal(false);
        }}
      />
      </ScrollView>

      {/* Banner Ad - Only show if ads not removed */}
      {!adsRemoved && (
        <AdBanner position="bottom" size="banner" />
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 48,
  },
  headerLeft: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 36,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    marginTop: 20,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  settingControl: {
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: colors.text.muted,
    fontWeight: '500',
  },
  actionsSection: {
    margin: 20,
    marginTop: 0,
  },
  resetButton: {
    backgroundColor: colors.button.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: colors.primary + '20',
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  colorOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
});