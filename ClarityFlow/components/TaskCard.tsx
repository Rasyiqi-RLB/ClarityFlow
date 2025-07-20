import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { Task } from '../types';
import { PRIORITY_CONFIG, THEME_COLORS } from '../utils/constants';

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onPress: () => void;
  quadrantColor: string;
  isCompleted?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onDelete,
  onPress,
  quadrantColor,
  isCompleted = false,
}) => {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(0.98);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      scale.value = withSpring(1);
      
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right - mark completed
        translateX.value = withSpring(0);
        runOnJS(onComplete)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left - delete
        translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
          runOnJS(onDelete)();
        });
      } else {
        // Return to center
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      scale.value = withSpring(0.98);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      runOnJS(onPress)();
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      ['#EF4444', 'transparent', '#10B981']
    );

    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
      backgroundColor,
    };
  });

  const actionTextStyle = useAnimatedStyle(() => {
    const opacity = Math.abs(translateX.value) > SWIPE_THRESHOLD * 0.5 ? 1 : 0;
    return { opacity };
  });

  const formatDueDate = (date: Date | string): string => {
    const now = new Date();
    const dateObj = new Date(date);
    const diffTime = dateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays}d`;
    return dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  // Dynamic styles based on theme
  const dynamicStyles = {
    card: {
      backgroundColor: colors.surface,
    },
    title: {
      color: colors.text.primary,
    },
    completedTitle: {
      color: colors.text.primary,
    },
    description: {
      color: colors.text.primary,
    },
    completedDescription: {
      color: colors.text.primary,
    },
    metadataText: {
      color: colors.text.primary,
    },
    completedMetadataText: {
      color: colors.text.primary,
    },
    tagText: {
      color: colors.text.primary,
    },
    moreTagsText: {
      color: colors.text.primary,
    },
  };

  return (
    <View style={styles.container}>
      {/* Background action indicators */}
      <View style={styles.actionContainer}>
        <Animated.View style={[styles.leftAction, actionTextStyle]}>
          <Text style={styles.actionText}>🗑️ Delete</Text>
        </Animated.View>
        <Animated.View style={[styles.rightAction, actionTextStyle]}>
          <Text style={styles.actionText}>✅ Complete</Text>
        </Animated.View>
      </View>

      {/* Main card */}
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, tapGesture)}>
        <Animated.View style={cardAnimatedStyle}>
          <Animated.View
            style={[
              styles.card,
              dynamicStyles.card,
              isCompleted && styles.completedCard,
              isOverdue && styles.overdueCard,
              { borderLeftColor: quadrantColor },
            ]}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text
                  style={[
                    styles.title,
                    dynamicStyles.title,
                    isCompleted && [styles.completedTitle, dynamicStyles.completedTitle],
                    isOverdue && styles.overdueTitle,
                  ]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityIcon}>{priorityConfig.icon}</Text>
                </View>
              </View>

              {task.description && (
                <Text
                  style={[
                    styles.description,
                    dynamicStyles.description,
                    isCompleted && [styles.completedDescription, dynamicStyles.completedDescription],
                  ]}
                  numberOfLines={1}
                >
                  {task.description}
                </Text>
              )}

              <View style={styles.footer}>
                <View style={styles.metadata}>
                  {task.dueDate && (
                    <Text style={[
                      styles.metadataText,
                      dynamicStyles.metadataText,
                      isOverdue && styles.overdueText,
                      isCompleted && [styles.completedMetadataText, dynamicStyles.completedMetadataText],
                    ]}>
                      📅 {formatDueDate(task.dueDate)}
                    </Text>
                  )}
                  
                  {task.estimatedTime && (
                    <Text style={[
                      styles.metadataText,
                      dynamicStyles.metadataText,
                      isCompleted && [styles.completedMetadataText, dynamicStyles.completedMetadataText],
                    ]}>
                      ⏱️ {formatTime(task.estimatedTime)}
                    </Text>
                  )}
                </View>

                {task.tags && task.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {task.tags.slice(0, 2).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={[styles.tagText, dynamicStyles.tagText]}>#{tag}</Text>
                      </View>
                    ))}
                    {task.tags.length > 2 && (
                      <Text style={[styles.moreTagsText, dynamicStyles.moreTagsText]}>+{task.tags.length - 2}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 1,
    position: 'relative',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 0,
  },
  leftAction: {
    alignItems: 'flex-start',
  },
  rightAction: {
    alignItems: 'flex-end',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: THEME_COLORS.light,
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    shadowColor: THEME_COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  completedCard: {
    opacity: 0.6,
    backgroundColor: THEME_COLORS.gray[50],
  },
  overdueCard: {
    borderLeftColor: THEME_COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME_COLORS.dark,
    flex: 1,
    marginRight: 8,
    lineHeight: 14,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: THEME_COLORS.gray[500],
  },
  overdueTitle: {
    color: THEME_COLORS.error,
  },
  priorityBadge: {
    backgroundColor: THEME_COLORS.gray[100],
    borderRadius: 6,
    padding: 2,
    minWidth: 18,
    alignItems: 'center',
  },
  priorityIcon: {
    fontSize: 9,
  },
  description: {
    fontSize: 11,
    color: THEME_COLORS.gray[600],
    marginBottom: 4,
    lineHeight: 14,
  },
  completedDescription: {
    color: THEME_COLORS.gray[400],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metadata: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metadataText: {
    fontSize: 10,
    color: THEME_COLORS.gray[600],
  },
  overdueText: {
    color: THEME_COLORS.error,
    fontWeight: '600',
  },
  completedMetadataText: {
    color: THEME_COLORS.gray[400],
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: THEME_COLORS.gray[100],
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 2,
  },
  tagText: {
    fontSize: 9,
    color: THEME_COLORS.gray[600],
  },
  moreTagsText: {
    fontSize: 9,
    color: THEME_COLORS.gray[500],
    marginLeft: 2,
  },
});

export default TaskCard;