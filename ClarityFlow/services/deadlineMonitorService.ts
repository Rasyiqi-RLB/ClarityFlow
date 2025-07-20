import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';
import NotificationService from './notificationService';

export interface DeadlineMonitorSettings {
  enabled: boolean;
  checkInterval: number; // in minutes
  lastCheck: string | null;
  monitoringActive: boolean;
}

class DeadlineMonitorService {
  private static instance: DeadlineMonitorService;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly SETTINGS_KEY = 'deadline_monitor_settings';
  private readonly TASKS_KEY = 'clarityflow_tasks';
  
  private defaultSettings: DeadlineMonitorSettings = {
    enabled: true,
    checkInterval: 60, // Check every hour
    lastCheck: null,
    monitoringActive: false
  };

  public static getInstance(): DeadlineMonitorService {
    if (!DeadlineMonitorService.instance) {
      DeadlineMonitorService.instance = new DeadlineMonitorService();
    }
    return DeadlineMonitorService.instance;
  }

  constructor() {
    // No need to initialize TaskService, we'll use direct AsyncStorage access
  }

  // Initialize the deadline monitoring service
  async initialize(): Promise<void> {
    try {
      console.log('🔍 Initializing deadline monitor service...');
      
      const settings = await this.getSettings();
      if (settings.enabled) {
        await this.startMonitoring();
      }
      
      console.log('🔍 Deadline monitor service initialized');
    } catch (error) {
      console.error('Failed to initialize deadline monitor service:', error);
    }
  }

  // Get monitoring settings
  async getSettings(): Promise<DeadlineMonitorSettings> {
    try {
      const settings = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (settings) {
        return { ...this.defaultSettings, ...JSON.parse(settings) };
      }
      return this.defaultSettings;
    } catch (error) {
      console.error('Failed to get deadline monitor settings:', error);
      return this.defaultSettings;
    }
  }

