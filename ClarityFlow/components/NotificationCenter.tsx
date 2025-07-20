import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import notificationService, { NotificationSettings } from '../services/notificationService';
import { THEME_COLORS } from '../utils/constants';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadSettings();
      loadStats();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const currentSettings = await notificationService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      Alert.alert('Error', 'Gagal memuat pengaturan notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const notificationStats = await notificationService.getNotificationStats();
      setStats(notificationStats);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    if (!settings) return;

    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await notificationService.updateSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update setting:', error);
      Alert.alert('Error', 'Gagal memperbarui pengaturan');
      // Revert on error
      setSettings(settings);
    }
  };

  const updateNestedSetting = async (parent: keyof NotificationSettings, key: string, value: any) => {
    if (!settings) return;

    try {
      const newSettings = {
        ...settings,
        [parent]: {
          ...(settings[parent] as any),
          [key]: value
        }
      };
      setSettings(newSettings);
      await notificationService.updateSettings({ [parent]: newSettings[parent] });
    } catch (error) {
      console.error('Failed to update nested setting:', error);
      Alert.alert('Error', 'Gagal memperbarui pengaturan');
      setSettings(settings);
    }
  };

  const sendTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert('✅ Berhasil', 'Notifikasi test telah dikirim!');
      loadStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to send test notification:', error);
      Alert.alert('❌ Error', 'Gagal mengirim notifikasi test');
    }
  };

  const resetSettings = async () => {
    Alert.alert(
      'Reset Pengaturan',
      'Yakin ingin mereset semua pengaturan notifikasi ke default?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.resetSettings();
              await loadSettings();
              Alert.alert('✅ Berhasil', 'Pengaturan telah direset');
            } catch (error) {
              Alert.alert('❌ Error', 'Gagal mereset pengaturan');
            }
          }
        }
      ]
    );
  };

  if (!visible) return null;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔔 Notification Center</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={THEME_COLORS.dark} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.loadingText}>Memuat pengaturan...</Text>
        </View>
      </View>
    );
  }

  if (!settings) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Notification Center</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={THEME_COLORS.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Card */}
        {stats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Statistik Notifikasi</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalSent}</Text>
                <Text style={styles.statLabel}>Total Dikirim</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalScheduled}</Text>
                <Text style={styles.statLabel}>Terjadwal</Text>
              </View>
            </View>
            {stats.lastSent && (
              <Text style={styles.lastSent}>
                Terakhir: {new Date(stats.lastSent).toLocaleString('id-ID')}
              </Text>
            )}
          </View>
        )}

        {/* Main Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Pengaturan Utama</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Aktifkan notifikasi push</Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) => updateSetting('pushNotifications', value)}
              trackColor={{ false: '#E5E7EB', true: THEME_COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Task Reminders</Text>
              <Text style={styles.settingDescription}>Pengingat tugas</Text>
            </View>
            <Switch
              value={settings.taskReminders}
              onValueChange={(value) => updateSetting('taskReminders', value)}
              trackColor={{ false: '#E5E7EB', true: THEME_COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Deadline Alerts</Text>
              <Text style={styles.settingDescription}>Peringatan deadline</Text>
            </View>
            <Switch
              value={settings.deadlineAlerts}
              onValueChange={(value) => updateSetting('deadlineAlerts', value)}
              trackColor={{ false: '#E5E7EB', true: THEME_COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Achievements</Text>
              <Text style={styles.settingDescription}>Notifikasi pencapaian</Text>
            </View>
            <Switch
              value={settings.achievements}
              onValueChange={(value) => updateSetting('achievements', value)}
              trackColor={{ false: '#E5E7EB', true: THEME_COLORS.primary }}
            />
          </View>
        </View>

        {/* Sound & Vibration */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔊 Suara & Getaran</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sound</Text>
              <Text style={styles.settingDescription}>Aktifkan suara notifikasi</Text>
            </View>
            <Switch
              value={settings.sound.enabled}
              onValueChange={(value) => updateNestedSetting('sound', 'enabled', value)}
              trackColor={{ false: '#E5E7EB', true: THEME_COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingDescription}>Aktifkan getaran</Text>
            </View>
            <Switch
              value={settings.vibration}
              onValueChange={(value) => updateSetting('vibration', value)}
              trackColor={{ false: '#E5E7EB', true: THEME_COLORS.primary }}
            />
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌙 Jam Tenang</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Aktifkan Jam Tenang</Text>
              <Text style={styles.settingDescription}>
                {settings.quietHours.start} - {settings.quietHours.end}
              </Text>
            </View>
            <Switch
              value={settings.quietHours.enabled}
              onValueChange={(value) => updateNestedSetting('quietHours', 'enabled', value)}
              trackColor={{ false: '#E5E7EB', true: THEME_COLORS.primary }}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
            <Ionicons name="notifications" size={20} color="#fff" />
            <Text style={styles.testButtonText}>Test Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
            <Ionicons name="refresh" size={20} color="#F59E0B" />
            <Text style={styles.resetButtonText}>Reset Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  lastSent: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME_COLORS.dark,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '600',
  },
});