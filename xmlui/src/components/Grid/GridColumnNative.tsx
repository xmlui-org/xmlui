import { forwardRef } from "react";
import classnames from "classnames";
import styles from "./GridColumn.module.scss";

type Props = {
  width?: string;
  horizontalAlignment?: "start" | "center" | "end" | "stretch";
  verticalAlignment?: "start" | "center" | "end" | "stretch";
  rowGap?: string;
  children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const defaultProps = {};

export const GridColumnNative = forwardRef<HTMLDivElement, Props>(function GridColumnNative(
  {
    width,
    horizontalAlignment,
    verticalAlignment,
    rowGap,
    children,
    className,
    style,
    ...rest
  },
  ref,
) {
  // Use display: contents to make children behave as grid items
  const columnStyles: React.CSSProperties = {
    ...style,
    display: "contents",
  };

  return (
    <div
      ref={ref}
      className={classnames(styles.gridColumn, className)}
      style={columnStyles}
      {...rest}
    >
      {children}
    </div>
  );
});
