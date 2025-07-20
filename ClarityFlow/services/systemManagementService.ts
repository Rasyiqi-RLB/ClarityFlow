import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { ENV_CONFIG, generateAPIKey as envGenerateAPIKey, getRateLimit, hasAPIManagement } from '../config/env';
import { db } from '../config/firebase';
import loggingService from './loggingService';

export interface SystemSettings {
  id: string;
  key: string;
  value: any;
  description: string;
  category: 'general' | 'security' | 'performance' | 'notifications';
  updatedAt: Date;
  updatedBy: string;
}

export interface DatabaseStats {
  totalCollections: number;
  totalDocuments: number;
  storageUsed: string;
  avgQueryTime: number;
  activeConnections: number;
  maxConnections: number;
}

export interface SecurityLog {
  id: string;
  type: 'login_success' | 'login_failed' | 'suspicious_activity' | 'api_abuse' | 'data_access';
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  environment: 'production' | 'development' | 'staging';
  permissions: string[];
  rateLimit: number;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface SystemHealth {
  cpu: {
    usage: number;
    status: 'good' | 'warning' | 'critical';
  };
  memory: {
    usage: number;
    total: string;
    status: 'good' | 'warning' | 'critical';
  };
  disk: {
    usage: number;
    total: string;
    status: 'good' | 'warning' | 'critical';
  };
  network: {
    throughput: string;
    latency: number;
    status: 'good' | 'warning' | 'critical';
  };
  database: {
    responseTime: number;
    connections: number;
    status: 'good' | 'warning' | 'critical';
  };
  api: {
    responseTime: number;
    errorRate: number;
    requestsPerMinute: number;
    status: 'good' | 'warning' | 'critical';
  };
}

class SystemManagementService {
  // System Settings Management
  async getSystemSettings(): Promise<SystemSettings[]> {
    try {
      const settingsRef = collection(db, 'systemSettings');
      const snapshot = await getDocs(settingsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as SystemSettings[];
    } catch (error) {
      console.error('Error fetching system settings:', error);
      // Return mock data for demo
      return this.getMockSystemSettings();
    }
  }

  async updateSystemSetting(id: string, value: any, updatedBy: string): Promise<void> {
    try {
      const settingRef = doc(db, 'systemSettings', id);
      await updateDoc(settingRef, {
        value,
        updatedAt: new Date(),
        updatedBy
      });
      
      loggingService.info(`Updated system setting ${id}`, 'SystemManagementService', { settingId: id, newValue: value, updatedBy });
    } catch (error) {
      console.error('Error updating system setting:', error);
      throw error;
    }
  }

  // Database Management
  async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      // In a real app, this would query actual database metrics
      // For demo, return mock data
      return {
        totalCollections: 12,
        totalDocuments: 1247892,
        storageUsed: '2.1GB',
        avgQueryTime: 45,
        activeConnections: 23,
        maxConnections: 100
      };
    } catch (error) {
      console.error('Error fetching database stats:', error);
      throw error;
    }
  }

  async performDatabaseBackup(): Promise<{ success: boolean; backupId: string; size: string }> {
    try {
      // Simulate backup process
      const backupId = `backup_${Date.now()}`;
      
      loggingService.info(`Database backup initiated: ${backupId}`, 'SystemManagementService', { backupId });
      
      return {
        success: true,
        backupId,
        size: '2.1GB'
      };
    } catch (error) {
      console.error('Error performing database backup:', error);
      throw error;
    }
  }

  async getBackupHistory(): Promise<Array<{ id: string; date: Date; size: string; status: 'success' | 'failed' }>> {
    try {
      // Return mock backup history
      return [
        { id: 'backup_001', date: new Date(), size: '2.1GB', status: 'success' },
        { id: 'backup_002', date: new Date(Date.now() - 86400000), size: '2.0GB', status: 'success' },
        { id: 'backup_003', date: new Date(Date.now() - 172800000), size: '1.9GB', status: 'success' }
      ];
    } catch (error) {
      console.error('Error fetching backup history:', error);
      throw error;
    }
  }

