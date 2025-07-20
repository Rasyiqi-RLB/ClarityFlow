import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabBarBackground() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colors.tab.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
