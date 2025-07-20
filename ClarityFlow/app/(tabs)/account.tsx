// React import removed as it's not directly used in this file
import { router } from 'expo-router';
import { useState } from 'react';
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
import APIManagement from '../../components/APIManagement';
import DataManagement from '../../components/DataManagement';
import DatabaseManagement from '../../components/DatabaseManagement';
import RemoveAdsModal from '../../components/RemoveAdsModal';
import SecurityLogs from '../../components/SecurityLogs';
import SystemManagement from '../../components/SystemManagement';
import UserManagement from '../../components/UserManagement';
import { useAds } from '../../contexts/AdContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { StorageService } from '../../services/storage';
import { THEME_COLORS } from '../../utils/constants';

function Account() {
  const { user: currentUser, logout, loading } = useAuth();
  const { t } = useLanguage();
  const { adsRemoved, showRewardedAd } = useAds();
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  
  // Modal states
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);
  const [showAPIManagement, setShowAPIManagement] = useState(false);
  const [showSystemManagement, setShowSystemManagement] = useState(false);
  const [showDatabaseManagement, setShowDatabaseManagement] = useState(false);
  const [showRemoveAdsModal, setShowRemoveAdsModal] = useState(false);

  // Reset state
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = () => {
    router.push('/login');
  };

  // Settings handlers
  const handleViewStats = () => {
    router.push('/statistics');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const togglePrivacy = () => {
    setPrivacyMode(!privacyMode);
  };

  // Admin handlers
  const handleUserManagement = () => {
    setShowUserManagement(true);
  };

  const handleSystemSettings = () => {
    setShowSystemManagement(true);
  };

  const handleDatabaseManagement = () => {
    setShowDatabaseManagement(true);
  };

  

  const handleAPIManagement = () => {
    setShowAPIManagement(true);
  };

  const handleSecurityLogs = () => {
    setShowSecurityLogs(true);
  };

  const handleSystemHealth = () => {
    setShowSystemManagement(true);
  };

  // Data handlers
  const handleExportData = () => {
    setShowDataManagement(true);
  };

  // Premium handlers
  const handlePremiumUpgrade = () => {
    setShowRemoveAdsModal(true);
  };

  const handleWatchRewardedAd = async () => {
    try {
      const result = await showRewardedAd();
      if (result.shown && result.rewarded) {
        Alert.alert(
          '🎉 Premium Unlocked!',
          'You now have 1 hour of premium features including:\n\n• Advanced analytics\n• Extra themes\n• Priority sync\n• Extended backup',
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else if (result.shown && !result.rewarded) {
        Alert.alert(
          'Ad Incomplete',
          'Please watch the complete ad to earn premium features.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Ad Not Available',
          'No ads are available right now. Please try again later.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Rewarded ad error:', error);
      Alert.alert(
        'Error',
        'Failed to show ad. Please try again later.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleResetData = async () => {
    try {
      setIsResetting(true);

      // Show confirmation dialog
      const confirmReset = () => {
        // Check if we're in web environment
        if (typeof window !== 'undefined' && window.confirm) {
          return window.confirm(
            t('account.resetWarning') + '\n\n' +
            t('account.resetWarningMessage') + '\n\n' +
            t('account.logoutConfirm')
          );
        } else {
          return new Promise((resolve) => {
            Alert.alert(
              t('account.resetWarning'),
              t('account.resetWarningMessage'),
              [
                { text: t('account.cancel'), style: 'cancel', onPress: () => resolve(false) },
                { text: t('account.resetAllData'), style: 'destructive', onPress: () => resolve(true) }
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
        t('account.resetSuccess'),
        t('account.resetSuccessMessage'),
        [{
          text: 'OK',
          onPress: () => {
            if (typeof window !== 'undefined' && window.location) {
              window.location.reload();
            }
          }
        }]
      );

    } catch (error) {
      console.error('Reset error:', error);
      Alert.alert('Error', t('account.resetError') + ': ' + (error as Error).message);
    } finally {
      setIsResetting(false);
    }
  };



  const handleLogout = async () => {
    console.log('🔴 Logout button pressed');
    
    // For web testing, bypass Alert and directly logout
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(t('account.logoutConfirm'));
      if (confirmed) {
        try {
          console.log('🔴 Starting logout process...');
          await logout();
          console.log('🔴 Logout successful');
        } catch (error) {
          console.error('🔴 Logout error:', error);
          alert(t('account.logoutError') + ': ' + (error as Error).message);
        }
      } else {
        console.log('🔴 Logout cancelled');
      }
      return;
    }
    
    // For mobile, use Alert
    Alert.alert(
      t('account.logout'),
      t('account.logoutConfirm'),
      [
        {
          text: t('account.cancel'),
          style: 'cancel',
          onPress: () => console.log('🔴 Logout cancelled')
        },
        {
          text: t('account.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔴 Starting logout process...');
              await logout();
              console.log('🔴 Logout successful');
            } catch (error) {
              console.error('🔴 Logout error:', error);
              Alert.alert('Error', t('account.logoutError') + ': ' + (error as Error).message);
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return t('account.unknownDate');
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>{t('account.loading')}</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.welcomeIcon}>👋</Text>
        <Text style={styles.welcomeTitle}>{t('account.welcome')}</Text>
        <Text style={styles.welcomeSubtitle}>
          {t('account.welcomeSubtitle')}
        </Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>{t('features.analytics')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>☁️</Text>
            <Text style={styles.featureText}>{t('features.cloudSync')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>{t('features.goalTracking')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔔</Text>
            <Text style={styles.featureText}>{t('features.smartNotifications')}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>{t('account.loginButton')}</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          {t('account.joinInfo')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(currentUser.displayName || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.displayName}</Text>
            <Text style={styles.profileEmail}>{currentUser.email}</Text>
            <Text style={styles.profileRole}>
              {currentUser.role === 'admin' ? t('account.administrator') : t('account.member')}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('account.accountInfo')}</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('account.joinedSince')}</Text>
            <Text style={styles.infoValue}>{formatDate(currentUser.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('account.status')}</Text>
            <Text style={[styles.infoValue, styles.statusActive]}>{t('account.statusActive')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('account.userId')}</Text>
            <Text style={styles.infoValue}>{currentUser.uid}</Text>
          </View>
        </View>
      </View>

      {/* Premium Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💎 Premium Features</Text>

        {/* Premium Status - Show if ads removed */}
        {adsRemoved && (
          <View style={styles.premiumStatusCard}>
            <View style={styles.premiumStatusHeader}>
              <Text style={styles.premiumStatusIcon}>⭐</Text>
              <View style={styles.premiumStatusInfo}>
                <Text style={styles.premiumStatusTitle}>Premium Active</Text>
                <Text style={styles.premiumStatusSubtitle}>Thank you for supporting ClarityFlow!</Text>
              </View>
            </View>
            <View style={styles.premiumStatusBadge}>
              <Text style={styles.premiumStatusBadgeText}>✅ Ad-Free</Text>
            </View>
          </View>
        )}

        {/* Premium Upgrade - Show if ads not removed */}
        {!adsRemoved && (
          <View style={styles.premiumCard}>
            <View style={styles.premiumHeader}>
              <Text style={styles.premiumIcon}>🚀</Text>
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumSubtitle}>Unlock advanced features and remove ads</Text>
              </View>
            </View>

            <View style={styles.premiumFeatures}>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureIcon}>🚫</Text>
                <Text style={styles.premiumFeatureText}>Remove all advertisements</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureIcon}>📊</Text>
                <Text style={styles.premiumFeatureText}>Advanced analytics & insights</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureIcon}>☁️</Text>
                <Text style={styles.premiumFeatureText}>Unlimited cloud storage</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureIcon}>🎯</Text>
                <Text style={styles.premiumFeatureText}>Priority customer support</Text>
              </View>
            </View>

            <View style={styles.premiumActions}>
              <TouchableOpacity style={styles.premiumButton} onPress={handlePremiumUpgrade}>
                <Text style={styles.premiumButtonText}>Upgrade Now</Text>
                <Text style={styles.premiumButtonSubtext}>Starting from Rp 45,000</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.watchAdButton} onPress={handleWatchRewardedAd}>
                <Text style={styles.watchAdButtonIcon}>🎬</Text>
                <View style={styles.watchAdButtonInfo}>
                  <Text style={styles.watchAdButtonText}>Watch Ad for Premium</Text>
                  <Text style={styles.watchAdButtonSubtext}>Get 1 hour of premium features</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('account.quickActions')}</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleViewStats}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>{t('account.statistics')}</Text>
            <Text style={styles.actionSubtitle}>{t('account.statisticsSubtitle')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={handleSettings}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionTitle}>{t('account.settings')}</Text>
            <Text style={styles.actionSubtitle}>{t('account.settingsSubtitle')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={handleExportData}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionTitle}>{t('account.exportData')}</Text>
            <Text style={styles.actionSubtitle}>{t('account.exportDataSubtitle')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, isResetting && styles.actionCardDisabled]}
            onPress={handleResetData}
            disabled={isResetting}
          >
            {isResetting ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Text style={styles.actionIcon}>🗑️</Text>
            )}
            <Text style={styles.actionTitle}>{t('account.resetData')}</Text>
            <Text style={styles.actionSubtitle}>
              {isResetting ? t('account.resetting') : t('account.resetDataSubtitle')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('account.settingsSection')}</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('account.notifications')}</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('account.privacyMode')}</Text>
            <Switch
              value={privacyMode}
              onValueChange={togglePrivacy}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={privacyMode ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Admin Panel - Only visible for admin users */}
      {currentUser.role === 'admin' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account.adminPanel')}</Text>
          <View style={styles.adminCard}>
            <Text style={styles.adminCardTitle}>{t('account.systemManagement')}</Text>
            <View style={styles.adminActionsGrid}>
              <TouchableOpacity style={styles.adminActionCard} onPress={handleUserManagement}>
                <Text style={styles.adminActionIcon}>👥</Text>
                <Text style={styles.adminActionTitle}>{t('account.userManagement')}</Text>
                <Text style={styles.adminActionSubtitle}>{t('account.userManagementSubtitle')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminActionCard} onPress={handleSystemSettings}>
                <Text style={styles.adminActionIcon}>⚙️</Text>
                <Text style={styles.adminActionTitle}>{t('account.systemSettings')}</Text>
                <Text style={styles.adminActionSubtitle}>{t('account.systemSettingsSubtitle')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminActionCard} onPress={handleDatabaseManagement}>
                <Text style={styles.adminActionIcon}>🗄️</Text>
                <Text style={styles.adminActionTitle}>{t('account.database')}</Text>
                <Text style={styles.adminActionSubtitle}>{t('account.databaseSubtitle')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminActionCard} onPress={handleSecurityLogs}>
                <Text style={styles.adminActionIcon}>🔒</Text>
                <Text style={styles.adminActionTitle}>{t('account.securityLogs')}</Text>
                <Text style={styles.adminActionSubtitle}>{t('account.securityLogsSubtitle')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminActionCard} onPress={handleAPIManagement}>
                <Text style={styles.adminActionIcon}>🔌</Text>
                <Text style={styles.adminActionTitle}>{t('account.apiManagement')}</Text>
                <Text style={styles.adminActionSubtitle}>{t('account.apiManagementSubtitle')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminActionCard} onPress={handleSystemHealth}>
                <Text style={styles.adminActionIcon}>💚</Text>
                <Text style={styles.adminActionTitle}>{t('account.systemHealth')}</Text>
                <Text style={styles.adminActionSubtitle}>{t('account.systemHealthSubtitle')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            console.log('🔴 TouchableOpacity pressed, loading state:', loading);
            handleLogout();
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.logoutButtonText}>{t('account.logout')}</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* User Management Modal */}
      <UserManagement 
        visible={showUserManagement} 
        onClose={() => setShowUserManagement(false)} 
      />
      
      {/* Security Management Modal */}
      <SecurityLogs
        visible={showSecurityLogs}
        onClose={() => setShowSecurityLogs(false)}
      />
      
      <APIManagement
        visible={showAPIManagement}
        onClose={() => setShowAPIManagement(false)}
      />
      
      {/* System Management Modal */}
      <SystemManagement
        visible={showSystemManagement}
        onClose={() => setShowSystemManagement(false)}
      />
      
      {/* Database Management Modal */}
      <DatabaseManagement
        visible={showDatabaseManagement}
        onClose={() => setShowDatabaseManagement(false)}
      />
      
      {/* Data Management Modal */}
      {showDataManagement && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('account.dataManagement')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDataManagement(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <DataManagement />
          </View>
        </View>
      )}

      {/* Remove Ads Modal */}
      <RemoveAdsModal
        visible={showRemoveAdsModal}
        onClose={() => setShowRemoveAdsModal(false)}
      />

      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
  },
  scrollContent: {
    paddingBottom: 100, // Add space for bottom navigation
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  featureList: {
    marginBottom: 32,
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: THEME_COLORS.dark,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 300,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.dark,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: THEME_COLORS.light,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: THEME_COLORS.gray[600],
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: THEME_COLORS.light,
    borderRadius: 12,
    padding: 16,
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.gray[200],
  },
  infoLabel: {
    fontSize: 14,
    color: THEME_COLORS.gray[600],
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.dark,
  },
  statusActive: {
    color: '#10B981',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    backgroundColor: THEME_COLORS.light,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardDisabled: {
    opacity: 0.6,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.dark,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: THEME_COLORS.gray[600],
    textAlign: 'center',
  },
  adminCard: {
    backgroundColor: THEME_COLORS.light,
    borderRadius: 12,
    padding: 16,
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  adminActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  adminActionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  adminActionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  adminActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME_COLORS.dark,
    marginBottom: 2,
    textAlign: 'center',
  },
  adminActionSubtitle: {
    fontSize: 10,
    color: THEME_COLORS.gray[600],
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: THEME_COLORS.light,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.gray[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME_COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: THEME_COLORS.gray[600],
  },
  // Premium styles
  premiumCard: {
    backgroundColor: THEME_COLORS.light,
    borderRadius: 16,
    padding: 20,
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: THEME_COLORS.gray[600],
  },
  premiumFeatures: {
    marginBottom: 20,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumFeatureIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  premiumFeatureText: {
    fontSize: 14,
    color: THEME_COLORS.dark,
    flex: 1,
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  premiumButtonSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Premium Status styles
  premiumStatusCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumStatusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  premiumStatusInfo: {
    flex: 1,
  },
  premiumStatusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 4,
  },
  premiumStatusSubtitle: {
    fontSize: 14,
    color: '#047857',
  },
  premiumStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  premiumStatusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Premium Actions styles
  premiumActions: {
    gap: 12,
  },
  watchAdButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  watchAdButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  watchAdButtonInfo: {
    flex: 1,
  },
  watchAdButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.dark,
    marginBottom: 2,
  },
  watchAdButtonSubtext: {
    fontSize: 12,
    color: THEME_COLORS.gray[600],
  },
});

export default Account;