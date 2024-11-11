import styles from "./Spinner.module.scss";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

interface SpinnerProps {
  delay?: number;
  fullScreen?: boolean;
  style?: CSSProperties;
}

// source https://loading.io/css/
export function Spinner({ delay = 400, fullScreen = false, style }: SpinnerProps) {
  const [pastDelay, setPastDelay] = useState(delay === 0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPastDelay(true);
    }, delay);
    return () => {
      clearTimeout(timeout);
    };
  }, [delay]);

  const spinner = (
    <>
      <div style={style}>
        <div className={styles["lds-ring"]}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </>
  );

  if (!pastDelay) {
    return null;
  } else {
    if (fullScreen) {
      return <div className={styles.fullScreenSpinnerWrapper}>{spinner}</div>;
    }
    return spinner;
  }
}
