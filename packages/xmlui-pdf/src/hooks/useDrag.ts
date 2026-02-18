import { useState, useCallback, useRef } from "react";

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface UseDragOptions {
  onDragStart?: (x: number, y: number) => void;
  onDrag?: (deltaX: number, deltaY: number) => void;
  onDragEnd?: (deltaX: number, deltaY: number) => void;
  disabled?: boolean;
}

/**
 * Custom hook for drag-and-drop functionality
 * Returns drag state and event handlers
 */
export function useDrag({
  onDragStart,
  onDrag,
  onDragEnd,
  disabled = false,
}: UseDragOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;
      
      event.stopPropagation();
      event.preventDefault();

      const startX = event.clientX;
      const startY = event.clientY;

      dragStateRef.current = {
        isDragging: true,
        startX,
        startY,
        currentX: startX,
        currentY: startY,
      };

      setIsDragging(true);
      onDragStart?.(startX, startY);
    },
    [disabled, onDragStart]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;

      const currentX = event.clientX;
      const currentY = event.clientY;
      const deltaX = currentX - dragStateRef.current.startX;
      const deltaY = currentY - dragStateRef.current.startY;

      dragStateRef.current.currentX = currentX;
      dragStateRef.current.currentY = currentY;

      onDrag?.(deltaX, deltaY);
    },
    [onDrag]
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;

      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;

      dragStateRef.current.isDragging = false;
      setIsDragging(false);
      onDragEnd?.(deltaX, deltaY);
    },
    [onDragEnd]
  );

  // Set up document-level event listeners for drag
  const startDrag = useCallback(() => {
    if (disabled) return;
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [disabled, handleMouseMove, handleMouseUp]);

  const stopDrag = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  // Auto cleanup on drag end
  if (!isDragging && dragStateRef.current.isDragging === false) {
    stopDrag();
  }

  // Start drag when mousedown happens
  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      handleMouseDown(event);
      startDrag();
    },
    [handleMouseDown, startDrag]
  );

  return {
    isDragging,
    onMouseDown,
    dragHandlers: {
      onMouseDown,
    },
  };
}
