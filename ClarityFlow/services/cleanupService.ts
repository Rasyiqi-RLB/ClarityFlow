/**
 * Cleanup Service
 * Manages cleanup of all services to prevent memory leaks
 */

class CleanupService {
  private static instance: CleanupService;
  private cleanupFunctions: (() => void)[] = [];

  public static getInstance(): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService();
    }
    return CleanupService.instance;
  }

  /**
   * Register a cleanup function
   */
  registerCleanup(cleanupFn: () => void): void {
    this.cleanupFunctions.push(cleanupFn);
  }

  /**
   * Execute all cleanup functions
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Starting application cleanup...');
    
    try {
      // Execute all registered cleanup functions
      for (const cleanupFn of this.cleanupFunctions) {
        try {
          cleanupFn();
        } catch (error) {
          console.error('Error in cleanup function:', error);
        }
      }

      // Cleanup specific services
      await this.cleanupServices();
      
      console.log('✅ Application cleanup completed');
    } catch (error) {
      console.error('❌ Error during application cleanup:', error);
    }
  }

  /**
   * Cleanup specific services
   */
  private async cleanupServices(): Promise<void> {
    try {
      // Cleanup deadline monitor service
      const DeadlineMonitorService = (await import('./deadlineMonitorService')).default;
      DeadlineMonitorService.cleanup();

      // Cleanup API middleware
      const { stopCleanupInterval } = await import('./apiMiddleware');
      stopCleanupInterval();

      // Cleanup billing service
      const { nativeBillingService } = await import('./nativeBillingService');
      await nativeBillingService.cleanup();

      console.log('🧹 All services cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up services:', error);
    }
  }

  /**
   * Clear all registered cleanup functions
   */
  clear(): void {
    this.cleanupFunctions = [];
  }
}

export default CleanupService.getInstance();
