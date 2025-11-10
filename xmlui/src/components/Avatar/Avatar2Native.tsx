/**
 * Avatar2 Native Component - Runtime CSS Implementation
 * 
 * This is a prototype implementation of the Avatar component using runtime CSS generation
 * via the useComponentStyle hook instead of SCSS modules. This allows for:
 * - Dynamic style injection at runtime
 * - Better tree-shaking and code splitting
 * - More flexible theming without build-time compilation
 * - Elimination of SCSS build infrastructure
 * 
 * The component functionality is identical to Avatar, but uses JavaScript-defined styles.
 */

import type { CSSProperties, Ref } from "react";
import { forwardRef, memo, useMemo } from "react";

import { useComponentStyle } from "../../components-core/theming/StyleContext";
import {
  avatarContainerStyle,
  avatarSizeStyles,
  avatarClickableStyle,
} from "./Avatar2Styles";

type Props = {
  size?: string;
  url?: string;
  name?: string;
  style?: CSSProperties;
  className?: string;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "onClick">;

export const defaultProps: Pick<Props, "size"> = {
  size: "sm",
};

export const Avatar2 = memo(
  forwardRef(function Avatar2(
    { size = defaultProps.size, url, name, style, className, onClick, ...rest }: Props,
    ref: Ref<any>,
  ) {
    // Memoize the abbreviated name calculation to avoid recalculation on every render
    const abbreviatedName = useMemo(() => abbrevName(name ?? null), [name]);

    // Handle keyboard events for accessibility
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (onClick && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onClick(event as any);
      }
    };

    // ===================================================================================================
    // Runtime CSS Generation
    // ===================================================================================================
    
    // Generate class name for base container styles
    const baseClassName = useComponentStyle(avatarContainerStyle);
    
    // Generate class name for size variant
    const sizeStyles = avatarSizeStyles[size as keyof typeof avatarSizeStyles] || avatarSizeStyles.sm;
    const sizeClassName = useComponentStyle(sizeStyles);
    
    // Generate class name for clickable state (only if onClick is provided)
    const clickableClassName = onClick ? useComponentStyle(avatarClickableStyle) : "";

    // Combine all generated class names with any user-provided className
    const combinedClassName = [
      className,
      baseClassName,
      sizeClassName,
      clickableClassName,
    ]
      .filter(Boolean)
      .join(" ");

    // ===================================================================================================
    // Component Rendering
    // ===================================================================================================

    const altTxt = !!name ? `Avatar2 of ${name}` : "Avatar2";

    if (url) {
      return (
        <img
          {...rest}
          ref={ref}
          src={url}
          alt={altTxt}
          className={combinedClassName}
          style={style}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          tabIndex={onClick ? 0 : undefined}
        />
      );
    } else
      return (
        <div
          {...rest}
          ref={ref}
          className={combinedClassName}
          style={style}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          role="img"
          aria-label={altTxt}
          tabIndex={onClick ? 0 : undefined}
        >
          {abbreviatedName || <span aria-hidden="true"></span>}
          {/* Display initials or an empty decorative span */}
        </div>
      );
  }),
);

/**
 * Generates abbreviated name from full name (initials).
 * Takes up to 3 words and uses the first letter of each, uppercased.
 * 
 * @param name - Full name string or null
 * @returns Abbreviated name (initials) or null
 * 
 * @example
 * abbrevName("Tim Smith") // Returns "TS"
 * abbrevName("Tim John Smith") // Returns "TJS"
 * abbrevName("Tim John Smith Jones") // Returns "TJS" (max 3)
 */
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