  // Security Logs Management
  async getSecurityLogs(limitCount: number = 50): Promise<SecurityLog[]> {
    try {
      const logsRef = collection(db, 'security_logs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as SecurityLog[];
    } catch (error) {
      console.error('Error fetching security logs:', error);
      // Return mock data for demo
      return this.getMockSecurityLogs();
    }
  }

  async getFailedLogins(hours: number = 24): Promise<SecurityLog[]> {
    try {
      const logsRef = collection(db, 'securityLogs');
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      // Try complex query first
      try {
        const q = query(
          logsRef,
          where('type', '==', 'login_failed'),
          where('timestamp', '>=', cutoffTime),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as SecurityLog[];
      } catch (indexError) {
        console.warn('Complex query failed, using simplified query:', indexError);
        
        // Fallback: Simple query without timestamp filter
        const simpleQuery = query(
          logsRef,
          where('type', '==', 'login_failed'),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(simpleQuery);
        
        // Filter by timestamp in memory
        const allLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as SecurityLog[];
        
        return allLogs.filter(log => log.timestamp >= cutoffTime);
      }
    } catch (error) {
      console.error('Error fetching failed logins:', error);
      return this.getMockFailedLogins();
    }
  }

  async getSuspiciousActivity(hours: number = 24): Promise<SecurityLog[]> {
    try {
      const logsRef = collection(db, 'securityLogs');
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      // Try complex query first
      try {
        const q = query(
          logsRef,
          where('type', '==', 'suspicious_activity'),
          where('resolved', '==', false),
          where('timestamp', '>=', cutoffTime),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as SecurityLog[];
      } catch (indexError) {
        console.warn('Complex query failed, using simplified query:', indexError);
        
        // Fallback: Simple query without timestamp filter
        const simpleQuery = query(
          logsRef,
          where('type', '==', 'suspicious_activity'),
          where('resolved', '==', false),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(simpleQuery);
        
        // Filter by timestamp in memory
        const allLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as SecurityLog[];
        
        return allLogs.filter(log => log.timestamp >= cutoffTime);
      }
    } catch (error) {
      console.error('Error fetching suspicious activity:', error);
      return this.getMockSuspiciousActivity();
    }
  }

  // API Management
  async getAPIKeys(): Promise<APIKey[]> {
    try {
      const keysRef = collection(db, 'apiKeys');
      const snapshot = await getDocs(keysRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastUsed: doc.data().lastUsed?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate()
      })) as APIKey[];
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return this.getMockAPIKeys();
    }
  }

  async createAPIKey(name: string, environment: 'production' | 'development' | 'staging', permissions: string[]): Promise<APIKey> {
    try {
      // Check if API management is enabled
      if (!hasAPIManagement()) {
        throw new Error('API management is disabled');
      }

      // Validate input
      if (!name.trim()) {
        throw new Error('API key name is required');
      }

      if (permissions.length === 0) {
        throw new Error('At least one permission is required');
      }

      // Check existing API keys count (mock check for demo)
      const existingKeys = await this.getAPIKeys();
      if (existingKeys.length >= ENV_CONFIG.MAX_API_KEYS_PER_USER) {
        throw new Error(`Maximum ${ENV_CONFIG.MAX_API_KEYS_PER_USER} API keys allowed`);
      }

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + ENV_CONFIG.API_KEY_EXPIRY_DAYS);

      const newKey: Omit<APIKey, 'id'> = {
        name: name.trim(),
        key: envGenerateAPIKey(environment),
        environment,
        permissions,
        rateLimit: getRateLimit(environment),
        usageCount: 0,
        lastUsed: new Date(),
        createdAt: new Date(),
        expiresAt,
        isActive: true
      };
      
      const docRef = await addDoc(collection(db, 'apiKeys'), newKey);
      
      loggingService.info(`Created API key: ${name}`, 'SystemManagementService', { 
        keyId: docRef.id, 
        environment, 
        permissions 
      });
      
      return {
        id: docRef.id,
        ...newKey
      };
    } catch (error) {
      console.error('Error creating API key:', error);
      loggingService.error('Failed to create API key', error as Error, 'SystemManagementService', { name, environment });
      throw error;
    }
  }

  async revokeAPIKey(keyId: string): Promise<void> {
    try {
      const keyRef = doc(db, 'apiKeys', keyId);
      await updateDoc(keyRef, {
        isActive: false,
        revokedAt: new Date()
      });
      
      loggingService.info(`Revoked API key: ${keyId}`, 'SystemManagementService', { keyId });
    } catch (error) {
      console.error('Error revoking API key:', error);
      loggingService.error('Failed to revoke API key', error as Error, 'SystemManagementService', { keyId });
      throw error;
    }
  }

  async deleteAPIKey(keyId: string): Promise<void> {
    try {
      const keyRef = doc(db, 'apiKeys', keyId);
      await deleteDoc(keyRef);
      
      loggingService.info(`Deleted API key: ${keyId}`, 'SystemManagementService', { keyId });
    } catch (error) {
      console.error('Error deleting API key:', error);
      loggingService.error('Failed to delete API key', error as Error, 'SystemManagementService', { keyId });
      throw error;
    }
  }

  async updateAPIKey(keyId: string, updates: Partial<Pick<APIKey, 'name' | 'permissions' | 'rateLimit'>>): Promise<void> {
    try {
      const keyRef = doc(db, 'apiKeys', keyId);
      await updateDoc(keyRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      loggingService.info(`Updated API key: ${keyId}`, 'SystemManagementService', { keyId, updates });
    } catch (error) {
      console.error('Error updating API key:', error);
      loggingService.error('Failed to update API key', error as Error, 'SystemManagementService', { keyId });
      throw error;
    }
  }

  async validateAPIKey(key: string): Promise<{ valid: boolean; keyData?: APIKey; error?: string }> {
    try {
      const keysRef = collection(db, 'apiKeys');
      const q = query(keysRef, where('key', '==', key), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { valid: false, error: 'Invalid or inactive API key' };
      }
      
      const keyDoc = snapshot.docs[0];
      const keyData = {
        id: keyDoc.id,
        ...keyDoc.data(),
        createdAt: keyDoc.data().createdAt?.toDate() || new Date(),
        lastUsed: keyDoc.data().lastUsed?.toDate() || new Date(),
        expiresAt: keyDoc.data().expiresAt?.toDate()
      } as APIKey;
      
      // Check if key is expired
      if (keyData.expiresAt && keyData.expiresAt < new Date()) {
        return { valid: false, error: 'API key has expired' };
      }
      
      // Update last used timestamp
      await this.updateAPIKeyUsage(keyData.id);
      
      return { valid: true, keyData };
    } catch (error) {
      console.error('Error validating API key:', error);
      return { valid: false, error: 'Failed to validate API key' };
    }
  }

  async updateAPIKeyUsage(keyId: string): Promise<void> {
    try {
      const keyRef = doc(db, 'apiKeys', keyId);
      await updateDoc(keyRef, {
        lastUsed: new Date(),
        usageCount: (await getDocs(query(collection(db, 'apiKeys'), where('__name__', '==', keyId)))).docs[0]?.data()?.usageCount + 1 || 1
      });
    } catch (error) {
      console.error('Error updating API key usage:', error);
      // Don't throw error for usage tracking failures
    }
  }

  async getAPIKeyUsageStats(keyId: string, days: number = 30): Promise<{ totalRequests: number; dailyAverage: number; lastUsed: Date }> {
    try {
      // In a real implementation, this would query usage logs
      // For demo, return mock data
      const apiKey = (await this.getAPIKeys()).find(key => key.id === keyId);
      if (!apiKey) {
        throw new Error('API key not found');
      }
      
      return {
        totalRequests: apiKey.usageCount,
        dailyAverage: Math.floor(apiKey.usageCount / days),
        lastUsed: apiKey.lastUsed
      };
    } catch (error) {
      console.error('Error getting API key usage stats:', error);
      throw error;
    }
  }

  // System Health Monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // In a real app, this would query actual system metrics
      // For demo, return mock data with some randomization
      const cpuUsage = Math.floor(Math.random() * 30) + 40; // 40-70%
      const memoryUsage = Math.floor(Math.random() * 20) + 60; // 60-80%
      const diskUsage = Math.floor(Math.random() * 15) + 20; // 20-35%
      
      return {
        cpu: {
          usage: cpuUsage,
          status: cpuUsage > 80 ? 'critical' : cpuUsage > 60 ? 'warning' : 'good'
        },
        memory: {
          usage: memoryUsage,
          total: '16GB',
          status: memoryUsage > 85 ? 'critical' : memoryUsage > 70 ? 'warning' : 'good'
        },
        disk: {
          usage: diskUsage,
          total: '500GB',
          status: diskUsage > 90 ? 'critical' : diskUsage > 75 ? 'warning' : 'good'
        },
        network: {
          throughput: '12 Mbps',
          latency: Math.floor(Math.random() * 20) + 10,
          status: 'good'
        },
        database: {
          responseTime: Math.floor(Math.random() * 30) + 30,
          connections: Math.floor(Math.random() * 20) + 15,
          status: 'good'
        },
        api: {
          responseTime: Math.floor(Math.random() * 50) + 100,
          errorRate: Math.random() * 0.5,
          requestsPerMinute: Math.floor(Math.random() * 1000) + 500,
          status: 'good'
        }
      };
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }

  // Helper methods for mock data
  private getMockSystemSettings(): SystemSettings[] {
    return [
      {
        id: '1',
        key: 'maintenance_mode',
        value: false,
        description: 'Enable maintenance mode',
        category: 'general',
        updatedAt: new Date(),
        updatedBy: 'admin'
      },
      {
        id: '2',
        key: 'max_login_attempts',
        value: 5,
        description: 'Maximum login attempts before lockout',
        category: 'security',
        updatedAt: new Date(),
        updatedBy: 'admin'
      },
      {
        id: '3',
        key: 'session_timeout',
        value: 3600,
        description: 'Session timeout in seconds',
        category: 'security',
        updatedAt: new Date(),
        updatedBy: 'admin'
      }
    ];
  }

  private getMockSecurityLogs(): SecurityLog[] {
    return [
      {
        id: '1',
        type: 'login_success',
        userId: 'user123',
        userEmail: 'user@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        details: 'Successful login',
        severity: 'low',
        timestamp: new Date(),
        resolved: true
      },
      {
        id: '2',
        type: 'login_failed',
        userEmail: 'attacker@example.com',
        ipAddress: '10.0.0.1',
        userAgent: 'curl/7.68.0',
        details: 'Failed login attempt - invalid password',
        severity: 'medium',
        timestamp: new Date(Date.now() - 3600000),
        resolved: false
      }
    ];
  }

  private getMockFailedLogins(): SecurityLog[] {
    return [
      {
        id: '3',
        type: 'login_failed',
        userEmail: 'test@example.com',
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0...',
        details: 'Wrong password',
        severity: 'low',
        timestamp: new Date(Date.now() - 1800000),
        resolved: false
      }
    ];
  }

  private getMockSuspiciousActivity(): SecurityLog[] {
    return [
      {
        id: '4',
        type: 'suspicious_activity',
        userId: 'user456',
        userEmail: 'suspicious@example.com',
        ipAddress: '203.0.113.1',
        userAgent: 'Bot/1.0',
        details: 'Multiple rapid API calls from unusual location',
        severity: 'high',
        timestamp: new Date(Date.now() - 7200000),
        resolved: false
      }
    ];
  }

  private getMockAPIKeys(): APIKey[] {
    return [
      {
        id: '1',
        name: 'Mobile App Production',
        key: 'sk_prod_1234567890abcdef',
        environment: 'production',
        permissions: ['read', 'write'],
        rateLimit: 10000,
        usageCount: 45678,
        lastUsed: new Date(),
        createdAt: new Date(Date.now() - 2592000000), // 30 days ago
        isActive: true
      },
      {
        id: '2',
        name: 'Development Testing',
        key: 'sk_dev_abcdef1234567890',
        environment: 'development',
        permissions: ['read'],
        rateLimit: 1000,
        usageCount: 1234,
        lastUsed: new Date(Date.now() - 3600000), // 1 hour ago
        createdAt: new Date(Date.now() - 604800000), // 7 days ago
        isActive: true
      }
    ];
  }

  // generateAPIKey method moved to env.ts as envGenerateAPIKey
}

export const systemManagementService = new SystemManagementService();