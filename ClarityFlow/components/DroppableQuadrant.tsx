import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EisenhowerQuadrant, Task } from '../types';
import { QUADRANT_CONFIG } from '../utils/constants';
import DraggableTaskCard from './DraggableTaskCard';

// Modern light theme colors - matching EisenhowerMatrix
const COLORS = {
  quadrants: {
    'urgent-important': {
      bg: '#fef2f2',
      border: '#ef4444',
    },
    'not-urgent-important': {
      bg: '#f0f9ff',
      border: '#3b82f6',
    },
    'urgent-not-important': {
      bg: '#fefce8',
      border: '#eab308',
    },
    'not-urgent-not-important': {
      bg: '#f0fdf4',
      border: '#22c55e',
    },
  },
};

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;

interface DroppableQuadrantProps {
  quadrant: EisenhowerQuadrant;
  tasks: Task[];
  isExpanded?: boolean;
  onPress?: () => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskDrop?: (taskId: string, targetQuadrant: string) => void;
  onTaskPress?: (task: Task) => void;
}

const DroppableQuadrant: React.FC<DroppableQuadrantProps> = ({
  quadrant,
  tasks,
  isExpanded,
  onPress,
  onTaskUpdate,
  onTaskDelete,
  onTaskDrop,
  onTaskPress,
}) => {
  const { colors: themeColors } = useTheme();
  const [isDropTarget, setIsDropTarget] = useState(false);
  const config = QUADRANT_CONFIG[quadrant];
  const colors = COLORS.quadrants[quadrant];
  const quadrantColor = colors.border;

  const handleTaskPress = (task: Task) => {
    if (onTaskPress) {
      onTaskPress(task);
    }
  };

  const handleTaskDrop = (taskId: string, targetQuadrant: string) => {
    if (onTaskDrop) {
      onTaskDrop(taskId, targetQuadrant);
    }
  };

  const quadrantStyle = [
    styles.quadrant,
    { backgroundColor: colors.bg },
    isDropTarget && styles.dropTarget,
  ];

  const titleStyle = { color: themeColors.text.primary };

  return (
    <TouchableOpacity
      style={quadrantStyle}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.quadrantHeader}>
        <Text style={[styles.quadrantIcon, { fontSize: isDesktop ? 24 : 18, marginRight: isDesktop ? 12 : 8 }]}>
          {config.icon}
        </Text>
        <View style={styles.quadrantTitleContainer}>
          <Text style={[styles.quadrantTitle, titleStyle, { fontSize: isDesktop ? 18 : 14 }]}>
            {config.title}
          </Text>
          <Text style={[styles.quadrantSubtitle, { fontSize: isDesktop ? 12 : 10, color: themeColors.text.primary }]}>
            {config.subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.quadrantContent}>
        {tasks.length > 0 ? (
          isExpanded ? (
            <ScrollView 
              style={styles.expandedTaskList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {tasks.map((task) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  quadrantColor={quadrantColor}
                  onDrop={handleTaskDrop}
                  onPress={() => handleTaskPress(task)}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.taskList}>
              {tasks.slice(0, isDesktop ? 3 : 2).map((task) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  quadrantColor={quadrantColor}
                  onDrop={handleTaskDrop}
                  onPress={() => handleTaskPress(task)}
                />
              ))}
              {tasks.length > (isDesktop ? 3 : 2) && (
                <Text style={styles.moreTasksText}>
                  +{tasks.length - (isDesktop ? 3 : 2)} more tasks
                </Text>
              )}
            </View>
          )
        ) : (
          <Text style={styles.noTasksText}>No tasks here yet</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  quadrant: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    minHeight: isDesktop ? 300 : 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropTarget: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
  taskList: {
    flex: 1,
  },
  expandedTaskList: {
    flex: 1,
    maxHeight: isDesktop ? 400 : 300,
  },
  moreTasksText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noTasksText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});

export default DroppableQuadrant;
