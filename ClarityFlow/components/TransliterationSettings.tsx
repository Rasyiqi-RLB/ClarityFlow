import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import TransliterationService from '../services/transliterationService';

interface TransliterationSettingsProps {
  onNavigateToTool?: () => void;
}

const TransliterationSettings: React.FC<TransliterationSettingsProps> = ({
  onNavigateToTool,
}) => {
  const { 
    t, 
    language, 
    transliterationEnabled, 
    setTransliterationEnabled,
    setLanguage 
  } = useLanguage();

  const transliterationService = TransliterationService.getInstance();

  const handleToggleTransliteration = async (enabled: boolean) => {
    try {
      await setTransliterationEnabled(enabled);
      Alert.alert(
        t('common.success'),
        enabled 
          ? t('transliteration.enabledMessage')
          : t('transliteration.disabledMessage')
      );
    } catch (error) {
      console.error('Error toggling transliteration:', error);
      Alert.alert(t('common.error'), t('transliteration.toggleError'));
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      await setLanguage(newLanguage as any);
      Alert.alert(t('common.success'), t('settings.languageChanged'));
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(t('common.error'), t('settings.languageChangeError'));
    }
  };

  const getSupportedLanguages = () => {
    const supportedLanguages = transliterationService.getSupportedLanguages();
    return ['id', 'en', 'ms', ...supportedLanguages.filter(lang => !['id', 'en'].includes(lang))];
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('transliteration.settings')}</Text>
        
        {/* Transliteration Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{t('transliteration.enableTransliteration')}</Text>
            <Text style={styles.settingDescription}>
              {t('transliteration.enableDescription')}
            </Text>
          </View>
          <Switch
            value={transliterationEnabled}
            onValueChange={handleToggleTransliteration}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={transliterationEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        {/* Language Selection */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{t('settings.language')}</Text>
            <Text style={styles.settingDescription}>
              {t('transliteration.currentLanguage')}: {' '}
              {transliterationService.getLanguageName(language as any, language as any)}
            </Text>
          </View>
        </View>

        {/* Language Options */}
        <View style={styles.languageGrid}>
          {getSupportedLanguages().map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.languageButton,
                language === lang && styles.selectedLanguageButton,
              ]}
              onPress={() => handleLanguageChange(lang)}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === lang && styles.selectedLanguageButtonText,
                ]}
              >
                {transliterationService.getLanguageName(lang as any, language as any)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transliteration Tool Access */}
        {transliterationEnabled && onNavigateToTool && (
          <TouchableOpacity
            style={styles.toolButton}
            onPress={onNavigateToTool}
          >
            <Text style={styles.toolButtonText}>
              {t('transliteration.openTool')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Supported Languages Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('transliteration.supportedLanguages')}</Text>
          <Text style={styles.infoText}>
            {transliterationService.getSupportedLanguages()
              .map(lang => transliterationService.getLanguageName(lang, language as any))
              .join(', ')}
          </Text>
        </View>

        {/* Features Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('transliteration.features')}</Text>
          <Text style={styles.infoText}>
            • {t('transliteration.feature1')}{'\n'}
            • {t('transliteration.feature2')}{'\n'}
            • {t('transliteration.feature3')}{'\n'}
            • {t('transliteration.feature4')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 16,
  },
  languageButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedLanguageButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedLanguageButtonText: {
    color: '#fff',
  },
  toolButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  toolButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default TransliterationSettings;
