import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  // Extract pointerEvents from props to avoid deprecation warning
  const { pointerEvents, ...restProps } = props as any;
  
  return (
    <PlatformPressable
      {...restProps}
      style={[
        props.style,
        // Move pointerEvents to style for React Native Web compatibility
        Platform.OS === 'web' && pointerEvents ? { pointerEvents } : undefined
      ]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
