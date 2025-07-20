import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthRefresh } from '../../hooks/useAuthRefresh';
import { AIService } from '../../services/aiService';
import { taskService } from '../../services/taskService';
import { AIAnalysisResult, EisenhowerQuadrant, Task } from '../../types';

// Import LinearGradient for enhanced UI
const LinearGradient = require('expo-linear-gradient').LinearGradient;

const { width } = Dimensions.get('window');

export default function AddTaskScreen() {
  const { colors, getFontSize } = useTheme();
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  useAuthRefresh(); // Auto-refresh auth state when screen is focused
  const router = useRouter();

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    scrollContainer: {
      backgroundColor: colors.background,
    },
    inputCard: {
      backgroundColor: colors.surface,
    },
    inputLabel: {
      color: colors.text.primary,
      fontSize: getFontSize(16),
    },
    loadingText: {
      color: colors.text.primary,
      fontSize: getFontSize(16),
    },
    warningContainer: {
      backgroundColor: colors.surface,
    },
    warningText: {
      color: colors.text.primary,
    },
    errorContainer: {
      backgroundColor: colors.surface,
    },
    errorText: {
      color: colors.text.primary,
    },
    inputWrapper: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    inputWrapperFocused: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
    },
    previewWrapper: {
      backgroundColor: colors.surface,
    },
    input: {
      color: colors.text.primary,
    },
    inputDisabled: {
      color: colors.text.primary,
    },
    manualButton: {
      backgroundColor: colors.surface,
    },
    manualButtonText: {
      color: colors.primary,
    },
    loginButton: {
      backgroundColor: colors.primary,
    },
    infoText: {
      color: colors.text.primary,
    },
    analysisText: {
      color: colors.text.primary,
    },
    previewTitle: {
      color: colors.text.primary,
    },
    previewQuadrant: {
      color: colors.text.primary,
    },
    previewReasoning: {
      color: colors.text.primary,
    },
    statText: {
      color: colors.text.primary,
    },
    tipsTitle: {
      color: colors.text.primary,
    },
    tipsText: {
      color: colors.text.primary,
    },
    modalContent: {
      backgroundColor: colors.surface,
    },
    modalTitle: {
      color: colors.text.primary,
    },
    modalSubtitle: {
      color: colors.text.primary,
    },
    quadrantOptionText: {
      color: colors.text.primary,
    },
    timeInputLabel: {
      color: colors.text.primary,
    },
    timeInput: {
      backgroundColor: colors.surface,
      color: colors.text.primary,
    },
    createManualButton: {
      backgroundColor: colors.primary,
    },
    simpleTitle: {
      color: colors.text.primary,
      fontSize: getFontSize(28),
      lineHeight: getFontSize(32),
    },
    simpleSubtitle: {
      color: colors.text.primary,
      fontSize: getFontSize(16),
      lineHeight: getFontSize(22),
    },
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [isOffline, setIsOffline] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState<EisenhowerQuadrant>('not-urgent-important');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [errorMessage, setErrorMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [inputFocused, setInputFocused] = useState(false);

  // Get translated quadrant names
  const getQuadrantName = (quadrant: EisenhowerQuadrant): string => {
    return `${t(`quadrant.${quadrant}.title`)} (${t(`quadrant.${quadrant}.subtitle`)})`;
  };

  useEffect(() => {
    checkOnlineStatus();

    // Animate on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Remove the separate auth check since we're using useAuth hook

  const checkOnlineStatus = () => {
    const online = AIService.isOnline();
    setIsOffline(!online);
  };

  const handleAddTask = async () => {
    console.log('🎯 handleAddTask: Starting function');
    console.log('📝 handleAddTask: Input text:', inputText);
    console.log('👤 handleAddTask: Current user:', user);
    
    if (!inputText.trim()) {
      console.log('❌ handleAddTask: Empty input text');
      return;
    }
    
    if (!isAuthenticated || !user) {
      console.log('❌ handleAddTask: No current user');
      Alert.alert('Login Diperlukan', 'Silakan login terlebih dahulu untuk menambah task', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
      return;
    }

    // Check if offline
    if (isOffline) {
      setErrorMessage('Anda sedang offline. Silakan periksa koneksi internet Anda dan coba lagi.');
      return;
    }

    console.log('✅ handleAddTask: Validation passed, starting process');
    setIsLoading(true);
    setAiAnalysis(null);
    setErrorMessage('');
    setShowManualInput(false);
    
    try {
      console.log('🤖 handleAddTask: Starting AI analysis for:', inputText.trim());
      setAnalysisStep(t('addTask.analyzing'));
      
      console.log('🔄 handleAddTask: Calling AIService.analyzeTask...');
      const ai = await AIService.analyzeTask(inputText.trim());
      console.log('✅ handleAddTask: AI analysis completed successfully:', ai);
      
      setAiAnalysis(ai);
      setAnalysisStep(t('addTask.savingTask'));
      
      await saveTaskToMatrix(ai);
      
    } catch (error: any) {
      console.error('❌ Add Task Error:', error);
      setAnalysisStep('');
      
      const errorMsg = error.message || error.toString();
      
      if (errorMsg === 'OFFLINE') {
        setErrorMessage('Anda sedang offline. Silakan periksa koneksi internet Anda dan coba lagi.');
        setIsOffline(true);
      } else if (errorMsg.includes('AI_DISABLED') || errorMsg.includes('NO_AI_API') || errorMsg.includes('AI_FAILED') || errorMsg.includes('API_KEY') || errorMsg.includes('NO_VALID_PROVIDER')) {
        setErrorMessage('AI sedang bermasalah. Silakan gunakan cara manual untuk sementara.');
        setShowManualInput(true);
      } else {
        setErrorMessage('Terjadi kesalahan saat menganalisis tugas. Silakan coba lagi atau gunakan input manual.');
        setShowManualInput(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManualTask = async () => {
    try {
      const manualAnalysis = AIService.createManualTask(
        inputText,
        selectedQuadrant,
        estimatedTime
      );
      
      await saveTaskToMatrix(manualAnalysis);
      setShowManualInput(false);
    } catch (error) {
      console.error('Error creating manual task:', error);
      Alert.alert('Error', 'Gagal membuat task manual. Silakan coba lagi.');
    }
  };

  const saveTaskToMatrix = async (analysis: AIAnalysisResult) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: inputText.trim(),
      description: analysis.reasoning,
      quadrant: analysis.quadrant,
      priority: analysis.priority,
      dueDate: analysis.suggestedDueDate,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: analysis.tags,
      estimatedTime: analysis.estimatedTime,
      userId: user?.uid || '',
      aiSuggestion: {
        quadrant: analysis.quadrant,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
      },
    };
    
    console.log('📝 Add Task: Created task object:', newTask);
    await taskService.saveTask(newTask, user!.uid);
    console.log('📝 Add Task: Task saved successfully');

    // Schedule notifications for the new task
    try {
      const { ENV_CONFIG } = await import('../../config/env');
      if (ENV_CONFIG.ENABLE_NOTIFICATIONS && newTask.dueDate) {
        const NotificationService = (await import('../../services/notificationService')).default;

        // Schedule task reminder
        await NotificationService.scheduleTaskReminder(newTask);

        // Schedule deadline alert
        await NotificationService.scheduleDeadlineAlert(newTask);

        console.log('📝 Add Task: Notifications scheduled for task');
      }
    } catch (error) {
      console.error('Failed to schedule notifications for new task:', error);
      // Don't fail the task creation if notification scheduling fails
    }

    setInputText('');
    setAnalysisStep('');
    setAiAnalysis(null);
    setErrorMessage('');
    
    Alert.alert(
      '✅ Task Berhasil Ditambahkan!',
      `📍 Kategori: ${getQuadrantName(analysis.quadrant as EisenhowerQuadrant)}\n\n🤖 AI Analysis:\n${analysis.reasoning || t('addTask.noReasoning')}\n\n⏱️ ${t('addTask.estimatedTime')}: ${analysis.estimatedTime || 30} ${t('addTask.minutes')}\n🎯 ${t('addTask.confidence')}: ${Math.round((analysis.confidence || 0) * 100)}%`,
      [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
    );
  };

  const getQuadrantColor = (quadrant: EisenhowerQuadrant) => {
    const colors: Record<EisenhowerQuadrant, string> = {
      'urgent-important': '#FF6B6B',
      'not-urgent-important': '#4ECDC4',
      'urgent-not-important': '#FFE66D',
      'not-urgent-not-important': '#95E1D3'
    };
    return colors[quadrant] || '#E0E0E0';
  };

  const getQuadrantLabel = (quadrant: EisenhowerQuadrant) => {
    const labels: Record<EisenhowerQuadrant, string> = {
      'urgent-important': 'Urgent & Penting',
      'not-urgent-important': 'Penting, Tidak Urgent',
      'urgent-not-important': 'Urgent, Tidak Penting',
      'not-urgent-not-important': 'Tidak Urgent & Tidak Penting'
    };
    return labels[quadrant] || quadrant;
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.scrollContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Memuat...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, dynamicStyles.scrollContainer]}>
        <Text style={styles.title}>Tambah Task Baru</Text>
        <Text style={styles.subtitle}>Login untuk menambah dan mengelola task Anda</Text>

        <View style={[styles.previewWrapper, dynamicStyles.previewWrapper]}>
          <TextInput
            style={[styles.input, styles.inputDisabled, dynamicStyles.input, dynamicStyles.inputDisabled]}
            placeholder="Tulis tugas atau aktivitas..."
            value={inputText}
            onChangeText={setInputText}
            multiline={false}
            editable={false}
            placeholderTextColor={colors.text.secondary}
          />
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonDisabled]}
            disabled={true}
          >
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.loginButton, dynamicStyles.loginButton]} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login untuk Menambah Task</Text>
        </TouchableOpacity>

        <Text style={[styles.infoText, dynamicStyles.infoText]}>
          Anda dapat melihat matrix tanpa login, tetapi perlu login untuk menambah task baru
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.scrollContainer, dynamicStyles.scrollContainer]} contentContainerStyle={styles.container}>
      {/* Simple Header */}
      <View style={styles.simpleHeader}>
        <Text style={[styles.simpleTitle, dynamicStyles.simpleTitle]}>{t('addTask.title')}</Text>
        <Text style={[styles.simpleSubtitle, dynamicStyles.simpleSubtitle]}>{t('addTask.subtitle')}</Text>
      </View>
      
      {/* Offline Warning */}
      {isOffline ? (
        <View style={styles.warningContainer}>
          <Ionicons name="wifi-outline" size={24} color="#FF6B6B" />
          <Text style={styles.warningText}>
            {t('addTask.offlineWarning')}
          </Text>
        </View>
      ) : null}

      {/* Error Message */}
      {errorMessage && !isOffline ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={24} color="#FF6B6B" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
      
      {/* Enhanced Input Card */}
      <Animated.View
        style={[
          styles.inputCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(fadeAnim, -20) }]
          }
        ]}
      >
        <View style={styles.inputHeader}>
          <Ionicons name="create-outline" size={20} color="#667eea" />
          <Text style={styles.inputLabel}>Describe your task</Text>
        </View>

        <View style={[
          styles.inputWrapper,
          dynamicStyles.inputWrapper,
          inputFocused && styles.inputWrapperFocused,
          inputFocused && dynamicStyles.inputWrapperFocused
        ]}>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder={t('addTask.placeholder')}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            multiline={true}
            numberOfLines={3}
            editable={!isLoading && !isOffline}
            onSubmitEditing={handleAddTask}
            blurOnSubmit={true}
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            (!inputText.trim() || isOffline) && styles.addButtonDisabled
          ]}
          onPress={handleAddTask}
          disabled={!inputText.trim() || isLoading || isOffline}
        >
          <LinearGradient
            colors={(!inputText.trim() || isOffline) ? ['#CBD5E1', '#CBD5E1'] : ['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.addButtonText}>{t('addTask.analyzeButton')}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Manual Input Button */}
      {showManualInput ? (
        <TouchableOpacity 
          style={styles.manualButton}
          onPress={() => setShowManualInput(true)}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.manualButtonText}>{t('addTask.manualButton')}</Text>
        </TouchableOpacity>
      ) : null}
      
      {isLoading && analysisStep ? (
        <Animated.View
          style={[
            styles.analysisContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#EFF6FF', '#DBEAFE']}
            style={styles.analysisGradient}
          >
            <ActivityIndicator size="small" color="#3B82F6" style={styles.analysisSpinner} />
            <Text style={styles.analysisText}>{analysisStep}</Text>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </LinearGradient>
        </Animated.View>
      ) : null}
      
      {aiAnalysis && !isLoading ? (
        <Animated.View
          style={[
            styles.previewContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(fadeAnim, -10) }]
            }
          ]}
        >
          <LinearGradient
            colors={['#F0FDF4', '#DCFCE7']}
            style={styles.previewGradient}
          >
            <View style={styles.previewHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
              <Text style={styles.previewTitle}>{t('addTask.analysisResult')}</Text>
            </View>

            <View style={styles.previewContent}>
              <View style={styles.previewRow}>
                <Ionicons name="location" size={16} color="#15803D" />
                <Text style={styles.previewQuadrant}>
                  {getQuadrantName(aiAnalysis.quadrant)}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Ionicons name="bulb" size={16} color="#15803D" />
                <Text style={styles.previewReasoning}>{aiAnalysis.reasoning || t('addTask.noReasoning')}</Text>
              </View>

              <View style={styles.previewStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={14} color="#16A34A" />
                  <Text style={styles.statText}>{aiAnalysis.estimatedTime || 30} min</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="analytics" size={14} color="#16A34A" />
                  <Text style={styles.statText}>{Math.round((aiAnalysis.confidence || 0) * 100)}%</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      ) : null}
      
      {/* Enhanced Tips Section */}
      <Animated.View
        style={[
          styles.tipsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(fadeAnim, -5) }]
          }
        ]}
      >
        <LinearGradient
          colors={['#FFFBEB', '#FEF3C7']}
          style={styles.tipsGradient}
        >
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color="#D97706" />
            <Text style={styles.tipsTitle}>{t('addTask.tipsTitle')}</Text>
          </View>

          <View style={styles.tipsContent}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#D97706" />
              <Text style={styles.tipsText}>{t('addTask.tip1')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#D97706" />
              <Text style={styles.tipsText}>{t('addTask.tip2')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#D97706" />
              <Text style={styles.tipsText}>{t('addTask.tip3')}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Manual Input Modal */}
      <Modal
        visible={showManualInput}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('addTask.manualInputTitle')}</Text>
              <TouchableOpacity onPress={() => setShowManualInput(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>{t('addTask.selectQuadrant')}:</Text>

            <View style={styles.quadrantGrid}>
              {[
                { key: 'urgent-important' as EisenhowerQuadrant },
                { key: 'not-urgent-important' as EisenhowerQuadrant },
                { key: 'urgent-not-important' as EisenhowerQuadrant },
                { key: 'not-urgent-not-important' as EisenhowerQuadrant }
              ].map((quadrant) => (
                <TouchableOpacity
                  key={quadrant.key}
                  style={[
                    styles.quadrantOption,
                    { backgroundColor: getQuadrantColor(quadrant.key as EisenhowerQuadrant) + '20' },
                    selectedQuadrant === quadrant.key && styles.selectedQuadrant
                  ]}
                  onPress={() => setSelectedQuadrant(quadrant.key as EisenhowerQuadrant)}
                >
                  <View style={[styles.quadrantIndicator, { backgroundColor: getQuadrantColor(quadrant.key as EisenhowerQuadrant) }]} />
                  <Text style={styles.quadrantOptionText}>{getQuadrantName(quadrant.key)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timeInputContainer}>
              <Text style={styles.timeInputLabel}>{t('addTask.estimatedTimeLabel')}:</Text>
              <TextInput
                style={styles.timeInput}
                value={estimatedTime.toString()}
                onChangeText={(text) => setEstimatedTime(parseInt(text) || 30)}
                keyboardType="numeric"
                placeholder="30"
              />
            </View>

            <TouchableOpacity style={styles.createManualButton} onPress={handleCreateManualTask}>
              <Text style={styles.createManualButtonText}>{t('addTask.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 40, // Add space at the top
    paddingBottom: 124, // Extra space for bottom navigation
    minHeight: '100%',
  },

  // Simple Header Styles
  simpleHeader: {
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  simpleTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    // color will be set dynamically
    marginBottom: 8,
    textAlign: 'center',
  },
  simpleSubtitle: {
    fontSize: 16,
    // color will be set dynamically
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  // Legacy styles (keeping for compatibility)
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Enhanced Input Card Styles
  inputCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    maxWidth: 500,
    width: '100%',
  },
  warningText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    maxWidth: 500,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  inputWrapper: {
    // backgroundColor will be set dynamically
    borderRadius: 16,
    borderWidth: 1,
    // borderColor will be set dynamically
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  inputWrapperFocused: {
    // borderColor will be set dynamically
    // backgroundColor will be set dynamically
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxWidth: 500,
    width: '100%',
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    fontSize: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: '#1F2937',
    paddingVertical: 4,
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  inputDisabled: {
    color: '#94A3B8',
  },

  // Enhanced Button Styles
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  manualButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
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
  // Enhanced Analysis Styles
  analysisContainer: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  analysisGradient: {
    padding: 24,
    alignItems: 'center',
  },
  analysisSpinner: {
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  // Enhanced Preview Styles
  previewContainer: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  previewGradient: {
    padding: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginLeft: 8,
  },
  previewContent: {
    gap: 16,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  previewQuadrant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803D',
    marginLeft: 8,
    flex: 1,
  },
  previewReasoning: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '600',
    marginLeft: 4,
  },
  // Enhanced Tips Styles
  tipsContainer: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  tipsGradient: {
    padding: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginLeft: 8,
  },
  tipsContent: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipsText: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  quadrantGrid: {
    gap: 12,
    marginBottom: 20,
  },
  quadrantOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedQuadrant: {
    borderColor: '#3B82F6',
  },
  quadrantIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  quadrantOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
  },
  timeInputContainer: {
    marginBottom: 20,
  },
  timeInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  createManualButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  createManualButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});