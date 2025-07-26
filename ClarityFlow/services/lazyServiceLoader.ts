/**
 * Lazy Service Loader
 * Loads services on-demand to prevent startup bottlenecks
 */

import { Platform } from 'react-native';

interface ServiceLoader {
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  loader: () => Promise<any>;
  timeout: number;
  fallback?: () => void;
}

class LazyServiceLoader {
  private static instance: LazyServiceLoader;
  private loadedServices = new Set<string>();
  private loadingServices = new Map<string, Promise<any>>();
  private serviceQueue: ServiceLoader[] = [];

  public static getInstance(): LazyServiceLoader {
    if (!LazyServiceLoader.instance) {
      LazyServiceLoader.instance = new LazyServiceLoader();
    }
    return LazyServiceLoader.instance;
  }

  /**
   * Register a service for lazy loading
   */
  registerService(service: ServiceLoader): void {
    this.serviceQueue.push(service);
  }

  /**
   * Load services by priority with staggered timing
   */
  async loadServicesByPriority(): Promise<void> {
    console.log('🚀 Starting lazy service loading...');

    // Sort by priority
    const sortedServices = this.serviceQueue.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Load critical services first
    const criticalServices = sortedServices.filter(s => s.priority === 'critical');
    await this.loadServicesInBatch(criticalServices, 0);

    // Load high priority services after a short delay
    const highServices = sortedServices.filter(s => s.priority === 'high');
    setTimeout(() => this.loadServicesInBatch(highServices, 500), 300);

    // Load medium priority services
    const mediumServices = sortedServices.filter(s => s.priority === 'medium');
    setTimeout(() => this.loadServicesInBatch(mediumServices, 1000), 1000);

    // Load low priority services
    const lowServices = sortedServices.filter(s => s.priority === 'low');
    setTimeout(() => this.loadServicesInBatch(lowServices, 2000), 2000);
  }

  /**
   * Load a batch of services with staggered timing
   */
  private async loadServicesInBatch(services: ServiceLoader[], baseDelay: number): Promise<void> {
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const delay = baseDelay + (i * 200); // Stagger by 200ms

      setTimeout(() => {
        this.loadService(service);
      }, delay);
    }
  }

  /**
   * Load a single service with timeout and error handling
   */
  private async loadService(service: ServiceLoader): Promise<any> {
    if (this.loadedServices.has(service.name)) {
      return; // Already loaded
    }

    if (this.loadingServices.has(service.name)) {
      return this.loadingServices.get(service.name); // Already loading
    }

    console.log(`📦 Loading service: ${service.name}`);

    const loadPromise = Promise.race([
      service.loader(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Service ${service.name} timeout`)), service.timeout)
      )
    ]);

    this.loadingServices.set(service.name, loadPromise);

    try {
      const result = await loadPromise;
      this.loadedServices.add(service.name);
      this.loadingServices.delete(service.name);
      console.log(`✅ Service loaded: ${service.name}`);
      return result;
    } catch (error) {
      console.warn(`⚠️ Service failed to load: ${service.name}`, error);
      this.loadingServices.delete(service.name);
      
      // Execute fallback if available
      if (service.fallback) {
        service.fallback();
      }
      
      return null;
    }
  }

  /**
   * Load a specific service on-demand
   */
  async loadServiceOnDemand(serviceName: string): Promise<any> {
    const service = this.serviceQueue.find(s => s.name === serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not registered`);
    }

    return this.loadService(service);
  }

  /**
   * Check if a service is loaded
   */
  isServiceLoaded(serviceName: string): boolean {
    return this.loadedServices.has(serviceName);
  }

  /**
   * Get loading status
   */
  getLoadingStatus(): { loaded: string[], loading: string[], pending: string[] } {
    const allServices = this.serviceQueue.map(s => s.name);
    const loaded = Array.from(this.loadedServices);
    const loading = Array.from(this.loadingServices.keys());
    const pending = allServices.filter(s => !loaded.includes(s) && !loading.includes(s));

    return { loaded, loading, pending };
  }
}

export default LazyServiceLoader.getInstance();
