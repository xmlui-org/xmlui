import { useState } from "react";
import type { Annotation } from "../../types/annotation.types";
import { useDrag } from "../../hooks/useDrag";
import { screenToPdfCoordinates } from "../../utils/coordinateMapping";
import styles from "./DraggableAnnotation.module.scss";

export interface DraggableAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  screenPosition: { x: number; y: number };
  screenSize: { width: number; height: number };
  pageWidth: number;
  pageHeight: number;
  scale: number;
  onAnnotationSelect?: (id: string) => void;
  onAnnotationUpdate?: (id: string, updates: Partial<Annotation>) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * DraggableAnnotation wrapper - Adds drag-and-drop functionality to annotations
 */
export function DraggableAnnotation({
  annotation,
  isSelected,
  screenPosition,
  screenSize,
  pageWidth,
  pageHeight,
  scale,
  onAnnotationSelect,
  onAnnotationUpdate,
  children,
  className,
}: DraggableAnnotationProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const viewport = { width: pageWidth, height: pageHeight, scale };

  const { isDragging, onMouseDown } = useDrag({
    onDragStart: () => {
      onAnnotationSelect?.(annotation.id);
    },
    onDrag: (deltaX, deltaY) => {
      setDragOffset({ x: deltaX, y: deltaY });
    },
    onDragEnd: (deltaX, deltaY) => {
      if (deltaX === 0 && deltaY === 0) {
        setDragOffset({ x: 0, y: 0 });
        return;
      }

      // Calculate new screen position
      const newScreenX = screenPosition.x + deltaX;
      const newScreenY = screenPosition.y + deltaY;

      // Convert back to PDF coordinates
      const newPdfPosition = screenToPdfCoordinates(newScreenX, newScreenY, viewport);

      // Clamp to page boundaries
      const clampedX = Math.max(0, Math.min(newPdfPosition.x, pageWidth - annotation.size.width));
      const clampedY = Math.max(0, Math.min(newPdfPosition.y, pageHeight - annotation.size.height));

      // Update annotation position
      onAnnotationUpdate?.(annotation.id, {
        position: { x: clampedX, y: clampedY },
      });

      setDragOffset({ x: 0, y: 0 });
    },
    disabled: !isSelected,
  });

  const currentLeft = screenPosition.x + dragOffset.x;
  const currentTop = screenPosition.y + dragOffset.y;

  return (
    <div
      className={`${className} ${isDragging ? styles.dragging : ""}`}
      style={{
        left: `${currentLeft}px`,
        top: `${currentTop}px`,
        width: `${screenSize.width}px`,
        height: `${screenSize.height}px`,
        cursor: isSelected ? "move" : "pointer",
      }}
      onMouseDown={onMouseDown}
      onClick={() => onAnnotationSelect?.(annotation.id)}
      data-annotation-id={annotation.id}
      data-annotation-type={annotation.type}
    >
      {children}
    </div>
  );
}
