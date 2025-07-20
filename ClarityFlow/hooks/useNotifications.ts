import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'task_reminder' | 'deadline_alert' | 'achievement' | 'weekly_update';
  timestamp: string;
  read: boolean;
  data?: any;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Set up periodic check for new notifications
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications.sort((a: NotificationItem, b: NotificationItem) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } else {
        // Initialize with empty notifications array
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const addNotification = async (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    try {
      const newNotification: NotificationItem = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false
      };

      const updatedNotifications = [newNotification, ...notifications];
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('user_notifications', JSON.stringify(updatedNotifications));
      
      return newNotification;
    } catch (error) {
      console.error('Failed to add notification:', error);
      return null;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const updatedNotifications = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('user_notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('user_notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      await AsyncStorage.removeItem('user_notifications');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const removeNotification = async (notificationId: string) => {
    try {
      const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('user_notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to remove notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    removeNotification
  };
};

export default useNotifications;
