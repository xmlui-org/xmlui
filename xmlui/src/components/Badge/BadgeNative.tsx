import classnames from "@components-core/utils/classnames";
import styles from "./Badge.module.scss";

const badgeVariantValues = ["badge", "pill"] as const;
type BadgeVariant = (typeof badgeVariantValues)[number];

export const badgeVariantNames: string[] = [...badgeVariantValues];

type Props = {
  value: string;
  variant?: BadgeVariant;
  color?: string | BadgeColors;
};

export const Badge = ({ value, color, variant = "badge" }: Props) => {
  return (
    <div
      className={classnames({ [styles.badge]: variant === "badge", [styles.pill]: variant === "pill" })}
      style={
        color
          ? typeof color === "string"
            ? { backgroundColor: color }
            : { backgroundColor: color.background, color: color.label }
          : undefined
      }
    >
      {value}
    </div>
  );
};

type BadgeColors = {
  label: string;
  background: string;
};

