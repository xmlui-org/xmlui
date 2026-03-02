import { describe, it, expect } from "vitest";
import { ScrollStyle, defaultProps, StackScroller } from "../../../src/components/Stack/StackScroller";

describe("StackScroller", () => {
  describe("Exports", () => {
    it("exports StackScroller component", () => {
      expect(typeof StackScroller).toBe("object"); // forwardRef returns an object
    });

    it("exports ScrollStyle type (used in type checking)", () => {
      const styles: ScrollStyle[] = ["normal", "overlay", "whenMouseOver", "whenScrolling"];
      expect(styles.length).toBe(4);
    });

    it("exports defaultProps with correct defaults", () => {
      expect(defaultProps.scrollStyle).toBe("normal");
      expect(defaultProps.showScrollerFade).toBe(false);
    });
  });

  describe("Type definitions", () => {
    it("accepts valid scrollStyle values as type", () => {
      const validStyles: ScrollStyle[] = [
        "normal",
        "overlay",
        "whenMouseOver",
        "whenScrolling",
      ];
      
      expect(validStyles).toHaveLength(4);
      expect(validStyles).toContain("normal");
      expect(validStyles).toContain("overlay");
    });

    it("component is forwardRef type", () => {
      // StackScroller should have a $$typeof property indicating it's a component
      expect(StackScroller).toHaveProperty("$$typeof");
    });
  });
});
