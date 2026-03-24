import type { ForwardedRef, HTMLAttributes, KeyboardEvent, MouseEvent, Ref } from "react";
import { forwardRef, memo, useCallback, useMemo } from "react";
import classnames from "classnames";

import styles from "./Avatar.module.scss";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

type Props = HTMLAttributes<HTMLElement> & {
  size?: string;
  url?: string;
  name?: string;
  classes?: Record<string, string>;
};

export const defaultProps: Pick<Props, "size"> = {
  size: "sm",
};

// Size tokens that map to predefined SCSS classes; anything else is treated as a
// raw CSS length value (e.g. "60px", "3rem").
const PREDEFINED_SIZES = new Set(["xs", "sm", "md", "lg"]);

// Calculates the font-size for a custom CSS length so that initials scale
// proportionally (~33% of the avatar width, matching the predefined size ratios).
function calculateFontSize(sizeValue: string): string {
  const match = sizeValue.match(/^([\d.]+)(.*)$/);
  if (match) {
    const [, num, unit] = match;
    return `${parseFloat(num) * 0.33}${unit || "px"}`;
  }
  return "1em";
}

// Returns up to three uppercase initials from a display name, or null when the
// name is empty or whitespace-only.
function abbreviateName(name: string | null): string | null {
  if (!name) return null;
  return name
    .trim()
    .split(" ")
    .filter((word) => word.trim().length > 0)
    .map((word) => word[0].toUpperCase())
    .slice(0, 3)
    .join("") || null;
}

export const Avatar = memo(forwardRef(function Avatar(
  { size = defaultProps.size, url, name, style, classes, className, onClick, onContextMenu, ...rest }: Props,
  ref: ForwardedRef<HTMLImageElement | HTMLDivElement>,
) {
  const abbreviatedName = useMemo(() => abbreviateName(name ?? null), [name]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick(event as unknown as MouseEvent<HTMLElement>);
    }
  }, [onClick]);

  const isCustomSize = !!size && !PREDEFINED_SIZES.has(size);

  const commonClassNames = classnames(
    classes?.[COMPONENT_PART_KEY],
    className,
    styles.container,
    !isCustomSize && (styles[size as keyof typeof styles] || styles.sm),
    { [styles.clickable]: !!onClick },
  );

  const mergedStyle = useMemo(
    () =>
      isCustomSize
        ? { ...style, width: size, height: size, fontSize: calculateFontSize(size!) }
        : style,
    [isCustomSize, size, style],
  );

  const altTxt = name ? `Avatar of ${name}` : "Avatar";

  const sharedProps = {
    ...rest,
    className: commonClassNames,
    style: mergedStyle,
    onClick,
    onContextMenu,
    onKeyDown: handleKeyDown,
    tabIndex: onClick ? 0 : undefined,
  };

  if (url) {
    return (
      <img
        {...sharedProps}
        ref={ref as Ref<HTMLImageElement>}
        src={url}
        alt={altTxt}
      />
    );
  }

  return (
    <div
      {...sharedProps}
      ref={ref as Ref<HTMLDivElement>}
      role="img"
      aria-label={altTxt}
    >
      {abbreviatedName || <span aria-hidden="true" />}
    </div>
  );
}));
