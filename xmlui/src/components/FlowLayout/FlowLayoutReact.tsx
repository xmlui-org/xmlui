import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

import { defaultProps } from "./FlowLayout.defaults";
import styles from "./FlowLayout.module.scss";

export type FlowLayoutProps = {
  className?: string;
  style?: CSSProperties;
  columnGap?: string;
  rowGap?: string;
  itemWidth?: string;
  verticalAlignment?: string;
  onContextMenu?: () => void | Promise<void>;
  registerComponentApi?: (api: Record<string, unknown>) => void;
  children?: ReactNode;
};

export type FlowItemWrapperProps = {
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  itemWidth?: string;
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
  registerComponentApi,
  children,
  ...rest
}: FlowLayoutProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollToTop = useCallback((behavior: ScrollBehavior = "instant") => {
    rootRef.current?.scrollTo({ top: 0, behavior });
  }, []);
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    rootRef.current?.scrollTo({ top: rootRef.current.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    registerComponentApi?.({ scrollToTop, scrollToBottom });
  }, [registerComponentApi, scrollToBottom, scrollToTop]);

  return (
    <div
      {...rest}
      ref={rootRef}
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

export function FlowItemWrapper({
  width,
  minWidth,
  maxWidth,
  itemWidth = defaultProps.itemWidth,
  children,
}: FlowItemWrapperProps) {
  return (
    <div
      className={styles.flowLayoutItem}
      style={{
        "--xmlui-itemWidth-FlowLayout": width ?? itemWidth,
        "--xmlui-minWidth-FlowLayoutItem": minWidth,
        "--xmlui-maxWidth-FlowLayoutItem": maxWidth,
      } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function FlowItemBreak() {
  return <div className={cx(styles.flowLayoutBreak, styles.flowLayoutForceBreak)} />;
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
