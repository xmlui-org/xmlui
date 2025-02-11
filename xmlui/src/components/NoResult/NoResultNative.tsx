import { CSSProperties, ForwardedRef, forwardRef } from "react";

import styles from "./NoResult.module.scss";

import { Icon } from "../Icon/IconNative";

type Props = {
  label: string;
  icon?: string;
  hideIcon?: boolean;
  style?: CSSProperties;
};

export const NoResult = forwardRef(function NoResult(
  { label, icon, hideIcon = false, style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div className={styles.wrapper} style={style} ref={forwardedRef}>
      {!hideIcon && <Icon name={icon ?? "noresult"} className={styles.icon} />}
      {label}
    </div>
  );
});
