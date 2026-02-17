import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnnotationLayer } from "../src/components/AnnotationLayer/AnnotationLayer";
import type { Annotation } from "../src/types/annotation.types";

describe("AnnotationLayer", () => {
  const mockAnnotations: Annotation[] = [
    {
      id: "ann-1",
      type: "text",
      page: 1,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      value: "Test Value",
      properties: {
        label: "Test Label",
        placeholder: "Enter text",
        required: false,
      },
      created: new Date(),
      modified: new Date(),
    },
    {
      id: "ann-2",
      type: "checkbox",
      page: 1,
      position: { x: 150, y: 200 },
      size: { width: 100, height: 30 },
      value: false,
      properties: {
        label: "Checkbox Label",
        required: true,
      },
      created: new Date(),
      modified: new Date(),
    },
    {
      id: "ann-3",
      type: "signature",
      page: 2,
      position: { x: 200, y: 300 },
      size: { width: 300, height: 100 },
      value: null,
      properties: {
        label: "Signature",
        required: true,
      },
      created: new Date(),
      modified: new Date(),
    },
  ];

  const defaultProps = {
    annotations: mockAnnotations,
    pageNumber: 1,
    pageWidth: 600,
    pageHeight: 800,
    scale: 1.0,
  };

  describe("rendering", () => {
    it("should render annotations for the current page only", () => {
      const { container } = render(<AnnotationLayer {...defaultProps} />);
      
      // Should render 2 annotations for page 1 (ann-1 and ann-2)
      const annotationBoxes = container.querySelectorAll("[data-annotation-id]");
      expect(annotationBoxes).toHaveLength(2);
      expect(annotationBoxes[0].getAttribute("data-annotation-id")).toBe("ann-1");
      expect(annotationBoxes[1].getAttribute("data-annotation-id")).toBe("ann-2");
    });

    it("should render annotation with label", () => {
      render(<AnnotationLayer {...defaultProps} />);
      
      expect(screen.getByText("Test Label")).toBeInTheDocument();
      expect(screen.getByText("Checkbox Label")).toBeInTheDocument();
    });

    it("should render annotation with value", () => {
      render(<AnnotationLayer {...defaultProps} />);
      
      expect(screen.getByText("Test Value")).toBeInTheDocument();
    });

    it("should render no annotations for page without annotations", () => {
      const { container } = render(<AnnotationLayer {...defaultProps} pageNumber={3} />);
      
      const annotationBoxes = container.querySelectorAll("[data-annotation-id]");
      expect(annotationBoxes).toHaveLength(0);
    });

    it("should apply correct type classes", () => {
      const { container } = render(<AnnotationLayer {...defaultProps} />);
      
      const textAnnotation = container.querySelector("[data-annotation-type='text']");
      const checkboxAnnotation = container.querySelector("[data-annotation-type='checkbox']");
      
      expect(textAnnotation).toBeInTheDocument();
      expect(checkboxAnnotation).toBeInTheDocument();
    });
  });

  describe("positioning", () => {
    it("should apply absolute positioning styles", () => {
      const { container } = render(<AnnotationLayer {...defaultProps} />);
      
      const annotationBox = container.querySelector("[data-annotation-id='ann-1']") as HTMLElement;
      
      // Check that inline positioning styles are applied
      // Note: position: absolute comes from CSS module, not inline style
      expect(annotationBox.style.left).toBeTruthy();
      expect(annotationBox.style.top).toBeTruthy();
      expect(annotationBox.style.width).toBeTruthy();
      expect(annotationBox.style.height).toBeTruthy();
    });

    it("should position annotations using screen coordinates", () => {
      const { container } = render(<AnnotationLayer {...defaultProps} />);
      
      const annotationBox = container.querySelector("[data-annotation-id='ann-1']") as HTMLElement;
      
      // With scale 1.0, PDF coordinates should match screen coordinates
      // PDF Y is flipped: screen Y = height - pdf Y
      const expectedTop = 800 - 100; // pageHeight - pdfY
      expect(annotationBox.style.left).toBe("100px");
      expect(annotationBox.style.top).toBe(`${expectedTop}px`);
      expect(annotationBox.style.width).toBe("200px");
      expect(annotationBox.style.height).toBe("50px");
    });

    it("should scale annotation size with scale factor", () => {
      const { container } = render(<AnnotationLayer {...defaultProps} scale={2.0} />);
      
      const annotationBox = container.querySelector("[data-annotation-id='ann-1']") as HTMLElement;
      
      // Width and height should be doubled
      expect(annotationBox.style.width).toBe("400px"); // 200 * 2
      expect(annotationBox.style.height).toBe("100px"); // 50 * 2
    });
  });

  describe("selection", () => {
    it("should apply selected class to selected annotation", () => {
      const { container } = render(
        <AnnotationLayer {...defaultProps} selectedAnnotationId="ann-1" />
      );
      
      const selectedBox = container.querySelector("[data-annotation-id='ann-1']");
      const unselectedBox = container.querySelector("[data-annotation-id='ann-2']");
      
      // CSS modules transform class names, so check if className contains 'selected'
      expect(selectedBox?.className).toContain("selected");
      expect(unselectedBox?.className).not.toContain("selected");
    });

    it("should call onAnnotationSelect when annotation is clicked", () => {
      const onSelect = vi.fn();
      const { container } = render(
        <AnnotationLayer {...defaultProps} onAnnotationSelect={onSelect} />
      );
      
      const annotationBox = container.querySelector("[data-annotation-id='ann-1']") as HTMLElement;
      annotationBox.click();
      
      expect(onSelect).toHaveBeenCalledWith("ann-1");
    });

    it("should not call onAnnotationSelect if handler not provided", () => {
      const { container } = render(<AnnotationLayer {...defaultProps} />);
      
      const annotationBox = container.querySelector("[data-annotation-id='ann-1']") as HTMLElement;
      
      // Should not throw
      expect(() => annotationBox.click()).not.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle empty annotations array", () => {
      const { container } = render(<AnnotationLayer {...defaultProps} annotations={[]} />);
      
      const annotationBoxes = container.querySelectorAll("[data-annotation-id]");
      expect(annotationBoxes).toHaveLength(0);
    });

    it("should handle annotation without label", () => {
      const annotationWithoutLabel: Annotation = {
        ...mockAnnotations[0],
        properties: { ...mockAnnotations[0].properties, label: undefined },
      };
      
      const { container } = render(
        <AnnotationLayer {...defaultProps} annotations={[annotationWithoutLabel]} />
      );
      
      const annotationBox = container.querySelector("[data-annotation-id]");
      expect(annotationBox).toBeInTheDocument();
    });

    it("should handle annotation without value", () => {
      const annotationWithoutValue: Annotation = {
        ...mockAnnotations[0],
        value: null,
      };
      
      const { container } = render(
        <AnnotationLayer {...defaultProps} annotations={[annotationWithoutValue]} />
      );
      
      const annotationBox = container.querySelector("[data-annotation-id]");
      expect(annotationBox).toBeInTheDocument();
    });

    it("should handle scale of 0.5", () => {
      const { container } = render(<AnnotationLayer {...defaultProps} scale={0.5} />);
      
      const annotationBox = container.querySelector("[data-annotation-id='ann-1']") as HTMLElement;
      
      // Width and height should be halved
      expect(annotationBox.style.width).toBe("100px"); // 200 * 0.5
      expect(annotationBox.style.height).toBe("25px"); // 50 * 0.5
    });
  });
});
