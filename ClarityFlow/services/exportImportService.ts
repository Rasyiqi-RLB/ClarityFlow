import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import { StorageService } from './storage';
import { BackupData } from '../types';

export class ExportImportService {
  private static readonly EXPORT_FILENAME = 'clarityflow_backup';
  private static readonly FILE_EXTENSION = '.json';

  /**
   * Export data to file
   */
  static async exportData(): Promise<boolean> {
    try {
      // Create backup data
      const backupData = await StorageService.createBackup();
      
      // Convert to JSON string
      const jsonData = JSON.stringify(backupData, null, 2);
      
      if (Platform.OS === 'web') {
        return this.exportDataWeb(jsonData);
      } else {
        return this.exportDataMobile(jsonData);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Gagal mengekspor data. Silakan coba lagi.');
      return false;
    }
  }

  /**
   * Export data for web platform
   */
  private static exportDataWeb(jsonData: string): boolean {
    try {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.EXPORT_FILENAME}_${this.getTimestamp()}${this.FILE_EXTENSION}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting data on web:', error);
      return false;
    }
  }

  /**
   * Export data for mobile platform
   */
  private static async exportDataMobile(jsonData: string): Promise<boolean> {
    try {
      const filename = `${this.EXPORT_FILENAME}_${this.getTimestamp()}${this.FILE_EXTENSION}`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Write file
      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export ClarityFlow Data',
        });
      } else {
        Alert.alert(
          'Export Berhasil',
          `Data berhasil diekspor ke: ${fileUri}`
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error exporting data on mobile:', error);
      return false;
    }
  }

  /**
   * Import data from file
   */
  static async importData(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return this.importDataWeb();
      } else {
        return this.importDataMobile();
      }
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Error', 'Gagal mengimpor data. Silakan coba lagi.');
      return false;
    }
  }

  /**
   * Import data for web platform
   */
  private static importDataWeb(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (event: any) => {
          try {
            const file = event.target.files[0];
            if (!file) {
              resolve(false);
              return;
            }
            
            const text = await file.text();
            const success = await this.processImportData(text);
            resolve(success);
          } catch (error) {
            console.error('Error reading file:', error);
            resolve(false);
          }
        };
        
        input.oncancel = () => resolve(false);
        input.click();
      } catch (error) {
        console.error('Error importing data on web:', error);
        resolve(false);
      }
    });
  }

  /**
   * Import data for mobile platform
   */
  private static async importDataMobile(): Promise<boolean> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return false;
      }
      
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      return this.processImportData(fileContent);
    } catch (error) {
      console.error('Error importing data on mobile:', error);
      return false;
    }
  }

  /**
   * Process imported data
   */
  private static async processImportData(jsonData: string): Promise<boolean> {
    try {
      const backupData: BackupData = JSON.parse(jsonData);
      
      // Validate backup data structure
      if (!this.validateBackupData(backupData)) {
        Alert.alert('Error', 'Format file tidak valid. Pastikan file adalah backup ClarityFlow yang valid.');
        return false;
      }
      
      // Show confirmation dialog
      return new Promise((resolve) => {
        Alert.alert(
          'Konfirmasi Import',
          'Import data akan mengganti semua data yang ada. Apakah Anda yakin?',
          [
            {
              text: 'Batal',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Import',
              style: 'destructive',
              onPress: async () => {
                try {
                  await StorageService.restoreBackup(backupData);
                  Alert.alert('Berhasil', 'Data berhasil diimpor!');
                  resolve(true);
                } catch (error) {
                  console.error('Error restoring backup:', error);
                  Alert.alert('Error', 'Gagal mengimpor data. Silakan coba lagi.');
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error('Error processing import data:', error);
      Alert.alert('Error', 'File tidak dapat dibaca atau format tidak valid.');
      return false;
    }
  }

  /**
   * Validate backup data structure
   */
  private static validateBackupData(data: any): data is BackupData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.tasks) &&
      Array.isArray(data.projects) &&
      typeof data.user === 'object' &&
      typeof data.stats === 'object' &&
      typeof data.version === 'string' &&
      data.timestamp
    );
  }

  /**
   * Get formatted timestamp for filename
   */
  private static getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}`;
  }

  /**
   * Get storage info for display
   */
  static async getStorageInfo(): Promise<{
    size: number;
    sizeFormatted: string;
    lastBackup: Date | null;
  }> {
    try {
      const [size, backupData] = await Promise.all([
        StorageService.getStorageSize(),
        StorageService.getBackupData(),
      ]);
      
      return {
        size,
        sizeFormatted: this.formatBytes(size),
        lastBackup: backupData?.timestamp || null,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        size: 0,
        sizeFormatted: '0 B',
        lastBackup: null,
      };
    }
  }

  /**
   * Format bytes to human readable string
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}