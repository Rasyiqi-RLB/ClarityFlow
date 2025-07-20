import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { StorageService } from '../services/storage';

interface DataManagementProps {
  visible?: boolean;
  onClose?: () => void;
}

interface StorageInfo {
  sizeFormatted: string;
  lastBackup: Date | null;
  totalTasks: number;
  totalProjects: number;
}

const DataManagement: React.FC<DataManagementProps> = ({ visible, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    sizeFormatted: 'Menghitung...',
    lastBackup: null,
    totalTasks: 0,
    totalProjects: 0
  });

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const tasks = await StorageService.getTasks();
      const projects = await StorageService.getProjects();
      
      // Calculate approximate size
      const dataSize = JSON.stringify({ tasks, projects }).length;
      const sizeInKB = Math.round(dataSize / 1024 * 100) / 100;
      
      setStorageInfo({
        sizeFormatted: `${sizeInKB} KB`,
        lastBackup: null, // Could be stored in AsyncStorage if needed
        totalTasks: tasks.length,
        totalProjects: projects.length
      });
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Belum pernah';
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      // Create backup data
      const backupData = await StorageService.createBackup();
      
      // Convert to JSON string
      const jsonData = JSON.stringify(backupData, null, 2);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `clarityflow-backup-${timestamp}.json`;
      
      if (Platform.OS === 'web') {
        // Web implementation
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert('Berhasil', 'Data berhasil diekspor ke file!');
      } else {
        // Mobile implementation
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, jsonData);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Berhasil', `Data disimpan di: ${fileUri}`);
        }
      }
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Gagal mengekspor data: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      setIsImporting(true);
      
      if (Platform.OS === 'web') {
        // Web implementation
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (event: any) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              try {
                const jsonData = e.target?.result as string;
                await processImportData(jsonData);
              } catch (error) {
                Alert.alert('Error', 'File tidak valid atau rusak');
              }
            };
            reader.readAsText(file);
          }
        };
        
        input.click();
      } else {
        // Mobile implementation
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });
        
        if (!result.canceled && result.assets[0]) {
          const fileUri = result.assets[0].uri;
          const jsonData = await FileSystem.readAsStringAsync(fileUri);
          await processImportData(jsonData);
        }
      }
      
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Gagal mengimpor data: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const processImportData = async (jsonData: string) => {
    try {
      const backupData = JSON.parse(jsonData);
      
      // Validate backup data structure
      if (!backupData.tasks || !Array.isArray(backupData.tasks)) {
        throw new Error('Format file backup tidak valid');
      }
      
      // Show confirmation dialog
      const confirmImport = () => {
        if (Platform.OS === 'web') {
          return window.confirm(
            `Impor data akan mengganti semua data yang ada.\n\n` +
            `Data yang akan diimpor:\n` +
            `- ${backupData.tasks.length} tugas\n` +
            `- ${backupData.projects?.length || 0} proyek\n\n` +
            `Lanjutkan?`
          );
        } else {
          return new Promise((resolve) => {
            Alert.alert(
              'Konfirmasi Import',
              `Impor data akan mengganti semua data yang ada.\n\n` +
              `Data yang akan diimpor:\n` +
              `- ${backupData.tasks.length} tugas\n` +
              `- ${backupData.projects?.length || 0} proyek\n\n` +
              `Lanjutkan?`,
              [
                { text: 'Batal', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Import', style: 'destructive', onPress: () => resolve(true) }
              ]
            );
          });
        }
      };
      
      const confirmed = await confirmImport();
      if (!confirmed) return;
      
      // Restore data
      await StorageService.restoreBackup(backupData);
      
      Alert.alert('Berhasil', 'Data berhasil diimpor! Aplikasi akan dimuat ulang.');
      
      // Reload the app to reflect changes
      if (Platform.OS === 'web') {
        window.location.reload();
      } else {
        // For mobile, you might want to navigate to home or trigger a refresh
        onClose?.();
      }
      
    } catch (error) {
      throw new Error('Format file tidak valid: ' + (error as Error).message);
    }
  };

  const handleResetData = async () => {
    try {
      setIsResetting(true);

      // Show confirmation dialog
      const confirmReset = () => {
        if (Platform.OS === 'web') {
          return window.confirm(
            'PERINGATAN: Reset Data\n\n' +
            'Tindakan ini akan menghapus SEMUA data termasuk:\n' +
            '- Semua tugas dan proyek\n' +
            '- Pengaturan aplikasi\n' +
            '- Riwayat aktivitas\n\n' +
            'Data yang dihapus TIDAK DAPAT dikembalikan!\n\n' +
            'Apakah Anda yakin ingin melanjutkan?'
          );
        } else {
          return new Promise((resolve) => {
            Alert.alert(
              'PERINGATAN: Reset Data',
              'Tindakan ini akan menghapus SEMUA data termasuk:\n\n' +
              '• Semua tugas dan proyek\n' +
              '• Pengaturan aplikasi\n' +
              '• Riwayat aktivitas\n\n' +
              'Data yang dihapus TIDAK DAPAT dikembalikan!',
              [
                { text: 'Batal', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Reset Semua Data', style: 'destructive', onPress: () => resolve(true) }
              ]
            );
          });
        }
      };

      const confirmed = await confirmReset();
      if (!confirmed) return;

      // Clear all data
      await StorageService.clearAllData();

      Alert.alert(
        'Reset Berhasil',
        'Semua data telah dihapus. Aplikasi akan dimuat ulang.',
        [{
          text: 'OK',
          onPress: () => {
            if (Platform.OS === 'web') {
              window.location.reload();
            } else {
              onClose?.();
            }
          }
        }]
      );

    } catch (error) {
      console.error('Reset error:', error);
      Alert.alert('Error', 'Gagal mereset data: ' + (error as Error).message);
    } finally {
      setIsResetting(false);
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manajemen Data</Text>
      
      {/* Storage Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="archive-outline" size={20} color="#666" />
          <Text style={styles.infoLabel}>Ukuran Data:</Text>
          <Text style={styles.infoValue}>{storageInfo.sizeFormatted}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.infoLabel}>Backup Terakhir:</Text>
          <Text style={styles.infoValue}>{formatDate(storageInfo.lastBackup)}</Text>
        </View>
      </View>

      {/* Export Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        <Text style={styles.sectionDescription}>
          Simpan semua data Anda ke file backup yang dapat disimpan atau dibagikan.
        </Text>
        
        <TouchableOpacity
          style={[styles.button, styles.exportButton]}
          onPress={handleExportData}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="download-outline" size={20} color="#fff" />
          )}
          <Text style={styles.buttonText}>
            {isExporting ? 'Mengekspor...' : 'Export Data'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Import Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Import Data</Text>
        <Text style={styles.sectionDescription}>
          Pulihkan data dari file backup. Ini akan mengganti semua data yang ada.
        </Text>
        
        <TouchableOpacity
          style={[styles.button, styles.importButton]}
          onPress={handleImportData}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          )}
          <Text style={styles.buttonText}>
            {isImporting ? 'Mengimpor...' : 'Import Data'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reset Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reset Data</Text>
        <Text style={styles.sectionDescription}>
          Hapus semua data aplikasi dan kembalikan ke pengaturan awal. Tindakan ini tidak dapat dibatalkan.
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleResetData}
          disabled={isResetting}
        >
          {isResetting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="trash-outline" size={20} color="#fff" />
          )}
          <Text style={styles.buttonText}>
            {isResetting ? 'Mereset...' : 'Reset Semua Data'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Warning */}
      <View style={styles.warningCard}>
        <Ionicons name="warning-outline" size={20} color="#ff9500" />
        <Text style={styles.warningText}>
          Import data akan mengganti semua data yang ada. Pastikan untuk membuat backup terlebih dahulu.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  exportButton: {
    backgroundColor: '#007AFF',
  },
  importButton: {
    backgroundColor: '#34C759',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});

export default DataManagement;