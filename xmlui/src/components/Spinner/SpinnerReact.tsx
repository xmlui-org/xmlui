import {
  forwardRef,
  memo,
  useEffect,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
} from "react";
import classnames from "classnames";

import { Part } from "../Part/Part";
import { PART_RING } from "../../components-core/parts";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { defaultProps } from "./Spinner.defaults";
import styles from "./Spinner.module.scss";

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  delay?: unknown;
  fullScreen?: boolean;
  classes?: Record<string, string>;
  className?: string;
  style?: CSSProperties;
};

// source https://loading.io/css/
export const Spinner = memo(forwardRef(function Spinner(
  {
    delay = defaultProps.delay,
    fullScreen = defaultProps.fullScreen,
    classes,
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
      className={classnames(styles["lds-ring"], classes?.[COMPONENT_PART_KEY], className)}
      role={fullScreen ? undefined : "status"}
      aria-label={fullScreen ? undefined : "Loading"}
      style={style}
      ref={forwardedRef}
      {...(!fullScreen ? rest : {})}
    >
      <Part partId={PART_RING}><div></div></Part>
      <div></div>
      <div></div>
      <div></div>
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
