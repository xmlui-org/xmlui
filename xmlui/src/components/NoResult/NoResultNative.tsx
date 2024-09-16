import { Icon } from "@components/Icon/IconNative";
import styles from "./NoResult.module.scss";
import { CSSProperties } from "react";

type Props = {
  label: string;
  icon?: string;
  hideIcon?: boolean;
  style?: CSSProperties;
};

export const NoResult = ({ label, icon, hideIcon = false, style }: Props) => {
  return (
    <div className={styles.wrapper} style={style}>
      {!hideIcon && <Icon name={icon ?? "noResult"} className={styles.icon} />}
      {label}
    </div>
  );
};

