import type { CSSProperties, ForwardedRef } from "react";
import { forwardRef, useEffect, useState } from "react";

import styles from "./Spinner.module.scss";
import classnames from "classnames";
import { Part } from "../Part/Part";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const PART_RING = "ring";

export const defaultProps = {
  delay: 400,
  fullScreen: false,
};

type SpinnerProps = {
  delay?: number;
  fullScreen?: boolean;
  style?: CSSProperties;
  classes?: Record<string, string>;
  className?: string;
};

// source https://loading.io/css/
export const Spinner = forwardRef(function Spinner(
  {
    delay = defaultProps.delay,
    fullScreen = defaultProps.fullScreen,
    style,
    classes,
    className,
    ...rest
  }: SpinnerProps,
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
        <div
          {...rest}
          role="status"
          aria-label="Loading"
          className={styles.fullScreenSpinnerWrapper}
        >
          <div
            className={classnames(styles["lds-ring"], classes?.[COMPONENT_PART_KEY], className)}
            style={style}
            ref={forwardedRef}
          >
            <Part partId={PART_RING}><div></div></Part>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      );
    }
    return (
      <div
        {...rest}
        className={classnames(styles["lds-ring"], classes?.[COMPONENT_PART_KEY], className)}
        role="status"
        aria-label="Loading"
        style={style}
        ref={forwardedRef}
      >
        <Part partId={PART_RING}><div></div></Part>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
});
