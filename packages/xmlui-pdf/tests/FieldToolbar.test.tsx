import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FieldToolbar } from "../src/components/FieldToolbar/FieldToolbar";

describe("FieldToolbar", () => {
  const defaultProps = {
    onAddAnnotation: vi.fn(),
    currentPage: 1,
    isEditMode: true,
  };

  describe("rendering", () => {
    it("should render toolbar when isEditMode is true", () => {
      render(<FieldToolbar {...defaultProps} />);
      
      expect(screen.getByTestId("field-toolbar")).toBeInTheDocument();
    });

    it("should not render toolbar when isEditMode is false", () => {
      render(<FieldToolbar {...defaultProps} isEditMode={false} />);
      
      expect(screen.queryByTestId("field-toolbar")).not.toBeInTheDocument();
    });

    it("should render toolbar title", () => {
      render(<FieldToolbar {...defaultProps} />);
      
      expect(screen.getByText("Add Field")).toBeInTheDocument();
    });

    it("should render text button", () => {
      render(<FieldToolbar {...defaultProps} />);
      
      expect(screen.getByTestId("add-text-button")).toBeInTheDocument();
      expect(screen.getByText("Text")).toBeInTheDocument();
    });

    it("should render checkbox button", () => {
      render(<FieldToolbar {...defaultProps} />);
      
      expect(screen.getByTestId("add-checkbox-button")).toBeInTheDocument();
      expect(screen.getByText("Checkbox")).toBeInTheDocument();
    });

    it("should render signature button", () => {
      render(<FieldToolbar {...defaultProps} />);
      
      expect(screen.getByTestId("add-signature-button")).toBeInTheDocument();
      expect(screen.getByText("Signature")).toBeInTheDocument();
    });

    it("should have button titles for accessibility", () => {
      render(<FieldToolbar {...defaultProps} />);
      
      expect(screen.getByTitle("Add Text Field")).toBeInTheDocument();
      expect(screen.getByTitle("Add Checkbox")).toBeInTheDocument();
      expect(screen.getByTitle("Add Signature")).toBeInTheDocument();
    });
  });

  describe("button interactions", () => {
    it("should call onAddAnnotation with text type when text button is clicked", () => {
      const onAddAnnotation = vi.fn();
      render(<FieldToolbar {...defaultProps} onAddAnnotation={onAddAnnotation} />);
      
      const textButton = screen.getByTestId("add-text-button");
      fireEvent.click(textButton);
      
      expect(onAddAnnotation).toHaveBeenCalledWith("text", 1);
    });

    it("should call onAddAnnotation with checkbox type when checkbox button is clicked", () => {
      const onAddAnnotation = vi.fn();
      render(<FieldToolbar {...defaultProps} onAddAnnotation={onAddAnnotation} />);
      
      const checkboxButton = screen.getByTestId("add-checkbox-button");
      fireEvent.click(checkboxButton);
      
      expect(onAddAnnotation).toHaveBeenCalledWith("checkbox", 1);
    });

    it("should call onAddAnnotation with signature type when signature button is clicked", () => {
      const onAddAnnotation = vi.fn();
      render(<FieldToolbar {...defaultProps} onAddAnnotation={onAddAnnotation} />);
      
      const signatureButton = screen.getByTestId("add-signature-button");
      fireEvent.click(signatureButton);
      
      expect(onAddAnnotation).toHaveBeenCalledWith("signature", 1);
    });

    it("should use current page number when adding annotations", () => {
      const onAddAnnotation = vi.fn();
      render(<FieldToolbar {...defaultProps} onAddAnnotation={onAddAnnotation} currentPage={3} />);
      
      const textButton = screen.getByTestId("add-text-button");
      fireEvent.click(textButton);
      
      expect(onAddAnnotation).toHaveBeenCalledWith("text", 3);
    });
  });

  describe("edit mode behavior", () => {
    it("should show toolbar by default when isEditMode is not specified", () => {
      const props = {
        onAddAnnotation: vi.fn(),
        currentPage: 1,
      };
      render(<FieldToolbar {...props} />);
      
      expect(screen.getByTestId("field-toolbar")).toBeInTheDocument();
    });

    it("should hide toolbar when isEditMode changes to false", () => {
      const { rerender } = render(<FieldToolbar {...defaultProps} isEditMode={true} />);
      
      expect(screen.getByTestId("field-toolbar")).toBeInTheDocument();
      
      rerender(<FieldToolbar {...defaultProps} isEditMode={false} />);
      
      expect(screen.queryByTestId("field-toolbar")).not.toBeInTheDocument();
    });
  });

  describe("multiple button clicks", () => {
    it("should handle multiple button clicks", () => {
      const onAddAnnotation = vi.fn();
      render(<FieldToolbar {...defaultProps} onAddAnnotation={onAddAnnotation} />);
      
      const textButton = screen.getByTestId("add-text-button");
      const checkboxButton = screen.getByTestId("add-checkbox-button");
      
      fireEvent.click(textButton);
      fireEvent.click(checkboxButton);
      fireEvent.click(textButton);
      
      expect(onAddAnnotation).toHaveBeenCalledTimes(3);
      expect(onAddAnnotation).toHaveBeenNthCalledWith(1, "text", 1);
      expect(onAddAnnotation).toHaveBeenNthCalledWith(2, "checkbox", 1);
      expect(onAddAnnotation).toHaveBeenNthCalledWith(3, "text", 1);
    });
  });
});
