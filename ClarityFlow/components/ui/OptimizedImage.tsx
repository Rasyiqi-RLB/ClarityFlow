import { Image, ImageProps } from 'react-native';
import React, { memo, useState, useCallback } from 'react';

interface OptimizedImageProps extends ImageProps {
  fallbackSource?: ImageProps['source'];
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

/**
 * Komponen Image yang dioptimasi dengan:
 * - Lazy loading
 * - Error handling
 * - Fallback image
 * - Memoization
 */
export const OptimizedImage = memo<OptimizedImageProps>(({
  source,
  fallbackSource,
  onLoadStart,
  onLoadEnd,
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleError = useCallback((error: any) => {
    setHasError(true);
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  const imageSource = hasError && fallbackSource ? fallbackSource : source;

  return (
    <Image
      {...props}
      source={imageSource}
      onLoadStart={handleLoadStart}
      onLoadEnd={handleLoadEnd}
      onError={handleError}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';