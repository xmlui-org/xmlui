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
  /** MouseDown handler that triggers drag/move — supplied by DraggableAnnotation */
  onMoveHandleMouseDown?: (e: React.MouseEvent) => void;
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
  onMoveHandleMouseDown,
  children,
}: ResizableAnnotationProps) {
  const [resizeDelta, setResizeDelta] = useState({ width: 0, height: 0 });
  const viewport = { width: pageWidth, height: pageHeight, scale };
  const maintainAspectRatio = annotation.type === "signature";

  // Respect annotation-level flags (default: both enabled)
  const canResize = annotation.properties.resizable !== false;
  const canMove = annotation.properties.movable !== false;

  const { isResizing, resizeHandlers } = useResize({
    onResizeStart: () => {
      // Visual feedback handled by isResizing state
    },
    onResize: (handle, deltaX, deltaY) => {
      // Only SE handle now, so deltaX/deltaY map directly to width/height
      setResizeDelta({ width: deltaX, height: deltaY });
    },
    onResizeEnd: (handle, deltaX, deltaY) => {
      if (deltaX === 0 && deltaY === 0) {
        setResizeDelta({ width: 0, height: 0 });
        return;
      }

      // Calculate new screen size
      const newScreenWidth = screenSize.width + deltaX;
      const newScreenHeight = screenSize.height + deltaY;

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
    disabled: !isSelected || !canResize,
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
          {canMove && onMoveHandleMouseDown && (
            <div
              className={`${styles.resizeHandle} ${styles.moveHandle} ${styles.nw}`}
              onMouseDown={(e) => { e.stopPropagation(); onMoveHandleMouseDown(e); }}
              data-testid="move-handle-nw"
              title="Move"
            />
          )}
          {canResize && (
            <div
              className={`${styles.resizeHandle} ${styles.se}`}
              onMouseDown={resizeHandlers.se}
              data-testid="resize-handle-se"
              title="Resize"
            />
          )}
        </div>
      )}
    </div>
  );
}
