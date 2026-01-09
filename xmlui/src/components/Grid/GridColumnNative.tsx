import React, { forwardRef } from "react";
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
  const columnStyles: React.CSSProperties = {
    ...style,
    display: "contents",
  };

  // Create a wrapper for column-specific styling if needed
  const hasColumnStyling = width || horizontalAlignment || verticalAlignment || rowGap;

  if (!hasColumnStyling) {
    // Simple contents display - children flow directly into grid
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
  }

  // With column-specific styling, we need to wrap children
  const wrapperStyles: React.CSSProperties = {};
  
  if (width) {
    wrapperStyles.gridColumn = `span 1`;
    wrapperStyles.width = width;
  }
  
  if (horizontalAlignment) {
    wrapperStyles.justifyItems = horizontalAlignment;
  }
  
  if (verticalAlignment) {
    wrapperStyles.alignItems = verticalAlignment;
  }
  
  if (rowGap) {
    wrapperStyles.rowGap = rowGap;
  }

  return (
    <div
      ref={ref}
      className={classnames(styles.gridColumn, className)}
      style={columnStyles}
      {...rest}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} style={wrapperStyles}>
          {child}
        </div>
      ))}
    </div>
  );
});
