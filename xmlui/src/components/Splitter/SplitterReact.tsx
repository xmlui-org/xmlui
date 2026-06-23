import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useMemo } from "react";

import { defaultProps, type SplitterResizeMode } from "./Splitter.defaults";
import styles from "./Splitter.module.scss";
import { parseSize } from "./utils";

type SplitterProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: ReactNode;
  splitterTemplate?: ReactNode;
  orientation?: "horizontal" | "vertical";
  floating?: boolean;
  resize?: (primarySize: number) => void | Promise<void>;
  swapped?: boolean;
  initialPrimarySize?: string;
  minPrimarySize?: string;
  maxPrimarySize?: string;
  resizeMode?: SplitterResizeMode;
};

export const Splitter = forwardRef<HTMLDivElement, SplitterProps>(function Splitter(
  {
    children,
    className,
    floating = defaultProps.floating,
    initialPrimarySize = defaultProps.initialPrimarySize,
    maxPrimarySize: _maxPrimarySize = defaultProps.maxPrimarySize,
    minPrimarySize: _minPrimarySize = defaultProps.minPrimarySize,
    orientation = defaultProps.orientation,
    resize: _resize,
    resizeMode: _resizeMode = defaultProps.resizeMode,
    splitterTemplate,
    swapped = defaultProps.swapped,
    style,
    ...rest
  },
  ref,
) {
  const childrenArray = useMemo(() => flattenRenderableChildren(children), [children]);
  const isHorizontal = orientation === "horizontal";
  const isMultiPanel = childrenArray.length > 1;
  const primaryStyle = useMemo<CSSProperties>(() => {
    const fallbackContainerSize = 100;
    const normalizedSize = normalizeSize(initialPrimarySize, fallbackContainerSize);
    return { flexBasis: normalizedSize };
  }, [initialPrimarySize]);

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        styles.splitter,
        isHorizontal ? styles.splitterHorizontal : styles.splitterVertical,
        className,
      )}
      style={{
        ...style,
        flexDirection: isHorizontal ? "row" : "column",
        "--xmlui-splitter-flex-direction": isHorizontal ? "row" : "column",
      } as CSSProperties}
    >
      {isMultiPanel ? (
        <>
          <div
            data-xmlui-part={!swapped ? "primaryPanel" : "secondaryPanel"}
            className={cx(!swapped ? styles.primaryPanel : styles.secondaryPanel)}
            style={!swapped ? primaryStyle : undefined}
          >
            {childrenArray[0]}
          </div>
          {!floating ? (
            <div
              data-xmlui-part="resizer"
              className={cx(
                styles.splitterResizer,
                isHorizontal ? styles.resizerHorizontal : styles.resizerVertical,
              )}
            >
              {splitterTemplate}
            </div>
          ) : null}
          <div
            data-xmlui-part={swapped ? "primaryPanel" : "secondaryPanel"}
            className={cx(swapped ? styles.primaryPanel : styles.secondaryPanel)}
            style={swapped ? primaryStyle : undefined}
          >
            {childrenArray[1]}
          </div>
          {floating ? (
            <div
              data-xmlui-part="resizer"
              className={cx(
                styles.floatingResizer,
                isHorizontal ? styles.floatingResizerHorizontal : styles.floatingResizerVertical,
              )}
            >
              {splitterTemplate}
            </div>
          ) : null}
        </>
      ) : (
        childrenArray[0] ? (
          <div data-xmlui-part="panel" className={styles.panel}>
            {childrenArray[0]}
          </div>
        ) : null
      )}
    </div>
  );
});

function flattenRenderableChildren(children: ReactNode): ReactNode[] {
  return Array.isArray(children)
    ? children.filter((child) => child !== null && child !== undefined && child !== false)
    : children === null || children === undefined || children === false
      ? []
      : [children];
}

function normalizeSize(value: string, fallbackContainerSize: number): string {
  if (/^-?\d+(\.\d+)?(px|%)$/.test(value.trim())) {
    return value;
  }
  try {
    return `${parseSize(value, fallbackContainerSize)}px`;
  } catch {
    return defaultProps.initialPrimarySize;
  }
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
