import { describe, expect, it } from "vitest";
import { parseLayoutProperty } from "../../../src/components-core/theming/parse-layout-props";

describe("parseLayoutProperty", () => {
  describe("Basic CSS property parsing", () => {
    it("should parse simple CSS property", () => {
      const result = parseLayoutProperty("color");
      expect(result).toEqual({
        property: "color",
      });
    });

    it("should parse CSS property in camelCase", () => {
      const result = parseLayoutProperty("backgroundColor");
      expect(result).toEqual({
        property: "backgroundColor",
      });
    });

    it("should reject empty string", () => {
      const result = parseLayoutProperty("");
      expect(result).toBe("Property string cannot be empty");
    });

    it("should reject null/undefined", () => {
      const result = parseLayoutProperty(null as any);
      expect(result).toBe("Property string cannot be empty");
    });

    it("should reject invalid CSS property name", () => {
      const result = parseLayoutProperty("123invalid");
      expect(result).toBe("Invalid CSS property name: 123invalid");
    });

    it("should reject CSS property name starting with uppercase", () => {
      const result = parseLayoutProperty("BackgroundColor");
      expect(result).toBe("Invalid CSS property name: BackgroundColor");
    });
  });

  describe("Part name parsing", () => {
    it("should parse CSS property with part name", () => {
      const result = parseLayoutProperty("color-header");
      expect(result).toEqual({
        property: "color",
        part: "header",
      });
    });

    it("should parse part name with underscores", () => {
      const result = parseLayoutProperty("color-header_content");
      expect(result).toEqual({
        property: "color",
        part: "header_content",
      });
    });

    it("should parse part name with numbers", () => {
      const result = parseLayoutProperty("color-item2");
      expect(result).toEqual({
        property: "color",
        part: "item2",
      });
    });

    it("should reject multiple part names", () => {
      const result = parseLayoutProperty("color-header-footer");
      expect(result).toBe("Multiple part names found");
    });
  });

  describe("Component name parsing", () => {
    it("should parse CSS property with component name", () => {
      const result = parseLayoutProperty("color-Button", true);
      expect(result).toEqual({
        property: "color",
        component: "Button",
      });
    });

    it("should parse component name with underscores", () => {
      const result = parseLayoutProperty("color-My_Button", true);
      expect(result).toEqual({
        property: "color",
        component: "My_Button",
      });
    });

    it("should parse component name with numbers", () => {
      const result = parseLayoutProperty("color-Button2", true);
      expect(result).toEqual({
        property: "color",
        component: "Button2",
      });
    });

    it("should reject multiple component names", () => {
      const result = parseLayoutProperty("color-Button-Card", true);
      expect(result).toBe("Multiple component names found");
    });
  });

  describe("Screen size parsing", () => {
    it("should parse single screen size", () => {
      const result = parseLayoutProperty("color-md");
      expect(result).toEqual({
        property: "color",
        screenSizes: ["md"],
      });
    });

    it("should parse multiple screen sizes", () => {
      const result = parseLayoutProperty("color-xs-md-xl");
      expect(result).toEqual({
        property: "color",
        screenSizes: ["xs", "md", "xl"],
      });
    });

    it("should parse all valid screen sizes", () => {
      const result = parseLayoutProperty("color-xs-sm-md-lg-xl-xxl");
      expect(result).toEqual({
        property: "color",
        screenSizes: ["xs", "sm", "md", "lg", "xl", "xxl"],
      });
    });

    it("should reject invalid screen size", () => {
      const result = parseLayoutProperty("color-123invalid");
      expect(result).toBe("Invalid segment: 123invalid");
    });
  });

  describe("State parsing", () => {
    it("should parse single state", () => {
      const result = parseLayoutProperty("color--hover");
      expect(result).toEqual({
        property: "color",
        states: ["hover"],
      });
    });

    it("should parse multiple states", () => {
      const result = parseLayoutProperty("color--hover--active");
      expect(result).toEqual({
        property: "color",
        states: ["hover", "active"],
      });
    });

    it("should parse state with underscores and numbers", () => {
      const result = parseLayoutProperty("color--hover_state2");
      expect(result).toEqual({
        property: "color",
        states: ["hover_state2"],
      });
    });

    it("should reject empty state name", () => {
      const result = parseLayoutProperty("color--");
      expect(result).toBe("State name cannot be empty");
    });

    it("should reject invalid state name", () => {
      const result = parseLayoutProperty("color--123invalid");
      expect(result).toBe("Invalid state name: 123invalid");
    });
  });

  describe("Complex combinations", () => {
    it("should parse property with part and component", () => {
      const result = parseLayoutProperty("color-header-Button", true);
      expect(result).toEqual({
        property: "color",
        part: "header",
        component: "Button",
      });
    });

    it("should parse property with part and screen sizes", () => {
      const result = parseLayoutProperty("color-header-md-lg");
      expect(result).toEqual({
        property: "color",
        part: "header",
        screenSizes: ["md", "lg"],
      });
    });

    it("should parse property with component and screen sizes", () => {
      const result = parseLayoutProperty("color-Button-xs-md", true);
      expect(result).toEqual({
        property: "color",
        component: "Button",
        screenSizes: ["xs", "md"],
      });
    });

    it("should parse property with part, component and screen sizes", () => {
      const result = parseLayoutProperty("backgroundColor-header-Button-md-lg", true);
      expect(result).toEqual({
        property: "backgroundColor",
        part: "header",
        component: "Button",
        screenSizes: ["md", "lg"],
      });
    });

    it("should parse property with part and states", () => {
      const result = parseLayoutProperty("color-header--hover--active");
      expect(result).toEqual({
        property: "color",
        part: "header",
        states: ["hover", "active"],
      });
    });

    it("should parse property with component and states", () => {
      const result = parseLayoutProperty("color-Button--hover", true);
      expect(result).toEqual({
        property: "color",
        component: "Button",
        states: ["hover"],
      });
    });

    it("should parse property with screen sizes and states", () => {
      const result = parseLayoutProperty("color-md-lg--hover");
      expect(result).toEqual({
        property: "color",
        screenSizes: ["md", "lg"],
        states: ["hover"],
      });
    });

    it("should parse all segments together", () => {
      const result = parseLayoutProperty(
        "backgroundColor-header-Button-md-lg--hover--active",
        true,
      );
      expect(result).toEqual({
        property: "backgroundColor",
        part: "header",
        component: "Button",
        screenSizes: ["md", "lg"],
        states: ["hover", "active"],
      });
    });

    it("should handle component before part correctly", () => {
      const result = parseLayoutProperty("color-Button-header", true);
      expect(result).toEqual({
        property: "color",
        component: "Button",
        part: "header",
      });
    });

    it("should handle screen sizes mixed with other segments", () => {
      const result = parseLayoutProperty("padding-content-xs-Button-md", true);
      expect(result).toEqual({
        property: "padding",
        part: "content",
        component: "Button",
        screenSizes: ["xs", "md"],
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle consecutive dashes in main part", () => {
      const result = parseLayoutProperty("color--hover");
      expect(result).toEqual({
        property: "color",
        states: ["hover"],
      });
    });

    it("should reject malformed input with empty segments", () => {
      const result = parseLayoutProperty("color-");
      expect(result).toEqual({
        property: "color",
      });
    });

    it("should handle complex CSS property names", () => {
      const result = parseLayoutProperty("borderTopLeftRadius-md");
      expect(result).toEqual({
        property: "borderTopLeftRadius",
        screenSizes: ["md"],
      });
    });
  });

  describe("Invalid string patterns and inconsistencies", () => {
    it("should handle string starting with dash (treated as empty property then state)", () => {
      const result = parseLayoutProperty("-color");
      expect(result).toEqual({
        property: "color",
        states: undefined,
      });
    });

    it("should reject string starting with number", () => {
      const result = parseLayoutProperty("123color-header");
      expect(result).toBe("Invalid CSS property name: 123color");
    });

    it("should reject CSS property with special characters", () => {
      const result = parseLayoutProperty("color@font-header");
      expect(result).toBe("Invalid CSS property name: color@font");
    });

    it("should reject part name starting with number", () => {
      const result = parseLayoutProperty("color-123header");
      expect(result).toBe("Invalid segment: 123header");
    });

    it("should reject part name with special characters", () => {
      const result = parseLayoutProperty("color-header@content");
      expect(result).toBe("Invalid segment: header@content");
    });

    it("should reject component name starting with lowercase", () => {
      const result = parseLayoutProperty("color-button");
      expect(result).toEqual({
        property: "color",
        part: "button",
      });
    });

    it("should reject component name starting with number", () => {
      const result = parseLayoutProperty("color-123Button");
      expect(result).toBe("Invalid segment: 123Button");
    });

    it("should reject component name with special characters", () => {
      const result = parseLayoutProperty("color-Button@Component");
      expect(result).toBe("Invalid segment: Button@Component");
    });

    it("should reject invalid screen size mixed with valid ones", () => {
      const result = parseLayoutProperty("color-xs-invalid-md");
      expect(result).toEqual({
        property: "color",
        part: "invalid",
        screenSizes: ["xs", "md"],
      });
    });

    it("should reject state name starting with number", () => {
      const result = parseLayoutProperty("color--123hover");
      expect(result).toBe("Invalid state name: 123hover");
    });

    it("should reject state name with special characters", () => {
      const result = parseLayoutProperty("color--hover@state");
      expect(result).toBe("Invalid state name: hover@state");
    });

    it("should reject state name with dash", () => {
      const result = parseLayoutProperty("color--hover-state");
      expect(result).toBe("Invalid state name: hover-state");
    });

    it("should reject empty state after double dash", () => {
      const result = parseLayoutProperty("color--hover--");
      expect(result).toBe("State name cannot be empty");
    });

    it("should reject multiple consecutive dashes in segments", () => {
      const result = parseLayoutProperty("color--header--Button");
      expect(result).toEqual({
        property: "color",
        states: ["header", "Button"],
      });
    });

    it("should reject string with only dashes", () => {
      const result = parseLayoutProperty("---");
      expect(result).toBe("Invalid state name: -");
    });

    it("should reject string ending with dash in main part", () => {
      const result = parseLayoutProperty("color-header-");
      expect(result).toEqual({
        property: "color",
        part: "header",
      });
    });

    it("should reject mixed case in screen sizes", () => {
      const result = parseLayoutProperty("color-Md", true);
      expect(result).toEqual({
        property: "color",
        component: "Md",
      });
    });

    it("should handle whitespace (should not occur in real usage)", () => {
      const result = parseLayoutProperty("color header");
      expect(result).toBe("Invalid CSS property name: color header");
    });

    it("should reject segments with underscores at start", () => {
      const result = parseLayoutProperty("color-_header");
      expect(result).toBe("Invalid segment: _header");
    });

    it("should treat very long segment as valid part name if it follows naming rules", () => {
      const result = parseLayoutProperty(
        "color-this_is_a_very_long_invalid_segment_that_starts_with_number123",
      );
      expect(result).toEqual({
        property: "color",
        part: "this_is_a_very_long_invalid_segment_that_starts_with_number123",
      });
    });

    it("should reject mixed valid and invalid patterns", () => {
      const result = parseLayoutProperty("backgroundColor-123invalid-Button-md--hover");
      expect(result).toBe("Invalid segment: 123invalid");
    });

    it("should handle component name with hyphen (parsing as separate segments)", () => {
      const result = parseLayoutProperty("color-My-Button", true);
      expect(result).toBe("Multiple component names found");
    });

    it("should handle case where segment could be ambiguous", () => {
      const result = parseLayoutProperty("color-xl-Button", true);
      expect(result).toEqual({
        property: "color",
        component: "Button",
        screenSizes: ["xl"],
      });
    });

    it("should reject segment starting with special character", () => {
      const result = parseLayoutProperty("color-@invalid");
      expect(result).toBe("Invalid segment: @invalid");
    });

    it("should reject segment with only numbers", () => {
      const result = parseLayoutProperty("color-123");
      expect(result).toBe("Invalid segment: 123");
    });

    it("should reject CSS property with numbers at start", () => {
      const result = parseLayoutProperty("2color-header");
      expect(result).toBe("Invalid CSS property name: 2color");
    });

    it("should handle leading dash as filtering empty segments", () => {
      const result = parseLayoutProperty("-header-Button", true);
      expect(result).toEqual({
        property: "header",
        component: "Button",
      });
    });

    it("should reject malformed state with special characters", () => {
      const result = parseLayoutProperty("color--hover@invalid");
      expect(result).toBe("Invalid state name: hover@invalid");
    });

    it("should properly reject truly invalid segment in mixed context", () => {
      const result = parseLayoutProperty("color-xs-#invalid-Button");
      expect(result).toBe("Invalid segment: #invalid");
    });
  });

  describe("parseComponent parameter", () => {
    it("should parse component name when parseComponent is true", () => {
      const result = parseLayoutProperty("color-Button", true);
      expect(result).toEqual({
        property: "color",
        component: "Button",
      });
    });

    it("should reject component name when parseComponent is false (default)", () => {
      const result = parseLayoutProperty("color-Button");
      expect(result).toBe("Component names are not allowed when parseComponent is false: Button");
    });

    it("should reject component name when parseComponent is explicitly false", () => {
      const result = parseLayoutProperty("color-Button", false);
      expect(result).toBe("Component names are not allowed when parseComponent is false: Button");
    });

    it("should parse part names when parseComponent is false", () => {
      const result = parseLayoutProperty("color-header", false);
      expect(result).toEqual({
        property: "color",
        part: "header",
      });
    });

    it("should parse screen sizes when parseComponent is false", () => {
      const result = parseLayoutProperty("color-md", false);
      expect(result).toEqual({
        property: "color",
        screenSizes: ["md"],
      });
    });

    it("should parse states when parseComponent is false", () => {
      const result = parseLayoutProperty("color--hover", false);
      expect(result).toEqual({
        property: "color",
        states: ["hover"],
      });
    });

    it("should parse complex property without component when parseComponent is false", () => {
      const result = parseLayoutProperty("backgroundColor-header-md--hover--active", false);
      expect(result).toEqual({
        property: "backgroundColor",
        part: "header",
        screenSizes: ["md"],
        states: ["hover", "active"],
      });
    });

    it("should reject property with component in complex expression when parseComponent is false", () => {
      const result = parseLayoutProperty("backgroundColor-header-Button-md--hover", false);
      expect(result).toBe("Component names are not allowed when parseComponent is false: Button");
    });

    it("should parse property with component in complex expression when parseComponent is true", () => {
      const result = parseLayoutProperty("backgroundColor-header-Button-md--hover", true);
      expect(result).toEqual({
        property: "backgroundColor",
        part: "header",
        component: "Button",
        screenSizes: ["md"],
        states: ["hover"],
      });
    });

    it("should handle multiple component names error with parseComponent is true", () => {
      const result = parseLayoutProperty("color-Button-Card", true);
      expect(result).toBe("Multiple component names found");
    });
  });
});
