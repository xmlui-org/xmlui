import { type CSSProperties, type ForwardedRef, forwardRef } from "react";
import classnames from "classnames";

import styles from "./Badge.module.scss";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

export const badgeVariantValues = ["badge", "pill"] as const;
export type BadgeVariant = (typeof badgeVariantValues)[number];
export type BadgeColors = {
  label: string;
  background: string;
};

// --- Type guard for BadgeColors ---
export function isBadgeColors(color: any): color is BadgeColors {
  return (
    typeof color === "object" &&
    color !== null &&
    "label" in color &&
    "background" in color &&
    typeof color.label === "string" &&
    typeof color.background === "string"
  );
}

type Props = {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  color?: string | BadgeColors;
  style?: CSSProperties;
  classes?: Record<string, string>;
  className?: string;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "onContextMenu">;

export const defaultProps: Pick<Props, "variant"> = {
  variant: "badge",
};

export const Badge = forwardRef(function Badge(
  { children, color, variant = defaultProps.variant, style, classes, className, onContextMenu, ...rest }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      {...rest}
      ref={forwardedRef}
      className={classnames(
        {
          [styles.badge]: variant === "badge",
          [styles.pill]: variant === "pill",
        },
        classes?.[COMPONENT_PART_KEY],
        className,
      )}
      onContextMenu={onContextMenu}
      style={{
        ...(color
          ? typeof color === "string"
            ? { backgroundColor: color }
            : { backgroundColor: color.background, color: color.label }
          : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
});
