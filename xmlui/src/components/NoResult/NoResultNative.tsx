import { CSSProperties, ForwardedRef, forwardRef } from "react";
import classnames from "classnames";

import styles from "./NoResult.module.scss";

import { Icon } from "../Icon/IconNative";

// Default props for the NoResult component
export const defaultProps = {
  hideIcon: false,
  icon: "noresult",
};

type Props = {
  label: string;
  icon?: string;
  hideIcon?: boolean;
  style?: CSSProperties;
  className?: string;
};

export const NoResult = forwardRef(function NoResult(
  { label, icon = defaultProps.icon, hideIcon = defaultProps.hideIcon, style, className, ...rest }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div className={classnames(styles.wrapper, className)} style={style} ref={forwardedRef} {...rest}>
      {!hideIcon && <Icon name={icon} className={styles.icon} />}
      {label}
    </div>
  );
});
