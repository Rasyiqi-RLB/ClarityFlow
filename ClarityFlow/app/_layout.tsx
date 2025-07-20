import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { AppHeader } from '@/components/DesktopHeader';
import ErrorBoundaryEnhanced from '@/components/ErrorBoundaryEnhanced';
import { AdProvider } from '../contexts/AdContext';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Navigation Theme Wrapper Component
function NavigationThemeWrapper({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useTheme();

  return (
    <NavigationThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      {children}
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });



  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        await StorageService.initialize();
        console.log('Storage service initialized');

        // Initialize notification service if enabled
        const { ENV_CONFIG } = await import('../config/env');
        if (ENV_CONFIG.ENABLE_NOTIFICATIONS) {
          const NotificationService = (await import('../services/notificationService')).default;
          await NotificationService.initialize();
          console.log('Notification service initialized');

          // Initialize deadline monitoring service
          const DeadlineMonitorService = (await import('../services/deadlineMonitorService')).default;
          await DeadlineMonitorService.initialize();
          console.log('Deadline monitor service initialized');
        }

        // Clean invalid API keys on app startup
        await AIService.cleanInvalidAPIKeys();
        console.log('API key validation completed');
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundaryEnhanced>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AdProvider>
              <NotificationProvider>
                <NavigationThemeWrapper>
                <View style={{ flex: 1 }}>
                  {/* Universal Header - Shows on both mobile and desktop */}
                  <AppHeader />

                  {/* Main Content */}
                  <View style={{ flex: 1 }}>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        presentation: 'card',
                        animationTypeForReplace: 'push'
                      }}
                    >
                      <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="index"
                        options={{
                          headerShown: false,
                          presentation: 'card'
                        }}
                      />
                      <Stack.Screen
                        name="login"
                        options={{
                          headerShown: false,
                          presentation: 'card'
                        }}
                      />
                      <Stack.Screen
                        name="member-dashboard"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="settings"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="statistics"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="+not-found"
                        options={{ headerShown: false }}
                      />
                    </Stack>
                  </View>
                </View>
                <StatusBar style="auto" />
                </NavigationThemeWrapper>
              </NotificationProvider>
            </AdProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundaryEnhanced>
  );
}
