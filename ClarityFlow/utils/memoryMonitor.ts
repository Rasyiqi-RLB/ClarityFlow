/**
 * Memory Monitor
 * Monitors memory usage and prevents memory leaks
 */

import { Platform } from 'react-native';

interface MemoryInfo {
  used: number;
  total: number;
  percentage: number;
  timestamp: number;
}

class MemoryMonitor {
  private static instance: MemoryMonitor;
  private isMonitoring = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  private memoryHistory: MemoryInfo[] = [];
  private readonly MAX_HISTORY = 50;
  private readonly WARNING_THRESHOLD = 80; // 80% memory usage
  private readonly CRITICAL_THRESHOLD = 90; // 90% memory usage

  public static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  /**
   * Start memory monitoring
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) return;

    console.log('🧠 Starting memory monitoring...');
    this.isMonitoring = true;

    this.monitorInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log('🧠 Stopping memory monitoring...');
    this.isMonitoring = false;

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  /**
   * Check current memory usage
   */
  private checkMemoryUsage(): void {
    try {
      const memoryInfo = this.getMemoryInfo();
      
      if (memoryInfo) {
        this.memoryHistory.push(memoryInfo);
        
        // Keep only recent history
        if (this.memoryHistory.length > this.MAX_HISTORY) {
          this.memoryHistory.shift();
        }

        // Check for memory warnings
        this.checkMemoryThresholds(memoryInfo);
      }
    } catch (error) {
      console.warn('Failed to check memory usage:', error);
    }
  }

  /**
   * Get current memory information
   */
  private getMemoryInfo(): MemoryInfo | null {
    try {
      if (Platform.OS === 'web') {
        // Web platform memory info
        const performance = (global as any).performance;
        if (performance && performance.memory) {
          const used = performance.memory.usedJSHeapSize;
          const total = performance.memory.totalJSHeapSize;
          return {
            used: Math.round(used / 1024 / 1024), // Convert to MB
            total: Math.round(total / 1024 / 1024),
            percentage: Math.round((used / total) * 100),
            timestamp: Date.now()
          };
        }
      } else {
        // React Native - use approximation based on bundle size and runtime
        const approximateUsed = this.estimateMemoryUsage();
        const approximateTotal = 512; // Assume 512MB available for app
        
        return {
          used: approximateUsed,
          total: approximateTotal,
          percentage: Math.round((approximateUsed / approximateTotal) * 100),
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.warn('Failed to get memory info:', error);
    }
    
    return null;
  }

  /**
   * Estimate memory usage for React Native
   */
  private estimateMemoryUsage(): number {
    // Rough estimation based on:
    // - Base React Native runtime: ~30MB
    // - Firebase: ~20MB
    // - Other libraries: ~15MB
    // - App code and data: variable
    
    const baseMemory = 65; // Base memory usage
    const historyLength = this.memoryHistory.length;
    const growthFactor = Math.min(historyLength * 0.5, 20); // Memory growth over time
    
    return Math.round(baseMemory + growthFactor);
  }

  /**
   * Check memory thresholds and take action
   */
  private checkMemoryThresholds(memoryInfo: MemoryInfo): void {
    if (memoryInfo.percentage >= this.CRITICAL_THRESHOLD) {
      console.error('🚨 CRITICAL: Memory usage at', memoryInfo.percentage + '%');
      this.handleCriticalMemory();
    } else if (memoryInfo.percentage >= this.WARNING_THRESHOLD) {
      console.warn('⚠️ WARNING: High memory usage at', memoryInfo.percentage + '%');
      this.handleHighMemory();
    }
  }

  /**
   * Handle critical memory situation
   */
  private handleCriticalMemory(): void {
    console.log('🧹 Attempting emergency memory cleanup...');
    
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Clear memory history to free up space
      this.memoryHistory = this.memoryHistory.slice(-10);

      // Notify other parts of the app to cleanup
      this.notifyMemoryPressure('critical');
    } catch (error) {
      console.error('Failed to handle critical memory:', error);
    }
  }

  /**
   * Handle high memory situation
   */
  private handleHighMemory(): void {
    console.log('🧹 Performing memory cleanup...');
    
    try {
      // Trim memory history
      this.memoryHistory = this.memoryHistory.slice(-25);

      // Notify other parts of the app
      this.notifyMemoryPressure('high');
    } catch (error) {
      console.error('Failed to handle high memory:', error);
    }
  }

  /**
   * Notify other parts of the app about memory pressure
   */
  private notifyMemoryPressure(level: 'high' | 'critical'): void {
    // In a real app, you might emit events or call cleanup functions
    console.log(`📢 Memory pressure notification: ${level}`);
  }

  /**
   * Get current memory status
   */
  getMemoryStatus(): MemoryInfo | null {
    return this.memoryHistory.length > 0 ? this.memoryHistory[this.memoryHistory.length - 1] : null;
  }

  /**
   * Get memory history
   */
  getMemoryHistory(): MemoryInfo[] {
    return [...this.memoryHistory];
  }

  /**
   * Force memory check
   */
  forceMemoryCheck(): MemoryInfo | null {
    const memoryInfo = this.getMemoryInfo();
    if (memoryInfo) {
      this.checkMemoryThresholds(memoryInfo);
    }
    return memoryInfo;
  }
}

export default MemoryMonitor.getInstance();
