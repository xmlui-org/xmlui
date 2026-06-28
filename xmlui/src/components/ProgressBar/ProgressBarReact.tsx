import type { ForwardedRef } from "react";
import { forwardRef, memo } from "react";
import classnames from "classnames";

import styles from "./ProgressBar.module.scss";
import { COMPONENT_PART_KEY } from "../../styling";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  classes?: Record<string, string>;
}

import { defaultProps } from "./ProgressBar.defaults";

export const ProgressBar = memo(forwardRef(function ProgressBar(
  { value = defaultProps.value, style, className, classes, ...rest }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      {...rest}
      className={classnames(styles.wrapper, classes?.[COMPONENT_PART_KEY], className)}
      style={style}
      ref={forwardedRef}
    >
      <div
        role="progressbar"
        aria-valuenow={value * 100}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ width: `${value * 100}%` }}
        className={classnames(styles.bar, { [styles.complete]: value === 1 })}
      />
    </div>
  );
}));
