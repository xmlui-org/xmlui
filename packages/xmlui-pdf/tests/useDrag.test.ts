import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDrag } from "../src/hooks/useDrag";

describe("useDrag", () => {
  describe("initialization", () => {
    it("should initialize with isDragging false", () => {
      const { result } = renderHook(() => useDrag());
      
      expect(result.current.isDragging).toBe(false);
    });

    it("should provide onMouseDown handler", () => {
      const { result } = renderHook(() => useDrag());
      
      expect(typeof result.current.onMouseDown).toBe("function");
    });

    it("should provide dragHandlers object", () => {
      const { result } = renderHook(() => useDrag());
      
      expect(result.current.dragHandlers).toBeDefined();
      expect(typeof result.current.dragHandlers.onMouseDown).toBe("function");
    });
  });

  describe("drag lifecycle", () => {
    it("should call onDragStart when mousedown occurs", () => {
      const onDragStart = vi.fn();
      const { result } = renderHook(() => useDrag({ onDragStart }));
      
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
        bubbles: true,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.onMouseDown(mouseDownEvent);
      });
      
      expect(onDragStart).toHaveBeenCalledWith(100, 200);
      expect(result.current.isDragging).toBe(true);
      expect(mouseDownEvent.stopPropagation).toHaveBeenCalled();
      expect(mouseDownEvent.preventDefault).toHaveBeenCalled();
    });

    it("should call onDrag during mouse move", () => {
      const onDrag = vi.fn();
      const { result } = renderHook(() => useDrag({ onDrag }));
      
      // Start drag
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.onMouseDown(mouseDownEvent);
      });
      
      // Move mouse
      const mouseMoveEvent = new MouseEvent("mousemove", {
        clientX: 150,
        clientY: 250,
      });
      
      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });
      
      expect(onDrag).toHaveBeenCalledWith(50, 50);
    });

    it("should call onDragEnd when mouse is released", () => {
      const onDragEnd = vi.fn();
      const { result } = renderHook(() => useDrag({ onDragEnd }));
      
      // Start drag
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.onMouseDown(mouseDownEvent);
      });
      
      // End drag
      const mouseUpEvent = new MouseEvent("mouseup", {
        clientX: 150,
        clientY: 250,
      });
      
      act(() => {
        document.dispatchEvent(mouseUpEvent);
      });
      
      expect(onDragEnd).toHaveBeenCalledWith(50, 50);
      expect(result.current.isDragging).toBe(false);
    });
  });

  describe("disabled state", () => {
    it("should not start drag when disabled", () => {
      const onDragStart = vi.fn();
      const { result } = renderHook(() => useDrag({ onDragStart, disabled: true }));
      
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.onMouseDown(mouseDownEvent);
      });
      
      expect(onDragStart).not.toHaveBeenCalled();
      expect(result.current.isDragging).toBe(false);
    });
  });

  describe("zero delta handling", () => {
    it("should handle zero delta on drag end", () => {
      const onDragEnd = vi.fn();
      const { result } = renderHook(() => useDrag({ onDragEnd }));
      
      // Start and end drag at same position
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.onMouseDown(mouseDownEvent);
      });
      
      const mouseUpEvent = new MouseEvent("mouseup", {
        clientX: 100,
        clientY: 200,
      });
      
      act(() => {
        document.dispatchEvent(mouseUpEvent);
      });
      
      expect(onDragEnd).toHaveBeenCalledWith(0, 0);
    });
  });

  describe("event propagation", () => {
    it("should stop propagation on mousedown", () => {
      const { result } = renderHook(() => useDrag());
      
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.onMouseDown(mouseDownEvent);
      });
      
      expect(mouseDownEvent.stopPropagation).toHaveBeenCalled();
    });

    it("should prevent default on mousedown", () => {
      const { result } = renderHook(() => useDrag());
      
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.onMouseDown(mouseDownEvent);
      });
      
      expect(mouseDownEvent.preventDefault).toHaveBeenCalled();
    });
  });
});
