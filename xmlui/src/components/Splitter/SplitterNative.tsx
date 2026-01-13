import React, { useEffect, useState, useMemo } from "react";
import classnames from "classnames";

import styles from "./Splitter.module.scss";

import { noop } from "../../components-core/constants";
import { parseSize, toPercentage } from "../Splitter/utils";
import type { OrientationOptions } from "../abstractions";

export const defaultProps = {
  initialPrimarySize: "50%",
  minPrimarySize: "0%",
  maxPrimarySize: "100%",
  orientation: "vertical" as OrientationOptions,
  swapped: false,
  floating: false,
};

type SplitterProps = {
  children: React.ReactNode[] | React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  splitterTemplate?: React.ReactNode;
  orientation?: OrientationOptions;
  floating?: boolean;
  resize?: (sizes: [number, number]) => void;
  swapped?: boolean;
  initialPrimarySize?: string;
  minPrimarySize?: string;
  maxPrimarySize?: string;
  visibleChildCount?: number;
};

export const Splitter = ({
  initialPrimarySize = defaultProps.initialPrimarySize,
  minPrimarySize = defaultProps.minPrimarySize,
  maxPrimarySize = defaultProps.maxPrimarySize,
  orientation = defaultProps.orientation,
  children,
  style,
  className,
  swapped = defaultProps.swapped,
  floating = defaultProps.floating,
  splitterTemplate,
  resize = noop,
  visibleChildCount,
  ...rest
}: SplitterProps) => {
  const [sizePercentage, setSizePercentage] = useState(50);
  const [containerSize, setContainerSize] = useState(100);
  const [splitter, setSplitter] = useState<HTMLDivElement | null>(null);
  const [resizerVisible, setResizerVisible] = useState(false);
  const [resizer, setResizer] = useState<HTMLDivElement | null>(null);
  const [floatingResizer, setFloatingResizer] = useState<HTMLDivElement | null>(null);
  const resizerElement = useMemo(
    () => (floating ? floatingResizer : resizer),
    [floating, resizer, floatingResizer],
  );

  // Calculate actual size in pixels from percentage
  const size = useMemo(() => {
    return (sizePercentage / 100) * containerSize;
  }, [sizePercentage, containerSize]);

  // Since the XMLUI renderer now pre-filters children, we can use them directly
  const childrenArray = React.Children.toArray(children);
  const actualChildCount = childrenArray.length;
  const effectiveChildCount = visibleChildCount ?? actualChildCount;
  const isMultiPanel = effectiveChildCount > 1;

  // ResizeObserver to track container size changes
  useEffect(() => {
    if (!splitter) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newContainerSize =
          orientation === "horizontal" ? entry.contentRect.width : entry.contentRect.height;
        setContainerSize(newContainerSize);
      }
    });

    resizeObserver.observe(splitter);

    return () => {
      resizeObserver.disconnect();
    };
  }, [splitter, orientation]);

  // Initialize container size and primary panel percentage
  useEffect(() => {
    if (splitter) {
      const newContainerSize =
        orientation === "horizontal"
          ? splitter.getBoundingClientRect().width
          : splitter.getBoundingClientRect().height;

      setContainerSize(newContainerSize);

      // Parse initial size and convert to percentage
      const initialParsedSize = parseSize(initialPrimarySize, newContainerSize);
      const initialPercentage = toPercentage(initialParsedSize, newContainerSize);

      setSizePercentage(initialPercentage);

      if (resize) {
        const actualPrimarySize = (initialPercentage / 100) * newContainerSize;
        resize([actualPrimarySize, newContainerSize - actualPrimarySize]);
      }
    }
  }, [initialPrimarySize, orientation, resize, splitter, swapped]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (splitter && resizerElement && containerSize > 0) {
        const newSize =
          orientation === "horizontal"
            ? Math.min(
                Math.max(
                  event.clientX - splitter.getBoundingClientRect().left,
                  parseSize(minPrimarySize, containerSize),
                ),
                parseSize(maxPrimarySize, containerSize),
              )
            : Math.min(
                Math.max(
                  event.clientY - splitter.getBoundingClientRect().top,
                  parseSize(minPrimarySize, containerSize),
                ),
                parseSize(maxPrimarySize, containerSize),
              );

        const newPercentage = toPercentage(newSize, containerSize);
        setSizePercentage(newPercentage);

        if (resize) {
          resize([newPercentage, 100 - newPercentage]);
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = () => {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    if (resizerElement) {
      resizerElement.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      if (resizerElement) {
        resizerElement.removeEventListener("mousedown", handleMouseDown);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    minPrimarySize,
    maxPrimarySize,
    orientation,
    resize,
    floating,
    resizerElement,
    splitter,
    containerSize,
  ]);

  useEffect(() => {
    const watchResizer = (event: MouseEvent) => {
      const cursorPosition = orientation === "horizontal" ? event.clientX : event.clientY;
      if (splitter) {
        const paneStart =
          orientation === "horizontal"
            ? splitter.getBoundingClientRect().left
            : splitter.getBoundingClientRect().top;
        const resizerPosition = paneStart + size;
        // Check if the cursor is near the resizer (within 20 pixels)
        if (cursorPosition > resizerPosition - 20 && cursorPosition < resizerPosition + 20) {
          setResizerVisible(true);
        } else {
          setResizerVisible(false);
        }
      }
    };

    if (splitter) {
      splitter.addEventListener("mousemove", watchResizer);
      splitter.addEventListener("mouseleave", () => setResizerVisible(false));
    }

    return () => {
      if (splitter) {
        splitter.removeEventListener("mouseleave", () => setResizerVisible(false));
        splitter.removeEventListener("mousemove", watchResizer);
      }
    };
  }, [size, orientation, splitter]);

  useEffect(() => {
    if (floatingResizer) {
      floatingResizer.style.opacity = resizerVisible ? "1" : "0";
    }
  }, [floatingResizer, resizerVisible]);

  return (
    <div
      {...rest}
      ref={(s) => setSplitter(s)}
      className={classnames(
        styles.splitter,
        {
          [styles.horizontal]: orientation === "horizontal",
          [styles.vertical]: orientation === "vertical",
        },
        className,
      )}
      style={style}
    >
      {isMultiPanel ? (
        <>
          <div
            style={!swapped ? { flexBasis: size } : {}}
            className={classnames({
              [styles.primaryPanel]: !swapped,
              [styles.secondaryPanel]: swapped,
            })}
          >
            {childrenArray[0]}
          </div>
          {!floating && (
            <div
              className={classnames(styles.resizer, {
                [styles.horizontal]: orientation === "horizontal",
                [styles.vertical]: orientation === "vertical",
              })}
              ref={(r) => setResizer(r)}
            >
              {splitterTemplate}
            </div>
          )}
          <div
            className={classnames({
              [styles.primaryPanel]: swapped,
              [styles.secondaryPanel]: !swapped,
            })}
            style={swapped ? { flexBasis: size } : {}}
          >
            {childrenArray[1]}
          </div>
          {floating && (
            <div
              ref={(fr) => setFloatingResizer(fr)}
              className={classnames(styles.floatingResizer, {
                [styles.horizontal]: orientation === "horizontal",
                [styles.vertical]: orientation === "vertical",
              })}
              style={{
                top: orientation === "horizontal" ? 0 : size,
                left: orientation === "horizontal" ? size : 0,
              }}
            >
              {splitterTemplate}
            </div>
          )}
        </>
      ) : (
        <>{childrenArray?.[0] && <div className={styles.panel}>{childrenArray[0]}</div>}</>
      )}
    </div>
  );
};
