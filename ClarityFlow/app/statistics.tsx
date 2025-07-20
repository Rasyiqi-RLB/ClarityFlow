import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { THEME_COLORS } from '../utils/constants';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const isMobile = width < 768;

export default function StatisticsScreen() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalTasks: 127,
    completedTasks: 113,
    inProgressTasks: 8,
    pendingTasks: 6,
    successRate: 89,
    currentStreak: 15,
    avgFocusTime: 2.3,
    weeklyProductivity: 15,
    monthlyGoals: 85,
    totalHours: 156.5
  });

  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading statistics for period:', timeRange);

      // Try to load saved stats first
      const savedStats = await AsyncStorage.getItem(`statistics_${timeRange}`);
      if (savedStats) {
        console.log('📊 Found saved stats for', timeRange);
        setStats(JSON.parse(savedStats));
      } else {
        // Generate default stats for the selected period
        console.log('📊 Generating default stats for', timeRange);
        const defaultStats = generateStatsForPeriod(timeRange);
        setStats(defaultStats);
        // Save generated stats
        await AsyncStorage.setItem(`statistics_${timeRange}`, JSON.stringify(defaultStats));
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Fallback to default stats
      setStats(generateStatsForPeriod(timeRange));
    } finally {
      setLoading(false);
    }
  };

  const generateStatsForPeriod = (period: string) => {
    console.log('📊 Generating stats for period:', period);

    const baseStats = {
      week: {
        totalTasks: 45,
        completedTasks: 38,
        inProgressTasks: 5,
        pendingTasks: 2,
        successRate: 84,
        currentStreak: 7,
        avgFocusTime: 1.8,
        weeklyProductivity: 84,
        monthlyGoals: 78,
        totalHours: 32.5
      },
      month: {
        totalTasks: 187,
        completedTasks: 156,
        inProgressTasks: 18,
        pendingTasks: 13,
        successRate: 83,
        currentStreak: 15,
        avgFocusTime: 2.3,
        weeklyProductivity: 88,
        monthlyGoals: 85,
        totalHours: 156.5
      },
      year: {
        totalTasks: 2240,
        completedTasks: 1890,
        inProgressTasks: 210,
        pendingTasks: 140,
        successRate: 84,
        currentStreak: 45,
        avgFocusTime: 2.1,
        weeklyProductivity: 86,
        monthlyGoals: 89,
        totalHours: 1850.0
      }
    };

    return baseStats[period as keyof typeof baseStats] || baseStats.month;
  };

  const getSubtitleForPeriod = (period: string) => {
    switch (period) {
      case 'week':
        return '+5 from last week';
      case 'month':
        return '+12 from last month';
      case 'year':
        return '+156 from last year';
      default:
        return '+12 from last month';
    }
  };

  const StatCard = ({ title, value, subtitle, color, icon }: any) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
    </View>
  );

  const ProgressBar = ({ label, value, maxValue, color }: any) => {
    const percentage = (value / maxValue) * 100;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>{value}/{maxValue}</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} 
          />
        </View>
        <Text style={styles.progressPercentage}>{percentage.toFixed(1)}%</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            try {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(tabs)');
              }
            } catch (error) {
              console.log('Navigation error:', error);
              router.push('/(tabs)');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('statistics.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={isDesktop ? styles.desktopContainer : styles.mobileContainer}
        showsVerticalScrollIndicator={false}
      >

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {['week', 'month', 'year'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeActive
            ]}
            onPress={() => {
              console.log('📊 Switching to period:', range);
              setTimeRange(range);
            }}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === range && styles.timeRangeActiveText,
              loading && styles.timeRangeDisabled
            ]}>
              {range === 'week' ? t('statistics.week') : range === 'month' ? t('statistics.month') : t('statistics.year')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading {timeRange} statistics...</Text>
        </View>
      )}

      {/* Main Stats Grid */}
      <View style={[styles.section, isDesktop && styles.sectionDesktop]}>
        <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>{t('statistics.mainSummary')}</Text>
        <View style={[styles.statsGrid, isDesktop ? styles.statsGridDesktop : styles.statsGridMobile]}>
          <StatCard
            title={t('statistics.totalTasks')}
            value={stats.totalTasks}
            subtitle={getSubtitleForPeriod(timeRange)}
            color="#3B82F6"
            icon="📋"
          />
          <StatCard
            title={t('statistics.completed')}
            value={stats.completedTasks}
            subtitle={`${((stats.completedTasks/stats.totalTasks)*100).toFixed(1)}%`}
            color="#10B981"
            icon="✅"
          />
          <StatCard
            title={t('statistics.successRate')}
            value={`${stats.successRate}%`}
            subtitle={`+5% ${t('statistics.fromLastMonth')}`}
            color="#F59E0B"
            icon="🎯"
          />
          <StatCard
            title={t('statistics.dailyStreak')}
            value={`${stats.currentStreak} ${t('statistics.days')}`}
            subtitle={t('statistics.bestRecord')}
            color="#EF4444"
            icon="🔥"
          />
        </View>
      </View>

      {/* Progress Tracking */}
      <View style={[styles.section, isDesktop && styles.sectionDesktop]}>
        <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>{t('statistics.progressTracking')}</Text>
        <View style={[styles.progressSection, isDesktop ? styles.progressSectionDesktop : styles.progressSectionMobile]}>
          <ProgressBar
            label={t('statistics.tasksCompleted')}
            value={stats.completedTasks}
            maxValue={stats.totalTasks}
            color="#10B981"
          />
          <ProgressBar
            label={t('statistics.monthlyGoals')}
            value={stats.monthlyGoals}
            maxValue={100}
            color="#3B82F6"
          />
          <ProgressBar
            label={t('statistics.weeklyProductivity')}
            value={stats.weeklyProductivity + 85}
            maxValue={100}
            color="#F59E0B"
          />
        </View>
      </View>

      {/* Time Analytics */}
      <View style={[styles.section, isDesktop && styles.sectionDesktop]}>
        <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>{t('statistics.timeAnalysis')}</Text>
        <View style={[styles.timeAnalytics, isDesktop ? styles.timeAnalyticsDesktop : styles.timeAnalyticsMobile]}>
          <View style={styles.timeCard}>
            <Text style={styles.timeIcon}>⏰</Text>
            <Text style={styles.timeValue}>{stats.avgFocusTime}h</Text>
            <Text style={styles.timeLabel}>{t('statistics.avgFocusTime')}</Text>
          </View>
          <View style={styles.timeCard}>
            <Text style={styles.timeIcon}>📅</Text>
            <Text style={styles.timeValue}>{stats.totalHours}h</Text>
            <Text style={styles.timeLabel}>{t('statistics.totalWorkHours')}</Text>
          </View>
          <View style={styles.timeCard}>
            <Text style={styles.timeIcon}>⚡</Text>
            <Text style={styles.timeValue}>{(stats.totalHours / stats.completedTasks).toFixed(1)}h</Text>
            <Text style={styles.timeLabel}>{t('statistics.avgPerTask')}</Text>
          </View>
        </View>
      </View>

      {/* Productivity Insights */}
      <View style={[styles.section, isDesktop && styles.sectionDesktop]}>
        <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>{t('statistics.insightsRecommendations')}</Text>
        <View style={[styles.insightsContainer, isDesktop ? styles.insightsContainerDesktop : styles.insightsContainerMobile]}>
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>🚀</Text>
            <Text style={styles.insightTitle}>{t('statistics.productivityIncreased')}</Text>
            <Text style={styles.insightDesc}>
              {t('statistics.productivityIncreasedDesc')}
            </Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>🎯</Text>
            <Text style={styles.insightTitle}>{t('statistics.targetAchieved')}</Text>
            <Text style={styles.insightDesc}>
              {t('statistics.targetAchievedDesc')}
            </Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>⏰</Text>
            <Text style={styles.insightTitle}>{t('statistics.optimalTime')}</Text>
            <Text style={styles.insightDesc}>
              {t('statistics.optimalTimeDesc')}
            </Text>
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isDesktop ? 40 : 20,
    paddingVertical: isDesktop ? 12 : 8,
    backgroundColor: THEME_COLORS.light,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.gray[200],
    minHeight: isDesktop ? 60 : 50,
  },
  backButton: {
    width: isDesktop ? 44 : 36,
    height: isDesktop ? 44 : 36,
    borderRadius: isDesktop ? 22 : 18,
    backgroundColor: THEME_COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backIcon: {
    fontSize: isDesktop ? 22 : 18,
    color: THEME_COLORS.dark,
    fontWeight: 'bold',
    marginLeft: -1,
  },
  headerTitle: {
    fontSize: isDesktop ? 20 : 16,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    letterSpacing: 0.5,
  },
  headerRight: {
    width: isDesktop ? 44 : 36,
  },
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  mobileContainer: {
    paddingBottom: 20,
  },
  desktopContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },

  timeRangeContainer: {
    flexDirection: 'row',
    marginHorizontal: isDesktop ? 0 : 20,
    marginTop: isDesktop ? 20 : 0,
    marginBottom: isDesktop ? 40 : 24,
    backgroundColor: THEME_COLORS.light,
    borderRadius: isDesktop ? 16 : 12,
    padding: isDesktop ? 8 : 6,
    maxWidth: isDesktop ? 500 : '100%',
    alignSelf: isDesktop ? 'center' : 'stretch',
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: THEME_COLORS.gray[100],
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: isDesktop ? 16 : 12,
    paddingHorizontal: isDesktop ? 24 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: isDesktop ? 12 : 8,
    marginHorizontal: isDesktop ? 4 : 2,
    minHeight: isDesktop ? 52 : 44,
    backgroundColor: 'transparent',
  },
  timeRangeButtonHover: {
    backgroundColor: THEME_COLORS.gray[50],
    transform: [{ scale: 1.01 }],
  },
  timeRangeActive: {
    backgroundColor: THEME_COLORS.primary,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  timeRangeText: {
    fontSize: isDesktop ? 16 : 14,
    fontWeight: '600',
    color: THEME_COLORS.gray[600],
    letterSpacing: 0.5,
  },
  timeRangeActiveText: {
    color: THEME_COLORS.light,
    fontWeight: '700',
    fontSize: isDesktop ? 16 : 14,
  },
  section: {
    margin: isDesktop ? 0 : 20,
    marginTop: 0,
    marginBottom: isDesktop ? 40 : 20,
  },
  sectionDesktop: {
    marginHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 16,
  },
  sectionTitleDesktop: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statsGridMobile: {
    justifyContent: 'space-between',
  },
  statsGridDesktop: {
    justifyContent: 'space-between',
    gap: 20,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  statCard: {
    width: isDesktop ? '23%' : (isTablet ? '48%' : '48%'),
    backgroundColor: THEME_COLORS.light,
    borderRadius: 12,
    padding: isDesktop ? 24 : 16,
    marginBottom: isDesktop ? 0 : 12,
    borderLeftWidth: 4,
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: isDesktop ? 160 : 'auto',
    minWidth: isDesktop ? 250 : 'auto',
  },

  statIcon: {
    fontSize: isDesktop ? 32 : 24,
    marginBottom: isDesktop ? 12 : 8,
  },
  statValue: {
    fontSize: isDesktop ? 32 : 24,
    fontWeight: 'bold',
    marginBottom: isDesktop ? 8 : 4,
  },
  statTitle: {
    fontSize: isDesktop ? 16 : 14,
    fontWeight: '600',
    color: THEME_COLORS.gray[700],
    marginBottom: isDesktop ? 4 : 2,
  },
  statSubtitle: {
    fontSize: isDesktop ? 14 : 12,
    color: THEME_COLORS.gray[500],
  },
  progressSection: {
    gap: 16,
  },
  progressSectionMobile: {
    flexDirection: 'column',
  },
  progressSectionDesktop: {
    flexDirection: 'row',
    gap: 24,
  },
  progressContainer: {
    backgroundColor: THEME_COLORS.light,
    borderRadius: 12,
    padding: 16,
    flex: isDesktop ? 1 : 0,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.dark,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.gray[600],
  },
  progressBarBg: {
    height: 8,
    backgroundColor: THEME_COLORS.gray[200],
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: THEME_COLORS.gray[500],
    textAlign: 'right',
  },
  timeAnalytics: {
    flexDirection: 'row',
  },
  timeAnalyticsMobile: {
    justifyContent: 'space-between',
  },
  timeAnalyticsDesktop: {
    justifyContent: 'space-between',
    gap: 24,
    maxWidth: 800,
    alignSelf: 'center',
  },
  timeCard: {
    flex: isDesktop ? 1 : 1,
    width: isDesktop ? 'auto' : 'auto',
    backgroundColor: THEME_COLORS.light,
    borderRadius: 12,
    padding: isDesktop ? 24 : 16,
    marginHorizontal: isDesktop ? 0 : 4,
    alignItems: 'center',
    minWidth: isDesktop ? 200 : 'auto',
  },
  timeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: THEME_COLORS.gray[600],
    textAlign: 'center',
  },
  insightsContainer: {
    gap: 12,
  },
  insightsContainerMobile: {
    flexDirection: 'column',
  },
  insightsContainerDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'space-between',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  insightCard: {
    backgroundColor: THEME_COLORS.light,
    borderRadius: 12,
    padding: isDesktop ? 24 : 16,
    flexDirection: isDesktop ? 'column' : 'row',
    alignItems: isDesktop ? 'center' : 'flex-start',
    width: isDesktop ? '32%' : 'auto',
    minWidth: isDesktop ? 300 : 'auto',
    marginBottom: isDesktop ? 20 : 0,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: isDesktop ? 0 : 12,
    marginTop: isDesktop ? 0 : 2,
    marginBottom: isDesktop ? 12 : 0,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginBottom: 4,
    flex: isDesktop ? 0 : 1,
    textAlign: isDesktop ? 'center' : 'left',
  },
  insightDesc: {
    fontSize: 14,
    color: THEME_COLORS.gray[600],
    lineHeight: 20,
    flex: isDesktop ? 0 : 1,
    textAlign: isDesktop ? 'center' : 'left',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: THEME_COLORS.gray[600],
  },
  timeRangeDisabled: {
    opacity: 0.5,
  },
});