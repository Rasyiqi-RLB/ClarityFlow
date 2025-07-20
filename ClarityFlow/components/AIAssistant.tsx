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
import { AIService } from '../services/aiService';
import { THEME_COLORS } from '../utils/constants';

interface AIAssistantProps {
  visible: boolean;
  onClose: () => void;
}

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'loading' | 'error';
}

interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedTime: string;
}

export default function AIAssistant({ visible, onClose }: AIAssistantProps) {
  const [features, setFeatures] = useState<AIFeature[]>([]);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    if (visible) {
      initializeAI();
    }
  }, [visible]);

  const initializeAI = async () => {
    try {
      setLoading(true);
      
      // Check AI service status
      const isAvailable = await AIService.isAIEnabled();
      setAiStatus(isAvailable ? 'online' : 'offline');

      // Initialize AI features
      const aiFeatures: AIFeature[] = [
        {
          id: 'task-analysis',
          name: 'Smart Task Analysis',
          description: 'AI menganalisis tugas dan memberikan insight',
          icon: 'analytics',
          enabled: isAvailable,
          status: isAvailable ? 'active' : 'inactive'
        },
        {
          id: 'priority-suggestions',
          name: 'Priority Suggestions',
          description: 'Saran prioritas berdasarkan deadline dan kompleksitas',
          icon: 'flag',
          enabled: isAvailable,
          status: isAvailable ? 'active' : 'inactive'
        },
        {
          id: 'time-estimation',
          name: 'Time Estimation',
          description: 'Estimasi waktu penyelesaian tugas',
          icon: 'time',
          enabled: isAvailable,
          status: isAvailable ? 'active' : 'inactive'
        },
        {
          id: 'productivity-insights',
          name: 'Productivity Insights',
          description: 'Analisis pola produktivitas dan rekomendasi',
          icon: 'trending-up',
          enabled: isAvailable,
          status: isAvailable ? 'active' : 'inactive'
        },
        {
          id: 'smart-reminders',
          name: 'Smart Reminders',
          description: 'Pengingat cerdas berdasarkan konteks',
          icon: 'notifications',
          enabled: isAvailable,
          status: isAvailable ? 'active' : 'inactive'
        }
      ];

      setFeatures(aiFeatures);

      // Generate AI suggestions if available
      if (isAvailable) {
        await generateSuggestions();
      }

    } catch (error) {
      console.error('Failed to initialize AI:', error);
      setAiStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    try {
      // Simulate AI-generated task suggestions
      const mockSuggestions: TaskSuggestion[] = [
        {
          id: '1',
          title: 'Review pending tasks',
          description: 'Ada 3 tugas yang mendekati deadline, sebaiknya diprioritaskan',
          priority: 'high',
          category: 'Task Management',
          estimatedTime: '15 menit'
        },
        {
          id: '2',
          title: 'Optimize morning routine',
          description: 'Berdasarkan pola aktivitas, pagi hari adalah waktu produktif terbaik',
          priority: 'medium',
          category: 'Productivity',
          estimatedTime: '5 menit'
        },
        {
          id: '3',
          title: 'Schedule break time',
          description: 'Anda belum mengambil istirahat dalam 2 jam terakhir',
          priority: 'medium',
          category: 'Wellness',
          estimatedTime: '10 menit'
        },
        {
          id: '4',
          title: 'Update project status',
          description: 'Beberapa project perlu update status untuk tracking yang lebih baik',
          priority: 'low',
          category: 'Project Management',
          estimatedTime: '20 menit'
        }
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  };

  const toggleFeature = async (featureId: string) => {
    setFeatures(prev => prev.map(feature => {
      if (feature.id === featureId) {
        const newEnabled = !feature.enabled;
        return {
          ...feature,
          enabled: newEnabled,
          status: newEnabled ? 'active' : 'inactive'
        };
      }
      return feature;
    }));

    Alert.alert(
      '✅ Berhasil',
      'Pengaturan fitur AI telah diperbarui'
    );
  };

  const applySuggestion = (suggestion: TaskSuggestion) => {
    Alert.alert(
      'Apply Suggestion',
      `Terapkan saran: "${suggestion.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Terapkan',
          onPress: () => {
            Alert.alert('✅ Diterapkan', 'Saran AI telah diterapkan ke sistem');
          }
        }
      ]
    );
  };

  const refreshAI = async () => {
    await initializeAI();
    Alert.alert('🔄 Refreshed', 'AI Assistant telah diperbarui');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      case 'loading': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (!visible) return null;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🤖 AI Assistant</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={THEME_COLORS.dark} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.loadingText}>Menginisialisasi AI...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Assistant</Text>
        <View style={styles.headerActions}>
          <View style={[styles.statusIndicator, { backgroundColor: aiStatus === 'online' ? '#10B981' : '#EF4444' }]}>
            <Text style={styles.statusText}>
              {aiStatus === 'online' ? 'Online' : 'Offline'}
            </Text>
          </View>
          <TouchableOpacity onPress={refreshAI} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color={THEME_COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={THEME_COLORS.dark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Features */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔧 AI Features</Text>
          <Text style={styles.cardDescription}>
            Kelola fitur-fitur AI yang tersedia untuk meningkatkan produktivitas
          </Text>
          
          {features.map((feature) => (
            <View key={feature.id} style={styles.featureItem}>
              <View style={styles.featureInfo}>
                <View style={styles.featureHeader}>
                  <Ionicons 
                    name={feature.icon as any} 
                    size={20} 
                    color={getStatusColor(feature.status)} 
                  />
                  <Text style={styles.featureName}>{feature.name}</Text>
                  <View style={[styles.featureStatus, { backgroundColor: getStatusColor(feature.status) }]} />
                </View>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <TouchableOpacity
                style={[styles.featureToggle, feature.enabled && styles.featureToggleActive]}
                onPress={() => toggleFeature(feature.id)}
              >
                <Text style={[styles.featureToggleText, feature.enabled && styles.featureToggleTextActive]}>
                  {feature.enabled ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* AI Suggestions */}
        {aiStatus === 'online' && suggestions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💡 Smart Suggestions</Text>
            <Text style={styles.cardDescription}>
              Saran cerdas dari AI berdasarkan aktivitas dan pola kerja Anda
            </Text>
            
            {suggestions.map((suggestion) => (
              <View key={suggestion.id} style={styles.suggestionItem}>
                <View style={styles.suggestionHeader}>
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                    <View style={styles.suggestionMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(suggestion.priority) }]}>
                        <Text style={styles.priorityText}>{suggestion.priority.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.categoryText}>{suggestion.category}</Text>
                      <Text style={styles.timeText}>⏱️ {suggestion.estimatedTime}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => applySuggestion(suggestion)}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* AI Status Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 AI Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Service Status</Text>
              <Text style={[styles.statusValue, { color: aiStatus === 'online' ? '#10B981' : '#EF4444' }]}>
                {aiStatus === 'online' ? '✅ Online' : '❌ Offline'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Active Features</Text>
              <Text style={styles.statusValue}>
                {features.filter(f => f.enabled).length}/{features.length}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Suggestions</Text>
              <Text style={styles.statusValue}>{suggestions.length} available</Text>
            </View>
          </View>
        </View>

        {/* Offline Message */}
        {aiStatus === 'offline' && (
          <View style={styles.offlineCard}>
            <Ionicons name="cloud-offline" size={48} color="#6B7280" />
            <Text style={styles.offlineTitle}>AI Service Offline</Text>
            <Text style={styles.offlineDescription}>
              Layanan AI sedang tidak tersedia. Periksa koneksi internet atau coba lagi nanti.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshAI}>
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
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
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 4,
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
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureInfo: {
    flex: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME_COLORS.dark,
    flex: 1,
  },
  featureStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  featureToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  featureToggleActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  featureToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  featureToggleTextActive: {
    color: '#fff',
  },
  suggestionItem: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLORS.primary,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.dark,
    marginBottom: 4,
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  applyButton: {
    backgroundColor: THEME_COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.dark,
  },
  offlineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  offlineDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});