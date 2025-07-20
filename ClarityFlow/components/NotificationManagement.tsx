import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import NotificationService, { NotificationSettings } from '../services/notificationService';
import { THEME_COLORS } from '../utils/constants';

interface NotificationManagementProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'schedule' | 'preferences';

const NotificationManagement: React.FC<NotificationManagementProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalScheduled: 0,
    lastSent: null as string | null,
    byType: {} as Record<string, number>
  });

  useEffect(() => {
    if (visible) {
      loadSettings();
      loadStats();
    }
  }, [visible]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const notificationSettings = await NotificationService.getSettings();
      setSettings(notificationSettings);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      Alert.alert('Error', 'Gagal memuat pengaturan notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const notificationStats = await NotificationService.getNotificationStats();
      setStats(notificationStats);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    await loadStats();
    setRefreshing(false);
  };

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    try {
      const newSettings = {
        ...settings,
        [key]: value
      } as NotificationSettings;
      setSettings(newSettings);
      await NotificationService.updateSettings(newSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Gagal menyimpan pengaturan');
    }
  };

  const updateNestedSetting = async (parentKey: keyof NotificationSettings, childKey: string, value: any) => {
    if (!settings) return;
    
    try {
      const parentValue = settings[parentKey];
      if (typeof parentValue === 'object' && parentValue !== null) {
        const newSettings = {
          ...settings,
          [parentKey]: {
            ...parentValue,
            [childKey]: value
          }
        } as NotificationSettings;
        setSettings(newSettings);
        await NotificationService.updateSettings(newSettings);
      }
    } catch (error) {
      console.error('Error updating nested setting:', error);
      Alert.alert('Error', 'Gagal menyimpan pengaturan');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Pengaturan',
      'Apakah Anda yakin ingin mengembalikan semua pengaturan notifikasi ke default?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.resetSettings();
              await loadSettings();
              Alert.alert('Berhasil', 'Pengaturan telah direset ke default');
            } catch (error) {
              Alert.alert('Error', 'Gagal mereset pengaturan');
            }
          }
        }
      ]
    );
  };

  const sendTestNotification = async () => {
    try {
      setLoading(true);
      await NotificationService.sendTestNotification();
      Alert.alert('Test Berhasil', 'Notifikasi test telah dikirim!');
    } catch (error) {
      Alert.alert('Test Gagal', 'Gagal mengirim notifikasi test');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = () => {
    sendTestNotification();
  };

  const renderTabButton = (tab: TabType, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderSettingRow = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingIcon}>{icon}</Text>
          <Text style={styles.settingTitle}>{title}</Text>
        </View>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: THEME_COLORS.gray[300], true: '#3B82F6' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  const renderGeneralSettings = () => {
    if (!settings) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.loadingText}>Memuat pengaturan...</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>🔔 Pengaturan Umum</Text>
        
        {/* Notification Types */}
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Jenis Notifikasi</Text>
          
          {renderSettingRow(
            'Task Reminders',
            'Pengingat untuk tugas yang akan datang',
            settings.taskReminders,
            (value) => updateSetting('taskReminders', value),
            '📋'
          )}
        
        {renderSettingRow(
          'Deadline Alerts',
          'Peringatan untuk deadline yang mendekat',
          settings.deadlineAlerts,
          (value) => updateSetting('deadlineAlerts', value),
          '⏰'
        )}
        
        {renderSettingRow(
          'Weekly Updates',
          'Ringkasan mingguan progress Anda',
          settings.weeklyUpdates,
          (value) => updateSetting('weeklyUpdates', value),
          '📊'
        )}
        
        {renderSettingRow(
          'Achievements',
          'Notifikasi pencapaian dan milestone',
          settings.achievements,
          (value) => updateSetting('achievements', value),
          '🏆'
        )}
      </View>
      
      {/* Delivery Methods */}
      <View style={styles.settingsGroup}>
        <Text style={styles.groupTitle}>Metode Pengiriman</Text>
        
        {renderSettingRow(
          'Email Notifications',
          'Terima notifikasi melalui email',
          settings.emailNotifications,
          (value) => updateSetting('emailNotifications', value),
          '📧'
        )}
        
        {renderSettingRow(
          'Push Notifications',
          'Notifikasi push di perangkat',
          settings.pushNotifications,
          (value) => updateSetting('pushNotifications', value),
          '📱'
        )}
      </View>
      
      {/* Test Section */}
      <View style={styles.testSection}>
        <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <Text style={styles.testButtonText}>🔔 Test Notifikasi</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    );
  };

  const renderScheduleSettings = () => {
    if (!settings) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.loadingText}>Memuat pengaturan...</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>⏰ Jadwal & Waktu</Text>
      
      {/* Quiet Hours */}
      <View style={styles.settingsGroup}>
        <Text style={styles.groupTitle}>Jam Tenang</Text>
        
        {renderSettingRow(
          'Enable Quiet Hours',
          'Nonaktifkan notifikasi pada jam tertentu',
          settings.quietHours.enabled,
          (value) => updateNestedSetting('quietHours', 'enabled', value),
          '🌙'
        )}
        
        {settings.quietHours.enabled && (
          <View style={styles.timeSettings}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Mulai:</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>{settings.quietHours.start}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Selesai:</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>{settings.quietHours.end}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      {/* Frequency Settings */}
      <View style={styles.settingsGroup}>
        <Text style={styles.groupTitle}>Frekuensi Notifikasi</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>⚡ Task Reminders Frequency</Text>
            <Text style={styles.settingDescription}>Seberapa sering pengingat tugas dikirim</Text>
          </View>
          <Text style={styles.settingValue}>{settings.frequency.taskReminders}</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>⚠️ Deadline Alerts Timing</Text>
            <Text style={styles.settingDescription}>Kapan peringatan deadline dikirim</Text>
          </View>
          <Text style={styles.settingValue}>{settings.frequency.deadlineAlerts}</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>📅 Weekly Updates Day</Text>
            <Text style={styles.settingDescription}>Hari pengiriman update mingguan</Text>
          </View>
          <Text style={styles.settingValue}>{settings.frequency.weeklyUpdates}</Text>
        </View>
      </View>
    </ScrollView>
    );
  };

  const renderPreferences = () => {
    if (!settings) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.loadingText}>Memuat pengaturan...</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>⚙️ Preferensi</Text>
      
      {/* Sound & Vibration */}
      <View style={styles.settingsGroup}>
        <Text style={styles.groupTitle}>Suara & Getaran</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>🔊 Sound</Text>
            <Text style={styles.settingDescription}>Mainkan suara saat notifikasi</Text>
          </View>
          <Switch
            value={settings.sound?.enabled || false}
            onValueChange={(value) => updateNestedSetting('sound', 'enabled', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.sound?.enabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>📳 Vibration</Text>
            <Text style={styles.settingDescription}>Getaran saat notifikasi</Text>
          </View>
          <Switch
            value={settings.vibration || false}
            onValueChange={(value) => updateSetting('vibration', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.vibration ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>
      
      {/* Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.groupTitle}>📊 Statistik Notifikasi</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalSent}</Text>
            <Text style={styles.statLabel}>Total Sent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalScheduled}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.lastSent ? new Date(stats.lastSent).toLocaleDateString() : 'Never'}</Text>
            <Text style={styles.statLabel}>Last Sent</Text>
          </View>
        </View>
      </View>
      
      {/* Reset Section */}
      <View style={styles.resetSection}>
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <Text style={styles.resetButtonText}>🔄 Reset ke Default</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔔 Pengaturan Notifikasi</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabContainer}>
          {renderTabButton('general', 'General', '🔔')}
          {renderTabButton('schedule', 'Schedule', '⏰')}
          {renderTabButton('preferences', 'Preferences', '⚙️')}
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Memuat pengaturan...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'schedule' && renderScheduleSettings()}
            {activeTab === 'preferences' && renderPreferences()}
          </>
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#3B82F6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.gray[200],
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#EBF8FF',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: THEME_COLORS.gray[600],
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  tabContent: {
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
    textAlign: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 16,
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.gray[200],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.gray[100],
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.dark,
  },
  settingDescription: {
    fontSize: 14,
    color: THEME_COLORS.gray[600],
    lineHeight: 18,
  },
  timeSettings: {
    padding: 16,
    backgroundColor: THEME_COLORS.gray[50],
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: THEME_COLORS.gray[600],
    fontWeight: '500',
  },
  timeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME_COLORS.gray[300],
  },
  timeText: {
    fontSize: 14,
    color: THEME_COLORS.dark,
    fontWeight: '500',
  },
  testSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: THEME_COLORS.gray[600],
    textAlign: 'center',
  },
  resetSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.gray[100],
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.dark,
    marginBottom: 4,
  },
});

export default NotificationManagement;