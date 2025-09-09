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
} & Pick<React.HTMLAttributes<HTMLDivElement>, "onClick">;

export const defaultProps: Pick<Props, "size"> = {
  size: "sm",
};

export const Avatar = memo(forwardRef(function Avatar(
  { size = defaultProps.size, url, name, style, className, onClick, ...rest }: Props,
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

  // Simplified className generation by directly mapping size to styles
  const commonClassNames = classnames(
    className,
    styles.container,
    styles[size as keyof typeof styles] || styles.sm, // Fallback to sm if size not found
    { [styles.clickable]: !!onClick }
  );
  const altTxt = !!name ? `Avatar of ${name}` : "Avatar";

  if (url) {
    return (
      <img
        {...rest}
        ref={ref}
        src={url}
        alt={altTxt}
        className={commonClassNames}
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
        className={commonClassNames}
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
