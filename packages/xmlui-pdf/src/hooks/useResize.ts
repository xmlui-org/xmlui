import { useState, useCallback, useRef } from "react";

export type ResizeHandle = "nw" | "ne" | "sw" | "se";

export interface ResizeState {
  isResizing: boolean;
  handle: ResizeHandle | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface UseResizeOptions {
  onResizeStart?: (handle: ResizeHandle, x: number, y: number) => void;
  onResize?: (handle: ResizeHandle, deltaX: number, deltaY: number) => void;
  onResizeEnd?: (handle: ResizeHandle, deltaX: number, deltaY: number) => void;
  disabled?: boolean;
  maintainAspectRatio?: boolean;
}

/**
 * Custom hook for resize functionality
 * Returns resize state and event handlers for each corner handle
 */
export function useResize({
  onResizeStart,
  onResize,
  onResizeEnd,
  disabled = false,
  maintainAspectRatio = false,
}: UseResizeOptions = {}) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeStateRef = useRef<ResizeState>({
    isResizing: false,
    handle: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const handleMouseDown = useCallback(
    (handle: ResizeHandle) => (event: React.MouseEvent) => {
      if (disabled) return;
      
      event.stopPropagation();
      event.preventDefault();

      const startX = event.clientX;
      const startY = event.clientY;

      resizeStateRef.current = {
        isResizing: true,
        handle,
        startX,
        startY,
        currentX: startX,
        currentY: startY,
      };

      setIsResizing(true);
      onResizeStart?.(handle, startX, startY);
    },
    [disabled, onResizeStart]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!resizeStateRef.current.isResizing || !resizeStateRef.current.handle) return;

      const currentX = event.clientX;
      const currentY = event.clientY;
      let deltaX = currentX - resizeStateRef.current.startX;
      let deltaY = currentY - resizeStateRef.current.startY;

      // Maintain aspect ratio if needed
      if (maintainAspectRatio && resizeStateRef.current.handle) {
        const avgDelta = (Math.abs(deltaX) + Math.abs(deltaY)) / 2;
        const sign = deltaX * deltaY >= 0 ? 1 : -1;
        deltaX = avgDelta * Math.sign(deltaX);
        deltaY = avgDelta * Math.sign(deltaY) * sign;
      }

      resizeStateRef.current.currentX = currentX;
      resizeStateRef.current.currentY = currentY;

      onResize?.(resizeStateRef.current.handle, deltaX, deltaY);
    },
    [onResize, maintainAspectRatio]
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (!resizeStateRef.current.isResizing || !resizeStateRef.current.handle) return;

      const handle = resizeStateRef.current.handle;
      let deltaX = event.clientX - resizeStateRef.current.startX;
      let deltaY = event.clientY - resizeStateRef.current.startY;

      // Maintain aspect ratio if needed
      if (maintainAspectRatio) {
        const avgDelta = (Math.abs(deltaX) + Math.abs(deltaY)) / 2;
        const sign = deltaX * deltaY >= 0 ? 1 : -1;
        deltaX = avgDelta * Math.sign(deltaX);
        deltaY = avgDelta * Math.sign(deltaY) * sign;
      }

      resizeStateRef.current.isResizing = false;
      resizeStateRef.current.handle = null;
      setIsResizing(false);
      onResizeEnd?.(handle, deltaX, deltaY);
    },
    [onResizeEnd, maintainAspectRatio]
  );

  // Set up document-level event listeners for resize
  const startResize = useCallback(() => {
    if (disabled) return;
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [disabled, handleMouseMove, handleMouseUp]);

  const stopResize = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  // Auto cleanup on resize end
  if (!isResizing && resizeStateRef.current.isResizing === false) {
    stopResize();
  }

  // Create handle-specific event handlers
  const createHandleMouseDown = useCallback(
    (handle: ResizeHandle) => (event: React.MouseEvent) => {
      handleMouseDown(handle)(event);
      startResize();
    },
    [handleMouseDown, startResize]
  );

  return {
    isResizing,
    resizeHandlers: {
      nw: createHandleMouseDown("nw"),
      ne: createHandleMouseDown("ne"),
      sw: createHandleMouseDown("sw"),
      se: createHandleMouseDown("se"),
    },
  };
}
