import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Task } from '../types';


const { width, height } = Dimensions.get('window');
const isDesktop = width > 1024;

interface TaskDetailModalProps {
  task: Task;
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onTaskUpdate?: (task: Task) => void;
  quadrantColor: string;
  isCompleted?: boolean;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  visible,
  onClose,
  onComplete,
  onDelete,
  onTaskUpdate,
  quadrantColor,
  isCompleted = false,
}) => {
  const slideY = useSharedValue(height);

  // State for editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<Task>(task);

  // Update editedTask when task prop changes
  React.useEffect(() => {
    setEditedTask(task);
  }, [task]);

  // Handle field save
  const handleSaveField = (field: string, value: string) => {
    const updatedTask = { ...editedTask, [field]: value, updatedAt: new Date() };
    setEditedTask(updatedTask);
    setEditingField(null);
    if (onTaskUpdate) {
      onTaskUpdate(updatedTask);
    }
  };

  // Get status based on quadrant and completion
  const getTaskStatus = () => {
    if (isCompleted) return 'Completed';

    switch (task.quadrant) {
      case 'urgent-important':
        return 'Critical - Do First';
      case 'not-urgent-important':
        return 'Important - Schedule';
      case 'urgent-not-important':
        return 'Urgent - Delegate';
      case 'not-urgent-not-important':
        return 'Low Priority - Eliminate';
      default:
        return 'Pending';
    }
  };

  // Get priority config based on quadrant
  const getQuadrantPriorityConfig = () => {
    switch (task.quadrant) {
      case 'urgent-important':
        return {
          icon: '🔥',
          label: 'Critical',
          color: '#ef4444', // Red
        };
      case 'not-urgent-important':
        return {
          icon: '⭐',
          label: 'Important',
          color: '#3b82f6', // Blue
        };
      case 'urgent-not-important':
        return {
          icon: '⚡',
          label: 'Urgent',
          color: '#f59e0b', // Orange
        };
      case 'not-urgent-not-important':
        return {
          icon: '📋',
          label: 'Low',
          color: '#6b7280', // Gray
        };
      default:
        return {
          icon: '📋',
          label: 'Pending',
          color: '#6b7280',
        };
    }
  };

  // Editable field component
  const EditableField: React.FC<{
    field: string;
    value: string;
    label?: string;
    multiline?: boolean;
    showLabel?: boolean;
    isTitle?: boolean;
  }> = ({ field, value, label, multiline = false, showLabel = true, isTitle = false }) => {
    const isEditing = editingField === field;
    const [tempValue, setTempValue] = useState(value);

    React.useEffect(() => {
      setTempValue(value);
    }, [value]);

    if (isEditing) {
      return (
        <View style={styles.editableFieldContainer}>
          {showLabel && label && <Text style={styles.metadataLabel}>{label}:</Text>}
          <View style={styles.editingContainer}>
            <TextInput
              style={[
                styles.editInput,
                multiline && styles.editInputMultiline,
                isTitle && styles.editInputTitle
              ]}
              value={tempValue}
              onChangeText={setTempValue}
              onBlur={() => {
                handleSaveField(field, tempValue);
              }}
              onSubmitEditing={() => {
                if (!multiline) {
                  handleSaveField(field, tempValue);
                }
              }}
              multiline={multiline}
              autoFocus
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.editableFieldContainer}>
        {showLabel && label && <Text style={styles.metadataLabel}>{label}:</Text>}
        <View style={styles.fieldValueContainer}>
          <Text style={[
            styles.metadataValue,
            isTitle && styles.titleText
          ]}>{value}</Text>
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => setEditingField(field)}
          >
            <Text style={styles.editIconText}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  React.useEffect(() => {
    if (visible) {
      slideY.value = withSpring(0, { damping: 20, stiffness: 100 });
    } else {
      slideY.value = withTiming(height, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideY.value }],
    };
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
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;



  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleSection}>
                <EditableField
                  field="title"
                  value={editedTask.title}
                  showLabel={false}
                  isTitle={true}
                />

                <View style={styles.headerActions}>
                  <View style={[
                    styles.priorityBadge,
                    {
                      borderColor: getQuadrantPriorityConfig().color,
                      backgroundColor: `${getQuadrantPriorityConfig().color}20` // 20% opacity
                    }
                  ]}>
                    <Text style={styles.priorityIcon}>{getQuadrantPriorityConfig().icon}</Text>
                    <Text style={[
                      styles.priorityText,
                      { color: getQuadrantPriorityConfig().color }
                    ]}>{getQuadrantPriorityConfig().label}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Description */}
            {editedTask.description && editedTask.description.trim() !== '' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Description</Text>
                <EditableField
                  field="description"
                  value={editedTask.description}
                  multiline={true}
                  showLabel={false}
                />
              </View>
            )}

            {/* Metadata */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Details</Text>
              
              {task.dueDate && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Due Date:</Text>
                  <Text style={[
                    styles.metadataValue,
                    isOverdue && styles.overdueText,
                  ]}>
                    {formatDueDate(task.dueDate)}
                  </Text>
                </View>
              )}
              
              {task.estimatedTime && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Estimated Time:</Text>
                  <Text style={styles.metadataValue}>
                    {formatTime(task.estimatedTime)}
                  </Text>
                </View>
              )}

              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Priority:</Text>
                <Text style={[
                  styles.metadataValue,
                  { color: getQuadrantPriorityConfig().color }
                ]}>
                  {getQuadrantPriorityConfig().icon} {getQuadrantPriorityConfig().label}
                </Text>
              </View>

              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Status:</Text>
                <Text style={[
                  styles.metadataValue,
                  isCompleted ? styles.completedText : styles.pendingText
                ]}>
                  {getTaskStatus()}
                </Text>
              </View>
            </View>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏷️ Tags</Text>
                <View style={styles.tagsContainer}>
                  {task.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* AI Suggestion */}
            {task.aiSuggestion &&
             task.aiSuggestion.reasoning &&
             task.aiSuggestion.reasoning.trim() !== '' &&
             task.aiSuggestion.reasoning !== editedTask.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🤖 AI Insight</Text>
                <Text style={styles.aiSuggestionText}>
                  {task.aiSuggestion.reasoning}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.completeButton,
                  isCompleted && styles.completedButton,
                ]}
                onPress={() => {
                  onComplete();
                  onClose();
                }}
              >
                <Text style={[
                  styles.actionButtonText,
                  isCompleted && styles.completedButtonText,
                ]}>
                  {isCompleted ? '✓ Completed' : '○ Mark Complete'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  onDelete();
                  onClose();
                }}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete Task</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    minHeight: height * 0.4,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: isDesktop ? 24 : 20,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: isDesktop ? 32 : 28,
    marginRight: 16,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.6)',
  },
  overdueTitle: {
    color: '#ef4444',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  priorityIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: isDesktop ? 16 : 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  description: {
    fontSize: isDesktop ? 16 : 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: isDesktop ? 24 : 20,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: isDesktop ? 14 : 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: isDesktop ? 14 : 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  overdueText: {
    color: '#ef4444',
  },
  completedText: {
    color: '#22c55e',
  },
  pendingText: {
    color: '#f59e0b',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(147, 197, 253, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#93c5fd',
    fontWeight: '500',
  },
  aiSuggestionText: {
    fontSize: isDesktop ? 14 : 12,
    color: 'rgba(147, 197, 253, 0.9)',
    lineHeight: isDesktop ? 20 : 18,
    fontStyle: 'italic',
  },
  actionsSection: {
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  completedButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: 'rgba(34, 197, 94, 0.6)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  actionButtonText: {
    fontSize: isDesktop ? 14 : 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  completedButtonText: {
    color: '#ffffff',
  },
  deleteButtonText: {
    fontSize: isDesktop ? 14 : 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Editable field styles
  editableFieldContainer: {
    marginBottom: 12,
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editIcon: {
    padding: 4,
    marginLeft: 8,
  },
  editIconText: {
    fontSize: 14,
    color: '#6B7280',
  },
  editingContainer: {
    marginTop: 4,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  editInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editInputTitle: {
    fontSize: isDesktop ? 24 : 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  titleText: {
    fontSize: isDesktop ? 24 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },

});

export default TaskDetailModal;