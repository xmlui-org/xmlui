import type { CSSProperties, Ref } from "react";
import { forwardRef, memo, useMemo, useState, useCallback, useEffect } from "react";
import classnames from "classnames";

import styles from "./Avatar.module.scss";

type Props = {
  size?: string;
  url?: string;
  name?: string;
  style?: CSSProperties;
  lazy?: boolean; // New prop for lazy loading
} & Pick<React.HTMLAttributes<HTMLDivElement>, "onClick">;

export const defaultProps: Pick<Props, "size"> = {
  size: "sm",
};

export const Avatar = memo(forwardRef(function Avatar(
  { size = defaultProps.size, url, name, style, onClick, lazy = false, ...rest }: Props,
  ref: Ref<any>,
) {
  // State for handling image loading and errors
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!url);

  // Memoize the abbreviated name calculation to avoid recalculation on every render
  const abbreviatedName = useMemo(() => abbrevName(name ?? null), [name]);

  // Reset error and loading state when URL changes
  useEffect(() => {
    if (url) {
      setImageLoadError(false);
      setImageLoading(true);
    }
  }, [url]);

  // Handle image load success
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // Handle image load error - fallback to initials
  const handleImageError = useCallback(() => {
    setImageLoadError(true);
    setImageLoading(false);
  }, []);

  // Determine if we should show the image
  const shouldShowImage = url && !imageLoadError;

  // Simplified className generation by directly mapping size to styles
  const commonClassNames = classnames(
    styles.container,
    styles[size as keyof typeof styles] || styles.sm, // Fallback to sm if size not found
    { 
      [styles.clickable]: !!onClick,
      [styles.loading]: imageLoading && shouldShowImage
    }
  );
  const altTxt = !!name ? `Avatar of ${name}` : "Avatar";

  // Enhanced rendering logic with error handling and loading states
  if (shouldShowImage) {
    return (
      <div className={commonClassNames} style={style} onClick={onClick}>
        <img
          {...rest}
          ref={ref}
          src={url}
          alt={altTxt}
          loading={lazy ? "lazy" : "eager"}
          className={styles.image}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {imageLoading && (
          <div className={styles.loadingIndicator} aria-hidden="true" />
        )}
      </div>
    );
  } else {
    return (
      <div
        {...rest}
        ref={ref}
        className={commonClassNames}
        style={style}
        onClick={onClick}
        role="img"
        aria-label={altTxt}
      >
        {abbreviatedName || <span aria-hidden="true"></span>}
        {abbreviatedName && (
          <span className="sr-only">{`Avatar showing initials ${abbreviatedName}`}</span>
        )}
      </div>
    );
  }
}));

function abbrevName(name: string | null): string | null {
  if (!!name) {
    const abbrev = name
      .trim()
      .split(" ")
      .filter((word) => !!word.trim().length)
      .map((word) => word[0].toUpperCase())
      .slice(0, 3)
      .join("");
    return abbrev;
  }
  return null;
}
