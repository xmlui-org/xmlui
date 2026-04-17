import { type CSSProperties, type ForwardedRef, forwardRef, memo, useMemo } from "react";
import classnames from "classnames";

import styles from "./Badge.module.scss";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

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

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, "color"> & {
  variant?: BadgeVariant;
  color?: string | BadgeColors;
  classes?: Record<string, string>;
};

export const defaultProps: Pick<Props, "variant"> = {
  variant: "badge",
};

export const Badge = memo(forwardRef(function Badge(
  { children, color, variant = defaultProps.variant, style, classes, className, onContextMenu, ...rest }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const mergedStyle = useMemo<CSSProperties | undefined>(() => {
    if (!color) return style;
    const colorStyle: CSSProperties =
      typeof color === "string"
        ? { backgroundColor: color }
        : { backgroundColor: (color as BadgeColors).background, color: (color as BadgeColors).label };
    return { ...colorStyle, ...style };
  }, [color, style]);

  return (
    <div
      ref={forwardedRef}
      {...rest}
      className={classnames(
        styles.container,
        {
          [styles.badge]: variant === "badge",
          [styles.pill]: variant === "pill",
        },
        classes?.[COMPONENT_PART_KEY],
        className,
      )}
      onContextMenu={onContextMenu}
      style={mergedStyle}
    >
      {children}
    </div>
  );
}));
