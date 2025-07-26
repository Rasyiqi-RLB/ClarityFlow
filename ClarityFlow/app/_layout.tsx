import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { AppHeader } from '../components/DesktopHeader';
import ErrorBoundaryEnhanced from '../components/ErrorBoundaryEnhanced';
import { AdProvider } from '../contexts/AdContext';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import CleanupService from '../services/cleanupService';
import LazyServiceLoader from '../services/lazyServiceLoader';
import { StorageService } from '../services/storage';
import CrashLogger from '../utils/crashLogger';
import CrashProtection from '../utils/crashProtection';
import MemoryMonitor from '../utils/memoryMonitor';

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
  const [loaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Handle font loading error
  if (fontError) {
    console.warn('Font loading failed:', fontError);
  }



  useEffect(() => {
    // Initialize crash protection, memory monitoring, and crash logger first
    CrashProtection.initialize();
    MemoryMonitor.startMonitoring(10000); // Check every 10 seconds
    CrashLogger.initialize(); // Advanced crash logging

    // Register services for lazy loading
    const registerServices = () => {
      // Critical services - load immediately
      LazyServiceLoader.registerService({
        name: 'storage',
        priority: 'critical',
        timeout: 3000,
        loader: async () => {
          await StorageService.initialize();
          console.log('✅ Storage service initialized');
        },
        fallback: () => console.warn('Storage service failed - app will continue with limited functionality')
      });

      // High priority services - load after critical
      LazyServiceLoader.registerService({
        name: 'notification',
        priority: 'high',
        timeout: 2000,
        loader: async () => {
          const { ENV_CONFIG } = await import('../config/env');
          if (ENV_CONFIG?.ENABLE_NOTIFICATIONS) {
            const NotificationService = (await import('../services/notificationService')).default;
            await NotificationService.initialize();
            console.log('✅ Notification service initialized');
          }
        },
        fallback: () => console.warn('Notification service failed - notifications disabled')
      });

      // Medium priority services - load when app is stable
      LazyServiceLoader.registerService({
        name: 'deadlineMonitor',
        priority: 'medium',
        timeout: 2000,
        loader: async () => {
          const DeadlineMonitorService = (await import('../services/deadlineMonitorService')).default;
          await DeadlineMonitorService.initialize();
          console.log('✅ Deadline monitor service initialized');
        },
        fallback: () => console.warn('Deadline monitor failed - monitoring disabled')
      });

      // Low priority services - load in background
      LazyServiceLoader.registerService({
        name: 'apiValidation',
        priority: 'low',
        timeout: 3000,
        loader: async () => {
          const { AIService } = await import('../services/aiService');
          await AIService.cleanInvalidAPIKeys();
          console.log('✅ API key validation completed');
        },
        fallback: () => console.warn('API validation failed - continuing without validation')
      });
    };

    // Initialize services with lazy loading
    const initializeServices = async () => {
      try {
        console.log('🚀 Starting optimized service initialization...');

        registerServices();
        await LazyServiceLoader.loadServicesByPriority();

        console.log('✅ Service initialization completed');
      } catch (error) {
        console.error('Critical error initializing services:', error);
        // Don't crash the app, just log the error and continue
      }
    };

    // Delay initialization to let the app render first
    const timer = setTimeout(initializeServices, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup all services when app unmounts
      CleanupService.cleanup().catch((error: any) => {
        console.error('Error during app cleanup:', error);
      });
    };
  }, []);

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
