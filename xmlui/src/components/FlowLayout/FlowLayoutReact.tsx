import type { CSSProperties, ReactNode } from "react";

import { defaultProps } from "./FlowLayout.defaults";

const styles = {
  flowLayout: "flowLayout",
  item: "item",
  alignItemsStart: "alignItemsStart",
  alignItemsCenter: "alignItemsCenter",
  alignItemsEnd: "alignItemsEnd",
};

export type FlowLayoutProps = {
  className?: string;
  style?: CSSProperties;
  columnGap?: string;
  rowGap?: string;
  itemWidth?: string;
  verticalAlignment?: string;
  onContextMenu?: () => void | Promise<void>;
  children?: ReactNode;
};

export function FlowLayout({
  className,
  style,
  columnGap = defaultProps.columnGap,
  rowGap = defaultProps.rowGap,
  itemWidth = defaultProps.itemWidth,
  verticalAlignment = defaultProps.verticalAlignment,
  onContextMenu,
  children,
  ...rest
}: FlowLayoutProps) {
  return (
    <div
      {...rest}
      className={cx(styles.flowLayout, alignmentClass(verticalAlignment), className)}
      style={{
        ...style,
        "--xmlui-columnGap-FlowLayout": columnGap,
        "--xmlui-rowGap-FlowLayout": rowGap,
        "--xmlui-itemWidth-FlowLayout": itemWidth,
      } as CSSProperties}
      onContextMenu={() => void onContextMenu?.()}
    >
      {children}
    </div>
  );
}

export function FlowItemWrapper({ children }: { children?: ReactNode }) {
  return <div className={styles.item}>{children}</div>;
}

function alignmentClass(value: string): string | undefined {
  if (value === "center") {
    return styles.alignItemsCenter;
  }
  if (value === "end") {
    return styles.alignItemsEnd;
  }
  return styles.alignItemsStart;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
