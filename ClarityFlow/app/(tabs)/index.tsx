import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EisenhowerMatrix from '../../components/EisenhowerMatrix';
import GestureTooltip from '../../components/GestureTooltip';
import InteractionGuard from '../../components/InteractionGuard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ReadOnlyEisenhowerMatrix from '../../components/ReadOnlyEisenhowerMatrix';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import { Task } from '../../types';

export default function HomeScreen() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGestureTooltip, setShowGestureTooltip] = useState(false);
  const [hideTooltipsPermanently, setHideTooltipsPermanently] = useState(false);

  // Load tooltip preference
  useEffect(() => {
    const loadTooltipPreference = async () => {
      try {
        // For now, use localStorage for web compatibility
        if (typeof window !== 'undefined' && window.localStorage) {
          const hideTooltips = localStorage.getItem('hideGestureTooltips');
          if (hideTooltips === 'true') {
            setHideTooltipsPermanently(true);
          }
        }
      } catch (error) {
        console.log('Error loading tooltip preference:', error);
      }
    };
    loadTooltipPreference();
  }, []);

  // Handle hide tooltips permanently
  const handleHideTooltipsPermanently = async () => {
    try {
      // For now, use localStorage for web compatibility
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('hideGestureTooltips', 'true');
      }
      setHideTooltipsPermanently(true);
      setShowGestureTooltip(false);
    } catch (error) {
      console.log('Error saving tooltip preference:', error);
    }
  };

  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Complete project proposal',
      description: 'Finish the quarterly project proposal for client review',
      priority: 'high',
      quadrant: 'urgent-important',
      completed: false,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Plan team meeting',
      description: 'Schedule and prepare agenda for next week team meeting',
      priority: 'medium',
      quadrant: 'not-urgent-important',
      completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Reply to emails',
      description: 'Respond to pending emails in inbox',
      priority: 'medium',
      quadrant: 'urgent-not-important',
      completed: false,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      title: 'Organize desk',
      description: 'Clean and organize workspace for better productivity',
      priority: 'low',
      quadrant: 'not-urgent-not-important',
      completed: false,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const loadTasks = async () => {
    if (!user) {
      setTasks(sampleTasks);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userTasks = await taskService.getTasks(user.uid);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  // Auto-refresh tasks ketika screen difokuskan (misalnya setelah kembali dari add-task)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadTasks();
      }
    }, [user])
  );

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      if (user) {
        await taskService.updateTask(updatedTask.id, updatedTask, user.uid);
      } else {
        await taskService.updateTask(updatedTask.id, updatedTask);
      }
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!user) return; // Tidak bisa delete task jika belum login

    try {
      await taskService.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const handleTaskDrop = async (taskId: string, targetQuadrant: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        quadrant: targetQuadrant as Task['quadrant'],
        updatedAt: new Date()
      };

      await handleTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error moving task:', error);
      Alert.alert('Error', 'Failed to move task');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {user ? (
          // User sudah login - tampilkan matrix normal
          <EisenhowerMatrix
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskDrop={handleTaskDrop}
            onAddTask={() => {}}
            onTaskPress={() => {}}
          />
        ) : (
          // User belum login - tampilkan read-only matrix dengan InteractionGuard
          <InteractionGuard>
            <ReadOnlyEisenhowerMatrix />
          </InteractionGuard>
        )}
      </ScrollView>

      {/* Floating Help Button - Only show on Matrix page and if not hidden */}
      {!hideTooltipsPermanently && (
        <TouchableOpacity
          style={styles.floatingHelpButton}
          onPress={() => setShowGestureTooltip(true)}
          activeOpacity={0.8}
        >
          <IconSymbol name="questionmark.circle" size={16} color="#3B82F6" />
        </TouchableOpacity>
      )}

      {/* Gesture Tooltip Modal */}
      <GestureTooltip
        visible={showGestureTooltip}
        onClose={() => setShowGestureTooltip(false)}
        onHidePermanently={handleHideTooltipsPermanently}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0, // Remove extra space below matrix
  },
  floatingHelpButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 24, // Much smaller, just for icon
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    // No background, border, or shadow - just the icon
  },
});
