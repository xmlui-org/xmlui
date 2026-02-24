/**
 * Unit tests for coordinate mapping utilities
 */

import { describe, it, expect } from "vitest";
import {
  screenToPdfCoordinates,
  pdfToScreenCoordinates,
  pdfToScreenSize,
  screenToPdfSize,
  clampPositionToPage,
  type PageViewport,
} from "../src/utils/coordinateMapping";

describe("coordinateMapping", () => {
  const viewport: PageViewport = {
    width: 612, // Standard Letter width in points
    height: 792, // Standard Letter height in points
    scale: 1.0,
  };

  describe("screenToPdfCoordinates", () => {
    it("should convert top-left screen corner to top-left PDF coordinates", () => {
      const result = screenToPdfCoordinates(0, 0, viewport);
      expect(result.x).toBe(0);
      expect(result.y).toBe(792); // Top of page in PDF coordinates
    });

    it("should convert bottom-left screen corner to bottom-left PDF coordinates", () => {
      const result = screenToPdfCoordinates(0, 792, viewport);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0); // Bottom of page in PDF coordinates
    });

    it("should convert center screen position correctly", () => {
      const result = screenToPdfCoordinates(306, 396, viewport);
      expect(result.x).toBe(306);
      expect(result.y).toBe(396);
    });

    it("should account for scale factor", () => {
      const scaledViewport = { ...viewport, scale: 2.0 };
      const result = screenToPdfCoordinates(200, 200, scaledViewport);
      expect(result.x).toBe(100); // Divided by scale
      expect(result.y).toBe(692); // (792 - 200/2)
    });
  });

  describe("pdfToScreenCoordinates", () => {
    it("should convert PDF coordinates to screen coordinates", () => {
      const result = pdfToScreenCoordinates(100, 692, viewport);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100); // 792 - 692 = 100
    });

    it("should be inverse of screenToPdfCoordinates", () => {
      const screenPos = { x: 150, y: 250 };
      const pdfPos = screenToPdfCoordinates(screenPos.x, screenPos.y, viewport);
      const backToScreen = pdfToScreenCoordinates(pdfPos.x, pdfPos.y, viewport);
      
      expect(backToScreen.x).toBeCloseTo(screenPos.x, 5);
      expect(backToScreen.y).toBeCloseTo(screenPos.y, 5);
    });

    it("should account for scale factor", () => {
      const scaledViewport = { ...viewport, scale: 1.5 };
      const result = pdfToScreenCoordinates(100, 592, scaledViewport);
      expect(result.x).toBe(150); // Multiplied by scale
      expect(result.y).toBe(300); // (792 - 592) * 1.5
    });
  });

  describe("pdfToScreenSize", () => {
    it("should convert PDF size to screen size", () => {
      const result = pdfToScreenSize(100, 50, viewport);
      expect(result.width).toBe(100);
      expect(result.height).toBe(50);
    });

    it("should account for scale factor", () => {
      const scaledViewport = { ...viewport, scale: 2.0 };
      const result = pdfToScreenSize(100, 50, scaledViewport);
      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });
  });

  describe("screenToPdfSize", () => {
    it("should convert screen size to PDF size", () => {
      const result = screenToPdfSize(200, 100, viewport);
      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });

    it("should account for scale factor", () => {
      const scaledViewport = { ...viewport, scale: 2.0 };
      const result = screenToPdfSize(200, 100, scaledViewport);
      expect(result.width).toBe(100);
      expect(result.height).toBe(50);
    });

    it("should be inverse of pdfToScreenSize", () => {
      const pdfSize = { width: 150, height: 75 };
      const screenSize = pdfToScreenSize(pdfSize.width, pdfSize.height, viewport);
      const backToPdf = screenToPdfSize(screenSize.width, screenSize.height, viewport);
      
      expect(backToPdf.width).toBeCloseTo(pdfSize.width, 5);
      expect(backToPdf.height).toBeCloseTo(pdfSize.height, 5);
    });
  });

  describe("clampPositionToPage", () => {
    it("should not clamp position within bounds", () => {
      const position = { x: 100, y: 100 };
      const size = { width: 50, height: 50 };
      const result = clampPositionToPage(position, size, viewport);
      
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it("should clamp negative X to 0", () => {
      const position = { x: -50, y: 100 };
      const size = { width: 50, height: 50 };
      const result = clampPositionToPage(position, size, viewport);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(100);
    });

    it("should clamp negative Y to 0", () => {
      const position = { x: 100, y: -50 };
      const size = { width: 50, height: 50 };
      const result = clampPositionToPage(position, size, viewport);
      
      expect(result.x).toBe(100);
      expect(result.y).toBe(0);
    });

    it("should clamp X that exceeds page width", () => {
      const position = { x: 600, y: 100 };
      const size = { width: 50, height: 50 };
      const result = clampPositionToPage(position, size, viewport);
      
      expect(result.x).toBe(562); // 612 - 50
      expect(result.y).toBe(100);
    });

    it("should clamp Y that exceeds page height", () => {
      const position = { x: 100, y: 800 };
      const size = { width: 50, height: 50 };
      const result = clampPositionToPage(position, size, viewport);
      
      expect(result.x).toBe(100);
      expect(result.y).toBe(742); // 792 - 50
    });

    it("should clamp both coordinates when both exceed bounds", () => {
      const position = { x: -10, y: 800 };
      const size = { width: 100, height: 100 };
      const result = clampPositionToPage(position, size, viewport);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(692); // 792 - 100
    });
  });
});
