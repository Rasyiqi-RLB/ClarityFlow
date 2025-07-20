import React, { useCallback } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Task } from '../types';
import { PRIORITY_CONFIG } from '../utils/constants';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;

interface DraggableTaskCardProps {
  task: Task;
  quadrantColor: string;
  onDrop?: (taskId: string, targetQuadrant: string) => void;
  onPress?: () => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  quadrantColor,
  onDrop,
  onPress,
}) => {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const opacity = useSharedValue(1);

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isCompleted = task.completed;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
    zIndex.value = withTiming(1);
    opacity.value = withTiming(1);
  }, [translateX, translateY, scale, zIndex, opacity]);

  const handleDrop = useCallback((x: number, y: number) => {
    // Calculate which quadrant the task was dropped in
    // This is a simplified calculation - you might need to adjust based on your layout
    const screenWidth = width;
    const screenHeight = Dimensions.get('window').height;
    
    let targetQuadrant = '';
    
    if (x < screenWidth / 2 && y < screenHeight / 2) {
      targetQuadrant = 'urgent-important';
    } else if (x >= screenWidth / 2 && y < screenHeight / 2) {
      targetQuadrant = 'not-urgent-important';
    } else if (x < screenWidth / 2 && y >= screenHeight / 2) {
      targetQuadrant = 'urgent-not-important';
    } else {
      targetQuadrant = 'not-urgent-not-important';
    }

    if (onDrop && targetQuadrant !== task.quadrant) {
      onDrop(task.id, targetQuadrant);
    }
    
    resetPosition();
  }, [onDrop, task.id, task.quadrant, resetPosition]);

  // Vertical drag gesture for drag and drop (tidak mengganggu horizontal swipe)
  const verticalDragGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.1);
      zIndex.value = withTiming(1000);
      opacity.value = withTiming(0.8);
    })
    .onUpdate((event) => {
      // Hanya allow vertical movement untuk drag and drop
      if (Math.abs(event.translationY) > Math.abs(event.translationX)) {
        translateX.value = event.translationX * 0.3; // Reduced horizontal movement
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      // Only trigger drop if vertical movement is significant
      if (Math.abs(event.translationY) > 50) {
        const dropX = event.absoluteX;
        const dropY = event.absoluteY;
        runOnJS(handleDrop)(dropX, dropY);
      } else {
        resetPosition();
      }
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    opacity: opacity.value,
  }));

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
  };

  return (
    <GestureDetector gesture={Gesture.Simultaneous(verticalDragGesture, tapGesture)}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View
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
                  <Text
                    style={[
                      styles.metadataText,
                      dynamicStyles.metadataText,
                      isOverdue && styles.overdueText,
                      isCompleted && [styles.completedMetadataText, dynamicStyles.completedMetadataText],
                    ]}
                  >
                    📅 {task.dueDate.toLocaleDateString()}
                  </Text>
                )}
                {task.estimatedTime && (
                  <Text
                    style={[
                      styles.metadataText,
                      dynamicStyles.metadataText,
                      isCompleted && [styles.completedMetadataText, dynamicStyles.completedMetadataText],
                    ]}
                  >
                    ⏱️ {task.estimatedTime}m
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  card: {
    // backgroundColor will be set dynamically
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  completedCard: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  overdueCard: {
    borderLeftColor: '#EF4444',
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
    // color will be set dynamically
    flex: 1,
    marginRight: 8,
    lineHeight: 14,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    // color will be set dynamically
  },
  overdueTitle: {
    color: '#EF4444',
  },
  priorityBadge: {
    backgroundColor: '#F3F4F6',
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
    // color will be set dynamically
    marginBottom: 4,
    lineHeight: 14,
  },
  completedDescription: {
    // color will be set dynamically
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
    // color will be set dynamically
  },
  overdueText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  completedMetadataText: {
    // color will be set dynamically
  },
});

export default DraggableTaskCard;
