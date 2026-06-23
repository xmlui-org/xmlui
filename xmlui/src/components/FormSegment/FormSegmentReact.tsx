import type { CSSProperties, ReactNode } from "react";

import styles from "./FormSegment.module.scss";

export type FormSegmentProps = {
  className?: string;
  style?: CSSProperties;
  orientation?: string;
  children?: ReactNode;
} & Record<string, unknown>;

export function FormSegment({
  className,
  style,
  orientation = "vertical",
  children,
  ...rest
}: FormSegmentProps) {
  const normalizedOrientation = orientation === "horizontal" ? "horizontal" : "vertical";
  return (
    <div
      {...rest}
      className={cx(
        styles.segment,
        normalizedOrientation === "horizontal" ? styles.horizontal : styles.vertical,
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

