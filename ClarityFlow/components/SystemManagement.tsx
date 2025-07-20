import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { THEME_COLORS } from '../utils/constants';
import AIAssistant from './AIAssistant';
import NotificationCenter from './NotificationCenter';
import PerformanceDashboard from './PerformanceDashboard';

interface SystemManagementProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'notifications' | 'performance' | 'ai';

const SystemManagement: React.FC<SystemManagementProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('notifications');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationCenter visible={true} onClose={() => {}} />;
      case 'performance':
        return <PerformanceDashboard visible={true} onClose={() => {}} />;
      case 'ai':
        return <AIAssistant visible={true} onClose={() => {}} />;
      default:
        return <NotificationCenter visible={true} onClose={() => {}} />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🚀 ClarityFlow System</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'notifications' && styles.activeTabButton]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text style={styles.tabIcon}>🔔</Text>
            <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
              Notifications
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'performance' && styles.activeTabButton]}
            onPress={() => setActiveTab('performance')}
          >
            <Text style={styles.tabIcon}>⚡</Text>
            <Text style={[styles.tabText, activeTab === 'performance' && styles.activeTabText]}>
              Performance
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'ai' && styles.activeTabButton]}
            onPress={() => setActiveTab('ai')}
          >
            <Text style={styles.tabIcon}>🤖</Text>
            <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>
              AI Assistant
            </Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Memuat sistem...</Text>
          </View>
        ) : (
          renderTabContent()
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 16,
  },
});

export default SystemManagement;