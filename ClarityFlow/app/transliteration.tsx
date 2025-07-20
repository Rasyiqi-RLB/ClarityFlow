import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import TransliterationTool from '../components/TransliterationTool';
import TransliterationSettings from '../components/TransliterationSettings';
import { TransliterationResult } from '../services/transliterationService';

const TransliterationPage: React.FC = () => {
  const router = useRouter();
  const { t, isRTL, transliterationEnabled } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'tool' | 'settings'>('tool');

  const handleTransliterationComplete = (result: TransliterationResult) => {
    console.log('Transliteration completed:', result);
    // You can add additional logic here, such as saving to history
  };

  const handleNavigateToTool = () => {
    setActiveTab('tool');
    setShowSettings(false);
  };

  if (!transliterationEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              {isRTL ? '→' : '←'} {t('nav.back')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('transliteration.title')}</Text>
        </View>

        <View style={styles.disabledContainer}>
          <Text style={styles.disabledTitle}>
            {t('transliteration.notEnabled')}
          </Text>
          <Text style={styles.disabledDescription}>
            {t('transliteration.enableInSettings')}
          </Text>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={styles.enableButtonText}>
              {t('transliteration.goToSettings')}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'settings' && (
          <TransliterationSettings onNavigateToTool={handleNavigateToTool} />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            {isRTL ? '→' : '←'} {t('nav.back')}
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('transliteration.title')}</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'tool' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('tool')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'tool' && styles.activeTabText,
            ]}
          >
            {t('transliteration.tool')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'settings' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('settings')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'settings' && styles.activeTabText,
            ]}
          >
            {t('settings.title')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'tool' ? (
          <TransliterationTool
            onTransliterationComplete={handleTransliterationComplete}
          />
        ) : (
          <TransliterationSettings onNavigateToTool={handleNavigateToTool} />
        )}
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.modalCloseButtonText}>
                {t('common.done')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {t('transliteration.settings')}
            </Text>
          </View>
          <TransliterationSettings onNavigateToTool={handleNavigateToTool} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 18,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  disabledTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  disabledDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  enableButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
});

export default TransliterationPage;
