import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import apiKeyService, { APIKeyConfig } from '../services/apiKeyService';
import { THEME_COLORS } from '../utils/constants';

interface APIManagementProps {
  visible: boolean;
  onClose: () => void;
}

const APIManagement: React.FC<APIManagementProps> = ({ visible, onClose }) => {
  const [configs, setConfigs] = useState<APIKeyConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (visible) {
      loadAPIConfigs();
    }
  }, [visible]);

  useEffect(() => {
    // Initialize showApiKeys state when configs change
    const initialShowState: { [key: string]: boolean } = {};
    configs.forEach(config => {
      initialShowState[config.name] = false;
    });
    setShowApiKeys(initialShowState);
  }, [configs]);

  const loadAPIConfigs = async () => {
    try {
      setLoading(true);
      const loadedConfigs = await apiKeyService.loadAPIConfigs();
      setConfigs(loadedConfigs);
    } catch (error) {
      console.error('Error loading API configs:', error);
      Alert.alert(
        'Error',
        'Failed to load API configurations. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const saveAPIConfigs = async () => {
    setSaving(true);
    try {
      // Save all configurations from current state
      for (const config of configs) {
        await apiKeyService.updateAPIKey(config.provider, config.apiKey || '');
        await apiKeyService.toggleAPIKey(config.provider, config.enabled);
      }
      
      Alert.alert('Success', 'API configuration saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving API configs:', error);
      Alert.alert('Error', 'Failed to save API configuration');
    } finally {
      setSaving(false);
    }
  };



  const toggleShowApiKey = (configName: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [configName]: !prev[configName]
    }));
  };

  const updateAPIKey = (index: number, apiKey: string) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], apiKey };
    setConfigs(newConfigs);
  };

  const toggleAPIEnabled = (index: number) => {
    const config = configs[index];
    if (!config) return;

    const newEnabledState = !config.enabled;

    // If enabling but no API key, show warning
    if (newEnabledState && (!config.apiKey || config.apiKey.trim() === '')) {
      Alert.alert(
        'No API Key',
        `Please enter a valid ${config.name} API key before enabling.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Update state immediately for better UX
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], enabled: newEnabledState };
    setConfigs(newConfigs);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔑 Pengaturan API</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Memuat konfigurasi...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            <Text style={styles.description}>
              Atur API key untuk menghubungkan aplikasi dengan layanan eksternal.
            </Text>
            
            {configs.map((config, index) => (
              <View key={index} style={styles.configCard}>
                <View style={styles.configHeader}>
                  <View style={styles.configInfo}>
                    <Text style={styles.configName}>{config.name || 'Unknown API'}</Text>
                    <Text style={styles.configDescription}>{config.description || 'No description available'}</Text>
                  </View>
                  <Switch
                      value={config.enabled}
                      onValueChange={() => toggleAPIEnabled(index)}
                      trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                      thumbColor={config.enabled ? '#fff' : '#fff'}
                    />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>API Key:</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.textInput, { paddingRight: 50 }]}
                      value={config.apiKey || ''}
                      onChangeText={(text) => updateAPIKey(index, text)}
                      placeholder={(config.provider || '') === 'gemini' ? 'AIzaSy...' : (config.provider || '') === 'openrouter' ? 'sk-or-...' : 'Enter API key...'}
                      secureTextEntry={!showApiKeys[config.name || 'unknown'] && !!(config.apiKey && config.apiKey.length > 0)}
                    />
                    {(config.apiKey && config.apiKey.length > 0) ? (
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => toggleShowApiKey(config.name || 'unknown')}
                      >
                        <Text style={styles.eyeButtonText}>
                          {showApiKeys[config.name || 'unknown'] ? '🙈' : '👁️'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <Text style={styles.helperText}>
                    {(config.provider || '') === 'gemini' 
                      ? '💡 Gemini API key should start with "AIzaSy"'
                      : (config.provider || '') === 'openrouter'
                      ? '💡 OpenRouter API key should start with "sk-or-"'
                      : '💡 Ensure API key format matches the provider'
                    }
                  </Text>
                </View>
                
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusText, { color: config.enabled ? '#10B981' : '#6B7280' }]}>
                    {config.enabled ? '✓ Aktif' : '○ Nonaktif'}
                  </Text>
                </View>
              </View>
            ))}
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveAPIConfigs}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Simpan Konfigurasi</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: THEME_COLORS.gray[600],
  },
  description: {
    fontSize: 16,
    color: THEME_COLORS.gray[600],
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  configCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  configInfo: {
    flex: 1,
    marginRight: 16,
  },
  configName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 14,
    color: THEME_COLORS.gray[600],
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.dark,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: THEME_COLORS.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  eyeButtonText: {
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: THEME_COLORS.gray[500],
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default APIManagement;