import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Dimensions, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ADD_TASK_ICON_CONSTANTS, ADD_TASK_ICON_STYLE, TAB_BAR_STYLE } from '@/constants/TabBarStyles';
import { useTheme } from '@/contexts/ThemeContext';
import { usePlatformCheck } from '@/hooks/usePerformance';
import type { TabBarStyleType } from '@/types/performance';

export default function TabLayout() {
  const { colors } = useTheme();
  const { isWeb } = usePlatformCheck();

  // Memoize computed values untuk menghindari re-calculation
  const { isDesktop, tabColors } = useMemo(() => {
    const { width } = Dimensions.get('window');
    const isDesktopComputed = width > 1024 && isWeb;

    const tabColorConfig = {
      activeTintColor: colors.tab.active,
      inactiveTintColor: colors.tab.inactive,
    };

    return {
      isDesktop: isDesktopComputed,
      tabColors: tabColorConfig,
    };
  }, [colors, isWeb]);

  // Memoize tab bar style untuk menghindari re-creation
  const memoizedTabBarStyle = useMemo((): TabBarStyleType => ({
    ...TAB_BAR_STYLE,
    backgroundColor: colors.tab.background, // Use dynamic background color
    borderTopColor: colors.border, // Use dynamic border color
    display: isDesktop ? 'none' : 'flex', // Hide tab bar on desktop
  }), [isDesktop, colors]);

  // Memoize container style
  const containerStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: 'transparent'
  }), []);

  // Memoize icon renderers untuk menghindari re-creation
  const renderHomeIcon = useCallback(({ color, focused }: { color: string; focused: boolean }) => (
    <IconSymbol name={focused ? 'square.grid.2x2.fill' : 'square.grid.2x2'} color={color} size={28} />
  ), []);

  const renderExploreIcon = useCallback(({ color, focused }: { color: string; focused: boolean }) => (
    <IconSymbol name={focused ? 'chart.bar.fill' : 'chart.bar'} color={color} size={28} />
  ), []);

  const renderAddTaskIcon = useCallback((_props: { color: string; focused: boolean }) => (
    <View style={[ADD_TASK_ICON_STYLE, { backgroundColor: colors.surface }]}>
      <MaterialIcons
        name={ADD_TASK_ICON_CONSTANTS.ICON.name}
        size={ADD_TASK_ICON_CONSTANTS.ICON.size}
        color={colors.primary}
      />
    </View>
  ), [colors]);

  const renderInsightIcon = useCallback(({ color, focused }: { color: string; focused: boolean }) => (
    <IconSymbol name={focused ? 'lightbulb.fill' : 'lightbulb'} color={color} size={28} />
  ), []);

  const renderAccountIcon = useCallback(({ color, focused }: { color: string; focused: boolean }) => (
    <IconSymbol name={focused ? 'person.fill' : 'person'} color={color} size={28} />
  ), []);

  return (
    <View style={containerStyle}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tabColors.activeTintColor,
          tabBarInactiveTintColor: tabColors.inactiveTintColor,
          tabBarShowLabel: false,
          headerShown: false, // Header now handled by RootLayout
          tabBarStyle: memoizedTabBarStyle,
        }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: renderExploreIcon,
        }}
      />
      <Tabs.Screen
        name="add-task"
        options={{
          tabBarIcon: renderAddTaskIcon,
        }}
      />
      <Tabs.Screen
        name="insight"
        options={{
          tabBarIcon: renderInsightIcon,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: renderAccountIcon,
        }}
      />
    </Tabs>
    </View>
  );
}
