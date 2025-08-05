import type { CSSProperties, ForwardedRef } from "react";
import { forwardRef, useEffect, useState } from "react";

import styles from "./Spinner.module.scss";

export const defaultProps = {
  delay: 400,
  fullScreen: false,
};

type SpinnerProps = {
  delay?: number;
  fullScreen?: boolean;
  style?: CSSProperties;
};

// source https://loading.io/css/
export const Spinner = forwardRef(function Spinner(
  { delay = defaultProps.delay, fullScreen = defaultProps.fullScreen, style }: SpinnerProps,
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

  if (!pastDelay) {
    return null;
  } else {
    if (fullScreen) {
      return (
        <div role="status" aria-label="Loading" className={styles.fullScreenSpinnerWrapper}>
          <div className={styles["lds-ring"]} style={style} ref={forwardedRef}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          ;
        </div>
      );
    }
    return;
    <div
      className={styles["lds-ring"]}
      role="status"
      aria-label="Loading"
      style={style}
      ref={forwardedRef}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>;
  }
});
