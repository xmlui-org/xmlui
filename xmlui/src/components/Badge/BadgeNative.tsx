import { ForwardedRef, forwardRef } from "react";
import classnames from "classnames";

import styles from "./Badge.module.scss";

const badgeVariantValues = ["badge", "pill"] as const;
export type BadgeVariant = (typeof badgeVariantValues)[number];
export const badgeVariantNames: string[] = [...badgeVariantValues];
export type BadgeColors = {
  label: string;
  background: string;
};

type Props = {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  color?: string | BadgeColors;
};

export const Badge = forwardRef(function Badge(
  { children, color, variant = "badge" }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={forwardedRef}
      className={classnames({
        [styles.badge]: variant === "badge",
        [styles.pill]: variant === "pill",
      })}
      style={
        color
          ? typeof color === "string"
            ? { backgroundColor: color }
            : { backgroundColor: color.background, color: color.label }
          : undefined
      }
    >
      {children}
    </div>
  );
});
