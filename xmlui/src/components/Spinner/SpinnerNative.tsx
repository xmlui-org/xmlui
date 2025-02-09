import { CSSProperties, ForwardedRef, forwardRef, useEffect, useState } from "react";

import styles from "./Spinner.module.scss";

interface SpinnerProps {
  delay?: number;
  fullScreen?: boolean;
  style?: CSSProperties;
}

// source https://loading.io/css/
export const Spinner = forwardRef(function Spinner(
  { delay = 400, fullScreen = false, style }: SpinnerProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
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
      <div className={styles["lds-ring"]} style={style} ref={forwardedRef}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
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
});
