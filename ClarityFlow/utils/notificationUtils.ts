import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'task_reminder' | 'deadline_alert' | 'achievement' | 'weekly_update';
  timestamp: string;
  read: boolean;
  data?: any;
}

export const addNotificationToStorage = async (notification: {
  title: string;
  body: string;
  type: 'task_reminder' | 'deadline_alert' | 'achievement' | 'weekly_update';
  data?: any;
}): Promise<void> => {
  try {
    // Get existing notifications
    const stored = await AsyncStorage.getItem('user_notifications');
    const existingNotifications: NotificationItem[] = stored ? JSON.parse(stored) : [];

    // Create new notification
    const newNotification: NotificationItem = {
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
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const stored = await AsyncStorage.getItem('user_notifications');
    if (stored) {
      const notifications: NotificationItem[] = JSON.parse(stored);
      return notifications.filter(n => !n.read).length;
    }
    return 0;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    return 0;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem('user_notifications');
    if (stored) {
      const notifications: NotificationItem[] = JSON.parse(stored);
      const updatedNotifications = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      await AsyncStorage.setItem('user_notifications', JSON.stringify(updatedNotifications));
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

export const clearAllNotifications = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('user_notifications');
    console.log('📱 All notifications cleared');
  } catch (error) {
    console.error('Failed to clear notifications:', error);
  }
};
