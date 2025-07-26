/**
 * Enhanced theme color hook that supports both new ThemeContext and legacy Colors
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

// Try to import ThemeContext, but handle gracefully if not available
let useTheme: any = null;
try {
  const themeModule = require('../contexts/ThemeContext');
  useTheme = themeModule.useTheme;
} catch (error) {
  // ThemeContext not available, will fall back to legacy behavior
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Try to use new ThemeContext first
  if (useTheme) {
    try {
      const { getColor } = useTheme();

      // If specific light/dark colors are provided, use them
      if (props.light && props.dark) {
        return getColor(props.light, props.dark);
      }

      // If colorName is provided, try to get from legacy Colors
      if (colorName) {
        const lightColor = Colors.light[colorName];
        const darkColor = Colors.dark[colorName];
        if (lightColor && darkColor) {
          return getColor(lightColor, darkColor);
        }
      }

      // Fallback to props if available
      const { isDarkMode } = useTheme();
      return isDarkMode ? (props.dark || '#FFFFFF') : (props.light || '#000000');
    } catch (error) {
      // Fall through to legacy behavior
    }
  }

  // Legacy behavior for backward compatibility
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else if (colorName) {
    return Colors[theme][colorName];
  } else {
    // Default fallback
    return theme === 'dark' ? '#FFFFFF' : '#000000';
  }
}

// New enhanced hook that uses ThemeContext directly
export function useThemeColorEnhanced() {
  if (!useTheme) {
    throw new Error('useThemeColorEnhanced requires ThemeContext to be available');
  }

  const { colors, getColor, isDarkMode } = useTheme();

  return {
    colors,
    getColor,
    isDarkMode,
    // Utility functions for common color patterns
    getTextColor: (variant: 'primary' | 'secondary' | 'muted' = 'primary') => colors.text[variant],
    getBackgroundColor: (variant: 'background' | 'surface' = 'background') =>
      variant === 'background' ? colors.background : colors.surface,
    getBorderColor: () => colors.border,
    getPrimaryColor: () => colors.primary,
    getButtonColor: (variant: 'primary' | 'secondary' | 'disabled' = 'primary') => colors.button[variant],
  };
}
