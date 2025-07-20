import AsyncStorage from '@react-native-async-storage/async-storage';
import { EisenhowerQuadrant, Task } from '../types';

class TaskService {
  private readonly TASKS_KEY = 'clarityflow_tasks';

  async getTasks(userId: string): Promise<Task[]> {
    try {
      const tasks = await AsyncStorage.getItem(`${this.TASKS_KEY}_${userId}`);
      if (tasks) {
        const parsedTasks = JSON.parse(tasks);
        return parsedTasks.map((task: any) => ({
          ...task,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  async saveTask(task: Task, userId: string): Promise<void> {
    try {
      const tasks = await this.getTasks(userId);
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        tasks[existingIndex] = { ...task, updatedAt: new Date() };
      } else {
        tasks.push({ ...task, createdAt: new Date(), updatedAt: new Date() });
      }
      
      await AsyncStorage.setItem(`${this.TASKS_KEY}_${userId}`, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string, userId?: string): Promise<void> {
    try {
      if (!userId) {
        // If no userId provided, try to get from all stored tasks
        const allKeys = await AsyncStorage.getAllKeys();
        const taskKeys = allKeys.filter(key => key.startsWith(this.TASKS_KEY));
        
        for (const key of taskKeys) {
          const tasksData = await AsyncStorage.getItem(key);
          if (tasksData) {
            const tasks = JSON.parse(tasksData);
            const filteredTasks = tasks.filter((task: Task) => task.id !== taskId);
            if (filteredTasks.length !== tasks.length) {
              await AsyncStorage.setItem(key, JSON.stringify(filteredTasks));
              return;
            }
          }
        }
      } else {
        const tasks = await this.getTasks(userId);
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        await AsyncStorage.setItem(`${this.TASKS_KEY}_${userId}`, JSON.stringify(filteredTasks));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async toggleTaskCompletion(taskId: string, userId?: string): Promise<void> {
    try {
      let completedTask: Task | null = null;
      let actualUserId: string | null = null;

      if (!userId) {
        // If no userId provided, try to get from all stored tasks
        const allKeys = await AsyncStorage.getAllKeys();
        const taskKeys = allKeys.filter(key => key.startsWith(this.TASKS_KEY));

        for (const key of taskKeys) {
          const tasksData = await AsyncStorage.getItem(key);
          if (tasksData) {
            const tasks = JSON.parse(tasksData);
            const taskIndex = tasks.findIndex((task: Task) => task.id === taskId);
            if (taskIndex >= 0) {
              const wasCompleted = tasks[taskIndex].completed;
              tasks[taskIndex] = {
                ...tasks[taskIndex],
                completed: !tasks[taskIndex].completed,
                updatedAt: new Date()
              };

              // Store task and userId for achievement processing
              if (!wasCompleted && tasks[taskIndex].completed) {
                completedTask = tasks[taskIndex];
                actualUserId = key.replace(`${this.TASKS_KEY}_`, '');
              }

              await AsyncStorage.setItem(key, JSON.stringify(tasks));
              break;
            }
          }
        }
      } else {
        const tasks = await this.getTasks(userId);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex >= 0) {
          const wasCompleted = tasks[taskIndex].completed;
          tasks[taskIndex] = {
            ...tasks[taskIndex],
            completed: !tasks[taskIndex].completed,
            updatedAt: new Date()
          };

          // Store task and userId for achievement processing
          if (!wasCompleted && tasks[taskIndex].completed) {
            completedTask = tasks[taskIndex];
            actualUserId = userId;
          }

          await AsyncStorage.setItem(`${this.TASKS_KEY}_${userId}`, JSON.stringify(tasks));
        }
      }

      // Process achievements if task was completed
      if (completedTask && actualUserId) {
        try {
          const { ENV_CONFIG } = await import('../config/env');
          if (ENV_CONFIG.ENABLE_NOTIFICATIONS) {
            const AchievementService = (await import('./achievementService')).default;
            const achievements = await AchievementService.processTaskCompletion(actualUserId, completedTask);

            if (achievements.length > 0) {
              console.log(`🏆 ${achievements.length} new achievement(s) unlocked for task completion!`);
            }
          }
        } catch (error) {
          console.error('Failed to process achievements for task completion:', error);
          // Don't fail the task completion if achievement processing fails
        }
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updatedTask: Task, userId?: string): Promise<void> {
    try {
      let completedTask: Task | null = null;
      let actualUserId: string | null = null;

      if (!userId) {
        // If no userId provided, try to get from all stored tasks
        const allKeys = await AsyncStorage.getAllKeys();
        const taskKeys = allKeys.filter(key => key.startsWith(this.TASKS_KEY));

        for (const key of taskKeys) {
          const tasksData = await AsyncStorage.getItem(key);
          if (tasksData) {
            const tasks = JSON.parse(tasksData);
            const taskIndex = tasks.findIndex((task: Task) => task.id === taskId);
            if (taskIndex >= 0) {
              const wasCompleted = tasks[taskIndex].completed;
              const updatedTaskWithTimestamp = { ...updatedTask, updatedAt: new Date() };
              tasks[taskIndex] = updatedTaskWithTimestamp;

              // Check if task was just completed
              if (!wasCompleted && updatedTask.completed) {
                completedTask = updatedTaskWithTimestamp;
                actualUserId = key.replace(`${this.TASKS_KEY}_`, '');
              }

              await AsyncStorage.setItem(key, JSON.stringify(tasks));
              break;
            }
          }
        }
      } else {
        const tasks = await this.getTasks(userId);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex >= 0) {
          const wasCompleted = tasks[taskIndex].completed;
          const updatedTaskWithTimestamp = { ...updatedTask, updatedAt: new Date() };
          tasks[taskIndex] = updatedTaskWithTimestamp;

          // Check if task was just completed
          if (!wasCompleted && updatedTask.completed) {
            completedTask = updatedTaskWithTimestamp;
            actualUserId = userId;
          }

          await AsyncStorage.setItem(`${this.TASKS_KEY}_${userId}`, JSON.stringify(tasks));
        }
      }

      // Process achievements if task was completed
      if (completedTask && actualUserId) {
        try {
          const { ENV_CONFIG } = await import('../config/env');
          if (ENV_CONFIG.ENABLE_NOTIFICATIONS) {
            const AchievementService = (await import('./achievementService')).default;
            const achievements = await AchievementService.processTaskCompletion(actualUserId, completedTask);

            if (achievements.length > 0) {
              console.log(`🏆 ${achievements.length} new achievement(s) unlocked for task completion!`);
            }
          }
        } catch (error) {
          console.error('Failed to process achievements for task completion:', error);
          // Don't fail the task update if achievement processing fails
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async getTasksByQuadrant(quadrant: EisenhowerQuadrant, userId: string): Promise<Task[]> {
    try {
      const tasks = await this.getTasks(userId);
      return tasks.filter(task => task.quadrant === quadrant && !task.completed);
    } catch (error) {
      console.error('Error getting tasks by quadrant:', error);
      return [];
    }
  }

  async getCompletedTasks(userId: string): Promise<Task[]> {
    try {
      const tasks = await this.getTasks(userId);
      return tasks.filter(task => task.completed);
    } catch (error) {
      console.error('Error getting completed tasks:', error);
      return [];
    }
  }

  async clearAllTasks(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.TASKS_KEY}_${userId}`);
    } catch (error) {
      console.error('Error clearing tasks:', error);
      throw error;
    }
  }
}

export const taskService = new TaskService();