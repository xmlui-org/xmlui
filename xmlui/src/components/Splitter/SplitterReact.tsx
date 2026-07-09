import React, { forwardRef, memo, useEffect, useRef, useState, useMemo } from "react";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

import styles from "./Splitter.module.scss";

import { noop } from "../../components-core/constants";
import { parseSize, toPercentage } from "../Splitter/utils";
import type { OrientationOptions } from "../abstractions";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { PART_PRIMARY_PANEL, PART_SECONDARY_PANEL } from "../../components-core/parts";
import { Part } from "../Part/Part";
import { defaultProps, type SplitterResizeMode } from "./Splitter.defaults";

type SplitterProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: React.ReactNode;
  classes?: Record<string, string>;
  splitterTemplate?: React.ReactNode;
  orientation?: OrientationOptions;
  floating?: boolean;
  resize?: (primarySize: number) => void;
  swapped?: boolean;
  initialPrimarySize?: string;
  minPrimarySize?: string;
  maxPrimarySize?: string;
  resizeMode?: SplitterResizeMode;
  visibleChildCount?: number;
};

function clampPrimarySize(size: number, containerSize: number, minSize: string, maxSize: string) {
  return Math.min(
    Math.max(size, parseSize(minSize, containerSize)),
    parseSize(maxSize, containerSize),
  );
}

export const Splitter = memo(forwardRef(function Splitter({
  initialPrimarySize = defaultProps.initialPrimarySize,
  minPrimarySize = defaultProps.minPrimarySize,
  maxPrimarySize = defaultProps.maxPrimarySize,
  resizeMode = defaultProps.resizeMode,
  orientation = defaultProps.orientation,
  children,
  style,
  className,
  classes,
  swapped = defaultProps.swapped,
  floating = defaultProps.floating,
  splitterTemplate,
  resize = noop,
  visibleChildCount,
  ...rest
}: SplitterProps, forwardedRef: React.ForwardedRef<HTMLDivElement>) {
  const [sizePercentage, setSizePercentage] = useState(50);
  const [containerSize, setContainerSize] = useState(100);
  const [splitter, setSplitter] = useState<HTMLDivElement | null>(null);
  const splitterRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(forwardedRef, splitterRef, setSplitter as React.RefCallback<HTMLDivElement>);
  const [resizerVisible, setResizerVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizer, setResizer] = useState<HTMLDivElement | null>(null);
  const [floatingResizer, setFloatingResizer] = useState<HTMLDivElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const sizePercentageRef = useRef(sizePercentage);
  const containerSizeRef = useRef(containerSize);
  const isInitializedRef = useRef(isInitialized);
  const resizerElement = useMemo(
    () => (floating ? floatingResizer : resizer),
    [floating, resizer, floatingResizer],
  );

  useEffect(() => {
    sizePercentageRef.current = sizePercentage;
  }, [sizePercentage]);

  useEffect(() => {
    containerSizeRef.current = containerSize;
  }, [containerSize]);

  useEffect(() => {
    isInitializedRef.current = isInitialized;
  }, [isInitialized]);

  // Calculate actual size in pixels from percentage
  const size = useMemo(() => {
    return (sizePercentage / 100) * containerSize;
  }, [sizePercentage, containerSize]);

  const floatingResizerStyle = useMemo(
    () => ({
      top: orientation === "horizontal" ? 0 : size,
      left: orientation === "horizontal" ? size : 0,
    }),
    [orientation, size],
  );

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
        const currentContainerSize = containerSizeRef.current;

        if (!isInitializedRef.current || currentContainerSize <= 0 || newContainerSize <= 0) {
          setContainerSize(newContainerSize);
          continue;
        }

        const currentPrimarySize = (sizePercentageRef.current / 100) * currentContainerSize;
        const currentSecondarySize = currentContainerSize - currentPrimarySize;
        const nextPrimarySize =
          resizeMode === "preservePrimary"
            ? currentPrimarySize
            : resizeMode === "preserveSecondary"
              ? newContainerSize - currentSecondarySize
              : (sizePercentageRef.current / 100) * newContainerSize;
        const constrainedPrimarySize = clampPrimarySize(
          nextPrimarySize,
          newContainerSize,
          minPrimarySize,
          maxPrimarySize,
        );

        setContainerSize(newContainerSize);
        setSizePercentage(toPercentage(constrainedPrimarySize, newContainerSize));
      }
    });

    resizeObserver.observe(splitter);

    return () => {
      resizeObserver.disconnect();
    };
  }, [maxPrimarySize, minPrimarySize, orientation, resizeMode, splitter]);

  // Initialize container size and primary panel percentage
  useEffect(() => {
    if (splitter) {
      const newContainerSize =
        orientation === "horizontal"
          ? splitter.getBoundingClientRect().width
          : splitter.getBoundingClientRect().height;

      setContainerSize(newContainerSize);

      // Parse initial size and convert to percentage
      const initialParsedSize = clampPrimarySize(
        parseSize(initialPrimarySize, newContainerSize),
        newContainerSize,
        minPrimarySize,
        maxPrimarySize,
      );
      const initialPercentage = toPercentage(initialParsedSize, newContainerSize);

      setSizePercentage(initialPercentage);
      setIsInitialized(true);

      if (resize) {
        const actualPrimarySize = (initialPercentage / 100) * newContainerSize;
        resize(actualPrimarySize);
      }
    }
  }, [initialPrimarySize, maxPrimarySize, minPrimarySize, orientation, resize, splitter, swapped]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (splitter && resizerElement && containerSize > 0) {
        const newSize =
          orientation === "horizontal"
            ? clampPrimarySize(
                event.clientX - splitter.getBoundingClientRect().left,
                containerSize,
                minPrimarySize,
                maxPrimarySize,
              )
            : clampPrimarySize(
                event.clientY - splitter.getBoundingClientRect().top,
                containerSize,
                minPrimarySize,
                maxPrimarySize,
              );

        const newPercentage = toPercentage(newSize, containerSize);
        setSizePercentage(newPercentage);

        if (resize) {
          resize(newSize);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = () => {
      setIsDragging(true);
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
      ref={composedRef}
      className={classnames(
        styles.splitter,
        {
          [styles.horizontal]: orientation === "horizontal",
          [styles.vertical]: orientation === "vertical",
          [styles.dragging]: isDragging,
        },
        classes?.[COMPONENT_PART_KEY],
        className,
      )}
      style={style}
    >
      {isMultiPanel ? (
        <>
          <Part partId={!swapped ? PART_PRIMARY_PANEL : PART_SECONDARY_PANEL}>
            <div
              style={
                !swapped
                  ? { flexBasis: isInitialized ? size : initialPrimarySize }
                  : {}
              }
              className={classnames({
                [styles.primaryPanel]: !swapped,
                [styles.secondaryPanel]: swapped,
              })}
            >
              {childrenArray[0]}
            </div>
          </Part>
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
          <Part partId={swapped ? PART_PRIMARY_PANEL : PART_SECONDARY_PANEL}>
            <div
              className={classnames({
                [styles.primaryPanel]: swapped,
                [styles.secondaryPanel]: !swapped,
              })}
              style={
                swapped
                  ? { flexBasis: isInitialized ? size : initialPrimarySize }
                  : {}
              }
            >
              {childrenArray[1]}
            </div>
          </Part>
          {floating && (
            <div
              ref={(fr) => setFloatingResizer(fr)}
              className={classnames(styles.floatingResizer, {
                [styles.horizontal]: orientation === "horizontal",
                [styles.vertical]: orientation === "vertical",
              })}
              style={floatingResizerStyle}
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
}));
