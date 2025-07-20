import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import NativeAd from '../../components/NativeAd';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthRefresh } from '../../hooks/useAuthRefresh';
import { StorageService } from '../../services/storage';
import { Task } from '../../types';

const { width } = Dimensions.get('window');
const isDesktop = width > 768;

// Removed hardcoded COLORS - now using ThemeContext

export default function InsightScreen() {
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyInsight, setDailyInsight] = useState<any>(null);
  const [isNewInsight, setIsNewInsight] = useState(false);
  const [previousInsights, setPreviousInsights] = useState<any[]>([]);
  const { user, isAuthenticated, loading } = useAuth();
  useAuthRefresh(); // Auto-refresh auth state when screen is focused
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    console.log('🔄 useEffect triggered - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);

    if (!loading) {
      console.log('✅ Loading complete, calling loadData()');
      loadData();
    } else {
      console.log('⏳ Still loading, waiting...');
    }
  }, [loading, isAuthenticated, user]);

  const handleLogin = () => {
    router.push('/login');
  };

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.text.primary,
    },
    headerTitle: {
      color: colors.text.primary,
    },
    headerSubtitle: {
      color: colors.text.primary,
    },
    lockCard: {
      backgroundColor: colors.surface,
    },
    lockTitle: {
      color: colors.text.primary,
    },
    lockDescription: {
      color: colors.text.primary,
    },
    featureText: {
      color: colors.text.primary,
    },
    loginButton: {
      backgroundColor: colors.primary,
    },
    sectionTitle: {
      color: colors.text.primary,
    },
    dailyInsightBadge: {
      backgroundColor: colors.primary,
    },
    dailyInsightDate: {
      color: colors.text.primary,
    },
    dailyInsightCard: {
      backgroundColor: colors.surface,
    },
    dailyInsightTitle: {
      color: colors.text.primary,
    },
    dailyInsightMeta: {
      color: colors.text.primary,
    },
    dailyInsightContent: {
      color: colors.text.primary,
    },
    dailyInsightTipsTitle: {
      color: colors.primary,
    },
    dailyInsightTip: {
      color: colors.text.primary,
    },
    previousInsightCard: {
      backgroundColor: colors.surface,
    },
    previousInsightDate: {
      color: colors.text.primary,
    },
    previousInsightCategory: {
      color: colors.primary,
    },
    previousInsightTitle: {
      color: colors.text.primary,
    },
    previousInsightContent: {
      color: colors.text.primary,
    },
  });

  const loadData = async () => {
    try {
      setDataLoading(true);
      const loadedTasks = await StorageService.getTasks();
      setTasks(loadedTasks);

      // Skip AI insights - keeping it simple

      // Get daily insight and dynamic AI insights
      const { DailyInsightsService } = await import('../../services/dailyInsightsService');
      const dailyInsightResponse = await DailyInsightsService.generateDailyInsight(loadedTasks);
      setDailyInsight(dailyInsightResponse.insight);
      setIsNewInsight(dailyInsightResponse.isNew);

      // Save daily insight to Firestore if new
      if (user?.uid && dailyInsightResponse.isNew) {
        await DailyInsightsService.saveDailyInsightToFirestore(dailyInsightResponse.insight, user.uid);
      }

      // Get previous insights from Firebase
      console.log('🔍 Starting previous insights loading...');
      console.log('👤 User object:', user);
      console.log('🔐 Is authenticated:', isAuthenticated);
      console.log('⏳ Loading state:', loading);

      try {
        // Try to get all insights first to debug
        const allInsights = await DailyInsightsService.getAllInsightsForDebug();
        console.log('🗂️ All insights in database:', allInsights);

        if (user?.uid) {
          console.log('👤 Current User ID:', user.uid);
          console.log('📧 Current User Email:', user.email);

          const previousInsightsResponse = await DailyInsightsService.getPreviousInsightsFromFirestore(user.uid);
          console.log('📊 Raw response from Firestore:', previousInsightsResponse);
          setPreviousInsights(previousInsightsResponse);
          console.log('✅ Loaded', previousInsightsResponse.length, 'previous insights');
        } else {
          console.log('❌ No user ID available, trying to load any available insights...');
          // If no user, try to show any available insights for demo purposes
          if (allInsights.length > 0) {
            const demoInsights = allInsights.slice(0, 5).map(insight => ({
              ...insight,
              createdAt: new Date(insight.createdAt)
            }));
            setPreviousInsights(demoInsights);
            console.log('📋 Loaded demo insights:', demoInsights.length);
          }
        }
      } catch (error) {
        console.error('❌ Error loading previous insights:', error);
        setPreviousInsights([]);
      }
    } catch (error) {
      console.error('Error loading insights data:', error);
      Alert.alert('Error', 'Failed to load insights data');
    } finally {
      setDataLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Memuat insights...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.lockedContent}>
            <View style={[styles.lockCard, dynamicStyles.lockCard]}>
              <Text style={styles.lockIcon}>💡</Text>
              <Text style={[styles.lockTitle, dynamicStyles.lockTitle]}>AI Insights</Text>
              <Text style={[styles.lockDescription, dynamicStyles.lockDescription]}>
                Login untuk mendapatkan analisis AI tentang pola kerja, rekomendasi optimasi, dan insight produktivitas personal Anda.
              </Text>

              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>🤖</Text>
                  <Text style={[styles.featureText, dynamicStyles.featureText]}>Analisis AI Pattern Recognition</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>📊</Text>
                  <Text style={[styles.featureText, dynamicStyles.featureText]}>Rekomendasi Produktivitas</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>⚡</Text>
                  <Text style={[styles.featureText, dynamicStyles.featureText]}>Optimasi Workflow</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>🎯</Text>
                  <Text style={[styles.featureText, dynamicStyles.featureText]}>Goal Achievement Insights</Text>
                </View>
              </View>

              <TouchableOpacity style={[styles.loginButton, dynamicStyles.loginButton]} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login dengan Google</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>💡</Text>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Daily Insights</Text>
          <Text style={[styles.headerSubtitle, dynamicStyles.headerSubtitle]}>
            Wawasan harian untuk meningkatkan produktivitas Anda
          </Text>
        </View>

        {/* Daily Insight - Blog Style */}
        {dataLoading ? (
          <View style={styles.section}>
            <View style={[styles.dailyInsightCard, dynamicStyles.dailyInsightCard]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Generating today's insight...</Text>
            </View>
          </View>
        ) : dailyInsight && (
          <View style={styles.section}>
            <View style={styles.dailyInsightHeader}>
              <Text style={[styles.dailyInsightBadge, dynamicStyles.dailyInsightBadge]}>
                {isNewInsight ? '🆕 NEW' : '📖 TODAY'}
              </Text>
              <Text style={[styles.dailyInsightDate, dynamicStyles.dailyInsightDate]}>
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>

            <View style={[styles.dailyInsightCard, dynamicStyles.dailyInsightCard]}>
              <View style={styles.dailyInsightTitleRow}>
                <Text style={styles.dailyInsightEmoji}>{dailyInsight.emoji}</Text>
                <View style={styles.dailyInsightTitleContainer}>
                  <Text style={[styles.dailyInsightTitle, dynamicStyles.dailyInsightTitle]}>{dailyInsight.title}</Text>
                  <Text style={[styles.dailyInsightMeta, dynamicStyles.dailyInsightMeta]}>
                    {dailyInsight.readTime} min read • {dailyInsight.category}
                  </Text>
                </View>
              </View>

              <Text style={[styles.dailyInsightContent, dynamicStyles.dailyInsightContent]}>{dailyInsight.content}</Text>

              {dailyInsight.tips && dailyInsight.tips.length > 0 && (
                <View style={styles.dailyInsightTips}>
                  <Text style={[styles.dailyInsightTipsTitle, dynamicStyles.dailyInsightTipsTitle]}>💡 Tips Hari Ini:</Text>
                  {dailyInsight.tips.map((tip: string, index: number) => (
                    <Text key={index} style={[styles.dailyInsightTip, dynamicStyles.dailyInsightTip]}>• {tip}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Native Ad - Productivity Tip */}
        <NativeAd type="productivity_tip" style={{ marginVertical: 16 }} />

        {/* Debug Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>🔍 Debug Info</Text>
          <Text style={[styles.previousInsightContent, dynamicStyles.previousInsightContent]}>
            Loading: {loading ? 'true' : 'false'}{'\n'}
            Authenticated: {isAuthenticated ? 'true' : 'false'}{'\n'}
            User: {user ? user.uid : 'null'}{'\n'}
            Previous Insights Count: {previousInsights.length}{'\n'}
            Data Loading: {dataLoading ? 'true' : 'false'}
          </Text>
        </View>

        {/* Previous Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>📚 Previous Insights</Text>
          {previousInsights.length > 0 ? (
            previousInsights.slice(0, 5).map((insight) => (
              <View key={insight.id} style={[styles.previousInsightCard, dynamicStyles.previousInsightCard, { marginBottom: 12 }]}>
                <View style={styles.previousInsightHeader}>
                  <Text style={[styles.previousInsightDate, dynamicStyles.previousInsightDate]}>
                    {new Date(insight.createdAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Text>
                  <Text style={[styles.previousInsightCategory, dynamicStyles.previousInsightCategory]}>{insight.category}</Text>
                </View>
                <View style={styles.previousInsightTitleRow}>
                  <Text style={styles.previousInsightEmoji}>{insight.emoji}</Text>
                  <Text style={[styles.previousInsightTitle, dynamicStyles.previousInsightTitle]}>{insight.title}</Text>
                </View>
                <Text style={[styles.previousInsightContent, dynamicStyles.previousInsightContent]} numberOfLines={3}>
                  {insight.content}
                </Text>
              </View>
            ))
          ) : (
            <View style={[styles.previousInsightCard, dynamicStyles.previousInsightCard, { marginBottom: 12 }]}>
              <Text style={[styles.previousInsightContent, dynamicStyles.previousInsightContent]}>
                {dataLoading ? 'Loading previous insights...' : 'No previous insights found. Try refreshing the page or check your connection.'}
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: isDesktop ? 32 : 26,
    fontWeight: 'bold',
    // color will be set dynamically
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    // color will be set dynamically
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: isDesktop ? 600 : '90%',
  },
  lockedContent: {
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  lockCard: {
    // backgroundColor will be set dynamically
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    // Removed border
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    // color will be set dynamically
    marginBottom: 12,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 16,
    // color will be set dynamically
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featureList: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureBullet: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    // color will be set dynamically
    flex: 1,
  },
  loginButton: {
    // backgroundColor will be set dynamically
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    // color will be set dynamically
    marginBottom: 16,
  },

  // Daily Insight Styles
  dailyInsightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dailyInsightBadge: {
    // backgroundColor will be set dynamically
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dailyInsightDate: {
    fontSize: 14,
    // color will be set dynamically
    fontStyle: 'italic',
  },
  dailyInsightCard: {
    // backgroundColor will be set dynamically
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dailyInsightTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dailyInsightEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  dailyInsightTitleContainer: {
    flex: 1,
  },
  dailyInsightTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    // color will be set dynamically
    marginBottom: 4,
    lineHeight: 28,
  },
  dailyInsightMeta: {
    fontSize: 12,
    // color will be set dynamically
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailyInsightContent: {
    fontSize: 16,
    // color will be set dynamically
    lineHeight: 24,
    marginBottom: 20,
  },
  dailyInsightTips: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  dailyInsightTipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    // color will be set dynamically
    marginBottom: 8,
  },
  dailyInsightTip: {
    fontSize: 14,
    // color will be set dynamically
    lineHeight: 20,
    marginBottom: 4,
  },

  // Previous Insights Styles
  previousInsightCard: {
    // backgroundColor will be set dynamically
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  previousInsightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previousInsightDate: {
    fontSize: 12,
    // color will be set dynamically
    fontWeight: '500',
  },
  previousInsightCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    // color will be set dynamically
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  previousInsightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previousInsightEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  previousInsightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    // color will be set dynamically
    flex: 1,
  },
  previousInsightContent: {
    fontSize: 13,
    // color will be set dynamically
    lineHeight: 18,
  },

});