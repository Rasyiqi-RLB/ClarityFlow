import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { IconSymbol } from './ui/IconSymbol';

interface NotificationBadgeProps {
  onPress: () => void;
  size?: number;
  color?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  onPress, 
  size = 24, 
  color = "#ffffff" 
}) => {
  const { unreadCount } = useNotifications();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <IconSymbol
        size={size}
        name="bell"
        color={color}
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NotificationBadge;
