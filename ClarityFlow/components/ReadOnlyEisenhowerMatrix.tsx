import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { EisenhowerQuadrant, Task } from '../types';
import { QUADRANT_CONFIG } from '../utils/constants';

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

// Demo data untuk preview
const DEMO_TASKS: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Finish the quarterly project proposal for client review',
    quadrant: 'urgent-important',
    priority: 'high',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo'
  },
  {
    id: '2',
    title: 'Plan team meeting',
    description: 'Schedule and prepare agenda for next week team meeting',
    quadrant: 'not-urgent-important',
    priority: 'medium',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo'
  },
  {
    id: '3',
    title: 'Review emails',
    description: 'Check and respond to pending emails',
    quadrant: 'urgent-not-important',
    priority: 'low',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo'
  },
  {
    id: '4',
    title: 'Social media browsing',
    description: 'Check social media updates',
    quadrant: 'not-urgent-not-important',
    priority: 'low',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo'
  }
];

const ReadOnlyEisenhowerMatrix: React.FC = memo(() => {
  const { isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const { width, height } = screenData;
  const isDesktop = width > 1024;

  // Get theme-aware quadrant colors
  const quadrantColors = useMemo(() => getQuadrantColors(isDarkMode), [isDarkMode]);
  
  // Memoized tasks by quadrant untuk performance - SAMA dengan EisenhowerMatrix
  const tasksByQuadrant = useMemo(() => {
    const result: Record<EisenhowerQuadrant, Task[]> = {
      'urgent-important': [],
      'not-urgent-important': [],
      'urgent-not-important': [],
      'not-urgent-not-important': []
    };
    
    DEMO_TASKS.forEach(task => {
      if (!task.completed && task.quadrant) {
        result[task.quadrant].push(task);
      }
    });
    
    return result;
  }, []);
  
  // Get tasks by quadrant dengan memoization - SAMA dengan EisenhowerMatrix
  const getTasksByQuadrant = useCallback((quadrant: EisenhowerQuadrant) => {
    return tasksByQuadrant[quadrant] || [];
  }, [tasksByQuadrant]);

  // Dynamic styles based on screen dimensions
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
  }), [height, isDesktop]);

  // Render simple task item untuk read-only - hanya judul
  const renderTaskItem = useCallback((task: Task, quadrantColor: string) => (
    <View
      key={task.id}
      style={[
        styles.taskItem,
        { borderLeftColor: quadrantColor }
      ]}
    >
      <Text style={[styles.taskTitle, themeStyles.taskTitle]} numberOfLines={1}>
        {task.title}
      </Text>
    </View>
  ), []);

  // Render quadrant card dengan memoization - STRUKTUR SAMA dengan EisenhowerMatrix
  const renderQuadrant = useCallback((quadrant: EisenhowerQuadrant) => {
    const config = QUADRANT_CONFIG[quadrant];
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
      <View
        key={quadrant}
        style={quadrantStyle}
      >
        <View style={styles.quadrantHeader}>
          <Text style={[styles.quadrantIcon, { fontSize: isDesktop ? 24 : 18, marginRight: isDesktop ? 12 : 8 }]}>{config.icon}</Text>
          <View style={styles.quadrantTitleContainer}>
            <Text style={[styles.quadrantTitle, titleStyle, { fontSize: isDesktop ? 18 : 14 }]}>
              {config.title}
            </Text>
            <Text style={[styles.quadrantSubtitle, themeStyles.quadrantSubtitle, { fontSize: isDesktop ? 12 : 10 }]}>
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
                {quadrantTasks.slice(0, 3).map((task) =>
                  renderTaskItem(task, quadrantColor.border)
                )}
                {quadrantTasks.length > 3 && (
                  <Text style={[styles.moreTasksText, themeStyles.moreTasksText]}>
                    +{quadrantTasks.length - 3} more tasks
                  </Text>
                )}
              </ScrollView>
            ) : (
              <View style={styles.mobileTaskContainer}>
                {quadrantTasks.slice(0, 2).map((task) =>
                  renderTaskItem(task, quadrantColor.border)
                )}
                {quadrantTasks.length > 2 && (
                  <Text style={[styles.moreTasksText, themeStyles.moreTasksText]}>
                    +{quadrantTasks.length - 2} more tasks
                  </Text>
                )}
              </View>
            )
          ) : (
            <Text style={[styles.noTasksText, themeStyles.noTasksText]}>No tasks here yet</Text>
          )}
        </View>
      </View>
    );
  }, [getTasksByQuadrant, renderTaskItem, isDesktop, quadrantColors]);

  // Create dynamic styles based on theme
  const themeStyles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    quadrantSubtitle: {
      color: colors.text.primary,
    },
    taskTitle: {
      color: colors.text.primary,
    },
    moreTasksText: {
      color: colors.text.primary,
    },
    noTasksText: {
      color: colors.text.primary,
    },
  }), [colors]);

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
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
    paddingHorizontal: 20,
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
  taskItem: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '500',
    // color will be set dynamically
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

export default ReadOnlyEisenhowerMatrix;