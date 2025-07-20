import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthRefresh } from '../../hooks/useAuthRefresh';
import { StorageService } from '../../services/storage';
import { ProductivityStats, Task } from '../../types';
import { PRODUCTIVITY_TIPS, QUADRANT_CONFIG } from '../../utils/constants';

export default function AnalyticsScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<ProductivityStats | null>(null);
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  useAuthRefresh(); // Auto-refresh auth state when screen is focused

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    sectionTitle: {
      color: colors.text.primary,
    },
    overviewCard: {
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
    },
    overviewNumber: {
      color: colors.primary,
    },
    overviewLabel: {
      color: colors.text.secondary,
    },
    quadrantStatCard: {
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
    },
    statNumber: {
      color: colors.text.primary,
    },
    statLabel: {
      color: colors.text.secondary,
    },
    overdueText: {
      color: colors.error,
    },
    timeCard: {
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
    },
    timeLabel: {
      color: colors.text.secondary,
    },
    timeValue: {
      color: colors.text.primary,
    },
    timeStat: {
      borderBottomColor: colors.border,
    },
    tipsCard: {
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
    },
    tipText: {
      color: colors.text.primary,
    },
    loadingText: {
      color: colors.text.secondary,
    },
    lockTitle: {
      color: colors.text.primary,
    },
    lockSubtitle: {
      color: colors.text.secondary,
    },
    lockedCard: {
      backgroundColor: colors.surface,
    },
    lockedNumber: {
      color: colors.text.secondary,
    },
    loginButton: {
      backgroundColor: colors.primary,
    },
    infoText: {
      color: colors.text.secondary,
    },
  });

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        loadData();
      }
    }
  }, [loading, isAuthenticated, user]);

  const handleLogin = () => {
    router.push('/login');
  };

  const loadData = async () => {
    try {
      const [loadedTasks, loadedStats] = await Promise.all([
        StorageService.getTasks(),
        StorageService.getStats(),
      ]);
      
      setTasks(loadedTasks);
      setStats(loadedStats);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    }
  };

  const calculateStats = (): ProductivityStats => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const overdueTasks = tasks.filter(task => 
      task.dueDate && task.dueDate < new Date() && !task.completed
    ).length;

    const quadrantStats = {
      'urgent-important': { total: 0, completed: 0, overdue: 0 },
      'not-urgent-important': { total: 0, completed: 0, overdue: 0 },
      'urgent-not-important': { total: 0, completed: 0, overdue: 0 },
      'not-urgent-not-important': { total: 0, completed: 0, overdue: 0 },
    };

    tasks.forEach(task => {
      quadrantStats[task.quadrant].total++;
      if (task.completed) {
        quadrantStats[task.quadrant].completed++;
      }
      if (task.dueDate && task.dueDate < new Date() && !task.completed) {
        quadrantStats[task.quadrant].overdue++;
      }
    });

    const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    const totalActualTime = tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
    const averageCompletionTime = completedTasks > 0 ? totalActualTime / completedTasks : 0;

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      quadrantStats,
      timeStats: {
        totalEstimatedTime,
        totalActualTime,
        averageCompletionTime,
      },
      weeklyProgress: [], // This would be calculated based on historical data
    };
  };

  const currentStats = calculateStats();

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getCompletionRate = (): number => {
    return currentStats.totalTasks > 0 
      ? Math.round((currentStats.completedTasks / currentStats.totalTasks) * 100)
      : 0;
  };

  const renderQuadrantStats = () => {
    return Object.entries(QUADRANT_CONFIG).map(([key, config]) => {
      const stats = currentStats.quadrantStats[key as keyof typeof currentStats.quadrantStats];
      const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

      return (
        <View key={key} style={[styles.quadrantStatCard, dynamicStyles.quadrantStatCard]}>
          <View style={styles.quadrantStatHeader}>
            <Text style={styles.quadrantStatIcon}>{config.icon}</Text>
            <Text style={[styles.quadrantStatTitle, { color: config.color }]}>
              {config.title}
            </Text>
          </View>
          <View style={styles.quadrantStatNumbers}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{stats.total}</Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>{t('analytics.total')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{stats.completed}</Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>{t('analytics.done')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{completionRate}%</Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>{t('analytics.rate')}</Text>
            </View>
          </View>
          {stats.overdue > 0 && (
            <Text style={[styles.overdueText, dynamicStyles.overdueText]}>⚠️ {stats.overdue} {t('analytics.overdueWarning')}</Text>
          )}
        </View>
      );
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.loadingText]}>{t('analytics.loading')}</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centerContent]}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={[styles.lockTitle, dynamicStyles.lockTitle]}>{t('analytics.locked')}</Text>
        <Text style={[styles.lockSubtitle, dynamicStyles.lockSubtitle]}>
          {t('analytics.lockedSubtitle')}
        </Text>

        <View style={styles.previewCards}>
          <View style={[styles.overviewCard, dynamicStyles.overviewCard, styles.lockedCard, dynamicStyles.lockedCard]}>
            <Text style={[styles.lockedNumber, dynamicStyles.lockedNumber]}>--</Text>
            <Text style={[styles.overviewLabel, dynamicStyles.overviewLabel]}>{t('analytics.totalTasks')}</Text>
          </View>
          <View style={[styles.overviewCard, dynamicStyles.overviewCard, styles.lockedCard, dynamicStyles.lockedCard]}>
            <Text style={[styles.lockedNumber, dynamicStyles.lockedNumber]}>--</Text>
            <Text style={[styles.overviewLabel, dynamicStyles.overviewLabel]}>{t('analytics.completed')}</Text>
          </View>
          <View style={[styles.overviewCard, dynamicStyles.overviewCard, styles.lockedCard, dynamicStyles.lockedCard]}>
            <Text style={[styles.lockedNumber, dynamicStyles.lockedNumber]}>--%</Text>
            <Text style={[styles.overviewLabel, dynamicStyles.overviewLabel]}>{t('analytics.successRate')}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.loginButton, dynamicStyles.loginButton]} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>{t('analytics.loginButton')}</Text>
        </TouchableOpacity>

        <Text style={[styles.infoText, dynamicStyles.infoText]}>
          {t('analytics.infoText')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, dynamicStyles.container]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >

      {/* Overview Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('analytics.overview')}</Text>
        <View style={styles.overviewCards}>
          <View style={[styles.overviewCard, dynamicStyles.overviewCard]}>
            <Text style={[styles.overviewNumber, dynamicStyles.overviewNumber]}>{currentStats.totalTasks}</Text>
            <Text style={[styles.overviewLabel, dynamicStyles.overviewLabel]}>{t('analytics.totalTasks')}</Text>
          </View>
          <View style={[styles.overviewCard, dynamicStyles.overviewCard]}>
            <Text style={[styles.overviewNumber, dynamicStyles.overviewNumber]}>{currentStats.completedTasks}</Text>
            <Text style={[styles.overviewLabel, dynamicStyles.overviewLabel]}>{t('analytics.completed')}</Text>
          </View>
          <View style={[styles.overviewCard, dynamicStyles.overviewCard]}>
            <Text style={[styles.overviewNumber, dynamicStyles.overviewNumber]}>{getCompletionRate()}%</Text>
            <Text style={[styles.overviewLabel, dynamicStyles.overviewLabel]}>{t('analytics.successRate')}</Text>
          </View>
          <View style={[styles.overviewCard, dynamicStyles.overviewCard]}>
            <Text style={[styles.overviewNumber, dynamicStyles.overviewNumber]}>{currentStats.overdueTasks}</Text>
            <Text style={[styles.overviewLabel, dynamicStyles.overviewLabel]}>{t('analytics.overdue')}</Text>
          </View>
        </View>
      </View>

      {/* Quadrant Performance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('analytics.quadrantPerformance')}</Text>
        <View style={styles.quadrantStatsGrid}>
          {renderQuadrantStats()}
        </View>
      </View>

      {/* Time Analysis */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('analytics.timeAnalysis')}</Text>
        <View style={[styles.timeCard, dynamicStyles.timeCard]}>
          <View style={[styles.timeStat, dynamicStyles.timeStat]}>
            <Text style={[styles.timeLabel, dynamicStyles.timeLabel]}>{t('analytics.estimatedTime')}</Text>
            <Text style={[styles.timeValue, dynamicStyles.timeValue]}>
              {formatTime(currentStats.timeStats.totalEstimatedTime)}
            </Text>
          </View>
          <View style={[styles.timeStat, dynamicStyles.timeStat]}>
            <Text style={[styles.timeLabel, dynamicStyles.timeLabel]}>{t('analytics.actualTime')}</Text>
            <Text style={[styles.timeValue, dynamicStyles.timeValue]}>
              {formatTime(currentStats.timeStats.totalActualTime)}
            </Text>
          </View>
          <View style={[styles.timeStat, dynamicStyles.timeStat]}>
            <Text style={[styles.timeLabel, dynamicStyles.timeLabel]}>{t('analytics.avgCompletion')}</Text>
            <Text style={[styles.timeValue, dynamicStyles.timeValue]}>
              {formatTime(currentStats.timeStats.averageCompletionTime)}
            </Text>
          </View>
        </View>
      </View>

      {/* Productivity Tips */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('analytics.productivityTips')}</Text>
        <View style={[styles.tipsCard, dynamicStyles.tipsCard]}>
          {PRODUCTIVITY_TIPS.slice(0, 3).map((tip, index) => (
            <Text key={index} style={[styles.tipText, dynamicStyles.tipText]}>• {tip}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically
  },
  scrollContent: {
    paddingBottom: 100, // Add space for bottom navigation
  },

  section: {
    padding: 12, // Reduced padding for mobile
    paddingTop: 6, // Reduced top padding
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    // color will be set dynamically
    marginBottom: 8, // Reduced margin bottom
  },
  overviewCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2, // Reduced gap for mobile
  },
  overviewCard: {
    flex: 1,
    // backgroundColor will be set dynamically
    borderRadius: 12,
    padding: 12, // Reduced padding
    alignItems: 'center',
    marginHorizontal: 1, // Reduced margin
    // shadowColor will be set dynamically
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    // color will be set dynamically
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    // color will be set dynamically
    textAlign: 'center',
  },
  quadrantStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 2, // Ultra reduced gap for mobile
  },
  quadrantStatCard: {
    width: '48%',
    // backgroundColor will be set dynamically
    borderRadius: 12,
    padding: 8, // Further reduced padding
    marginBottom: 2, // Ultra reduced margin bottom
    // shadowColor will be set dynamically
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quadrantStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, // Ultra reduced margin bottom
  },
  quadrantStatIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  quadrantStatTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  quadrantStatNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    // color will be set dynamically
  },
  statLabel: {
    fontSize: 10,
    // color will be set dynamically
  },
  overdueText: {
    fontSize: 12,
    // color will be set dynamically
    marginTop: 8,
    textAlign: 'center',
  },
  timeCard: {
    // backgroundColor will be set dynamically
    borderRadius: 12,
    padding: 8, // Reduced padding for mobile
    // shadowColor will be set dynamically
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4, // Reduced padding for mobile
    borderBottomWidth: 1,
    // borderBottomColor will be set dynamically
  },
  timeLabel: {
    fontSize: 14,
    // color will be set dynamically
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    // color will be set dynamically
  },
  tipsCard: {
    // backgroundColor will be set dynamically
    borderRadius: 12,
    padding: 8, // Reduced padding for mobile
    // shadowColor will be set dynamically
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipText: {
    fontSize: 14,
    // color will be set dynamically
    marginBottom: 4, // Reduced margin for mobile
    lineHeight: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    // color will be set dynamically
    marginTop: 12,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    // color will be set dynamically
    marginBottom: 8,
    textAlign: 'center',
  },
  lockSubtitle: {
    fontSize: 16,
    // color will be set dynamically
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  previewCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    width: '100%',
    maxWidth: 350,
  },
  lockedCard: {
    opacity: 0.5,
    // backgroundColor will be set dynamically
  },
  lockedNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    // color will be set dynamically
    marginBottom: 4,
  },
  loginButton: {
    // backgroundColor will be set dynamically
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    // color will be set dynamically
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});
