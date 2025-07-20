import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Basic colors
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // UI colors
  border: string;
  divider: string;
  overlay: string;
  
  // Interactive colors
  button: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  
  // Tab colors
  tab: {
    background: string;
    active: string;
    inactive: string;
  };
}

export interface ThemeContextType {
  // Current theme state
  isDarkMode: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red';

  // Theme actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large' | 'xlarge') => void;
  setColorScheme: (scheme: 'blue' | 'green' | 'purple' | 'orange' | 'red') => void;

  // Color scheme utilities
  getColor: (lightColor: string, darkColor: string) => string;
  getFontSize: (baseSize: number) => number;
}

// Light theme colors
const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#10B981',

  text: {
    primary: '#000000',    // Pure black
    secondary: '#000000',  // Pure black
    muted: '#000000',      // Pure black
    inverse: '#FFFFFF',    // White text for dark backgrounds
  },
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  border: '#E2E8F0',
  divider: '#F1F5F9',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  button: {
    primary: '#3B82F6',
    secondary: '#F1F5F9',
    disabled: '#E2E8F0',
  },

  tab: {
    background: '#FFFFFF',
    active: '#3B82F6',
    inactive: '#6B7280',    // Gray color for visibility in light mode
  },
};

// Dark theme colors
const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  primary: '#60A5FA',
  secondary: '#A78BFA',
  accent: '#34D399',

  text: {
    primary: '#FFFFFF',    // Pure white
    secondary: '#FFFFFF',  // Pure white
    muted: '#FFFFFF',      // Pure white
    inverse: '#000000',    // Pure black for light backgrounds
  },
  
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  border: '#334155',
  divider: '#475569',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  button: {
    primary: '#60A5FA',
    secondary: '#334155',
    disabled: '#475569',
  },
  
  tab: {
    background: '#1E293B',
    active: '#60A5FA',
    inactive: '#FFFFFF',    // Pure white
  },
};

// Helper function to get pure text color based on theme
export const getPureTextColor = (isDarkMode: boolean) => {
  return isDarkMode ? '#FFFFFF' : '#000000';
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage keys
const THEME_STORAGE_KEY = 'app_theme_mode';
const FONT_SIZE_STORAGE_KEY = 'app_font_size';
const COLOR_SCHEME_STORAGE_KEY = 'app_color_scheme';

// Provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [colorScheme, setColorSchemeState] = useState<'blue' | 'green' | 'purple' | 'orange' | 'red'>('blue');
  const [isLoading, setIsLoading] = useState(true);

  // Calculate if dark mode should be active
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  // Get current colors based on theme and color scheme
  const colors = useMemo(() => {
    const baseColors = isDarkMode ? darkColors : lightColors;

    // Color scheme mapping
    const schemeColors = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      red: '#EF4444',
    };

    return {
      ...baseColors,
      primary: schemeColors[colorScheme],
    };
  }, [isDarkMode, colorScheme]);

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedTheme, savedFontSize, savedColorScheme] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY),
          AsyncStorage.getItem(COLOR_SCHEME_STORAGE_KEY),
        ]);

        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }

        if (savedFontSize && ['small', 'medium', 'large', 'xlarge'].includes(savedFontSize)) {
          setFontSizeState(savedFontSize as 'small' | 'medium' | 'large' | 'xlarge');
        }

        if (savedColorScheme && ['blue', 'green', 'purple', 'orange', 'red'].includes(savedColorScheme)) {
          setColorSchemeState(savedColorScheme as 'blue' | 'green' | 'purple' | 'orange' | 'red');
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save theme preference
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Save font size preference
  const setFontSize = async (size: 'small' | 'medium' | 'large' | 'xlarge') => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
      setFontSizeState(size);
    } catch (error) {
      console.error('Error saving font size preference:', error);
    }
  };

  // Save color scheme preference
  const setColorScheme = async (scheme: 'blue' | 'green' | 'purple' | 'orange' | 'red') => {
    try {
      await AsyncStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
      setColorSchemeState(scheme);
    } catch (error) {
      console.error('Error saving color scheme preference:', error);
    }
  };

  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  // Utility function to get color based on current theme
  const getColor = (lightColor: string, darkColor: string): string => {
    return isDarkMode ? darkColor : lightColor;
  };

  // Utility function to get font size based on setting
  const getFontSize = (baseSize: number): number => {
    const multipliers = {
      small: 0.8,
      medium: 1.0,
      large: 1.2,
      xlarge: 1.4,
    };
    return baseSize * multipliers[fontSize];
  };

  // Don't render until theme is loaded
  if (isLoading) {
    return null;
  }

  const value: ThemeContextType = {
    isDarkMode,
    themeMode,
    colors,
    fontSize,
    colorScheme,
    setThemeMode,
    toggleTheme,
    setFontSize,
    setColorScheme,
    getColor,
    getFontSize,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export for backward compatibility
export const useThemeColors = () => {
  const { colors } = useTheme();
  return colors;
};
