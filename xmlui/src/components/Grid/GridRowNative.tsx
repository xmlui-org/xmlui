import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./GridRow.module.scss";

type Props = {
  height?: string;
  horizontalAlignment?: "start" | "center" | "end" | "stretch";
  verticalAlignment?: "start" | "center" | "end" | "stretch";
  columnGap?: string;
  children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const defaultProps = {};

export const GridRowNative = forwardRef<HTMLDivElement, Props>(function GridRowNative(
  {
    height,
    horizontalAlignment,
    verticalAlignment,
    columnGap,
    children,
    className,
    style,
    ...rest
  },
  ref,
) {
  const rowStyles: React.CSSProperties = {
    ...style,
    display: "contents",
  };

  // Create a wrapper for row-specific styling if needed
  const hasRowStyling = height || horizontalAlignment || verticalAlignment || columnGap;

  if (!hasRowStyling) {
    // Simple contents display - children flow directly into grid
    return (
      <div
        ref={ref}
        className={classnames(styles.gridRow, className)}
        style={rowStyles}
        {...rest}
      >
        {children}
      </div>
    );
  }

  // With row-specific styling, we need to wrap children
  const wrapperStyles: React.CSSProperties = {};
  
  if (height) {
    wrapperStyles.gridRow = `span 1`;
    wrapperStyles.height = height;
  }
  
  if (horizontalAlignment) {
    wrapperStyles.justifySelf = horizontalAlignment;
  }
  
  if (verticalAlignment) {
    wrapperStyles.alignSelf = verticalAlignment;
  }
  
  if (columnGap) {
    wrapperStyles.columnGap = columnGap;
  }

  return (
    <div
      ref={ref}
      className={classnames(styles.gridRow, className)}
      style={rowStyles}
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
