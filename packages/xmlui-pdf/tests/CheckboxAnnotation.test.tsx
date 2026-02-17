import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CheckboxAnnotation } from "../src/components/AnnotationTools/CheckboxAnnotation";
import type { Annotation } from "../src/types/annotation.types";

describe("CheckboxAnnotation", () => {
  const mockAnnotation: Annotation = {
    id: "checkbox-1",
    type: "checkbox",
    page: 1,
    position: { x: 100, y: 100 },
    size: { width: 150, height: 30 },
    value: false,
    properties: {
      label: "Checkbox Label",
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
      render(<CheckboxAnnotation {...defaultProps} />);
      
      expect(screen.getByText("Checkbox Label")).toBeInTheDocument();
    });

    it("should render required indicator when required property is true", () => {
      render(<CheckboxAnnotation {...defaultProps} />);
      
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("should not render required indicator when required property is false", () => {
      const annotation = {
        ...mockAnnotation,
        properties: { ...mockAnnotation.properties, required: false },
      };
      
      render(<CheckboxAnnotation {...defaultProps} annotation={annotation} />);
      
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("should render checkbox unchecked when value is false", () => {
      render(<CheckboxAnnotation {...defaultProps} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("should render checkbox checked when value is true", () => {
      const annotation = { ...mockAnnotation, value: true };
      render(<CheckboxAnnotation {...defaultProps} annotation={annotation} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("should render checkbox checked when value is string 'true'", () => {
      const annotation = { ...mockAnnotation, value: "true" };
      render(<CheckboxAnnotation {...defaultProps} annotation={annotation} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("should render without label when not provided", () => {
      const annotation = {
        ...mockAnnotation,
        properties: { ...mockAnnotation.properties, label: undefined },
      };
      
      render(<CheckboxAnnotation {...defaultProps} annotation={annotation} />);
      
      expect(screen.queryByText("Checkbox Label")).not.toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });
  });

  describe("selection", () => {
    it("should apply selected class when selected", () => {
      render(<CheckboxAnnotation {...defaultProps} isSelected={true} />);
      
      const checkboxAnnotation = screen.getByTestId("checkbox-annotation");
      expect(checkboxAnnotation.className).toContain("selected");
    });

    it("should not apply selected class when not selected", () => {
      render(<CheckboxAnnotation {...defaultProps} isSelected={false} />);
      
      const checkboxAnnotation = screen.getByTestId("checkbox-annotation");
      expect(checkboxAnnotation.className).not.toContain("selected");
    });

    it("should call onSelect when container is clicked", () => {
      const onSelect = vi.fn();
      render(<CheckboxAnnotation {...defaultProps} onSelect={onSelect} />);
      
      const checkboxAnnotation = screen.getByTestId("checkbox-annotation");
      fireEvent.click(checkboxAnnotation);
      
      expect(onSelect).toHaveBeenCalledWith("checkbox-1");
    });

    it("should call onSelect when checkbox is focused", () => {
      const onSelect = vi.fn();
      render(<CheckboxAnnotation {...defaultProps} onSelect={onSelect} />);
      
      const checkbox = screen.getByRole("checkbox");
      fireEvent.focus(checkbox);
      
      expect(onSelect).toHaveBeenCalledWith("checkbox-1");
    });
  });

  describe("checkbox interaction", () => {
    it("should call onUpdate with true when checkbox is checked", () => {
      const onUpdate = vi.fn();
      render(<CheckboxAnnotation {...defaultProps} onUpdate={onUpdate} />);
      
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      
      expect(onUpdate).toHaveBeenCalledWith("checkbox-1", { value: true });
    });

    it("should call onUpdate with false when checkbox is unchecked", () => {
      const onUpdate = vi.fn();
      const annotation = { ...mockAnnotation, value: true };
      render(<CheckboxAnnotation {...defaultProps} annotation={annotation} onUpdate={onUpdate} />);
      
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      
      expect(onUpdate).toHaveBeenCalledWith("checkbox-1", { value: false });
    });
  });

  describe("event propagation", () => {
    it("should stop propagation when container is clicked", () => {
      const onSelect = vi.fn();
      render(<CheckboxAnnotation {...defaultProps} onSelect={onSelect} />);
      
      const checkboxAnnotation = screen.getByTestId("checkbox-annotation");
      const event = new MouseEvent("click", { bubbles: true });
      const stopPropagationSpy = vi.spyOn(event, "stopPropagation");
      
      checkboxAnnotation.dispatchEvent(event);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle null value as unchecked", () => {
      const annotation = { ...mockAnnotation, value: null };
      render(<CheckboxAnnotation {...defaultProps} annotation={annotation} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("should handle undefined value as unchecked", () => {
      const annotation = { ...mockAnnotation, value: undefined };
      render(<CheckboxAnnotation {...defaultProps} annotation={annotation} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("should handle empty string value as unchecked", () => {
      const annotation = { ...mockAnnotation, value: "" };
      render(<CheckboxAnnotation {...defaultProps} annotation={annotation} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });
  });
});