  // Update monitoring settings
  async updateSettings(settings: Partial<DeadlineMonitorSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
      
      // Restart monitoring if settings changed
      if (settings.enabled !== undefined || settings.checkInterval !== undefined) {
        await this.stopMonitoring();
        if (newSettings.enabled) {
          await this.startMonitoring();
        }
      }
    } catch (error) {
      console.error('Failed to update deadline monitor settings:', error);
    }
  }

  // Start background monitoring
  async startMonitoring(): Promise<void> {
    try {
      const settings = await this.getSettings();
      
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      // Initial check
      await this.checkUpcomingDeadlines();

      // Set up periodic checking
      this.intervalId = setInterval(async () => {
        await this.checkUpcomingDeadlines();
      }, settings.checkInterval * 60 * 1000); // Convert minutes to milliseconds

      // Update monitoring status
      await this.updateSettings({ 
        monitoringActive: true,
        lastCheck: new Date().toISOString()
      });

      console.log(`🔍 Deadline monitoring started (checking every ${settings.checkInterval} minutes)`);
    } catch (error) {
      console.error('Failed to start deadline monitoring:', error);
    }
  }

  // Stop background monitoring
  async stopMonitoring(): Promise<void> {
    try {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      await this.updateSettings({ monitoringActive: false });
      console.log('🔍 Deadline monitoring stopped');
    } catch (error) {
      console.error('Failed to stop deadline monitoring:', error);
    }
  }

  // Check for upcoming deadlines and schedule notifications
  async checkUpcomingDeadlines(): Promise<void> {
    try {
      console.log('🔍 Checking upcoming deadlines...');
      
      // Get all users' tasks (in a real app, you'd get current user)
      // For now, we'll check a default user or all stored tasks
      const userIds = await this.getAllUserIds();
      
      for (const userId of userIds) {
        await this.checkUserDeadlines(userId);
      }

      // Update last check time
      await this.updateSettings({ lastCheck: new Date().toISOString() });
      
      console.log('🔍 Deadline check completed');
    } catch (error) {
      console.error('Failed to check upcoming deadlines:', error);
    }
  }

  // Get tasks for a specific user
  private async getTasks(userId: string): Promise<Task[]> {
    try {
      const tasksData = await AsyncStorage.getItem(`${this.TASKS_KEY}_${userId}`);
      if (tasksData) {
        return JSON.parse(tasksData).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  // Check deadlines for a specific user
  private async checkUserDeadlines(userId: string): Promise<void> {
    try {
      const tasks = await this.getTasks(userId);
      const now = new Date();

      for (const task of tasks) {
        if (task.completed || !task.dueDate) {
          continue;
        }

        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // Check if we need to send notifications
        await this.checkTaskNotifications(task, daysDiff);
      }
    } catch (error) {
      console.error(`Failed to check deadlines for user ${userId}:`, error);
    }
  }

  // Check if task needs notifications
  private async checkTaskNotifications(task: Task, daysDiff: number): Promise<void> {
    try {
      const notificationSettings = await NotificationService.getSettings();
      
      // Check for deadline alerts
      if (notificationSettings.deadlineAlerts) {
        let shouldAlert = false;
        
        switch (notificationSettings.frequency.deadlineAlerts) {
          case '1day':
            shouldAlert = daysDiff <= 1 && daysDiff > 0;
            break;
          case '3days':
            shouldAlert = daysDiff <= 3 && daysDiff > 0;
            break;
          case '1week':
            shouldAlert = daysDiff <= 7 && daysDiff > 0;
            break;
        }

        if (shouldAlert) {
          await this.sendUrgentDeadlineAlert(task, daysDiff);
        }
      }

      // Check for overdue tasks
      if (daysDiff < 0) {
        await this.sendOverdueAlert(task, Math.abs(daysDiff));
      }
    } catch (error) {
      console.error('Failed to check task notifications:', error);
    }
  }

  // Send urgent deadline alert
  private async sendUrgentDeadlineAlert(task: Task, daysDiff: number): Promise<void> {
    try {
      const urgencyLevel = daysDiff <= 1 ? 'urgent' : 'warning';
      const title = daysDiff <= 1 ? '🚨 Urgent Deadline!' : '⚠️ Deadline Approaching';
      const timeText = daysDiff === 1 ? 'tomorrow' : `in ${daysDiff} days`;
      
      await NotificationService.scheduleNotification({
        id: `urgent_deadline_${task.id}_${Date.now()}`,
        type: 'deadline_alert',
        title,
        body: `"${task.title}" is due ${timeText}!`,
        data: {
          taskId: task.id,
          urgency: urgencyLevel,
          daysLeft: daysDiff
        }
      });

      console.log(`🚨 Urgent deadline alert sent for task: ${task.title} (${daysDiff} days left)`);
    } catch (error) {
      console.error('Failed to send urgent deadline alert:', error);
    }
  }

  // Send overdue alert
  private async sendOverdueAlert(task: Task, daysOverdue: number): Promise<void> {
    try {
      await NotificationService.scheduleNotification({
        id: `overdue_${task.id}_${Date.now()}`,
        type: 'deadline_alert',
        title: '🔴 Task Overdue!',
        body: `"${task.title}" was due ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago`,
        data: {
          taskId: task.id,
          urgency: 'overdue',
          daysOverdue
        }
      });

      console.log(`🔴 Overdue alert sent for task: ${task.title} (${daysOverdue} days overdue)`);
    } catch (error) {
      console.error('Failed to send overdue alert:', error);
    }
  }

  // Get all user IDs (simplified for demo)
  private async getAllUserIds(): Promise<string[]> {
    try {
      // In a real app, you'd get this from your user management system
      // For now, we'll try to get from stored tasks
      const keys = await AsyncStorage.getAllKeys();
      const taskKeys = keys.filter(key => key.startsWith('clarityflow_tasks_'));
      return taskKeys.map(key => key.replace('clarityflow_tasks_', ''));
    } catch (error) {
      console.error('Failed to get user IDs:', error);
      return [];
    }
  }

  // Get monitoring status
  async getMonitoringStatus(): Promise<{
    isActive: boolean;
    lastCheck: string | null;
    nextCheck: string | null;
    settings: DeadlineMonitorSettings;
  }> {
    try {
      const settings = await this.getSettings();
      const nextCheck = settings.lastCheck 
        ? new Date(new Date(settings.lastCheck).getTime() + settings.checkInterval * 60 * 1000).toISOString()
        : null;

      return {
        isActive: settings.monitoringActive && this.intervalId !== null,
        lastCheck: settings.lastCheck,
        nextCheck,
        settings
      };
    } catch (error) {
      console.error('Failed to get monitoring status:', error);
      return {
        isActive: false,
        lastCheck: null,
        nextCheck: null,
        settings: this.defaultSettings
      };
    }
  }

  // Manual deadline check (for testing)
  async performManualCheck(): Promise<void> {
    try {
      console.log('🔍 Performing manual deadline check...');
      await this.checkUpcomingDeadlines();
      console.log('🔍 Manual deadline check completed');
    } catch (error) {
      console.error('Failed to perform manual deadline check:', error);
      throw error;
    }
  }
}

export default DeadlineMonitorService.getInstance();
