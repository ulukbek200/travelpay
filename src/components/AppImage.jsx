import React, { useEffect, useState } from 'react';
import { TOUR_IMAGE_FALLBACK } from '../utils/tourMedia';
import { getMediaUrl } from '../utils/media';

/**
 * Shared image primitive for user content. It reserves its own space before an
 * image arrives, uses native lazy-loading and always has a local fallback.
 */
export default function AppImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  style,
  imgStyle,
  aspectRatio = '4 / 3',
  fit = 'cover',
  objectPosition = 'center',
  fallbackSrc = TOUR_IMAGE_FALLBACK,
  variant = 'large',
  priority = false,
  onLoad,
  onError,
  ...rest
}) {
  const source = getMediaUrl(src, variant, fallbackSrc) || TOUR_IMAGE_FALLBACK;
  const [imageSrc, setImageSrc] = useState(source);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setImageSrc(source);
    setIsLoaded(false);
    setHasFailed(false);
  }, [source]);

  const handleLoad = (event) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event) => {
    if (!hasFailed && imageSrc !== fallbackSrc) {
      setHasFailed(true);
      setImageSrc(fallbackSrc);
      return;
    }

    setHasFailed(true);
    setIsLoaded(true);
    onError?.(event);
  };

  return (
    <span
      className={`tp-image ${isLoaded ? 'is-loaded' : 'is-loading'} ${hasFailed ? 'has-fallback' : ''} ${className}`.trim()}
      style={{ aspectRatio, ...style }}
      aria-busy={!isLoaded}
    >
      <span className="tp-image__skeleton" aria-hidden="true" />
      <img
        {...rest}
        className={`tp-image__img ${imgClassName}`.trim()}
        src={imageSrc || TOUR_IMAGE_FALLBACK}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{ objectFit: fit, objectPosition, ...imgStyle }}
      />
    </span>
  );
}
