import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { FieldProperties } from "../src/components/FieldToolbar/FieldProperties";
import type { Annotation } from "../src/types/annotation.types";

describe("FieldProperties", () => {
  const mockAnnotation: Annotation = {
    id: "text-1",
    type: "text",
    page: 1,
    position: { x: 100, y: 100 },
    size: { width: 200, height: 50 },
    value: "Test",
    properties: {
      label: "Test Label",
      placeholder: "Test Placeholder",
      required: true,
      fontSize: 14,
      fontFamily: "Arial",
    },
    created: new Date(),
    modified: new Date(),
  };

  const defaultProps = {
    annotation: mockAnnotation,
    onUpdate: vi.fn(),
  };

  describe("rendering", () => {
    it("should render properties panel", () => {
      render(<FieldProperties {...defaultProps} />);
      
      expect(screen.getByTestId("field-properties")).toBeInTheDocument();
    });

    it("should show empty state when no annotation selected", () => {
      render(<FieldProperties annotation={null} onUpdate={vi.fn()} />);
      
      expect(screen.getByText("Select an annotation to edit properties")).toBeInTheDocument();
    });

    it("should display annotation type", () => {
      render(<FieldProperties {...defaultProps} />);
      
      expect(screen.getByText("text")).toBeInTheDocument();
    });

    it("should render label input with current value", () => {
      render(<FieldProperties {...defaultProps} />);
      
      const input = screen.getByTestId("property-label") as HTMLInputElement;
      expect(input.value).toBe("Test Label");
    });

    it("should render placeholder input for text annotations", () => {
      render(<FieldProperties {...defaultProps} />);
      
      const input = screen.getByTestId("property-placeholder") as HTMLInputElement;
      expect(input.value).toBe("Test Placeholder");
    });

    it("should not render placeholder input for checkbox annotations", () => {
      const checkboxAnnotation = {
        ...mockAnnotation,
        type: "checkbox" as const,
      };
      render(<FieldProperties annotation={checkboxAnnotation} onUpdate={vi.fn()} />);
      
      expect(screen.queryByTestId("property-placeholder")).not.toBeInTheDocument();
    });

    it("should render required checkbox", () => {
      render(<FieldProperties {...defaultProps} />);
      
      const checkbox = screen.getByTestId("property-required") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("should render font size input for text annotations", () => {
      render(<FieldProperties {...defaultProps} />);
      
      const input = screen.getByTestId("property-font-size") as HTMLInputElement;
      expect(input.value).toBe("14");
    });

    it("should render font family select for text annotations", () => {
      render(<FieldProperties {...defaultProps} />);
      
      const select = screen.getByTestId("property-font-family") as HTMLSelectElement;
      expect(select.value).toBe("Arial");
    });
  });

  describe("interactions", () => {
    it("should call onUpdate when label changes", () => {
      const onUpdate = vi.fn();
      render(<FieldProperties {...defaultProps} onUpdate={onUpdate} />);
      
      const input = screen.getByTestId("property-label");
      fireEvent.change(input, { target: { value: "New Label" } });
      
      expect(onUpdate).toHaveBeenCalledWith("text-1", {
        properties: expect.objectContaining({
          label: "New Label",
        }),
      });
    });

    it("should call onUpdate when placeholder changes", () => {
      const onUpdate = vi.fn();
      render(<FieldProperties {...defaultProps} onUpdate={onUpdate} />);
      
      const input = screen.getByTestId("property-placeholder");
      fireEvent.change(input, { target: { value: "New Placeholder" } });
      
      expect(onUpdate).toHaveBeenCalledWith("text-1", {
        properties: expect.objectContaining({
          placeholder: "New Placeholder",
        }),
      });
    });

    it("should call onUpdate when required changes", () => {
      const onUpdate = vi.fn();
      render(<FieldProperties {...defaultProps} onUpdate={onUpdate} />);
      
      const checkbox = screen.getByTestId("property-required");
      fireEvent.click(checkbox);
      
      expect(onUpdate).toHaveBeenCalledWith("text-1", {
        properties: expect.objectContaining({
          required: false,
        }),
      });
    });

    it("should call onUpdate when font size changes", () => {
      const onUpdate = vi.fn();
      render(<FieldProperties {...defaultProps} onUpdate={onUpdate} />);
      
      const input = screen.getByTestId("property-font-size");
      fireEvent.change(input, { target: { value: "18" } });
      
      expect(onUpdate).toHaveBeenCalledWith("text-1", {
        properties: expect.objectContaining({
          fontSize: 18,
        }),
      });
    });

    it("should call onUpdate when font family changes", () => {
      const onUpdate = vi.fn();
      render(<FieldProperties {...defaultProps} onUpdate={onUpdate} />);
      
      const select = screen.getByTestId("property-font-family");
      fireEvent.change(select, { target: { value: "Helvetica" } });
      
      expect(onUpdate).toHaveBeenCalledWith("text-1", {
        properties: expect.objectContaining({
          fontFamily: "Helvetica",
        }),
      });
    });
  });

  describe("state updates", () => {
    it("should update local state when annotation changes", () => {
      const { rerender } = render(<FieldProperties {...defaultProps} />);
      
      const newAnnotation = {
        ...mockAnnotation,
        properties: {
          ...mockAnnotation.properties,
          label: "Updated Label",
        },
      };
      
      rerender(<FieldProperties annotation={newAnnotation} onUpdate={vi.fn()} />);
      
      const input = screen.getByTestId("property-label") as HTMLInputElement;
      expect(input.value).toBe("Updated Label");
    });
  });
});
