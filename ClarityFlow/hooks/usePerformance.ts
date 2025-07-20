import { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

interface PerformanceData {
  renderTime: number;
  memoryUsage: number;
  apiCalls: number;
  errorCount: number;
  lastUpdated: Date;
}

/**
 * Custom hook untuk performance monitoring
 * Membantu mengidentifikasi re-renders yang tidak perlu
 */
export function useRenderCount(componentName: string) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    if (__DEV__) {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });
  
  return renderCount.current;
}

/**
 * Custom hook untuk mengoptimasi Dimensions.get('window')
 * Menghindari pemanggilan berulang yang tidak perlu
 */
export function useWindowDimensions() {
  const dimensions = useRef(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      dimensions.current = window;
    });
    
    return () => subscription?.remove();
  }, []);
  
  return dimensions.current;
}

/**
 * Custom hook untuk memoize platform checks
 */
export function usePlatformCheck() {
  const platformInfo = useRef({
    isWeb: Platform.OS === 'web',
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
  });
  
  return platformInfo.current;
}

/**
 * Custom hook untuk performance monitoring real-time
 */
export function usePerformance() {
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        collectPerformanceData();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const collectPerformanceData = () => {
    // Simulate performance data collection
    const data: PerformanceData = {
      renderTime: Math.random() * 50 + 5,
      memoryUsage: Math.random() * 100,
      apiCalls: Math.floor(Math.random() * 10),
      errorCount: Math.floor(Math.random() * 3),
      lastUpdated: new Date()
    };

    setPerformance(data);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    collectPerformanceData();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  return {
    performance,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    collectPerformanceData
  };
}