/**
 * Advanced Crash Logger
 * Captures detailed crash information for debugging force close issues
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CrashReport {
  timestamp: string;
  platform: string;
  error: string;
  stack: string;
  memoryUsage?: number;
  deviceInfo: any;
  appState: string;
  lastActions: string[];
}

class CrashLogger {
  private static instance: CrashLogger;
  private crashReports: CrashReport[] = [];
  private lastActions: string[] = [];
  private readonly MAX_REPORTS = 10;
  private readonly MAX_ACTIONS = 20;

  public static getInstance(): CrashLogger {
    if (!CrashLogger.instance) {
      CrashLogger.instance = new CrashLogger();
    }
    return CrashLogger.instance;
  }

  /**
   * Initialize crash logging
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔍 Initializing advanced crash logger...');
      
      // Load previous crash reports
      await this.loadCrashReports();
      
      // Set up global error handlers
      this.setupGlobalErrorHandlers();
      
      // Log app start
      this.logAction('APP_START');
      
      console.log('✅ Crash logger initialized');
    } catch (error) {
      console.error('Failed to initialize crash logger:', error);
    }
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    if (typeof global !== 'undefined' && global.addEventListener) {
      global.addEventListener('unhandledrejection', (event: any) => {
        this.logCrash('UNHANDLED_PROMISE_REJECTION', event.reason);
      });
    }

    // Handle React Native global errors
    if (Platform.OS !== 'web' && global.ErrorUtils) {
      const originalHandler = global.ErrorUtils.getGlobalHandler();
      
      global.ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
        this.logCrash('GLOBAL_ERROR', error, { isFatal });
        
        // Call original handler
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }

    // Handle console errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      originalConsoleError.apply(console, args);
      
      const errorMessage = args.join(' ');
      if (this.isCriticalError(errorMessage)) {
        this.logCrash('CONSOLE_ERROR', errorMessage);
      }
    };
  }

  /**
   * Log user actions for crash context
   */
  logAction(action: string): void {
    const timestamp = new Date().toISOString();
    const actionWithTime = `${timestamp}: ${action}`;
    
    this.lastActions.push(actionWithTime);
    
    // Keep only recent actions
    if (this.lastActions.length > this.MAX_ACTIONS) {
      this.lastActions.shift();
    }
  }

  /**
   * Log a crash with detailed information
   */
  async logCrash(type: string, error: any, metadata?: any): Promise<void> {
    try {
      const crashReport: CrashReport = {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        error: error?.toString() || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        memoryUsage: this.getMemoryUsage(),
        deviceInfo: this.getDeviceInfo(),
        appState: 'active', // Could be enhanced with actual app state
        lastActions: [...this.lastActions]
      };

      // Add metadata if provided
      if (metadata) {
        (crashReport as any).metadata = metadata;
      }

      this.crashReports.push(crashReport);
      
      // Keep only recent reports
      if (this.crashReports.length > this.MAX_REPORTS) {
        this.crashReports.shift();
      }

      // Save to storage
      await this.saveCrashReports();
      
      // Log to console for immediate debugging
      console.error('🚨 CRASH LOGGED:', {
        type,
        error: crashReport.error,
        timestamp: crashReport.timestamp,
        lastActions: crashReport.lastActions.slice(-5) // Last 5 actions
      });

    } catch (logError) {
      console.error('Failed to log crash:', logError);
    }
  }

  /**
   * Get memory usage estimation
   */
  private getMemoryUsage(): number {
    try {
      if (Platform.OS === 'web' && (global as any).performance?.memory) {
        return Math.round((global as any).performance.memory.usedJSHeapSize / 1024 / 1024);
      }
      return 0; // Not available on React Native
    } catch {
      return 0;
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): any {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      // Add more device info as needed
    };
  }

  /**
   * Check if error is critical
   */
  private isCriticalError(message: string): boolean {
    const criticalPatterns = [
      'heap out of memory',
      'maximum call stack',
      'cannot read property',
      'undefined is not a function',
      'network request failed',
      'firebase',
      'native module',
      'bridge',
      'java.lang',
      'android.app',
      'force close',
      'crash'
    ];

    return criticalPatterns.some(pattern => 
      message.toLowerCase().includes(pattern)
    );
  }

  /**
   * Save crash reports to storage
   */
  private async saveCrashReports(): Promise<void> {
    try {
      await AsyncStorage.setItem('crash_reports', JSON.stringify(this.crashReports));
    } catch (error) {
      console.error('Failed to save crash reports:', error);
    }
  }

  /**
   * Load crash reports from storage
   */
  private async loadCrashReports(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('crash_reports');
      if (stored) {
        this.crashReports = JSON.parse(stored);
        console.log(`📊 Loaded ${this.crashReports.length} previous crash reports`);
      }
    } catch (error) {
      console.error('Failed to load crash reports:', error);
    }
  }

  /**
   * Get all crash reports
   */
  getCrashReports(): CrashReport[] {
    return [...this.crashReports];
  }

  /**
   * Clear crash reports
   */
  async clearCrashReports(): Promise<void> {
    this.crashReports = [];
    await AsyncStorage.removeItem('crash_reports');
    console.log('🧹 Crash reports cleared');
  }

  /**
   * Export crash reports for debugging
   */
  exportCrashReports(): string {
    return JSON.stringify(this.crashReports, null, 2);
  }
}

export default CrashLogger.getInstance();
