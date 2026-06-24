import type {
  CSSProperties,
  ForwardedRef,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  Ref,
} from "react";
import { forwardRef, memo, useCallback, useMemo } from "react";

import { defaultProps } from "./Avatar.defaults";
import styles from "./Avatar.module.scss";

export type AvatarProps = HTMLAttributes<HTMLElement> & {
  size?: string;
  url?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
};

const predefinedSizes = new Set(["xs", "sm", "md", "lg"]);

export const Avatar = memo(forwardRef(function Avatar(
  {
    size = defaultProps.size,
    url,
    name,
    style,
    className,
    onClick,
    onContextMenu,
    ...rest
  }: AvatarProps,
  ref: ForwardedRef<HTMLImageElement | HTMLDivElement>,
) {
  const abbreviatedName = useMemo(() => abbreviateName(name ?? null), [name]);
  const isCustomSize = Boolean(size) && !predefinedSizes.has(size);
  const classNames = [
    styles.container,
    !isCustomSize ? styles[size as keyof typeof styles] ?? styles.sm : undefined,
    onClick ? styles.clickable : undefined,
    className,
  ].filter(Boolean).join(" ");
  const mergedStyle = useMemo<CSSProperties>(() => {
    if (!isCustomSize) {
      return { ...style, flexShrink: 0 };
    }
    return {
      ...style,
      width: size,
      height: size,
      fontSize: calculateFontSize(size),
      flexShrink: 0,
    };
  }, [isCustomSize, size, style]);
  const altText = name ? `Avatar of ${name}` : "Avatar";

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick(event as unknown as MouseEvent<HTMLElement>);
    }
  }, [onClick]);

  const sharedProps = {
    ...rest,
    className: classNames,
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
        alt={altText}
      />
    );
  }

  return (
    <div
      {...sharedProps}
      ref={ref as Ref<HTMLDivElement>}
      role="img"
      aria-label={altText}
    >
      {abbreviatedName || <span aria-hidden="true" />}
    </div>
  );
}));

function calculateFontSize(sizeValue: string | undefined): string {
  const match = String(sizeValue ?? "").match(/^([\d.]+)(.*)$/);
  if (!match) {
    return "1em";
  }
  const [, numberPart, unit] = match;
  return `${Number.parseFloat(numberPart) * 0.33}${unit || "px"}`;
}

function abbreviateName(name: string | null): string | null {
  if (!name) {
    return null;
  }
  return name
    .trim()
    .split(" ")
    .filter((word) => word.trim().length > 0)
    .map((word) => word[0].toUpperCase())
    .slice(0, 3)
    .join("") || null;
}
