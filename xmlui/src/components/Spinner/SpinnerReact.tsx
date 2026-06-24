import {
  forwardRef,
  memo,
  useEffect,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
} from "react";

import { defaultProps } from "./Spinner.defaults";
import styles from "./Spinner.module.scss";

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  delay?: unknown;
  fullScreen?: boolean;
  className?: string;
  style?: CSSProperties;
};

export const Spinner = memo(forwardRef(function Spinner(
  {
    delay = defaultProps.delay,
    fullScreen = defaultProps.fullScreen,
    className,
    style,
    ...rest
  }: SpinnerProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const normalizedDelay = normalizeDelay(delay);
  const [pastDelay, setPastDelay] = useState(normalizedDelay === 0);

  useEffect(() => {
    if (normalizedDelay === 0) {
      setPastDelay(true);
      return;
    }
    setPastDelay(false);
    const timeout = setTimeout(() => {
      setPastDelay(true);
    }, normalizedDelay);
    return () => {
      clearTimeout(timeout);
    };
  }, [normalizedDelay]);

  if (!pastDelay) {
    return null;
  }

  const spinner = (
    <div
      className={[styles.spinner, className].filter(Boolean).join(" ")}
      role={fullScreen ? undefined : "status"}
      aria-label={fullScreen ? undefined : "Loading"}
      style={style}
      ref={fullScreen ? undefined : forwardedRef}
      {...(!fullScreen ? rest : {})}
    >
      <div className={styles.spinnerSegment} data-part-id="ring" data-xmlui-part="ring" />
      <div className={styles.spinnerSegment} />
      <div className={styles.spinnerSegment} />
      <div className={styles.spinnerSegment} />
    </div>
  );

  if (!fullScreen) {
    return spinner;
  }

  return (
    <div
      {...rest}
      className={styles.fullScreenSpinnerWrapper}
      role="status"
      aria-label="Loading"
      ref={forwardedRef}
    >
      {spinner}
    </div>
  );
}));

function normalizeDelay(delay: unknown): number {
  if (delay === undefined || delay === null) {
    return 0;
  }
  if (typeof delay === "number") {
    return Number.isFinite(delay) ? Math.max(0, delay) : defaultProps.delay;
  }
  if (typeof delay === "string" && delay.trim() !== "") {
    const parsed = Number(delay);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : defaultProps.delay;
  }
  return defaultProps.delay;
}
