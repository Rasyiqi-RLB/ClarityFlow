import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SecurityLog, systemManagementService } from '../services/systemManagementService';
import { THEME_COLORS } from '../utils/constants';

interface SecurityLogsProps {
  visible: boolean;
  onClose: () => void;
}

const SecurityLogs: React.FC<SecurityLogsProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [failedLogins, setFailedLogins] = useState<SecurityLog[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SecurityLog[]>([]);

  useEffect(() => {
    if (visible) {
      loadSecurityLogs();
    }
  }, [visible]);

  const loadSecurityLogs = async () => {
    setLoading(true);
    try {
      const [logs, failed, suspicious] = await Promise.all([
        systemManagementService.getSecurityLogs(50),
        systemManagementService.getFailedLogins(24),
        systemManagementService.getSuspiciousActivity()
      ]);
      
      setSecurityLogs(logs);
      setFailedLogins(failed);
      setSuspiciousActivity(suspicious);
    } catch (error) {
      console.error('Error loading security logs:', error);
      Alert.alert('Error', 'Gagal memuat log keamanan');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSecurityLogs();
    setRefreshing(false);
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const getLogTypeIcon = (type: SecurityLog['type']) => {
    switch (type) {
      case 'login_success': return '✅';
      case 'login_failed': return '❌';
      case 'suspicious_activity': return '⚠️';
      case 'api_abuse': return '🚫';
      case 'data_access': return '📁';
      default: return '📝';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔒 Log Keamanan</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Memuat log keamanan...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{securityLogs.length}</Text>
                <Text style={styles.summaryLabel}>Total Logs</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, { color: '#EF4444' }]}>{failedLogins.length}</Text>
                <Text style={styles.summaryLabel}>Failed Logins</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>{suspiciousActivity.length}</Text>
                <Text style={styles.summaryLabel}>Suspicious</Text>
              </View>
            </View>
            
            {/* Recent Logs */}
            <Text style={styles.sectionTitle}>📋 Log Terbaru</Text>
            {securityLogs.slice(0, 10).map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.logTypeContainer}>
                    <Text style={styles.logTypeIcon}>{getLogTypeIcon(log.type)}</Text>
                    <Text style={styles.logType}>{(log.type || 'unknown').replace('_', ' ').toUpperCase()}</Text>
                  </View>
                  <View style={styles.severityContainer}>
                    <Text style={styles.severityIcon}>{getSeverityIcon(log.severity)}</Text>
                    <Text style={[styles.severityText, { color: getSeverityColor(log.severity) }]}>
                      {(log.severity || 'info').toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.logDetails}>{log.details}</Text>
                
                <View style={styles.logMeta}>
                  <Text style={styles.logMetaText}>👤 {log.userEmail || 'Unknown'}</Text>
                  <Text style={styles.logMetaText}>🌐 {log.ipAddress}</Text>
                  <Text style={styles.logMetaText}>🕒 {(log.timestamp || new Date()).toLocaleString('id-ID')}</Text>
                </View>
              </View>
            ))}
            
            {/* Failed Logins Section */}
            {failedLogins.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>❌ Login Gagal (24 jam terakhir)</Text>
                {failedLogins.map((log) => (
                  <View key={log.id} style={[styles.logCard, styles.failedLoginCard]}>
                    <Text style={styles.logDetails}>{log.details}</Text>
                    <View style={styles.logMeta}>
                      <Text style={styles.logMetaText}>📧 {log.userEmail}</Text>
                      <Text style={styles.logMetaText}>🌐 {log.ipAddress}</Text>
                      <Text style={styles.logMetaText}>🕒 {(log.timestamp || new Date()).toLocaleString('id-ID')}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
            
            {/* Suspicious Activity Section */}
            {suspiciousActivity.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>⚠️ Aktivitas Mencurigakan</Text>
                {suspiciousActivity.map((activity) => (
                  <View key={activity.id} style={[styles.logCard, styles.suspiciousCard]}>
                    <View style={styles.logHeader}>
                      <Text style={styles.suspiciousTitle}>🚨 {activity.details}</Text>
                      <Text style={[styles.severityText, { color: getSeverityColor(activity.severity) }]}>
                  {(activity.severity || 'info').toUpperCase()}
                </Text>
                    </View>
                    
                    <View style={styles.logMeta}>
                      <Text style={styles.logMetaText}>👤 {activity.userEmail || 'Unknown'}</Text>
                      <Text style={styles.logMetaText}>🌐 {activity.ipAddress}</Text>
                      <Text style={styles.logMetaText}>🕒 {(activity.timestamp || new Date()).toLocaleString('id-ID')}</Text>
                      <Text style={styles.logMetaText}>📱 {activity.userAgent?.substring(0, 50) || 'Unknown'}...</Text>
                    </View>
                    
                    <View style={styles.activityActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Investigasi</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.blockButton]}>
                        <Text style={styles.blockButtonText}>Blokir IP</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
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
    backgroundColor: '#DC2626',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 16,
    marginTop: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
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
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: THEME_COLORS.gray[600],
    textAlign: 'center',
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  failedLoginCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  suspiciousCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  logType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logDetails: {
    fontSize: 14,
    color: THEME_COLORS.dark,
    marginBottom: 8,
    lineHeight: 20,
  },
  logMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  logMetaText: {
    fontSize: 12,
    color: THEME_COLORS.gray[600],
  },
  suspiciousTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
    flex: 1,
  },
  activityActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  blockButton: {
    backgroundColor: '#EF4444',
  },
  blockButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SecurityLogs;