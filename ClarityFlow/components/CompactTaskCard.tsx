import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { Task } from '../types';
import { PRIORITY_CONFIG } from '../utils/constants';
import TaskDetailModal from './TaskDetailModal';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;

interface CompactTaskCardProps {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onTaskUpdate?: (task: Task) => void;
  onPress?: () => void;
  quadrantColor: string;
  isCompleted?: boolean;
  disabled?: boolean;
}

const CompactTaskCard: React.FC<CompactTaskCardProps> = ({
  task,
  onComplete,
  onDelete,
  onTaskUpdate,
  onPress,
  quadrantColor,
  isCompleted = false,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  // Animation values
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const SWIPE_THRESHOLD = width * 0.25;

  const handleTaskPress = () => {
    if (disabled) return;
    if (onPress) {
      onPress();
    }
    setModalVisible(true);
  };

  // Pan gesture for swipe actions
  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(0.98);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const shouldComplete = event.translationX > SWIPE_THRESHOLD;
      const shouldDelete = event.translationX < -SWIPE_THRESHOLD;

      if (shouldComplete && !disabled) {
        runOnJS(onComplete)();
      } else if (shouldDelete && !disabled) {
        runOnJS(onDelete)();
      }

      translateX.value = withSpring(0);
      scale.value = withSpring(1);
    });

  // Tap gesture for opening modal
  const tapGesture = Gesture.Tap()
    .onStart(() => {
      scale.value = withTiming(0.98, { duration: 150 });
    })
    .onEnd(() => {
      scale.value = withTiming(1, { duration: 150 });
      runOnJS(handleTaskPress)();
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

    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else {
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <>
      <View style={styles.container}>
        {/* Background action indicators */}
        <View style={styles.actionContainer}>
          <Animated.View style={[styles.leftAction, actionTextStyle]}>
            <Text style={styles.actionText}>🗑️</Text>
          </Animated.View>
          <Animated.View style={[styles.rightAction, actionTextStyle]}>
            <Text style={styles.actionText}>✅</Text>
          </Animated.View>
        </View>

        {/* Main card */}
        <GestureDetector gesture={Gesture.Simultaneous(panGesture, tapGesture)}>
          <Animated.View style={cardAnimatedStyle}>
            <Animated.View 
              style={[styles.card, { borderLeftColor: quadrantColor }]}
            >
              <View style={styles.content}>
                <Text style={[
                  styles.title,
                  isCompleted && styles.completedTitle,
                  isOverdue && styles.overdueTitle,
                ]} numberOfLines={2}>
                  {task.title}
                </Text>
              </View>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={task}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onComplete={onComplete}
        onDelete={onDelete}
        onTaskUpdate={onTaskUpdate}
        quadrantColor={quadrantColor}
        isCompleted={isCompleted}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 6,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 16,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  overdueTitle: {
    color: '#EF4444',
  },
});

export default CompactTaskCard;