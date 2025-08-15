import { CSSProperties, ForwardedRef, forwardRef } from "react";
import classnames from "classnames";

import styles from "./ProgressBar.module.scss";

interface Props {
  value: number;
  style?: CSSProperties;
  className?: string;
}

export const defaultProps = {
  value: 0,
};

export const ProgressBar = forwardRef(function ProgressBar(
  { value = defaultProps.value, style, className }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div className={classnames(styles.wrapper, className)} style={style} ref={forwardedRef}>
      <div
        role="progressbar"
        aria-valuenow={value * 100}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ width: `${value * 100}%` }}
        className={styles.bar}
      />
    </div>
  );
});
