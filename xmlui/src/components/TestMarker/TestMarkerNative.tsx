import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./TestMarker.module.scss";

type Props = {
  tag?: string;
  children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const TestMarkerNative = forwardRef<HTMLDivElement, Props>(
  function TestMarkerNative(
    {
      tag,
      children,
      className,
      ...rest
    }: Props,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) {
    // Build data attributes object
    const dataAttributes: Record<string, string> = {};
    
    if (tag) {
      dataAttributes['data-test'] = tag;
    }

    return (
      <div
        ref={ref}
        className={classnames(styles.testMarker, className)}
        {...dataAttributes}
        {...rest}
      >
        {children}
      </div>
    );
  },
);