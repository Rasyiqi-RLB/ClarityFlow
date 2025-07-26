import { isValidAPIKeyFormat } from '../config/env';
import loggingService from './loggingService';
import { APIKey, systemManagementService } from './systemManagementService';

export interface APIRequest {
  apiKey: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetTime: Date;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  blocked: boolean;
}

class APIMiddleware {
  private rateLimitStore: Map<string, { count: number; resetTime: Date }> = new Map();

  /**
   * Validate API key and check permissions
   */
  async validateAPIKey(apiKey: string, requiredPermission?: string): Promise<{ valid: boolean; keyData?: APIKey; error?: string }> {
    try {
      // Basic format validation
      if (!isValidAPIKeyFormat(apiKey)) {
        return { valid: false, error: 'Invalid API key format' };
      }

      // Validate with database
      const validation = await systemManagementService.validateAPIKey(apiKey);
      
      if (!validation.valid) {
        return validation;
      }

      // Check specific permission if required
      if (requiredPermission && validation.keyData) {
        if (!validation.keyData.permissions.includes(requiredPermission) && !validation.keyData.permissions.includes('admin')) {
          return { valid: false, error: `Missing required permission: ${requiredPermission}` };
        }
      }

      return validation;
    } catch (error) {
      console.error('Error validating API key:', error);
      return { valid: false, error: 'API key validation failed' };
    }
  }

  /**
   * Check rate limiting for API key
   */
  checkRateLimit(apiKey: string, rateLimit: number): RateLimitInfo {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour window
    
    const existing = this.rateLimitStore.get(apiKey);
    
    if (!existing || existing.resetTime < now) {
      // Reset or initialize rate limit
      const resetTime = new Date(now.getTime() + 60 * 60 * 1000);
      this.rateLimitStore.set(apiKey, { count: 1, resetTime });
      
      return {
        limit: rateLimit,
        remaining: rateLimit - 1,
        resetTime,
        blocked: false
      };
    }
    
    // Increment count
    existing.count++;
    this.rateLimitStore.set(apiKey, existing);
    
    const remaining = Math.max(0, rateLimit - existing.count);
    const blocked = existing.count > rateLimit;
    
    return {
      limit: rateLimit,
      remaining,
      resetTime: existing.resetTime,
      blocked
    };
  }

  /**
   * Process API request with validation and rate limiting
   */
  async processRequest(request: APIRequest, requiredPermission?: string): Promise<APIResponse> {
    try {
      // Log request
      loggingService.info(`API Request: ${request.method} ${request.endpoint}`, 'APIMiddleware', {
        apiKey: request.apiKey.substring(0, 10) + '...',
        endpoint: request.endpoint,
        method: request.method,
        userAgent: request.userAgent,
        ipAddress: request.ipAddress
      });

      // Validate API key
      const validation = await this.validateAPIKey(request.apiKey, requiredPermission);
      
      if (!validation.valid) {
        loggingService.warn(`API key validation failed: ${validation.error}`, 'APIMiddleware', {
          apiKey: request.apiKey.substring(0, 10) + '...',
          error: validation.error
        });
        
        return {
          success: false,
          error: validation.error || 'Invalid API key',
          statusCode: 401
        };
      }

      const keyData = validation.keyData!;

      // Check rate limiting
      const rateLimitInfo = this.checkRateLimit(request.apiKey, keyData.rateLimit);
      
      if (rateLimitInfo.blocked) {
        loggingService.warn(`Rate limit exceeded for API key`, 'APIMiddleware', {
          apiKey: request.apiKey.substring(0, 10) + '...',
          limit: rateLimitInfo.limit,
          resetTime: rateLimitInfo.resetTime
        });
        
        return {
          success: false,
          error: 'Rate limit exceeded',
          statusCode: 429,
          rateLimit: rateLimitInfo
        };
      }

      // Request is valid, return success with rate limit info
      return {
        success: true,
        statusCode: 200,
        rateLimit: rateLimitInfo
      };
      
    } catch (error) {
      console.error('Error processing API request:', error);
      loggingService.error('API request processing failed', error as Error, 'APIMiddleware', {
        endpoint: request.endpoint,
        method: request.method
      });
      
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  /**
   * Clean up expired rate limit entries
   */
  cleanupRateLimits(): void {
    const now = new Date();
    
    for (const [key, value] of this.rateLimitStore.entries()) {
      if (value.resetTime < now) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Get rate limit status for API key
   */
  getRateLimitStatus(apiKey: string, rateLimit: number): RateLimitInfo {
    return this.checkRateLimit(apiKey, rateLimit);
  }

  /**
   * Reset rate limit for API key (admin function)
   */
  resetRateLimit(apiKey: string): void {
    this.rateLimitStore.delete(apiKey);
    loggingService.info(`Rate limit reset for API key`, 'APIMiddleware', {
      apiKey: apiKey.substring(0, 10) + '...'
    });
  }
}

export const apiMiddleware = new APIMiddleware();

// Clean up rate limits every hour - with proper cleanup
let cleanupInterval: NodeJS.Timeout | null = null;

const startCleanupInterval = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }

  cleanupInterval = setInterval(() => {
    apiMiddleware.cleanupRateLimits();
  }, 60 * 60 * 1000);
};

const stopCleanupInterval = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

// Start the cleanup interval
startCleanupInterval();

// Export cleanup function for proper memory management
export { stopCleanupInterval };
