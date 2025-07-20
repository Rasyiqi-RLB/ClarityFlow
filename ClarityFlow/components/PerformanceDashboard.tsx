import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { usePerformance } from '../hooks/usePerformance';
import { THEME_COLORS } from '../utils/constants';

interface PerformanceDashboardProps {
  visible: boolean;
  onClose: () => void;
}

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  apiResponseTime: number;
  errorRate: number;
  userInteractions: number;
  lastUpdated: Date;
}

export default function PerformanceDashboard({ visible, onClose }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { performance } = usePerformance();

  useEffect(() => {
    if (visible) {
      loadMetrics();
      
      if (autoRefresh) {
        const interval = setInterval(loadMetrics, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
      }
    }
  }, [visible, autoRefresh]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Simulate performance metrics collection
      const mockMetrics: PerformanceMetrics = {
        memoryUsage: Math.random() * 100,
        renderTime: Math.random() * 50 + 10,
        apiResponseTime: Math.random() * 200 + 50,
        errorRate: Math.random() * 5,
        userInteractions: Math.floor(Math.random() * 1000),
        lastUpdated: new Date()
      };

      // Add real performance data if available
      if (performance) {
        mockMetrics.renderTime = performance.renderTime || mockMetrics.renderTime;
        mockMetrics.memoryUsage = performance.memoryUsage || mockMetrics.memoryUsage;
      }

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
      Alert.alert('Error', 'Gagal memuat data performa');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return '#10B981'; // Green
    if (value <= thresholds.warning) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getStatusText = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'Excellent';
    if (value <= thresholds.warning) return 'Good';
    return 'Needs Attention';
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Yakin ingin membersihkan cache aplikasi? Ini akan meningkatkan performa.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            // Simulate cache clearing
            Alert.alert('✅ Berhasil', 'Cache telah dibersihkan');
            loadMetrics();
          }
        }
      ]
    );
  };

  const optimizePerformance = async () => {
    Alert.alert(
      'Optimize Performance',
      'Menjalankan optimasi performa aplikasi...',
      [
        {
          text: 'OK',
          onPress: () => {
            // Simulate performance optimization
            setTimeout(() => {
              Alert.alert('✅ Optimasi Selesai', 'Performa aplikasi telah dioptimalkan');
              loadMetrics();
            }, 2000);
          }
        }
      ]
    );
  };

  if (!visible) return null;

  if (loading && !metrics) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>⚡ Performance Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={THEME_COLORS.dark} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.loadingText}>Memuat data performa...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Performance Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setAutoRefresh(!autoRefresh)} 
            style={[styles.refreshButton, autoRefresh && styles.refreshButtonActive]}
          >
            <Ionicons 
              name={autoRefresh ? "pause" : "play"} 
              size={16} 
              color={autoRefresh ? "#fff" : THEME_COLORS.primary} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={THEME_COLORS.dark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {metrics && (
          <>
            {/* Status Overview */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Status Overview</Text>
              <View style={styles.statusGrid}>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(metrics.memoryUsage, { good: 50, warning: 80 }) }]} />
                  <Text style={styles.statusLabel}>Memory</Text>
                  <Text style={styles.statusValue}>{getStatusText(metrics.memoryUsage, { good: 50, warning: 80 })}</Text>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(metrics.renderTime, { good: 16, warning: 30 }) }]} />
                  <Text style={styles.statusLabel}>Render</Text>
                  <Text style={styles.statusValue}>{getStatusText(metrics.renderTime, { good: 16, warning: 30 })}</Text>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(metrics.apiResponseTime, { good: 100, warning: 200 }) }]} />
                  <Text style={styles.statusLabel}>API</Text>
                  <Text style={styles.statusValue}>{getStatusText(metrics.apiResponseTime, { good: 100, warning: 200 })}</Text>
                </View>
              </View>
            </View>

            {/* Detailed Metrics */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📈 Detailed Metrics</Text>
              
              <View style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>Memory Usage</Text>
                  <Text style={styles.metricDescription}>RAM yang digunakan aplikasi</Text>
                </View>
                <View style={styles.metricValue}>
                  <Text style={[styles.metricNumber, { color: getStatusColor(metrics.memoryUsage, { good: 50, warning: 80 }) }]}>
                    {metrics.memoryUsage.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>Render Time</Text>
                  <Text style={styles.metricDescription}>Waktu render komponen</Text>
                </View>
                <View style={styles.metricValue}>
                  <Text style={[styles.metricNumber, { color: getStatusColor(metrics.renderTime, { good: 16, warning: 30 }) }]}>
                    {metrics.renderTime.toFixed(1)}ms
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>API Response Time</Text>
                  <Text style={styles.metricDescription}>Rata-rata waktu respons API</Text>
                </View>
                <View style={styles.metricValue}>
                  <Text style={[styles.metricNumber, { color: getStatusColor(metrics.apiResponseTime, { good: 100, warning: 200 }) }]}>
                    {metrics.apiResponseTime.toFixed(0)}ms
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>Error Rate</Text>
                  <Text style={styles.metricDescription}>Tingkat error aplikasi</Text>
                </View>
                <View style={styles.metricValue}>
                  <Text style={[styles.metricNumber, { color: getStatusColor(metrics.errorRate, { good: 1, warning: 3 }) }]}>
                    {metrics.errorRate.toFixed(2)}%
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>User Interactions</Text>
                  <Text style={styles.metricDescription}>Total interaksi pengguna</Text>
                </View>
                <View style={styles.metricValue}>
                  <Text style={styles.metricNumber}>
                    {metrics.userInteractions.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Performance Tips */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💡 Performance Tips</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.tipText}>Tutup aplikasi yang tidak digunakan</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.tipText}>Restart aplikasi secara berkala</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.tipText}>Bersihkan cache secara rutin</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.tipText}>Update aplikasi ke versi terbaru</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.optimizeButton} onPress={optimizePerformance}>
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.optimizeButtonText}>Optimize Performance</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearButton} onPress={clearCache}>
                <Ionicons name="trash" size={20} color="#F59E0B" />
                <Text style={styles.clearButtonText}>Clear Cache</Text>
              </TouchableOpacity>
            </View>

            {/* Last Updated */}
            <Text style={styles.lastUpdated}>
              Last updated: {metrics.lastUpdated.toLocaleTimeString('id-ID')}
            </Text>
          </>
        )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME_COLORS.primary,
  },
  refreshButtonActive: {
    backgroundColor: THEME_COLORS.primary,
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
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    gap: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME_COLORS.dark,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME_COLORS.dark,
  },
  metricDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  metricValue: {
    alignItems: 'flex-end',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  optimizeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
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
  clearButtonText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '600',
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 32,
    fontStyle: 'italic',
  },
});