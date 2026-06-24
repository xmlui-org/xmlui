import type { CSSProperties, ForwardedRef, HTMLAttributes } from "react";
import { forwardRef, memo, useMemo } from "react";

import { defaultProps } from "./Badge.defaults";
import styles from "./Badge.module.scss";

export const badgeVariantValues = ["badge", "pill"] as const;
export type BadgeVariant = (typeof badgeVariantValues)[number];
export type BadgeColors = {
  label: string;
  background: string;
};

export function isBadgeColors(color: unknown): color is BadgeColors {
  return (
    typeof color === "object" &&
    color !== null &&
    "label" in color &&
    "background" in color &&
    typeof (color as BadgeColors).label === "string" &&
    typeof (color as BadgeColors).background === "string"
  );
}

export type BadgeProps = Omit<HTMLAttributes<HTMLDivElement>, "color"> & {
  variant?: BadgeVariant;
  color?: string | BadgeColors;
  className?: string;
  style?: CSSProperties;
};

export const Badge = memo(forwardRef(function Badge(
  {
    children,
    color,
    variant = defaultProps.variant,
    style,
    className,
    onContextMenu,
    ...rest
  }: BadgeProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const mergedStyle = useMemo<CSSProperties | undefined>(() => {
    if (!color) {
      return style;
    }
    const colorStyle: CSSProperties =
      typeof color === "string"
        ? { backgroundColor: color }
        : { backgroundColor: color.background, color: color.label };
    return { ...colorStyle, ...style };
  }, [color, style]);

  const classNames = [
    styles.container,
    variant === "pill" ? styles.pill : styles.badge,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div
      ref={forwardedRef}
      {...rest}
      className={classNames}
      onContextMenu={onContextMenu}
      style={mergedStyle}
    >
      {children}
    </div>
  );
}));
