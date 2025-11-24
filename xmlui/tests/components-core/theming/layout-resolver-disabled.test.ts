import { describe, expect, it } from "vitest";
import { resolveLayoutProps } from "../../../src/components-core/theming/layout-resolver";

describe("Layout resolver - disabled inline styles", () => {
  // Properties that are inline styles and should be excluded when disableInlineStyle is true
  const INLINE_STYLE_PROPS = [
    // Positioning
    { prop: "top", value: "10px", cssKey: "top" },
    { prop: "right", value: "10px", cssKey: "right" },
    { prop: "bottom", value: "10px", cssKey: "bottom" },
    { prop: "left", value: "10px", cssKey: "left" },

    // Spacing
    { prop: "gap", value: "10px", cssKey: "gap" },
    { prop: "padding", value: "10px", cssKey: "padding" },
    { prop: "paddingRight", value: "10px", cssKey: "paddingRight" },
    { prop: "paddingLeft", value: "10px", cssKey: "paddingLeft" },
    { prop: "paddingTop", value: "10px", cssKey: "paddingTop" },
    { prop: "paddingBottom", value: "10px", cssKey: "paddingBottom" },
    { prop: "margin", value: "10px", cssKey: "margin" },
    { prop: "marginRight", value: "10px", cssKey: "marginRight" },
    { prop: "marginLeft", value: "10px", cssKey: "marginLeft" },
    { prop: "marginTop", value: "10px", cssKey: "marginTop" },
    { prop: "marginBottom", value: "10px", cssKey: "marginBottom" },

    // Borders
    { prop: "border", value: "1px solid black", cssKey: "border" },
    { prop: "borderRight", value: "1px solid black", cssKey: "borderRight" },
    { prop: "borderLeft", value: "1px solid black", cssKey: "borderLeft" },
    { prop: "borderTop", value: "1px solid black", cssKey: "borderTop" },
    { prop: "borderBottom", value: "1px solid black", cssKey: "borderBottom" },
    { prop: "borderColor", value: "blue", cssKey: "borderColor" },
    { prop: "borderStyle", value: "dotted", cssKey: "borderStyle" },
    { prop: "borderWidth", value: "2px", cssKey: "borderWidth" },
    { prop: "borderRadius", value: "5px", cssKey: "borderRadius" },
    { prop: "radiusTopLeft", value: "5px", cssKey: "borderTopLeftRadius" },
    { prop: "radiusTopRight", value: "5px", cssKey: "borderTopRightRadius" },
    { prop: "radiusBottomLeft", value: "5px", cssKey: "borderBottomLeftRadius" },
    { prop: "radiusBottomRight", value: "5px", cssKey: "borderBottomRightRadius" },

    // Typography
    { prop: "color", value: "red", cssKey: "color" },
    { prop: "fontFamily", value: "Arial", cssKey: "fontFamily" },
    { prop: "fontSize", value: "16px", cssKey: "fontSize" },
    { prop: "fontWeight", value: "bold", cssKey: "fontWeight" },
    { prop: "fontStyle", value: "italic", cssKey: "fontStyle" },
    { prop: "fontVariant", value: "small-caps", cssKey: "fontVariant" },
    { prop: "lineBreak", value: "auto", cssKey: "lineBreak" },
    { prop: "textDecoration", value: "underline", cssKey: "textDecoration" },
    { prop: "textDecorationLine", value: "overline", cssKey: "textDecorationLine" },
    { prop: "textDecorationColor", value: "blue", cssKey: "textDecorationColor" },
    { prop: "textDecorationStyle", value: "dotted", cssKey: "textDecorationStyle" },
    { prop: "textDecorationThickness", value: "2px", cssKey: "textDecorationThickness" },
    { prop: "textIndent", value: "20px", cssKey: "textIndent" },
    { prop: "textShadow", value: "2px 2px 4px gray", cssKey: "textShadow" },
    { prop: "textUnderlineOffset", value: "5px", cssKey: "textUnderlineOffset" },
    { prop: "userSelect", value: "none", cssKey: "userSelect" },
    { prop: "letterSpacing", value: "2px", cssKey: "letterSpacing" },
    { prop: "textTransform", value: "uppercase", cssKey: "textTransform" },
    { prop: "lineHeight", value: "1.5", cssKey: "lineHeight" },
    { prop: "textAlign", value: "center", cssKey: "textAlign" },
    { prop: "textAlignLast", value: "right", cssKey: "textAlignLast" },
    { prop: "textWrap", value: "wrap", cssKey: "textWrap" },
    { prop: "wordBreak", value: "break-word", cssKey: "wordBreak" },
    { prop: "wordSpacing", value: "5px", cssKey: "wordSpacing" },
    { prop: "wordWrap", value: "break-word", cssKey: "wordWrap" },
    { prop: "writingMode", value: "horizontal-tb", cssKey: "writingMode" },

    // Colors and Effects
    { prop: "backgroundColor", value: "yellow", cssKey: "backgroundColor" },
    { prop: "background", value: "linear-gradient(to right, red, blue)", cssKey: "background" },
    { prop: "boxShadow", value: "2px 2px 5px gray", cssKey: "boxShadow" },
    { prop: "direction", value: "rtl", cssKey: "direction" },
    { prop: "overflowX", value: "hidden", cssKey: "overflowX" },
    { prop: "overflowY", value: "scroll", cssKey: "overflowY" },
    { prop: "zIndex", value: "100", cssKey: "zIndex" },
    { prop: "opacity", value: "0.5", cssKey: "opacity" },
    { prop: "zoom", value: "1.5", cssKey: "zoom" },
    { prop: "cursor", value: "pointer", cssKey: "cursor" },
    { prop: "whiteSpace", value: "nowrap", cssKey: "whiteSpace" },
    { prop: "transform", value: "rotate(45deg)", cssKey: "transform" },

    // Outline
    { prop: "outline", value: "2px solid blue", cssKey: "outline" },
    { prop: "outlineWidth", value: "2px", cssKey: "outlineWidth" },
    { prop: "outlineColor", value: "green", cssKey: "outlineColor" },
    { prop: "outlineStyle", value: "dashed", cssKey: "outlineStyle" },
    { prop: "outlineOffset", value: "5px", cssKey: "outlineOffset" },
  ];

  // Properties that are NOT inline styles (should always be included)
  const NON_INLINE_STYLE_PROPS = [
    { prop: "width", value: "100px", cssKey: "width" },
    { prop: "height", value: "50px", cssKey: "height" },
  ];

  describe("Parametrized tests for inline style properties", () => {
    INLINE_STYLE_PROPS.forEach(({ prop, value, cssKey }) => {
      it(`${prop} should be excluded when disableInlineStyle is true`, () => {
        const result = resolveLayoutProps(
          { [prop]: value },
          undefined,
          true, // disableInlineStyle = true
        );
        expect(result.cssProps[cssKey]).toBeUndefined();
      });

      it(`${prop} should be included when disableInlineStyle is false`, () => {
        const result = resolveLayoutProps(
          { [prop]: value },
          undefined,
          false, // disableInlineStyle = false
        );
        expect(result.cssProps[cssKey]).toBeDefined();
      });

      it(`${prop} should be included when disableInlineStyle is undefined`, () => {
        const result = resolveLayoutProps(
          { [prop]: value },
          undefined,
          undefined, // disableInlineStyle = undefined (default behavior)
        );
        expect(result.cssProps[cssKey]).toBeDefined();
      });
    });
  });

  describe("Non-inline style properties should always be included", () => {
    NON_INLINE_STYLE_PROPS.forEach(({ prop, value, cssKey }) => {
      it(`${prop} should be included even when disableInlineStyle is true`, () => {
        const result = resolveLayoutProps(
          { [prop]: value },
          undefined,
          true, // disableInlineStyle = true
        );
        expect(result.cssProps[cssKey]).toBeDefined();
        expect(result.cssProps[cssKey]).toBe(value);
      });
    });
  });

  describe("Multiple properties with disableInlineStyle", () => {
    it("should only exclude inline style properties", () => {
      const result = resolveLayoutProps(
        {
          width: "100px", // Not an inline style - should be included
          padding: "10px", // Inline style - should be excluded
          height: "50px", // Not an inline style - should be included
          color: "red", // Inline style - should be excluded
        },
        undefined,
        true, // disableInlineStyle = true
      );

      // Should be included
      expect(result.cssProps.width).toBe("100px");
      expect(result.cssProps.height).toBe("50px");

      // Should be excluded
      expect(result.cssProps.padding).toBeUndefined();
      expect(result.cssProps.color).toBeUndefined();
    });

    it("should include all properties when disableInlineStyle is false", () => {
      const result = resolveLayoutProps(
        {
          width: "100px",
          padding: "10px",
          height: "50px",
          color: "red",
        },
        undefined,
        false, // disableInlineStyle = false
      );

      // All should be included
      expect(result.cssProps.width).toBe("100px");
      expect(result.cssProps.padding).toBe("10px");
      expect(result.cssProps.height).toBe("50px");
      expect(result.cssProps.color).toBe("red");
    });
  });
});
