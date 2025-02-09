import { CSSProperties, ForwardedRef, forwardRef } from "react";

import styles from "./ProgressBar.module.scss";

interface Props {
  value: number;
  style: CSSProperties;
}

export const ProgressBar = forwardRef(function ProgressBar(
  { value = 0, style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div className={styles.wrapper} style={style} ref={forwardedRef}>
      <div style={{ width: `${value * 100}%` }} className={styles.bar} />
    </div>
  );
});
