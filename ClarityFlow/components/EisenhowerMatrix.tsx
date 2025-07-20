import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { EisenhowerQuadrant, Task } from '../types';
import { QUADRANT_CONFIG } from '../utils/constants';
import DragDropTaskCard from './DragDropTaskCard';

// Function to get theme-aware quadrant colors
const getQuadrantColors = (isDarkMode: boolean) => {
  const baseColors = {
    'urgent-important': {
      light: { bg: 'rgba(239, 68, 68, 0.05)', border: '#EF4444', accent: '#DC2626' },
      dark: { bg: 'rgba(239, 68, 68, 0.15)', border: '#F87171', accent: '#EF4444' }
    },
    'not-urgent-important': {
      light: { bg: 'rgba(245, 158, 11, 0.05)', border: '#F59E0B', accent: '#D97706' },
      dark: { bg: 'rgba(245, 158, 11, 0.15)', border: '#FBBF24', accent: '#F59E0B' }
    },
    'urgent-not-important': {
      light: { bg: 'rgba(59, 130, 246, 0.05)', border: '#3B82F6', accent: '#2563EB' },
      dark: { bg: 'rgba(59, 130, 246, 0.15)', border: '#60A5FA', accent: '#3B82F6' }
    },
    'not-urgent-not-important': {
      light: { bg: 'rgba(107, 114, 128, 0.05)', border: '#6B7280', accent: '#4B5563' },
      dark: { bg: 'rgba(107, 114, 128, 0.15)', border: '#9CA3AF', accent: '#6B7280' }
    },
  };

  const theme = isDarkMode ? 'dark' : 'light';
  return Object.fromEntries(
    Object.entries(baseColors).map(([key, value]) => [key, value[theme]])
  );
};

interface EisenhowerMatrixProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskDrop?: (taskId: string, targetQuadrant: string) => void;
  onAddTask: () => void;
  onTaskPress: (task: Task) => void;
}

