import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResize } from "../src/hooks/useResize";

describe("useResize", () => {
  describe("initialization", () => {
    it("should initialize with isResizing false", () => {
      const { result } = renderHook(() => useResize());
      
      expect(result.current.isResizing).toBe(false);
    });

    it("should provide resize handlers for all corners", () => {
      const { result } = renderHook(() => useResize());
      
      expect(typeof result.current.resizeHandlers.nw).toBe("function");
      expect(typeof result.current.resizeHandlers.ne).toBe("function");
      expect(typeof result.current.resizeHandlers.sw).toBe("function");
      expect(typeof result.current.resizeHandlers.se).toBe("function");
    });
  });

  describe("resize lifecycle", () => {
    it("should call onResizeStart when handle mousedown occurs", () => {
      const onResizeStart = vi.fn();
      const { result } = renderHook(() => useResize({ onResizeStart }));
      
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
        bubbles: true,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.resizeHandlers.se(mouseDownEvent);
      });
      
      expect(onResizeStart).toHaveBeenCalledWith("se", 100, 200);
      expect(result.current.isResizing).toBe(true);
      expect(mouseDownEvent.stopPropagation).toHaveBeenCalled();
      expect(mouseDownEvent.preventDefault).toHaveBeenCalled();
    });

    it("should call onResize during mouse move", () => {
      const onResize = vi.fn();
      const { result } = renderHook(() => useResize({ onResize }));
      
      // Start resize
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.resizeHandlers.se(mouseDownEvent);
      });
      
      // Move mouse
      const mouseMoveEvent = new MouseEvent("mousemove", {
        clientX: 150,
        clientY: 250,
      });
      
      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });
      
      expect(onResize).toHaveBeenCalledWith("se", 50, 50);
    });

    it("should call onResizeEnd when mouse is released", () => {
      const onResizeEnd = vi.fn();
      const { result } = renderHook(() => useResize({ onResizeEnd }));
      
      // Start resize
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.resizeHandlers.nw(mouseDownEvent);
      });
      
      // End resize
      const mouseUpEvent = new MouseEvent("mouseup", {
        clientX: 80,
        clientY: 180,
      });
      
      act(() => {
        document.dispatchEvent(mouseUpEvent);
      });
      
      expect(onResizeEnd).toHaveBeenCalledWith("nw", -20, -20);
      expect(result.current.isResizing).toBe(false);
    });
  });

  describe("different handles", () => {
    it("should handle nw corner resize", () => {
      const onResize = vi.fn();
      const { result } = renderHook(() => useResize({ onResize }));
      
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.resizeHandlers.nw(mouseDownEvent);
      });
      
      const mouseMoveEvent = new MouseEvent("mousemove", {
        clientX: 80,
        clientY: 180,
      });
      
      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });
      
      expect(onResize).toHaveBeenCalledWith("nw", -20, -20);
    });

    it("should handle ne corner resize", () => {
      const onResize = vi.fn();
      const { result } = renderHook(() => useResize({ onResize }));
      
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.resizeHandlers.ne(mouseDownEvent);
      });
      
      const mouseMoveEvent = new MouseEvent("mousemove", {
        clientX: 120,
        clientY: 180,
      });
      
      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });
      
      expect(onResize).toHaveBeenCalledWith("ne", 20, -20);
    });

    it("should handle sw corner resize", () => {
      const onResize = vi.fn();
      const { result } = renderHook(() => useResize({ onResize }));
      
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.resizeHandlers.sw(mouseDownEvent);
      });
      
      const mouseMoveEvent = new MouseEvent("mousemove", {
        clientX: 80,
        clientY: 220,
      });
      
      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });
      
      expect(onResize).toHaveBeenCalledWith("sw", -20, 20);
    });
  });

  describe("disabled state", () => {
    it("should not start resize when disabled", () => {
      const onResizeStart = vi.fn();
      const { result } = renderHook(() => useResize({ onResizeStart, disabled: true }));
      
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.resizeHandlers.se(mouseDownEvent);
      });
      
      expect(onResizeStart).not.toHaveBeenCalled();
      expect(result.current.isResizing).toBe(false);
    });
  });

  describe("aspect ratio maintenance", () => {
    it("should maintain aspect ratio when enabled", () => {
      const onResize = vi.fn();
      const { result } = renderHook(() => useResize({ onResize, maintainAspectRatio: true }));
      
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
      }) as any;
      mouseDownEvent.stopPropagation = vi.fn();
      mouseDownEvent.preventDefault = vi.fn();
      
      act(() => {
        result.current.resizeHandlers.se(mouseDownEvent);
      });
      
      // Move mouse asymmetrically
      const mouseMoveEvent = new MouseEvent("mousemove", {
        clientX: 160, // +60
        clientY: 240, // +40
      });
      
      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });
      
      // Should average deltas for aspect ratio
      expect(onResize).toHaveBeenCalled();
      const call = onResize.mock.calls[0];
      expect(call[0]).toBe("se");
      // Delta should be averaged: (60 + 40) / 2 = 50
      expect(Math.abs(call[1])).toBeCloseTo(50, 0);
      expect(Math.abs(call[2])).toBeCloseTo(50, 0);
    });
  });
});
