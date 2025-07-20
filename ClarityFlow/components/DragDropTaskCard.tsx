import React, { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Task } from '../types';
import CompactTaskCard from './CompactTaskCard';

const { width } = Dimensions.get('window');

interface DragDropTaskCardProps {
  task: Task;
  quadrantColor: string;
  onComplete: () => void;
  onDelete: () => void;
  onTaskUpdate?: (task: Task) => void;
  onDrop?: (taskId: string, targetQuadrant: string) => void;
  onPress?: () => void;
  isCompleted?: boolean;
  disabled?: boolean;
}

const DragDropTaskCard: React.FC<DragDropTaskCardProps> = ({
  task,
  quadrantColor,
  onComplete,
  onDelete,
  onTaskUpdate,
  onDrop,
  onPress,
  isCompleted = false,
  disabled = false,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isDragMode = useSharedValue(false);

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
    zIndex.value = withTiming(1);
    opacity.value = withTiming(1);
    isDragMode.value = false;
  }, [translateX, translateY, scale, zIndex, opacity, isDragMode]);

  const handleDrop = useCallback((x: number, y: number) => {
    console.log('HandleDrop called with coordinates:', { x, y });
    console.log('Screen dimensions:', { width, height: Dimensions.get('window').height });

    // Calculate which quadrant the task was dropped in
    // Adjust for matrix layout - matrix usually starts after header/navigation
    const screenWidth = width;
    const screenHeight = Dimensions.get('window').height;

    // Estimate matrix area (excluding header/navigation)
    const matrixStartY = screenHeight * 0.15; // Approximate header height
    const matrixHeight = screenHeight * 0.7;  // Matrix area height
    const matrixCenterY = matrixStartY + (matrixHeight / 2);

    let targetQuadrant = '';

    // More accurate quadrant detection based on matrix layout
    if (x < screenWidth / 2 && y < matrixCenterY) {
      targetQuadrant = 'urgent-important';        // Top Left
    } else if (x >= screenWidth / 2 && y < matrixCenterY) {
      targetQuadrant = 'not-urgent-important';    // Top Right
    } else if (x < screenWidth / 2 && y >= matrixCenterY) {
      targetQuadrant = 'urgent-not-important';    // Bottom Left
    } else {
      targetQuadrant = 'not-urgent-not-important'; // Bottom Right
    }

    console.log('Target quadrant:', targetQuadrant, 'Current quadrant:', task.quadrant);

    if (onDrop && targetQuadrant !== task.quadrant) {
      console.log('Calling onDrop with:', task.id, targetQuadrant);
      onDrop(task.id, targetQuadrant);
    } else {
      console.log('No drop action needed');
    }

    resetPosition();
  }, [onDrop, task.id, task.quadrant, resetPosition]);

  // Long press to enter drag mode
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      console.log('Long press started - entering drag mode');
      isDragMode.value = true;
      scale.value = withSpring(1.1);
      zIndex.value = withTiming(1000);
      opacity.value = withTiming(0.8);
    });

  // Pan gesture for dragging (only active after long press)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isDragMode.value) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        console.log('Dragging:', { x: event.translationX, y: event.translationY });
      }
    })
    .onEnd((event) => {
      if (isDragMode.value) {
        console.log('Drag ended:', { x: event.translationX, y: event.translationY, absoluteX: event.absoluteX, absoluteY: event.absoluteY });

        // Check if movement was significant enough for drop
        const totalMovement = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);

        if (totalMovement > 50) {
          const dropX = event.absoluteX;
          const dropY = event.absoluteY;
          console.log('Triggering drop at:', { dropX, dropY });
          runOnJS(handleDrop)(dropX, dropY);
        } else {
          console.log('Movement too small, resetting position');
          resetPosition();
        }

        isDragMode.value = false;
      }
    });

  // Combine gestures
  const combinedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <CompactTaskCard
          task={task}
          onComplete={onComplete}
          onDelete={onDelete}
          onTaskUpdate={onTaskUpdate}
          onPress={onPress}
          quadrantColor={quadrantColor}
          isCompleted={isCompleted}
          disabled={disabled}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
});

export default DragDropTaskCard;
