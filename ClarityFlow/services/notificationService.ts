import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface NotificationSettings {
  taskReminders: boolean;
  deadlineAlerts: boolean;
  weeklyUpdates: boolean;
  achievements: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  frequency: {
    taskReminders: 'immediate' | 'hourly' | 'daily';
    deadlineAlerts: '1day' | '3days' | '1week';
    weeklyUpdates: 'monday' | 'friday' | 'sunday';
  };
  sound: {
    enabled: boolean;
    type: 'default' | 'gentle' | 'urgent';
  };
  vibration: boolean;
}

export interface NotificationTemplate {
  id: string;
  type: 'task_reminder' | 'deadline_alert' | 'weekly_update' | 'achievement';
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private defaultSettings: NotificationSettings = {
    taskReminders: true,
    deadlineAlerts: true,
    weeklyUpdates: false,
    achievements: true,
    emailNotifications: false,
    pushNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    },
    frequency: {
      taskReminders: 'hourly',
      deadlineAlerts: '1day',
      weeklyUpdates: 'monday'
    },
    sound: {
      enabled: true,
      type: 'default'
    },
    vibration: true
  };

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Request permissions
      await this.requestPermissions();
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      // Handle web platform separately
      if (Platform.OS === 'web') {
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            return true;
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
          }
        }
        console.warn('Web notifications not supported or denied');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'ClarityFlow Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  // Get notification settings
  async getSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem('notificationSettings');
      if (stored) {
        return { ...this.defaultSettings, ...JSON.parse(stored) };
      }
      return this.defaultSettings;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return this.defaultSettings;
    }
  }

  // Update notification settings
  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }

  // Reset settings to default
  async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.defaultSettings));
    } catch (error) {
      console.error('Failed to reset notification settings:', error);
      throw error;
    }
  }

  // Check if notifications should be sent (considering quiet hours)
  async shouldSendNotification(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      
      if (!settings.pushNotifications) {
        return false;
      }

      if (settings.quietHours.enabled) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const startTime = settings.quietHours.start;
        const endTime = settings.quietHours.end;
        
        // Handle quiet hours that span midnight
        if (startTime > endTime) {
          if (currentTime >= startTime || currentTime <= endTime) {
            return false;
          }
        } else {
          if (currentTime >= startTime && currentTime <= endTime) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to check notification timing:', error);
      return true; // Default to allowing notifications
    }
  }

  // Schedule a notification
  async scheduleNotification(template: NotificationTemplate, trigger?: Notifications.NotificationTriggerInput): Promise<string | null> {
    try {
      const shouldSend = await this.shouldSendNotification();
      if (!shouldSend) {
        return null;
      }

      const settings = await this.getSettings();
      
      // Check if this type of notification is enabled
      switch (template.type) {
        case 'task_reminder':
          if (!settings.taskReminders) return null;
          break;
        case 'deadline_alert':
          if (!settings.deadlineAlerts) return null;
          break;
        case 'weekly_update':
          if (!settings.weeklyUpdates) return null;
          break;
        case 'achievement':
          if (!settings.achievements) return null;
          break;
      }

      // Check if platform supports notifications
      if (Platform.OS === 'web') {
        // For web platform, use browser notifications if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(template.title, {
            body: template.body,
            icon: '/favicon.ico',
            tag: template.id
          });
          console.log(`📱 Web notification sent: ${template.title}`);

          // Add notification to storage for notification panel
          await this.addNotificationToStorage({
            title: template.title,
            body: template.body,
            type: template.type,
            data: template.data
          });

          return template.id;
        } else {
          console.log(`📱 Web notifications not available or not permitted`);
          return null;
        }
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: template.title,
          body: template.body,
          data: template.data,
          sound: settings.sound.enabled ? settings.sound.type : false,
          vibrate: settings.vibration ? [0, 250, 250, 250] : [],
        },
        trigger: trigger || null,
      });

      // Add notification to storage for notification panel
      if (notificationId) {
        await this.addNotificationToStorage({
          title: template.title,
          body: template.body,
          type: template.type,
          data: template.data
        });
      }

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web notifications can't be cancelled after being shown
        console.log(`📱 Web notification ${notificationId} cannot be cancelled`);
        return;
      }
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        console.log('📱 Web notifications cannot be cancelled in bulk');
        return;
      }
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Get notification statistics
  async getNotificationStats(): Promise<{
    totalSent: number;
    totalScheduled: number;
    lastSent: string | null;
    byType: Record<string, number>;
  }> {
    try {
      const stats = await AsyncStorage.getItem('notificationStats');
      if (stats) {
        return JSON.parse(stats);
      }
      
      return {
        totalSent: 0,
        totalScheduled: 0,
        lastSent: null,
        byType: {
          task_reminder: 0,
          deadline_alert: 0,
          weekly_update: 0,
          achievement: 0
        }
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {
        totalSent: 0,
        totalScheduled: 0,
        lastSent: null,
        byType: {}
      };
    }
  }

  // Update notification statistics
  async updateNotificationStats(type: string): Promise<void> {
    try {
      const stats = await this.getNotificationStats();
      stats.totalSent += 1;
      stats.lastSent = new Date().toISOString();
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      await AsyncStorage.setItem('notificationStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to update notification stats:', error);
    }
  }

  // Test notification
  async sendTestNotification(): Promise<void> {
    try {
      const template: NotificationTemplate = {
        id: 'test',
        type: 'achievement',
        title: '🧪 Test Notification',
        body: 'Notifikasi berfungsi dengan baik! Pengaturan Anda sudah benar.',
        data: { test: true }
      };

      await this.scheduleNotification(template);
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  // Schedule task reminder notification
  async scheduleTaskReminder(task: any): Promise<string | null> {
    try {
      if (!task.dueDate) {
        return null;
      }

      const settings = await this.getSettings();
      if (!settings.taskReminders) {
        return null;
      }

      const dueDate = new Date(task.dueDate);
      const now = new Date();

      // Calculate reminder time based on frequency setting
      let reminderTime: Date;
      switch (settings.frequency.taskReminders) {
        case 'immediate':
          reminderTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
          break;
        case 'hourly':
          reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000); // 1 hour before due
          break;
        case 'daily':
          reminderTime = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before due
          break;
        default:
          reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000); // Default: 1 hour before
      }

      // Don't schedule if reminder time is in the past
      if (reminderTime <= now) {
        return null;
      }

      const template: NotificationTemplate = {
        id: `task_reminder_${task.id}`,
        type: 'task_reminder',
        title: '📋 Task Reminder',
        body: `Jangan lupa: ${task.title}`,
        data: {
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.dueDate
        }
      };

      const notificationId = await this.scheduleNotification(template, {
        date: reminderTime
      });

      if (notificationId) {
        await this.updateNotificationStats('task_reminder');
        console.log(`Task reminder scheduled for ${task.title} at ${reminderTime.toISOString()}`);
      }

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule task reminder:', error);
      return null;
    }
  }

  // Schedule deadline alert notification
  async scheduleDeadlineAlert(task: any): Promise<string | null> {
    try {
      if (!task.dueDate) {
        return null;
      }

      const settings = await this.getSettings();
      if (!settings.deadlineAlerts) {
        return null;
      }

      const dueDate = new Date(task.dueDate);
      const now = new Date();

      // Calculate alert time based on frequency setting
      let alertTime: Date;
      switch (settings.frequency.deadlineAlerts) {
        case '1day':
          alertTime = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
          break;
        case '3days':
          alertTime = new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days before
          break;
        case '1week':
          alertTime = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week before
          break;
        default:
          alertTime = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000); // Default: 1 day before
      }

      // Don't schedule if alert time is in the past
      if (alertTime <= now) {
        return null;
      }

      const template: NotificationTemplate = {
        id: `deadline_alert_${task.id}`,
        type: 'deadline_alert',
        title: '⏰ Deadline Alert',
        body: `Deadline approaching: ${task.title}`,
        data: {
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.dueDate
        }
      };

      const notificationId = await this.scheduleNotification(template, {
        date: alertTime
      });

      if (notificationId) {
        await this.updateNotificationStats('deadline_alert');
        console.log(`Deadline alert scheduled for ${task.title} at ${alertTime.toISOString()}`);
      }

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule deadline alert:', error);
      return null;
    }
  }

  // Schedule achievement notification
  async scheduleAchievementNotification(achievement: {
    type: 'task_completed' | 'streak' | 'goal_reached';
    title: string;
    message: string;
    data?: any;
  }): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      if (!settings.achievements) {
        return null;
      }

      const template: NotificationTemplate = {
        id: `achievement_${Date.now()}`,
        type: 'achievement',
        title: achievement.title,
        body: achievement.message,
        data: achievement.data
      };

      const notificationId = await this.scheduleNotification(template);

      if (notificationId) {
        await this.updateNotificationStats('achievement');
        console.log(`Achievement notification sent: ${achievement.title}`);
      }

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule achievement notification:', error);
      return null;
    }
  }

  // Cancel task-related notifications
  async cancelTaskNotifications(taskId: string): Promise<void> {
    try {
      // Cancel task reminder
      await this.cancelNotification(`task_reminder_${taskId}`);

      // Cancel deadline alert
      await this.cancelNotification(`deadline_alert_${taskId}`);

      console.log(`Cancelled notifications for task: ${taskId}`);
    } catch (error) {
      console.error('Failed to cancel task notifications:', error);
    }
  }

  // Add notification to storage for notification panel
  private async addNotificationToStorage(notification: {
    title: string;
    body: string;
    type: 'task_reminder' | 'deadline_alert' | 'achievement' | 'weekly_update';
    data?: any;
  }): Promise<void> {
    try {
      // Get existing notifications
      const stored = await AsyncStorage.getItem('user_notifications');
      const existingNotifications = stored ? JSON.parse(stored) : [];

      // Create new notification
      const newNotification = {
        id: Date.now().toString(),
        title: notification.title,
        body: notification.body,
        type: notification.type,
        timestamp: new Date().toISOString(),
        read: false,
        data: notification.data
      };

      // Add to beginning of array (most recent first)
      const updatedNotifications = [newNotification, ...existingNotifications];

      // Keep only last 50 notifications to prevent storage bloat
      const trimmedNotifications = updatedNotifications.slice(0, 50);

      // Save back to storage
      await AsyncStorage.setItem('user_notifications', JSON.stringify(trimmedNotifications));

      console.log('📱 Notification added to storage:', newNotification.title);
    } catch (error) {
      console.error('Failed to add notification to storage:', error);
    }
  }
}

export default NotificationService.getInstance();