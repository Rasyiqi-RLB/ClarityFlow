/**
 * TypeScript utility types untuk performance optimization
 */

import { ViewStyle } from 'react-native';

/**
 * Type untuk tab bar style yang kompatibel dengan React Navigation
 */
export type TabBarStyleType = ViewStyle & {
  display?: 'none' | 'flex';
  position?: 'absolute' | 'relative';
};

/**
 * Type untuk timeout reference yang kompatibel dengan Node.js dan browser
 */
export type TimeoutRef = ReturnType<typeof setTimeout> | null;

/**
 * Type untuk debounced function
 */
export type DebouncedFunction<T extends (...args: any[]) => any> = T;

/**
 * Type untuk throttled function
 */
export type ThrottledFunction<T extends (...args: any[]) => any> = T;

/**
 * Type untuk platform check result
 */
export interface PlatformInfo {
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

/**
 * Type untuk performance constants
 */
export interface PerformanceConstants {
  DEBOUNCE_DELAYS: Record<string, number>;
  THROTTLE_DELAYS: Record<string, number>;
  ANIMATION_DURATIONS: Record<string, number>;
  CACHE_SIZES: Record<string, number>;
  PERFORMANCE_THRESHOLDS: Record<string, number>;
}