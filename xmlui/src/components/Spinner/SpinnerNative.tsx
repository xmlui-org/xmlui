import type { CSSProperties, ForwardedRef} from "react";
import { forwardRef, useEffect, useState } from "react";

import styles from "./Spinner.module.scss";
import classnames from "classnames";

export const defaultProps = {
  delay: 400,
  fullScreen: false
};

type SpinnerProps  = {
  delay?: number;
  fullScreen?: boolean;
  style?: CSSProperties;
  className?: string;
}

// source https://loading.io/css/
export const Spinner = forwardRef(function Spinner(
  { delay = defaultProps.delay, fullScreen = defaultProps.fullScreen, style, className }: SpinnerProps,
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
      <div className={classnames(styles["lds-ring"], className)} style={style} ref={forwardedRef}>
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
