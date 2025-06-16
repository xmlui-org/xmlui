import { CSSProperties, ForwardedRef, forwardRef } from "react";

import styles from "./NoResult.module.scss";

import { Icon } from "../Icon/IconNative";

// Default props for the NoResult component
export const defaultProps = {
  hideIcon: false,
  icon: "noresult"
};

type Props = {
  label: string;
  icon?: string;
  hideIcon?: boolean;
  style?: CSSProperties;
};

export const NoResult = forwardRef(function NoResult(
  { label, icon = defaultProps.icon, hideIcon = defaultProps.hideIcon, style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div className={styles.wrapper} style={style} ref={forwardedRef}>
      {!hideIcon && <Icon name={icon} className={styles.icon} />}
      {label}
    </div>
  );
});
