import { forwardRef, useMemo } from "react";
import classnames from "classnames";
import styles from "./Grid.module.scss";

type Props = {
  columnWidths?: string;
  rowHeights?: string;
  columns?: number;
  rows?: number;
  columnGap?: string;
  rowGap?: string;
  gap?: string;
  horizontalAlignment?: "start" | "center" | "end" | "stretch";
  verticalAlignment?: "start" | "center" | "end" | "stretch";
  data?: any[];
  children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const defaultProps = {
  horizontalAlignment: "stretch" as const,
  verticalAlignment: "stretch" as const,
};

export const GridNative = forwardRef<HTMLDivElement, Props>(function GridNative(
  {
    columnWidths,
    rowHeights,
    columns,
    rows,
    columnGap,
    rowGap,
    gap,
    horizontalAlignment = defaultProps.horizontalAlignment,
    verticalAlignment = defaultProps.verticalAlignment,
    data,
    children,
    className,
    style,
    ...rest
  },
  ref,
) {
  const gridStyles = useMemo(() => {
    const styles: React.CSSProperties = { ...style };

    // Parse and apply column widths
    if (columnWidths) {
      styles.gridTemplateColumns = columnWidths;
    } else if (columns) {
      // Create implicit columns with auto sizing
      styles.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    // Parse and apply row heights
    if (rowHeights) {
      styles.gridTemplateRows = rowHeights;
    } else if (rows) {
      // Create implicit rows with auto sizing
      styles.gridTemplateRows = `repeat(${rows}, auto)`;
    }

    // Apply gaps - columnGap/rowGap override gap if specified
    styles.columnGap = columnGap || gap;
    styles.rowGap = rowGap || gap;

    // Apply default alignment
    if (horizontalAlignment) {
      styles.justifyItems = horizontalAlignment;
    }
    if (verticalAlignment) {
      styles.alignItems = verticalAlignment;
    }

    return styles;
  }, [
    columnWidths,
    rowHeights,
    columns,
    rows,
    columnGap,
    rowGap,
    gap,
    horizontalAlignment,
    verticalAlignment,
    style,
  ]);

  return (
    <div ref={ref} className={classnames(styles.grid, className)} style={gridStyles} {...rest}>
      {children}
    </div>
  );
});
