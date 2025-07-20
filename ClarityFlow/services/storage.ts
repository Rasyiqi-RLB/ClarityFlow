import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackupData, ProductivityStats, Project, Task, User } from '../types';

const STORAGE_KEYS = {
  TASKS: 'clarityflow_tasks',
  PROJECTS: 'clarityflow_projects',
  USER: 'clarityflow_user',
  STATS: 'clarityflow_stats',
  SETTINGS: 'clarityflow_settings',
  BACKUP_DATA: 'clarityflow_backup_data',
};

export class StorageService {
  // Initialize service
  static async initialize(): Promise<void> {
    try {
      // Check if AsyncStorage is available and working
      await AsyncStorage.getItem('test');
      console.log('StorageService initialized successfully');
    } catch (error) {
      console.error('Error initializing StorageService:', error);
      throw error;
    }
  }

  // Validation helpers
  private static validateTask(task: any): task is Task {
    return (
      task &&
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      typeof task.quadrant === 'string' &&
      (task.createdAt === undefined || !isNaN(new Date(task.createdAt).getTime())) &&
      (task.updatedAt === undefined || !isNaN(new Date(task.updatedAt).getTime())) &&
      (task.dueDate === undefined || task.dueDate === null || !isNaN(new Date(task.dueDate).getTime()))
    );
  }

  private static validateProject(project: any): project is Project {
    return (
      project &&
      typeof project.id === 'string' &&
      typeof project.name === 'string' &&
      (project.createdAt === undefined || !isNaN(new Date(project.createdAt).getTime())) &&
      (project.updatedAt === undefined || !isNaN(new Date(project.updatedAt).getTime()))
    );
  }

  private static validateUser(user: any): user is User {
    return (
      user &&
      typeof user.id === 'string' &&
      typeof user.name === 'string' &&
      (user.createdAt === undefined || !isNaN(new Date(user.createdAt).getTime())) &&
      (user.updatedAt === undefined || !isNaN(new Date(user.updatedAt).getTime()))
    );
  }

  private static safeJsonParse<T>(jsonString: string, validator?: (data: any) => data is T): T | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (validator && !validator(parsed)) {
        console.warn('Data validation failed for parsed JSON');
        return null;
      }
      return parsed;
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return null;
    }
  }

  // Task Management
  static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  static async getTasks(userId?: string): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (tasksJson) {
        const rawTasks = this.safeJsonParse(tasksJson);

        if (!rawTasks || !Array.isArray(rawTasks)) {
          console.warn('Invalid tasks data format, returning empty array');
          return [];
        }

        // Validate and convert tasks
        const validTasks = rawTasks
          .filter(this.validateTask)
          .map((task: any) => ({
            ...task,
            createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
            updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            reminders: task.reminders?.map((reminder: any) => ({
              ...reminder,
              time: new Date(reminder.time),
            })),
          }));

        // Log if some tasks were filtered out
        if (validTasks.length !== rawTasks.length) {
          console.warn(`Filtered out ${rawTasks.length - validTasks.length} invalid tasks`);
        }

        // Filter by userId if provided
        return userId ? validTasks.filter((task: Task) => task.userId === userId) : validTasks;
      }
      return [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw new Error(`Failed to load tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async addTask(task: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      tasks.push(task);
      await this.saveTasks(tasks);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  static async updateTask(updatedTask: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const index = tasks.findIndex(task => task.id === updatedTask.id);
      if (index !== -1) {
        tasks[index] = { ...updatedTask, updatedAt: new Date() };
        await this.saveTasks(tasks);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      await this.saveTasks(filteredTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Project Management
  static async saveProjects(projects: Project[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
      throw error;
    }
  }

  static async getProjects(): Promise<Project[]> {
    try {
      const projectsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (projectsJson) {
        const rawProjects = this.safeJsonParse(projectsJson);

        if (!rawProjects || !Array.isArray(rawProjects)) {
          console.warn('Invalid projects data format, returning empty array');
          return [];
        }

        // Validate and convert projects
        const validProjects = rawProjects
          .filter(this.validateProject)
          .map((project: any) => ({
            ...project,
            createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
            updatedAt: project.updatedAt ? new Date(project.updatedAt) : new Date(),
          }));

        // Log if some projects were filtered out
        if (validProjects.length !== rawProjects.length) {
          console.warn(`Filtered out ${rawProjects.length - validProjects.length} invalid projects`);
        }

        return validProjects;
      }
      return [];
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error(`Failed to load projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // User Management
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (userJson) {
        const user = JSON.parse(userJson);
        return {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Stats Management
  static async saveStats(stats: ProductivityStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving stats:', error);
      throw error;
    }
  }

  static async getStats(): Promise<ProductivityStats | null> {
    try {
      const statsJson = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      if (statsJson) {
        return JSON.parse(statsJson);
      }
      return null;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  // Backup Management
  static async createBackup(): Promise<BackupData> {
    try {
      const [tasks, projects, user, stats] = await Promise.all([
        this.getTasks(),
        this.getProjects(),
        this.getUser(),
        this.getStats(),
      ]);

      const backupData: BackupData = {
        tasks,
        projects,
        user: user || {} as User,
        stats: stats || {} as ProductivityStats,
        version: '1.0.0',
        timestamp: new Date(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_DATA, JSON.stringify(backupData));
      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  static async restoreBackup(backupData: BackupData): Promise<void> {
    try {
      await Promise.all([
        this.saveTasks(backupData.tasks),
        this.saveProjects(backupData.projects),
        this.saveUser(backupData.user),
        this.saveStats(backupData.stats),
      ]);
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  static async getBackupData(): Promise<BackupData | null> {
    try {
      const backupJson = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_DATA);
      if (backupJson) {
        const backup = JSON.parse(backupJson);
        return {
          ...backup,
          timestamp: new Date(backup.timestamp),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting backup data:', error);
      return null;
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      // Get all keys to remove
      const keysToRemove = Object.values(STORAGE_KEYS);

      // For web compatibility, remove each key individually
      for (const key of keysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
          console.log(`Removed storage key: ${key}`);
        } catch (keyError) {
          console.warn(`Failed to remove key ${key}:`, keyError);
        }
      }

      // Also clear any other ClarityFlow related keys that might exist
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const clarityFlowKeys = allKeys.filter(key => key.startsWith('clarityflow_'));

        for (const key of clarityFlowKeys) {
          if (!keysToRemove.includes(key)) {
            await AsyncStorage.removeItem(key);
            console.log(`Removed additional storage key: ${key}`);
          }
        }
      } catch (getAllKeysError) {
        console.warn('Could not get all keys for cleanup:', getAllKeysError);
      }

      console.log('All ClarityFlow data cleared successfully');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Get storage size
  static async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error getting storage size:', error);
      return 0;
    }
  }
}