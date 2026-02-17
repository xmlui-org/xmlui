import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TextAnnotation } from "../src/components/AnnotationTools/TextAnnotation";
import type { Annotation } from "../src/types/annotation.types";

describe("TextAnnotation", () => {
  const mockAnnotation: Annotation = {
    id: "text-1",
    type: "text",
    page: 1,
    position: { x: 100, y: 100 },
    size: { width: 200, height: 50 },
    value: "Test Value",
    properties: {
      label: "Test Label",
      placeholder: "Enter text here",
      required: true,
      fontSize: 14,
      fontFamily: "Arial",
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
      render(<TextAnnotation {...defaultProps} />);
      
      expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("should render required indicator when required property is true", () => {
      render(<TextAnnotation {...defaultProps} />);
      
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("should not render required indicator when required property is false", () => {
      const annotation = {
        ...mockAnnotation,
        properties: { ...mockAnnotation.properties, required: false },
      };
      
      render(<TextAnnotation {...defaultProps} annotation={annotation} />);
      
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("should render input with current value", () => {
      render(<TextAnnotation {...defaultProps} />);
      
      const input = screen.getByDisplayValue("Test Value");
      expect(input).toBeInTheDocument();
    });

    it("should render input with placeholder", () => {
      const annotation = { ...mockAnnotation, value: "" };
      render(<TextAnnotation {...defaultProps} annotation={annotation} />);
      
      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should render without label when not provided", () => {
      const annotation = {
        ...mockAnnotation,
        properties: { ...mockAnnotation.properties, label: undefined },
      };
      
      render(<TextAnnotation {...defaultProps} annotation={annotation} />);
      
      expect(screen.queryByText("Test Label")).not.toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Value")).toBeInTheDocument();
    });

    it("should apply custom font size", () => {
      render(<TextAnnotation {...defaultProps} />);
      
      const input = screen.getByDisplayValue("Test Value") as HTMLInputElement;
      expect(input.style.fontSize).toBe("14px");
    });

    it("should apply custom font family", () => {
      render(<TextAnnotation {...defaultProps} />);
      
      const input = screen.getByDisplayValue("Test Value") as HTMLInputElement;
      expect(input.style.fontFamily).toBe("Arial");
    });
  });

  describe("selection", () => {
    it("should apply selected class when selected", () => {
      const { container } = render(<TextAnnotation {...defaultProps} isSelected={true} />);
      
      const textAnnotation = container.querySelector(".textAnnotation");
      expect(textAnnotation?.className).toContain("selected");
    });

    it("should not apply selected class when not selected", () => {
      const { container } = render(<TextAnnotation {...defaultProps} isSelected={false} />);
      
      const textAnnotation = container.querySelector(".textAnnotation");
      expect(textAnnotation?.className).not.toContain("selected");
    });

    it("should call onSelect when container is clicked", () => {
      const onSelect = vi.fn();
      const { container } = render(<TextAnnotation {...defaultProps} onSelect={onSelect} />);
      
      const textAnnotation = container.querySelector(".textAnnotation") as HTMLElement;
      fireEvent.click(textAnnotation);
      
      expect(onSelect).toHaveBeenCalledWith("text-1");
    });

    it("should call onSelect when input is focused", () => {
      const onSelect = vi.fn();
      render(<TextAnnotation {...defaultProps} onSelect={onSelect} />);
      
      const input = screen.getByDisplayValue("Test Value");
      fireEvent.focus(input);
      
      expect(onSelect).toHaveBeenCalledWith("text-1");
    });
  });

  describe("input handling", () => {
    it("should call onUpdate when input value changes", () => {
      const onUpdate = vi.fn();
      render(<TextAnnotation {...defaultProps} onUpdate={onUpdate} />);
      
      const input = screen.getByDisplayValue("Test Value");
      fireEvent.change(input, { target: { value: "New Value" } });
      
      expect(onUpdate).toHaveBeenCalledWith("text-1", { value: "New Value" });
    });

    it("should handle empty value", () => {
      const annotation = { ...mockAnnotation, value: null };
      render(<TextAnnotation {...defaultProps} annotation={annotation} />);
      
      const input = screen.getByPlaceholderText("Enter text here") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("should update to empty string", () => {
      const onUpdate = vi.fn();
      render(<TextAnnotation {...defaultProps} onUpdate={onUpdate} />);
      
      const input = screen.getByDisplayValue("Test Value");
      fireEvent.change(input, { target: { value: "" } });
      
      expect(onUpdate).toHaveBeenCalledWith("text-1", { value: "" });
    });
  });

  describe("event propagation", () => {
    it("should stop propagation when container is clicked", () => {
      const onSelect = vi.fn();
      const { container } = render(<TextAnnotation {...defaultProps} onSelect={onSelect} />);
      
      const textAnnotation = container.querySelector(".textAnnotation") as HTMLElement;
      const event = new MouseEvent("click", { bubbles: true });
      const stopPropagationSpy = vi.spyOn(event, "stopPropagation");
      
      textAnnotation.dispatchEvent(event);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle undefined value", () => {
      const annotation = { ...mockAnnotation, value: undefined };
      render(<TextAnnotation {...defaultProps} annotation={annotation} />);
      
      const input = screen.getByPlaceholderText("Enter text here") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("should handle no placeholder", () => {
      const annotation = {
        ...mockAnnotation,
        properties: { ...mockAnnotation.properties, placeholder: undefined },
      };
      
      render(<TextAnnotation {...defaultProps} annotation={annotation} />);
      
      const input = screen.getByDisplayValue("Test Value");
      expect(input).toBeInTheDocument();
    });

    it("should handle no font customization", () => {
      const annotation = {
        ...mockAnnotation,
        properties: {
          ...mockAnnotation.properties,
          fontSize: undefined,
          fontFamily: undefined,
        },
      };
      
      render(<TextAnnotation {...defaultProps} annotation={annotation} />);
      
      const input = screen.getByDisplayValue("Test Value") as HTMLInputElement;
      expect(input.style.fontSize).toBe("");
      expect(input.style.fontFamily).toBe("");
    });
  });
});
