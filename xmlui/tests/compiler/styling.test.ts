import { describe, expect, it } from "vitest";

import {
  isLayoutPropName,
  parseStyleSelectorKey,
  resolveLayoutStyle,
  resolveThemeReferences,
  supportedLayoutPropNames,
  themeVariablesToCssProperties,
} from "../../src/styling";

describe("styling contracts", () => {
  it("recognizes supported and deferred original XMLUI layout props", () => {
    expect(supportedLayoutPropNames).toContain("gap");
    expect(supportedLayoutPropNames).toContain("paddingHorizontal");
    expect(supportedLayoutPropNames).toContain("scrollSnapType");
    expect(supportedLayoutPropNames).toContain("textUnderlineOffset");
    expect(isLayoutPropName("backgroundColor")).toBe(true);
    expect(isLayoutPropName("unknown")).toBe(false);
  });
});

describe("theme variable helpers", () => {
  it("resolves XMLUI dollar theme references to CSS variables", () => {
    expect(resolveThemeReferences("$color-primary")).toBe("var(--xmlui-color-primary)");
    expect(resolveThemeReferences("1px solid $color-border")).toBe("1px solid var(--xmlui-color-border)");
    expect(resolveThemeReferences("red")).toBe("red");
    expect(resolveThemeReferences(12)).toBe(12);
    expect(resolveThemeReferences("var(--xmlui-color-primary)")).toBe("var(--xmlui-color-primary)");
  });

  it("converts theme variable maps to CSS custom properties", () => {
    expect(themeVariablesToCssProperties({
      "color-primary": "red",
      "--xmlui-space-2": "8px",
      empty: "",
    })).toEqual({
      "--xmlui-color-primary": "red",
      "--xmlui-space-2": "8px",
    });
  });
});

describe("layout resolver", () => {
  it("resolves sizing, spacing, border, alignment, and theme values", () => {
    expect(resolveLayoutStyle({
      width: 120,
      paddingHorizontal: "$space-2",
      paddingTop: "12px",
      marginVertical: 4,
      border: "1px solid $color-border",
      backgroundColor: "$color-surface",
      horizontalAlignment: "center",
      verticalAlignment: "bottom",
    }, { orientation: "horizontal" })).toMatchObject({
      display: "flex",
      flexDirection: "row",
      width: "120px",
      paddingLeft: "var(--xmlui-space-2)",
      paddingRight: "var(--xmlui-space-2)",
      paddingTop: "12px",
      marginTop: "4px",
      marginBottom: "4px",
      border: "1px solid var(--xmlui-color-border)",
      backgroundColor: "var(--xmlui-color-surface)",
      justifyContent: "center",
      alignItems: "flex-end",
    });
  });

  it("maps star sizing to flex behavior in the parent orientation", () => {
    expect(resolveLayoutStyle({ width: "2*" }, { orientation: "horizontal" })).toMatchObject({
      flexGrow: 2,
      flexShrink: 1,
      flexBasis: 0,
    });
    expect(resolveLayoutStyle({ height: "*" }, { orientation: "vertical" })).toMatchObject({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
    });
  });

  it("parses part, breakpoint, and state selector keys", () => {
    expect(parseStyleSelectorKey("backgroundColor-button-md--hover")).toEqual({
      property: "backgroundColor",
      part: "button",
      breakpoint: "md",
      state: "hover",
    });
  });
});
