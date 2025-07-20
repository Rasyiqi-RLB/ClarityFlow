import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface APIKeyConfig {
  name: string;
  description: string;
  apiKey: string;
  enabled: boolean;
  provider: 'gemini' | 'openrouter';
  lastUpdated?: Date;
}

export interface FirestoreAPIKeys {
  gemini?: string;
  openrouter?: string;
  lastUpdated?: Date;
  updatedAt?: Date;
}

class APIKeyService {
  private readonly SETTINGS_DOC_PATH = 'admin/settings';

  /**
   * Load API keys from Firebase Firestore
   */
  async loadAPIConfigs(): Promise<APIKeyConfig[]> {
    try {
      const settingsRef = doc(db, this.SETTINGS_DOC_PATH);
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        const apiKeys = data?.apiKeys as FirestoreAPIKeys;
        
        if (apiKeys) {
          const configs: APIKeyConfig[] = [];
          
          // Gemini configuration
          configs.push({
            name: 'Gemini',
            description: 'Google Gemini AI untuk analisis tugas dan produktivitas',
            apiKey: apiKeys.gemini || '',
            enabled: Boolean(apiKeys.gemini && apiKeys.gemini.trim() !== ''),
            provider: 'gemini',
            lastUpdated: apiKeys.lastUpdated || apiKeys.updatedAt || new Date()
          });
          
          // OpenRouter configuration
          configs.push({
            name: 'OpenRouter',
            description: 'OpenRouter API untuk akses ke berbagai model AI',
            apiKey: apiKeys.openrouter || '',
            enabled: Boolean(apiKeys.openrouter && apiKeys.openrouter.trim() !== ''),
            provider: 'openrouter',
            lastUpdated: apiKeys.lastUpdated || apiKeys.updatedAt || new Date()
          });
          
          return configs;
        }
      }
      
      // Return default empty configurations
      return [
        {
          name: 'Gemini',
          description: 'Google Gemini AI untuk analisis tugas dan produktivitas',
          apiKey: '',
          enabled: false,
          provider: 'gemini'
        },
        {
          name: 'OpenRouter',
          description: 'OpenRouter API untuk akses ke berbagai model AI',
          apiKey: '',
          enabled: false,
          provider: 'openrouter'
        }
      ];
    } catch (error) {
      console.error('Error loading API keys from Firestore:', error);
      throw new Error('Failed to load API configurations');
    }
  }

  /**
   * Save API keys to Firebase Firestore
   */
  async saveAPIConfigs(configs: APIKeyConfig[]): Promise<void> {
    try {
      const settingsRef = doc(db, this.SETTINGS_DOC_PATH);
      
      // Convert configs to Firestore format
      const apiKeys: FirestoreAPIKeys = {
        lastUpdated: new Date(),
        updatedAt: new Date()
      };
      
      configs.forEach(config => {
        if (config.provider === 'gemini') {
          apiKeys.gemini = config.apiKey;
        } else if (config.provider === 'openrouter') {
          apiKeys.openrouter = config.apiKey;
        }
      });
      
      // Check if document exists
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        // Update existing document
        await updateDoc(settingsRef, {
          apiKeys,
          lastUpdated: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Create new document
        await setDoc(settingsRef, {
          apiKeys,
          lastUpdated: new Date(),
          updatedAt: new Date(),
          createdAt: new Date()
        });
      }
      
      console.log('API keys saved to Firestore successfully');
    } catch (error) {
      console.error('Error saving API keys to Firestore:', error);
      throw new Error('Failed to save API configurations');
    }
  }

  /**
   * Update specific API key
   */
  async updateAPIKey(provider: 'gemini' | 'openrouter', apiKey: string): Promise<void> {
    try {
      const configs = await this.loadAPIConfigs();
      const configIndex = configs.findIndex(c => c.provider === provider);
      
      if (configIndex !== -1) {
        configs[configIndex].apiKey = apiKey;
        configs[configIndex].enabled = Boolean(apiKey && apiKey.trim() !== '');
        configs[configIndex].lastUpdated = new Date();
        
        await this.saveAPIConfigs(configs);
      }
    } catch (error) {
      console.error(`Error updating ${provider} API key:`, error);
      throw new Error(`Failed to update ${provider} API key`);
    }
  }

  /**
   * Toggle API key enabled status
   */
  async toggleAPIKey(provider: 'gemini' | 'openrouter', enabled: boolean): Promise<void> {
    try {
      const configs = await this.loadAPIConfigs();
      const configIndex = configs.findIndex(c => c.provider === provider);
      
      if (configIndex !== -1) {
        configs[configIndex].enabled = enabled;
        configs[configIndex].lastUpdated = new Date();
        
        await this.saveAPIConfigs(configs);
      }
    } catch (error) {
      console.error(`Error toggling ${provider} API key:`, error);
      throw new Error(`Failed to toggle ${provider} API key`);
    }
  }

  /**
   * Validate API key format
   */
  validateAPIKeyFormat(provider: 'gemini' | 'openrouter', apiKey: string): boolean {
    if (!apiKey || apiKey.trim() === '') return false;
    
    switch (provider) {
      case 'gemini':
        // Gemini API keys typically start with 'AIza' and are 39 characters long
        return apiKey.startsWith('AIza') && apiKey.length === 39;
      case 'openrouter':
        // OpenRouter API keys typically start with 'sk-or-' and are longer
        return apiKey.startsWith('sk-or-') && apiKey.length > 20;
      default:
        return false;
    }
  }

  /**
   * Get active API key for a provider
   */
  async getActiveAPIKey(provider: 'gemini' | 'openrouter'): Promise<string | null> {
    try {
      const configs = await this.loadAPIConfigs();
      const config = configs.find(c => c.provider === provider && c.enabled);
      return config?.apiKey || null;
    } catch (error) {
      console.error(`Error getting active ${provider} API key:`, error);
      return null;
    }
  }

  /**
   * Check if any API key is configured and enabled
   */
  async hasActiveAPIKey(): Promise<boolean> {
    try {
      const configs = await this.loadAPIConfigs();
      return configs.some((config: APIKeyConfig) => config.enabled && config.apiKey.trim() !== '');
    } catch (error) {
      console.error('Error checking for active API keys:', error);
      return false;
    }
  }
}

export default new APIKeyService();