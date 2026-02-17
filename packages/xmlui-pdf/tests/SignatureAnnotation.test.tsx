import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SignatureAnnotation } from "../src/components/AnnotationTools/SignatureAnnotation";
import type { Annotation } from "../src/types/annotation.types";

describe("SignatureAnnotation", () => {
  const mockAnnotation: Annotation = {
    id: "signature-1",
    type: "signature",
    page: 1,
    position: { x: 100, y: 100 },
    size: { width: 200, height: 80 },
    value: null,
    properties: {
      label: "Signature",
      required: true,
    },
    created: new Date(),
    modified: new Date(),
  };

  const defaultProps = {
    annotation: mockAnnotation,
    isSelected: false,
    onUpdate: vi.fn(),
    onSelect: vi.fn(),
  };

  describe("rendering", () => {
    it("should render with label", () => {
      render(<SignatureAnnotation {...defaultProps} />);
      
      expect(screen.getByText("Signature")).toBeInTheDocument();
    });

    it("should render required indicator when required property is true", () => {
      render(<SignatureAnnotation {...defaultProps} />);
      
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("should not render required indicator when required property is false", () => {
      const annotation = {
        ...mockAnnotation,
        properties: { ...mockAnnotation.properties, required: false },
      };
      
      render(<SignatureAnnotation {...defaultProps} annotation={annotation} />);
      
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("should render without label when not provided", () => {
      const annotation = {
        ...mockAnnotation,
        properties: { ...mockAnnotation.properties, label: undefined },
      };
      
      render(<SignatureAnnotation {...defaultProps} annotation={annotation} />);
      
      expect(screen.queryByText("Signature")).not.toBeInTheDocument();
      expect(screen.getByTestId("signature-annotation")).toBeInTheDocument();
    });

    it("should render placeholder when no signature value", () => {
      render(<SignatureAnnotation {...defaultProps} />);
      
      expect(screen.getByText("Click to sign")).toBeInTheDocument();
    });

    it("should apply empty class when no signature value", () => {
      render(<SignatureAnnotation {...defaultProps} />);
      
      const signatureAnnotation = screen.getByTestId("signature-annotation");
      expect(signatureAnnotation.className).toContain("empty");
    });

    it("should render signature image when value is present", () => {
      const annotation = { 
        ...mockAnnotation, 
        value: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" 
      };
      render(<SignatureAnnotation {...defaultProps} annotation={annotation} />);
      
      const image = screen.getByRole("img", { name: "Signature" });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", annotation.value);
    });

    it("should not render placeholder when signature value exists", () => {
      const annotation = { 
        ...mockAnnotation, 
        value: "data:image/png;base64,test" 
      };
      render(<SignatureAnnotation {...defaultProps} annotation={annotation} />);
      
      expect(screen.queryByText("Click to sign")).not.toBeInTheDocument();
    });

    it("should not apply empty class when signature value exists", () => {
      const annotation = { 
        ...mockAnnotation, 
        value: "data:image/png;base64,test" 
      };
      render(<SignatureAnnotation {...defaultProps} annotation={annotation} />);
      
      const signatureAnnotation = screen.getByTestId("signature-annotation");
      expect(signatureAnnotation.className).not.toContain("empty");
    });
  });

  describe("selection", () => {
    it("should apply selected class when selected", () => {
      render(<SignatureAnnotation {...defaultProps} isSelected={true} />);
      
      const signatureAnnotation = screen.getByTestId("signature-annotation");
      expect(signatureAnnotation.className).toContain("selected");
    });

    it("should not apply selected class when not selected", () => {
      render(<SignatureAnnotation {...defaultProps} isSelected={false} />);
      
      const signatureAnnotation = screen.getByTestId("signature-annotation");
      expect(signatureAnnotation.className).not.toContain("selected");
    });

    it("should call onSelect when container is clicked", () => {
      const onSelect = vi.fn();
      render(<SignatureAnnotation {...defaultProps} onSelect={onSelect} />);
      
      const signatureAnnotation = screen.getByTestId("signature-annotation");
      fireEvent.click(signatureAnnotation);
      
      expect(onSelect).toHaveBeenCalledWith("signature-1");
    });

    it("should call onSelect when container is focused", () => {
      const onSelect = vi.fn();
      render(<SignatureAnnotation {...defaultProps} onSelect={onSelect} />);
      
      const signatureAnnotation = screen.getByTestId("signature-annotation");
      fireEvent.focus(signatureAnnotation);
      
      expect(onSelect).toHaveBeenCalledWith("signature-1");
    });

    it("should be keyboard focusable", () => {
      render(<SignatureAnnotation {...defaultProps} />);
      
      const signatureAnnotation = screen.getByTestId("signature-annotation");
      expect(signatureAnnotation).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("event propagation", () => {
    it("should stop propagation when container is clicked", () => {
      const onSelect = vi.fn();
      render(<SignatureAnnotation {...defaultProps} onSelect={onSelect} />);
      
      const signatureAnnotation = screen.getByTestId("signature-annotation");
      const event = new MouseEvent("click", { bubbles: true });
      const stopPropagationSpy = vi.spyOn(event, "stopPropagation");
      
      signatureAnnotation.dispatchEvent(event);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty string value as no signature", () => {
      const annotation = { ...mockAnnotation, value: "" };
      render(<SignatureAnnotation {...defaultProps} annotation={annotation} />);
      
      expect(screen.getByText("Click to sign")).toBeInTheDocument();
    });

    it("should handle undefined value as no signature", () => {
      const annotation = { ...mockAnnotation, value: undefined };
      render(<SignatureAnnotation {...defaultProps} annotation={annotation} />);
      
      expect(screen.getByText("Click to sign")).toBeInTheDocument();
    });

    it("should handle null value as no signature", () => {
      const annotation = { ...mockAnnotation, value: null };
      render(<SignatureAnnotation {...defaultProps} annotation={annotation} />);
      
      expect(screen.getByText("Click to sign")).toBeInTheDocument();
    });
  });
});
