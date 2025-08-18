import React, { useEffect, useState, useMemo } from "react";
import classnames from "classnames";

import styles from "./Splitter.module.scss";

import { noop } from "../../components-core/constants";
import { parseSize, toPercentage } from "../Splitter/utils";
import { OrientationOptions } from "../abstractions";

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
}: SplitterProps) => {
  const [size, setSize] = useState(0);
  const [splitter, setSplitter] = useState<HTMLDivElement | null>(null);
  const [resizerVisible, setResizerVisible] = useState(false);
  const [resizer, setResizer] = useState<HTMLDivElement | null>(null);
  const [floatingResizer, setFloatingResizer] = useState<HTMLDivElement | null>(null);
  const resizerElement = useMemo(
    () => (floating ? floatingResizer : resizer),
    [floating, resizer, floatingResizer],
  );

  useEffect(() => {
    if (splitter) {
      const containerSize =
        orientation === "horizontal"
          ? splitter.getBoundingClientRect().width
          : splitter.getBoundingClientRect().height;
      const initialParsedSize = parseSize(initialPrimarySize, containerSize);

      setSize(initialParsedSize);
      if (resize) {
        resize([
          toPercentage(initialParsedSize, containerSize),
          toPercentage(containerSize - initialParsedSize, containerSize),
        ]);
      }
    }
  }, [initialPrimarySize, orientation, resize, splitter, swapped]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (splitter && resizerElement) {
        const containerSize =
          orientation === "horizontal"
            ? splitter.getBoundingClientRect().width
            : splitter.getBoundingClientRect().height;
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

        setSize(newSize);
        if (resize) {
          resize([
            toPercentage(newSize, containerSize),
            toPercentage(containerSize - newSize, containerSize),
          ]);
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
  }, [minPrimarySize, maxPrimarySize, orientation, resize, floating, resizerElement, splitter]);

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
      ref={(s) => setSplitter(s)}
      className={classnames(styles.splitter, {
        [styles.horizontal]: orientation === "horizontal",
        [styles.vertical]: orientation === "vertical",
      }, className)}
      style={style}
    >
      {React.Children.count(children) > 1 ? (
        <>
          <div
            style={!swapped ? { flexBasis: size } : {}}
            className={classnames({
              [styles.primaryPanel]: !swapped,
              [styles.secondaryPanel]: swapped,
            })}
          >
            {React.Children.toArray(children)[0]}
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
            {React.Children.toArray(children)[1]}
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
        <>
          {React.Children.toArray(children)?.[0] && (
            <div className={styles.panel}>{React.Children.toArray(children)[0]}</div>
          )}
        </>
      )}
    </div>
  );
};
