import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthGuard } from '../components/AuthGuard';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/authService';
import { MemberDashboard } from '../types';

const { width } = Dimensions.get('window');

export default function MemberDashboardScreen() {
  const { user: currentUser, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<MemberDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadDashboard();
    }
  }, [currentUser]);

  const loadDashboard = async () => {
    try {
      if (!currentUser) return;
      
      const dashboard = await AuthService.getMemberDashboard(currentUser.uid);
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // User will be automatically redirected by AuthContext
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Gagal logout');
            }
          },
        },
      ]
    );
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-task':
        router.push('/add-task');
        break;
      case 'analytics':
        Alert.alert('Info', 'Fitur Analytics akan segera tersedia');
        break;
      default:
        Alert.alert('Info', `Fitur ${action} akan segera tersedia`);
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'expired': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#f59e0b';
    }
  };

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'expired': return 'Kedaluwarsa';
      case 'cancelled': return 'Dibatalkan';
      case 'pending': return 'Menunggu';
      default: return status;
    }
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Gratis';
      case 'basic': return 'Basic';
      case 'premium': return 'Premium';
      case 'enterprise': return 'Enterprise';
      default: return plan;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memuat dashboard...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Gagal memuat data dashboard</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { user, subscription, recentTasks, productivity, quickActions } = dashboardData;

  return (
    <AuthGuard requiredRole="member">
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Selamat datang,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscription Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View>
              <Text style={styles.planName}>{getPlanDisplayName(subscription.plan)}</Text>
              <View style={styles.statusContainer}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getSubscriptionStatusColor(subscription.status) }
                  ]} 
                />
                <Text style={styles.statusText}>
                  {getSubscriptionStatusText(subscription.status)}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.manageButton}>
              <Text style={styles.manageButtonText}>Kelola</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.subscriptionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Berakhir:</Text>
              <Text style={styles.detailValue}>
                {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('id-ID') : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Auto Renew:</Text>
              <Text style={styles.detailValue}>
                {subscription.autoRenew ? 'Ya' : 'Tidak'}
              </Text>
            </View>
          </View>

          {/* Usage Stats */}
          <View style={styles.usageSection}>
            <Text style={styles.usageTitle}>Penggunaan Bulan Ini</Text>
            <View style={styles.usageStats}>
              <View style={styles.usageStat}>
                <Text style={styles.usageNumber}>{subscription.usage.tasksCreated}</Text>
                <Text style={styles.usageLabel}>Tasks</Text>
                <Text style={styles.usageLimit}>/ {subscription.usage.monthlyLimits.tasks}</Text>
              </View>
              <View style={styles.usageStat}>
                <Text style={styles.usageNumber}>{subscription.usage.aiAnalysisUsed}</Text>
                <Text style={styles.usageLabel}>AI Analysis</Text>
                <Text style={styles.usageLimit}>/ {subscription.usage.monthlyLimits.aiCalls}</Text>
              </View>
              <View style={styles.usageStat}>
                <Text style={styles.usageNumber}>{subscription.usage.storageUsed}MB</Text>
                <Text style={styles.usageLabel}>Storage</Text>
                <Text style={styles.usageLimit}>/ {subscription.usage.monthlyLimits.storage}MB</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, !action.enabled && styles.disabledCard]}
              onPress={() => action.enabled && handleQuickAction(action.action)}
              disabled={!action.enabled}
            >
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>📋</Text>
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Productivity Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Produktivitas</Text>
        <View style={styles.productivityCard}>
          <View style={styles.productivityStats}>
            <View style={styles.productivityStat}>
              <Text style={styles.productivityNumber}>{productivity.totalTasks}</Text>
              <Text style={styles.productivityLabel}>Total Tasks</Text>
            </View>
            <View style={styles.productivityStat}>
              <Text style={styles.productivityNumber}>{productivity.completedTasks}</Text>
              <Text style={styles.productivityLabel}>Selesai</Text>
            </View>
            <View style={styles.productivityStat}>
              <Text style={styles.productivityNumber}>{productivity.overdueTasks}</Text>
              <Text style={styles.productivityLabel}>Terlambat</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.viewAnalyticsButton}>
            <Text style={styles.viewAnalyticsButtonText}>Lihat Analytics Lengkap</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Tasks */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tasks Terbaru</Text>
          <TouchableOpacity onPress={() => Alert.alert('Info', 'Fitur Lihat Semua Tasks akan segera tersedia')}>
            <Text style={styles.viewAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        
        {recentTasks.length > 0 ? (
          <View style={styles.tasksContainer}>
            {recentTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: task.priority === 'high' ? '#ef4444' : 
                                     task.priority === 'medium' ? '#f59e0b' : '#10b981' }
                  ]}>
                    <Text style={styles.priorityText}>{task.priority}</Text>
                  </View>
                </View>
                
                {task.description && (
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}
                
                <View style={styles.taskFooter}>
                  <Text style={styles.taskQuadrant}>{task.quadrant}</Text>
                  {task.dueDate && (
                    <Text style={styles.taskDueDate}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('id-ID') : 'No due date'}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Belum ada tasks</Text>
            <TouchableOpacity 
              style={styles.addTaskButton}
              onPress={() => router.push('/add-task')}
            >
              <Text style={styles.addTaskButtonText}>Tambah Task Pertama</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#64748b',
  },
  manageButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  subscriptionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  usageSection: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  usageStat: {
    alignItems: 'center',
    flex: 1,
  },
  usageNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  usageLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  usageLimit: {
    fontSize: 10,
    color: '#9ca3af',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledCard: {
    opacity: 0.6,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIconText: {
    fontSize: 20,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  productivityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productivityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productivityStat: {
    alignItems: 'center',
    flex: 1,
  },
  productivityNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  productivityLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  viewAnalyticsButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAnalyticsButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  tasksContainer: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskQuadrant: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  addTaskButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addTaskButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});