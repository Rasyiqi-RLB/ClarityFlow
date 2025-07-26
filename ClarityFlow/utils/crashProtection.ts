/**
 * Crash Protection Utilities
 * Provides global error handling and crash prevention
 */

import { Platform } from 'react-native';

class CrashProtection {
  private static isInitialized = false;

  /**
   * Initialize global error handlers
   */
  static initialize(): void {
    if (this.isInitialized) return;

    try {
      // Handle unhandled promise rejections
      if (typeof global !== 'undefined') {
        global.addEventListener?.('unhandledrejection', (event: any) => {
          console.error('🚨 Unhandled Promise Rejection:', event.reason);
          
          // Prevent the default behavior (which would crash the app)
          event.preventDefault();
          
          // Log the error for debugging
          this.logCrashEvent('unhandled_promise_rejection', event.reason);
        });
      }

      // Handle uncaught exceptions (React Native specific)
      if (Platform.OS !== 'web') {
        const originalHandler = global.ErrorUtils?.getGlobalHandler();
        
        global.ErrorUtils?.setGlobalHandler((error: any, isFatal: boolean) => {
          console.error('🚨 Global Error Handler:', error, 'Fatal:', isFatal);
          
          // Log the error
          this.logCrashEvent('global_error', error, { isFatal });
          
          // Call original handler if it exists
          if (originalHandler) {
            originalHandler(error, isFatal);
          }
          
          // For non-fatal errors, try to continue
          if (!isFatal) {
            console.log('🔄 Attempting to recover from non-fatal error');
          }
        });
      }

      // Handle console errors
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        // Call original console.error
        originalConsoleError.apply(console, args);
        
        // Log critical errors
        const errorMessage = args.join(' ');
        if (this.isCriticalError(errorMessage)) {
          this.logCrashEvent('console_error', errorMessage);
        }
      };

      this.isInitialized = true;
      console.log('🛡️ Crash protection initialized');
    } catch (error) {
      console.error('Failed to initialize crash protection:', error);
    }
  }

  /**
   * Check if an error message indicates a critical error
   */
  private static isCriticalError(message: string): boolean {
    const criticalPatterns = [
      'heap out of memory',
      'maximum call stack',
      'cannot read property',
      'undefined is not a function',
      'network request failed',
      'firebase',
      'auth',
      'database'
    ];

    return criticalPatterns.some(pattern => 
      message.toLowerCase().includes(pattern)
    );
  }

  /**
   * Log crash events for debugging
   */
  private static logCrashEvent(type: string, error: any, metadata?: any): void {
    try {
      const crashData = {
        type,
        error: error?.toString() || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        metadata
      };

      console.log('📊 Crash Event Logged:', crashData);
      
      // In production, you could send this to a crash reporting service
      // like Sentry, Crashlytics, etc.
    } catch (logError) {
      console.error('Failed to log crash event:', logError);
    }
  }

  /**
   * Wrap async functions with error handling
   */
  static wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    fallbackValue?: any
  ): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error('🚨 Async function error:', error);
        this.logCrashEvent('async_function_error', error);
        return fallbackValue;
      }
    }) as T;
  }

  /**
   * Wrap sync functions with error handling
   */
  static wrapSync<T extends (...args: any[]) => any>(
    fn: T,
    fallbackValue?: any
  ): T {
    return ((...args: any[]) => {
      try {
        return fn(...args);
      } catch (error) {
        console.error('🚨 Sync function error:', error);
        this.logCrashEvent('sync_function_error', error);
        return fallbackValue;
      }
    }) as T;
  }
}

export default CrashProtection;
