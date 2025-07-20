/**
 * Performance-related constants
 * Mengoptimasi nilai-nilai yang sering digunakan
 */

// Debounce delays (dalam milliseconds)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 150,
  API_CALL: 500,
  SCROLL: 100,
} as const;

// Throttle delays (dalam milliseconds)
export const THROTTLE_DELAYS = {
  SCROLL: 16, // ~60fps
  RESIZE: 100,
  ANIMATION: 16,
  GESTURE: 50,
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
  EXTRA_SLOW: 500,
} as const;

// Cache sizes
export const CACHE_SIZES = {
  IMAGES: 50,
  API_RESPONSES: 100,
  COMPONENTS: 20,
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_WARNING: 16, // milliseconds
  MEMORY_WARNING: 100, // MB
  BUNDLE_SIZE_WARNING: 5, // MB
} as const;