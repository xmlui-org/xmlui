import { CSSProperties, ForwardedRef, forwardRef } from "react";

import styles from "./ProgressBar.module.scss";

interface Props {
  value: number;
  style: CSSProperties;
}

export const defaultProps = {
  value: 0,
};

export const ProgressBar = forwardRef(function ProgressBar(
  { value = defaultProps.value, style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div className={styles.wrapper} style={style} ref={forwardedRef}>
      <div style={{ width: `${value * 100}%` }} className={styles.bar} />
    </div>
  );
});
