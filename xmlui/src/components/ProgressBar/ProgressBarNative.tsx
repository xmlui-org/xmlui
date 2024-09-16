import styles from "./ProgressBar.module.scss";
import { CSSProperties, forwardRef } from "react";

interface Props {
  value: number;
  style: CSSProperties;
}

export const ProgressBar = forwardRef(function ProgressBar({ value = 0, style }: Props, ref) {
  return (
    <div className={styles.wrapper} style={style} ref={ref as any}>
      <div style={{ width: `${value * 100}%` }} className={styles.bar} />
    </div>
  );
});
