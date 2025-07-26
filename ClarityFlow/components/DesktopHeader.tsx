import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBadge from './NotificationBadge';
import { IconSymbol } from './ui/IconSymbol';

interface AppHeaderProps {
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title = 'ClarityFlow' }) => {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const isDesktop = width > 1024 && Platform.OS === 'web';
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const handleNotificationPress = () => {
    // Jika sedang berada di halaman notifikasi, kembali ke halaman sebelumnya
    // Kita bisa mendeteksi ini dengan melihat apakah title mengandung "Notifikasi"
    if (title === 'Notifikasi' || window.location?.pathname === '/notifications') {
      // Cek apakah bisa kembali, jika tidak maka navigasi ke home
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        router.push('/');
      }
    } else {
      router.push('/notifications');
    }
  };



  return (
    <View style={{
      backgroundColor: colors.surface,
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      elevation: 0,
      shadowOpacity: 0,
    }}>
      {/* Left side - Title */}
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text.primary,
      }}>
        {title}
      </Text>

      {/* Right side - Navigation and Actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Desktop Navigation Menu - Only show on desktop */}
        {isDesktop && (
          <>
            <TouchableOpacity
              style={{ marginRight: 20, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.push('/(tabs)')}
            >
              <IconSymbol size={20} name="square.grid.2x2" color={colors.text.primary} />
              <Text style={{ color: colors.text.primary, marginLeft: 8, fontSize: 14, fontWeight: '500' }}>Matrix</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginRight: 20, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.push('/(tabs)/insight')}
            >
              <IconSymbol size={20} name="lightbulb" color={colors.text.primary} />
              <Text style={{ color: colors.text.primary, marginLeft: 8, fontSize: 14, fontWeight: '500' }}>Insight</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginRight: 20, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.push('/(tabs)/add-task')}
            >
              <IconSymbol size={20} name="plus.circle" color={colors.text.primary} />
              <Text style={{ color: colors.text.primary, marginLeft: 8, fontSize: 14, fontWeight: '500' }}>Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginRight: 20, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <IconSymbol size={20} name="chart.bar" color={colors.text.primary} />
              <Text style={{ color: colors.text.primary, marginLeft: 8, fontSize: 14, fontWeight: '500' }}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginRight: 20, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.push('/(tabs)/account')}
            >
              <IconSymbol size={20} name="person" color={colors.text.primary} />
              <Text style={{ color: colors.text.primary, marginLeft: 8, fontSize: 14, fontWeight: '500' }}>Account</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Action Buttons - Show on both mobile and desktop */}

        <View style={{ marginRight: 16 }}>
          <NotificationBadge
            onPress={handleNotificationPress}
            size={24}
            color={colors.text.primary}
          />
        </View>

        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: isDarkMode ? colors.button.secondary : colors.button.secondary,
          }}
        >
          <IconSymbol
            size={24}
            name={isDarkMode ? "sun.max" : "moon"}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>


    </View>
  );
};

// Keep backward compatibility
export const DesktopHeader = AppHeader;
export default AppHeader;