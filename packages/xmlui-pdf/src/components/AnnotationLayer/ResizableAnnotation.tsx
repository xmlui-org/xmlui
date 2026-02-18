import { useState } from "react";
import type { Annotation } from "../../types/annotation.types";
import { useResize, ResizeHandle } from "../../hooks/useResize";
import { screenToPdfSize } from "../../utils/coordinateMapping";
import styles from "./ResizableAnnotation.module.scss";

export interface ResizableAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  screenSize: { width: number; height: number };
  pageWidth: number;
  pageHeight: number;
  scale: number;
  onAnnotationUpdate?: (id: string, updates: Partial<Annotation>) => void;
  children: React.ReactNode;
}

const MIN_SIZES = {
  text: { width: 100, height: 30 },
  checkbox: { width: 100, height: 25 },
  signature: { width: 150, height: 60 },
};

/**
 * ResizableAnnotation wrapper - Adds resize handles to annotations
 */
export function ResizableAnnotation({
  annotation,
  isSelected,
  screenSize,
  pageWidth,
  pageHeight,
  scale,
  onAnnotationUpdate,
  children,
}: ResizableAnnotationProps) {
  const [resizeDelta, setResizeDelta] = useState({ width: 0, height: 0 });
  const viewport = { width: pageWidth, height: pageHeight, scale };
  const maintainAspectRatio = annotation.type === "signature";

  const { isResizing, resizeHandlers } = useResize({
    onResizeStart: () => {
      // Visual feedback handled by isResizing state
    },
    onResize: (handle, deltaX, deltaY) => {
      let widthDelta = 0;
      let heightDelta = 0;

      // Calculate size changes based on which handle is being dragged
      switch (handle) {
        case "nw":
          widthDelta = -deltaX;
          heightDelta = -deltaY;
          break;
        case "ne":
          widthDelta = deltaX;
          heightDelta = -deltaY;
          break;
        case "sw":
          widthDelta = -deltaX;
          heightDelta = deltaY;
          break;
        case "se":
          widthDelta = deltaX;
          heightDelta = deltaY;
          break;
      }

      setResizeDelta({ width: widthDelta, height: heightDelta });
    },
    onResizeEnd: (handle, deltaX, deltaY) => {
      if (deltaX === 0 && deltaY === 0) {
        setResizeDelta({ width: 0, height: 0 });
        return;
      }

      let widthDelta = 0;
      let heightDelta = 0;

      // Calculate size changes based on which handle was dragged
      switch (handle) {
        case "nw":
          widthDelta = -deltaX;
          heightDelta = -deltaY;
          break;
        case "ne":
          widthDelta = deltaX;
          heightDelta = -deltaY;
          break;
        case "sw":
          widthDelta = -deltaX;
          heightDelta = deltaY;
          break;
        case "se":
          widthDelta = deltaX;
          heightDelta = deltaY;
          break;
      }

      // Calculate new screen size
      const newScreenWidth = screenSize.width + widthDelta;
      const newScreenHeight = screenSize.height + heightDelta;

      // Convert to PDF size
      const newPdfSize = screenToPdfSize(newScreenWidth, newScreenHeight, viewport);

      // Apply minimum sizes
      const minSize = MIN_SIZES[annotation.type];
      const clampedWidth = Math.max(minSize.width, newPdfSize.width);
      const clampedHeight = Math.max(minSize.height, newPdfSize.height);

      // Update annotation size
      onAnnotationUpdate?.(annotation.id, {
        size: { width: clampedWidth, height: clampedHeight },
      });

      setResizeDelta({ width: 0, height: 0 });
    },
    disabled: !isSelected,
    maintainAspectRatio,
  });

  const currentWidth = screenSize.width + resizeDelta.width;
  const currentHeight = screenSize.height + resizeDelta.height;

  return (
    <div className={styles.resizableWrapper}>
      <div
        className={isResizing ? styles.resizing : ""}
        style={{
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
        }}
      >
        {children}
      </div>
      
      {isSelected && (
        <div className={styles.resizeHandles}>
          <div
            className={`${styles.resizeHandle} ${styles.nw}`}
            onMouseDown={resizeHandlers.nw}
            data-testid="resize-handle-nw"
          />
          <div
            className={`${styles.resizeHandle} ${styles.ne}`}
            onMouseDown={resizeHandlers.ne}
            data-testid="resize-handle-ne"
          />
          <div
            className={`${styles.resizeHandle} ${styles.sw}`}
            onMouseDown={resizeHandlers.sw}
            data-testid="resize-handle-sw"
          />
          <div
            className={`${styles.resizeHandle} ${styles.se}`}
            onMouseDown={resizeHandlers.se}
            data-testid="resize-handle-se"
          />
        </div>
      )}
    </div>
  );
}
