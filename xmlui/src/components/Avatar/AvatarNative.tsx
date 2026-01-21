import type { CSSProperties, Ref } from "react";
import { forwardRef, memo, useMemo } from "react";
import classnames from "classnames";

import styles from "./Avatar.module.scss";

type Props = {
  size?: string;
  url?: string;
  name?: string;
  style?: CSSProperties;
  className?: string;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "onClick" | "onContextMenu">;

export const defaultProps: Pick<Props, "size"> = {
  size: "sm",
};

export const Avatar = memo(forwardRef(function Avatar(
  { size = defaultProps.size, url, name, style, className, onClick, onContextMenu, ...rest }: Props,
  ref: Ref<any>,
) {
  // Memoize the abbreviated name calculation to avoid recalculation on every render
  const abbreviatedName = useMemo(() => abbrevName(name ?? null), [name]);

  // Handle keyboard events for accessibility
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(event as any);
    }
  };

  // Check if size is a predefined value or a custom CSS value
  const predefinedSizes = ['xs', 'sm', 'md', 'lg'];
  const isCustomSize = size && !predefinedSizes.includes(size);
  
  // Simplified className generation by directly mapping size to styles
  const commonClassNames = classnames(
    className,
    styles.container,
    !isCustomSize && (styles[size as keyof typeof styles] || styles.sm), // Only apply predefined size class
    { [styles.clickable]: !!onClick }
  );
  
  // Calculate font size for custom sizes based on pattern: fontSize ≈ 33% of width
  const calculateFontSize = (sizeValue: string): string => {
    const match = sizeValue.match(/^([\d.]+)(.*)$/);
    if (match) {
      const [, num, unit] = match;
      const numericValue = parseFloat(num);
      const fontSize = numericValue * 0.33; // ~33% ratio observed in predefined sizes
      return `${fontSize}${unit || 'px'}`;
    }
    return '1em'; // fallback
  };
  
  // Merge custom size into style if it's not a predefined value
  const mergedStyle = isCustomSize
    ? { ...style, width: size, height: size, fontSize: calculateFontSize(size!) }
    : style;
  
  const altTxt = !!name ? `Avatar of ${name}` : "Avatar";

  if (url) {
    return (
      <img
        {...rest}
        ref={ref}
        src={url}
        alt={altTxt}
        className={commonClassNames}
        style={mergedStyle}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onKeyDown={handleKeyDown}
        tabIndex={onClick ? 0 : undefined}
      />
    );
  } else
    return (
      <div
        {...rest}
        ref={ref}
        className={commonClassNames}
        style={mergedStyle}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onKeyDown={handleKeyDown}
        role="img"
        aria-label={altTxt}
        tabIndex={onClick ? 0 : undefined}
      >
        {abbreviatedName || <span aria-hidden="true"></span>}
        {/* Display initials or an empty decorative span */}
      </div>
    );
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
