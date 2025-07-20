import { ENV, shouldLog } from '../config/environment';
import { AuthError } from '../types/auth';

/**
 * Enhanced logging service untuk monitoring dan debugging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
  error?: Error | AuthError;
  userId?: string;
  sessionId?: string;
}

export interface LoggingServiceInterface {
  debug(message: string, context?: string, data?: any): void;
  info(message: string, context?: string, data?: any): void;
  warn(message: string, context?: string, data?: any): void;
  error(message: string, error?: Error | AuthError, context?: string, data?: any): void;
  logAuthEvent(event: string, data?: any, error?: AuthError): void;
  logPerformance(operation: string, duration: number, context?: string): void;
  logUserAction(action: string, data?: any): void;
}

class LoggingService implements LoggingServiceInterface {
  private sessionId: string;
  private userId?: string;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeLogging();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeLogging(): void {
    if (ENV.logging.enableConsole && shouldLog('info')) {
      console.log('🔍 Logging Service initialized', {
        sessionId: this.sessionId,
        level: ENV.logging.level,
        enableConsole: ENV.logging.enableConsole,
        enableRemote: ENV.logging.enableRemote,
      });
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  clearUserId(): void {
    this.userId = undefined;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: Error | AuthError
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
      error,
      userId: this.userId,
      sessionId: this.sessionId,
    };
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  private formatConsoleMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    const userId = entry.userId ? `[User: ${entry.userId}]` : '';
    
    return `${timestamp} ${context} ${userId} ${entry.message}`;
  }

  private logToConsole(entry: LogEntry): void {
    if (!ENV.logging.enableConsole || !shouldLog(entry.level)) {
      return;
    }

    const message = this.formatConsoleMessage(entry);
    
    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.data);
        break;
      case 'info':
        console.info(message, entry.data);
        break;
      case 'warn':
        console.warn(message, entry.data);
        break;
      case 'error':
        console.error(message, entry.error || entry.data);
        break;
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!ENV.logging.enableRemote || !shouldLog(entry.level)) {
      return;
    }

    try {
      // Implementasi remote logging (Firebase, Sentry, dll)
      // Untuk sekarang, hanya simpan di buffer
      // TODO: Implement actual remote logging
    } catch (error) {
      console.error('Failed to send log to remote service:', error);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: Error | AuthError
  ): void {
    const entry = this.createLogEntry(level, message, context, data, error);
    
    this.addToBuffer(entry);
    this.logToConsole(entry);
    
    if (ENV.logging.enableRemote) {
      this.logToRemote(entry).catch(() => {
        // Silent fail untuk remote logging
      });
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log('warn', message, context, data);
  }

  error(message: string, error?: Error | AuthError, context?: string, data?: any): void {
    this.log('error', message, context, data, error);
  }

  logAuthEvent(event: string, data?: any, error?: AuthError): void {
    const message = `Auth Event: ${event}`;
    if (error) {
      this.error(message, error, 'AUTH', data);
    } else {
      this.info(message, 'AUTH', data);
    }
  }

  logPerformance(operation: string, duration: number, context?: string): void {
    const message = `Performance: ${operation} took ${duration}ms`;
    const level = duration > 1000 ? 'warn' : 'info';
    this.log(level, message, context || 'PERFORMANCE', { duration, operation });
  }

  logUserAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, 'USER_ACTION', data);
  }

  // Utility methods
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  getErrorLogs(): LogEntry[] {
    return this.logBuffer.filter(entry => entry.level === 'error');
  }

  clearBuffer(): void {
    this.logBuffer = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// Singleton instance
export const logger = new LoggingService();

// Performance measurement decorator
export function measurePerformance(context?: string) {
  return function (target: any, propertyName: string, descriptor?: PropertyDescriptor) {
    if (!descriptor) {
      // Handle case where descriptor is undefined
      return;
    }
    
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        logger.logPerformance(propertyName, duration, context);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.logPerformance(`${propertyName} (failed)`, duration, context);
        throw error;
      }
    };
    
    return descriptor;
  };
}

export default logger;