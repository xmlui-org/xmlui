import { type CSSProperties, type ForwardedRef, forwardRef } from "react";
import classnames from "classnames";

import styles from "./Badge.module.scss";

export const badgeVariantValues = ["badge", "pill"] as const;
export type BadgeVariant = (typeof badgeVariantValues)[number];
export type BadgeColors = {
  label: string;
  background: string;
};

type Props = {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  color?: string | BadgeColors;
  style?: CSSProperties;
};

export const defaultProps: Pick<Props, "variant"> = {
  variant: "badge",
};

export const Badge = forwardRef(function Badge(
  { children, color, variant = defaultProps.variant, style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={forwardedRef}
      className={classnames({
        [styles.badge]: variant === "badge",
        [styles.pill]: variant === "pill",
      })}
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
