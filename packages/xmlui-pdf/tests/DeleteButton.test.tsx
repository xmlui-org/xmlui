import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { DeleteButton } from "../src/components/AnnotationLayer/DeleteButton";

describe("DeleteButton", () => {
  describe("rendering", () => {
    it("should render delete button", () => {
      const onDelete = vi.fn();
      render(<DeleteButton onDelete={onDelete} />);
      
      expect(screen.getByTestId("delete-button")).toBeInTheDocument();
    });

    it("should have accessibility attributes", () => {
      const onDelete = vi.fn();
      render(<DeleteButton onDelete={onDelete} />);
      
      const button = screen.getByTestId("delete-button");
      expect(button).toHaveAttribute("aria-label", "Delete annotation");
      expect(button).toHaveAttribute("title", "Delete annotation (Delete/Backspace)");
    });

    it("should render × symbol", () => {
      const onDelete = vi.fn();
      render(<DeleteButton onDelete={onDelete} />);
      
      expect(screen.getByText("×")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onDelete when clicked", () => {
      const onDelete = vi.fn();
      render(<DeleteButton onDelete={onDelete} />);
      
      const button = screen.getByTestId("delete-button");
      fireEvent.click(button);
      
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("should stop event propagation", () => {
      const onDelete = vi.fn();
      render(<DeleteButton onDelete={onDelete} />);
      
      const button = screen.getByTestId("delete-button");
      const event = new MouseEvent("click", { bubbles: true });
      const stopPropagationSpy = vi.spyOn(event, "stopPropagation");
      
      button.dispatchEvent(event);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it("should not call onDelete multiple times on single click", () => {
      const onDelete = vi.fn();
      render(<DeleteButton onDelete={onDelete} />);
      
      const button = screen.getByTestId("delete-button");
      fireEvent.click(button);
      
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});