const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = memo(({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskDrop,
  onAddTask,
  onTaskPress,
}) => {
  const { t } = useLanguage();
  const { colors, isDarkMode } = useTheme();
  const [expandedQuadrant, setExpandedQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Get translated quadrant config
  const getTranslatedQuadrantConfig = useCallback((quadrant: EisenhowerQuadrant) => {
    const baseConfig = QUADRANT_CONFIG[quadrant];
    return {
      ...baseConfig,
      title: t(`quadrant.${quadrant}.title`),
      subtitle: t(`quadrant.${quadrant}.subtitle`),
      description: t(`quadrant.${quadrant}.description`),
    };
  }, [t]);
  
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const { width, height } = screenData;
  const isDesktop = width > 1024;
  
  // Memoized tasks by quadrant untuk performance
  const tasksByQuadrant = useMemo(() => {
    const result: Record<EisenhowerQuadrant, Task[]> = {
      'urgent-important': [],
      'not-urgent-important': [],
      'urgent-not-important': [],
      'not-urgent-not-important': []
    };
    
    tasks.forEach(task => {
      if (!task.completed && task.quadrant) {
        result[task.quadrant].push(task);
      }
    });
    
    return result;
  }, [tasks]);
  
  // Get tasks by quadrant dengan memoization
  const getTasksByQuadrant = useCallback((quadrant: EisenhowerQuadrant) => {
    return tasksByQuadrant[quadrant] || [];
  }, [tasksByQuadrant]);

  // Handle quadrant interaction
  const handleQuadrantPress = useCallback((quadrant: EisenhowerQuadrant) => {
    setExpandedQuadrant(expandedQuadrant === quadrant ? null : quadrant);
  }, [expandedQuadrant]);

  // Dynamic styles based on screen dimensions and theme
  const dynamicStyles = useMemo(() => ({
    matrixContainer: {
      flex: 1,
      paddingHorizontal: 0,
      paddingTop: 0,
      height: isDesktop ? height - 60 : undefined, // Hanya kurangi header (60px) untuk desktop
    },
    quadrantCard: {
      width: '50%' as const,
      height: isDesktop ? (height - 60) / 2 : (height - 100) / 2, // Desktop: kurangi header saja, Mobile: tetap kurangi bottom nav
      marginBottom: 0,
    },
    mobileQuadrantCard: {
      width: '50%' as const,
      height: (height - 100) / 2,
      borderWidth: 0,
    },
    container: {
      backgroundColor: colors.background,
    },
    quadrantSubtitle: {
      color: colors.text.muted,
    },
    moreTasksText: {
      color: colors.text.muted,
    },
    noTasksText: {
      color: colors.text.muted,
    },
    quadrantTitle: {
      color: colors.text.primary,
    },
  }), [height, isDesktop, colors]);

  // Get theme-aware quadrant colors
  const quadrantColors = useMemo(() => getQuadrantColors(isDarkMode), [isDarkMode]);

  // Render quadrant card dengan memoization
  const renderQuadrant = useCallback((quadrant: EisenhowerQuadrant) => {
    const config = getTranslatedQuadrantConfig(quadrant);
    const quadrantColor = quadrantColors[quadrant];
    const quadrantTasks = getTasksByQuadrant(quadrant);
    
    const quadrantStyle = {
      backgroundColor: quadrantColor.bg,
      borderColor: quadrantColor.border,
      flex: 1,
      borderRadius: 1,
      borderWidth: 0,
      padding: isDesktop ? 20 : 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 10,
      transform: [{ scale: 1 }],
    };

    const titleStyle = {
      color: colors.text.primary,
    };
    
    return (
      <TouchableOpacity
        key={quadrant}
        style={quadrantStyle}
        onPress={() => handleQuadrantPress(quadrant)}
        activeOpacity={0.8}
      >
        <View style={styles.quadrantHeader}>
          <Text style={[styles.quadrantIcon, { fontSize: isDesktop ? 24 : 18, marginRight: isDesktop ? 12 : 8 }]}>{config.icon}</Text>
          <View style={styles.quadrantTitleContainer}>
            <Text style={[styles.quadrantTitle, titleStyle, { fontSize: isDesktop ? 18 : 14 }]}>
              {config.title}
            </Text>
            <Text style={[styles.quadrantSubtitle, { fontSize: isDesktop ? 12 : 10, color: colors.text.primary }]}>
              {config.subtitle}
            </Text>
          </View>
        </View>
        
        <View style={styles.quadrantContent}>
          {quadrantTasks.length > 0 ? (
            isDesktop ? (
              <ScrollView 
                style={styles.taskScrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {quadrantTasks.slice(0, 3).map((task, index) => (
                  <View
                    key={task.id}
                    style={[
                      styles.taskCardContainer,
                      index === quadrantTasks.length - 1 && { marginBottom: 0 }
                    ]}
                  >
                    <DragDropTaskCard
                      task={task}
                      onComplete={() => onTaskUpdate?.({ ...task, completed: true })}
                      onDelete={() => onTaskDelete?.(task.id)}
                      onTaskUpdate={onTaskUpdate}
                      onDrop={onTaskDrop}
                      quadrantColor={colors.border}
                      isCompleted={task.completed}
                    />
                  </View>
                ))}
                {quadrantTasks.length > 3 && (
                  <Text style={styles.moreTasksText}>
                    +{quadrantTasks.length - 3} more tasks
                  </Text>
                )}
              </ScrollView>
            ) : (
              <View style={styles.mobileTaskContainer}>
                {quadrantTasks.slice(0, 2).map((task, index) => (
                  <View
                    key={task.id}
                    style={[
                      styles.taskCardContainer,
                      index === quadrantTasks.length - 1 && { marginBottom: 0 }
                    ]}
                  >
                    <DragDropTaskCard
                      task={task}
                      onComplete={() => onTaskUpdate?.({ ...task, completed: true })}
                      onDelete={() => onTaskDelete?.(task.id)}
                      onTaskUpdate={onTaskUpdate}
                      onDrop={onTaskDrop}
                      quadrantColor={colors.border}
                      isCompleted={task.completed}
                    />
                  </View>
                ))}
                {quadrantTasks.length > 2 && (
                  <Text style={styles.moreTasksText}>
                    +{quadrantTasks.length - 2} more tasks
                  </Text>
                )}
              </View>
            )
          ) : (
            <Text style={styles.noTasksText}>{t('quadrant.noTasks')}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [expandedQuadrant, getTasksByQuadrant, onTaskUpdate, onTaskDelete, isDesktop, getTranslatedQuadrantConfig, quadrantColors]);

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      {isDesktop ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Matrix Grid */}
          <View style={dynamicStyles.matrixContainer}>
            <View style={[styles.matrixGrid, styles.matrixGridDesktop]}>
              {Object.keys(QUADRANT_CONFIG).map((quadrant, index) =>
                <View key={quadrant} style={[
                  dynamicStyles.quadrantCard,
                  index === Object.keys(QUADRANT_CONFIG).length - 1 && { marginRight: 0 }
                ]}>
                  {renderQuadrant(quadrant as EisenhowerQuadrant)}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        /* Mobile Full Screen Layout */
        <View style={styles.mobileContainer}>
          <View style={styles.mobileMatrixGrid}>
            {Object.keys(QUADRANT_CONFIG).map((quadrant) =>
              <View key={quadrant} style={dynamicStyles.mobileQuadrantCard}>
                {renderQuadrant(quadrant as EisenhowerQuadrant)}
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 0,
  },
  matrixGridDesktop: {
    width: '100%',
    paddingHorizontal: 0,
  },
  // Mobile specific styles
  mobileContainer: {
    flex: 1,
  },
  mobileMatrixGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quadrantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  quadrantIcon: {
    // Dynamic sizing handled in component
  },
  quadrantTitleContainer: {
    flex: 1,
  },
  quadrantTitle: {
    fontWeight: 'bold',
    marginBottom: 0,
  },
  quadrantSubtitle: {
    // color will be set dynamically
  },
  quadrantContent: {
    flex: 1,
  },
  taskScrollView: {
    flex: 1,
  },
  mobileTaskContainer: {
    flex: 1,
  },
  taskCardContainer: {
    marginBottom: 8,
  },
  moreTasksText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    // color will be set dynamically
  },
  noTasksText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
    // color will be set dynamically
  },
});

export { EisenhowerMatrix };
export default EisenhowerMatrix;