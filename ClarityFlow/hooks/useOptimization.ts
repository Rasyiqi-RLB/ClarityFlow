import React, { useCallback, useRef, useEffect } from 'react';
import type { TimeoutRef, DebouncedFunction, ThrottledFunction } from '@/types/performance';

/**
 * Custom hook untuk debouncing function calls
 * Berguna untuk search input, API calls, dll
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): DebouncedFunction<T> {
  const timeoutRef = useRef<TimeoutRef>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Custom hook untuk throttling function calls
 * Berguna untuk scroll events, resize events, dll
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ThrottledFunction<T> {
  const lastCallRef = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

/**
 * Custom hook untuk memoize expensive calculations
 */
export function useExpensiveCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  const memoizedValue = React.useMemo(calculation, dependencies);
  return memoizedValue;
}