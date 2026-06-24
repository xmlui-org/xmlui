import {
  forwardRef,
  memo,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
} from "react";

import { defaultProps } from "./ProgressBar.defaults";
import styles from "./ProgressBar.module.scss";

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value?: unknown;
  className?: string;
  style?: CSSProperties;
};

export const ProgressBar = memo(forwardRef(function ProgressBar(
  {
    value = defaultProps.value,
    className,
    style,
    ...rest
  }: ProgressBarProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const normalizedValue = normalizeProgressValue(value);
  const barClassName = [
    styles.bar,
    normalizedValue === 1 ? styles.complete : undefined,
  ].filter(Boolean).join(" ");

  return (
    <div
      {...rest}
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      style={style}
      ref={forwardedRef}
    >
      <div
        role="progressbar"
        aria-valuenow={normalizedValue * 100}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ width: `${normalizedValue * 100}%` }}
        className={barClassName}
      />
    </div>
  );
}));

function normalizeProgressValue(value: unknown): number {
  const numeric = typeof value === "number"
    ? value
    : typeof value === "string" && value.trim() !== ""
      ? Number(value)
      : value === true
        ? 1
        : value === false || value === null || value === undefined || value === ""
          ? 0
          : Number(value);
  if (!Number.isFinite(numeric)) {
    return defaultProps.value;
  }
  return Math.max(0, Math.min(1, numeric));
}
