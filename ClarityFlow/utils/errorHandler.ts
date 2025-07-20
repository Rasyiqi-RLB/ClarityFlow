// Error handling utilities for ClarityFlow

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

export class ErrorHandler {
  private static errors: AppError[] = [];

  static logError(error: Error | string, context?: string): AppError {
    const appError: AppError = {
      code: context || 'UNKNOWN_ERROR',
      message: typeof error === 'string' ? error : error.message,
      details: typeof error === 'object' ? error : undefined,
      timestamp: new Date(),
      stack: typeof error === 'object' ? error.stack : undefined,
    };

    this.errors.push(appError);
    
    // Log to console in development
    if (__DEV__) {
      console.error('ClarityFlow Error:', appError);
    }

    return appError;
  }

  static getErrors(): AppError[] {
    return [...this.errors];
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static getRecentErrors(count: number = 10): AppError[] {
    return this.errors.slice(-count);
  }

  static hasErrors(): boolean {
    return this.errors.length > 0;
  }

  static getErrorCount(): number {
    return this.errors.length;
  }
}

// Common error codes
export const ERROR_CODES = {
  STORAGE_ERROR: 'STORAGE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.STORAGE_ERROR]: 'Failed to save or load data',
  [ERROR_CODES.AI_SERVICE_ERROR]: 'AI service is temporarily unavailable',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection is required',
  [ERROR_CODES.VALIDATION_ERROR]: 'Invalid input data',
  [ERROR_CODES.PERMISSION_ERROR]: 'Permission denied',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred',
} as const;

// Helper function to create user-friendly error messages
// Functions removed - not used in codebase
// getUserFriendlyMessage, debugLog, debugError, measurePerformance, measureAsyncPerformance
 