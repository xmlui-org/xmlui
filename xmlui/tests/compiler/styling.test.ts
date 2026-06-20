import { describe, expect, it } from "vitest";

import {
  ButtonMd,
  StackMd,
} from "../../src/component-core/metadata";
import {
  COMPONENT_PART_KEY,
  collectComponentThemeDefaults,
  componentThemeVariablesToCssProperties,
  createComponentThemeClass,
  extractScssThemeVars,
  mergeThemeVariableLayers,
  isLayoutPropName,
  parseScssVar,
  parseStyleSelectorKey,
  resolveResponsiveLayoutStyles,
  resolveLayoutStyle,
  resolveThemeReferences,
  resolveThemeVariable,
  resolveThemeVariablesWithCssVars,
  supportedLayoutPropNames,
  themeVariableFallbackNames,
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
  it("parses SCSS-exported theme variable maps like the original helper", () => {
    expect(parseScssVar('{"padding-Button":"Button padding"}')).toEqual({
      "padding-Button": "Button padding",
    });
    expect(parseScssVar("(gap-Stack: $gap-layout, color: #fff)")).toEqual({
      "gap-Stack": "$gap-layout",
      color: "#fff",
    });
  });

  it("extracts theme variable metadata from createThemeVar declarations", () => {
    expect(
      extractScssThemeVars(`
        $backgroundColor-content-App: createThemeVar("backgroundColor-content-App");
        $gap-content-App: createThemeVar('gap-content-App');
      `),
    ).toEqual({
      "backgroundColor-content-App": "Theme variable declared by backgroundColor-content-App.",
      "gap-content-App": "Theme variable declared by gap-content-App.",
    });
  });

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

  it("merges base, tone, and component default theme variables", () => {
    const theme = mergeThemeVariableLayers([
      {
        "color-primary": "blue",
        "textColor-Text": "$color-primary",
        dark: {
          "color-primary": "white",
        },
        tones: {
          dark: {
            "backgroundColor-App": "black",
          },
        },
      },
      collectComponentThemeDefaults(StackMd, [], "dark"),
    ], "dark");

    expect(theme).toMatchObject({
      "color-primary": "white",
      "backgroundColor-App": "black",
      "gap-Stack": "$gap-layout",
    });
    expect(resolveThemeVariablesWithCssVars(theme)).toMatchObject({
      "textColor-Text": "var(--xmlui-color-primary)",
      "gap-Stack": "var(--xmlui-gap-layout)",
    });
  });

  it("matches hierarchical component theme variables with old fallback order", () => {
    expect(themeVariableFallbackNames("backgroundColor-Button-primary-solid--hover")).toEqual([
      "backgroundColor-Button-primary-solid--hover",
      "backgroundColor-Button-primary--hover",
      "backgroundColor-Button-solid--hover",
      "backgroundColor-Button--hover",
      "backgroundColor-Button-primary-solid",
      "backgroundColor-Button-primary",
      "backgroundColor-Button-solid",
      "backgroundColor-Button",
    ]);
    expect(resolveThemeVariable("backgroundColor-Button-primary-solid--hover", [
      {
        "backgroundColor-Button": "transparent",
        "backgroundColor-Button-primary": "blue",
      },
      {
        "backgroundColor-Button": "green",
      },
    ])).toBe("green");
  });

  it("creates scoped component theme CSS properties from metadata declarations", () => {
    const variables = mergeThemeVariableLayers([
      collectComponentThemeDefaults(ButtonMd),
      {
        "backgroundColor-Button": "$color-primary",
        "color-primary": "#2563eb",
      },
    ]);

    expect(componentThemeVariablesToCssProperties(ButtonMd, variables)).toMatchObject({
      "--xmlui-padding-Button": "var(--xmlui-space-2) var(--xmlui-space-4)",
      "--xmlui-gap-Button": "var(--xmlui-space-2)",
      "--xmlui-backgroundColor-Button": "var(--xmlui-color-primary)",
    });
    expect(createComponentThemeClass("Button", ButtonMd, variables)).toMatchObject({
      className: "xmlui-Button",
      style: expect.objectContaining({
        "--xmlui-backgroundColor-Button": "var(--xmlui-color-primary)",
      }),
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
    expect(parseStyleSelectorKey("gap-md")).toEqual({
      property: "gap",
      part: undefined,
      breakpoint: "md",
      state: undefined,
    });
  });

  it("resolves responsive component part styles", () => {
    expect(resolveResponsiveLayoutStyles({
      padding: "$space-2",
      "backgroundColor-button-md--hover": "$color-primary",
      "gap-md": "16px",
    })).toEqual({
      [COMPONENT_PART_KEY]: {
        base: {
          padding: "var(--xmlui-space-2)",
        },
        breakpoints: {
          md: {
            gap: "16px",
          },
        },
        states: {},
      },
      button: {
        base: {},
        breakpoints: {},
        states: {
          hover: {
            base: {},
            breakpoints: {
              md: {
                backgroundColor: "var(--xmlui-color-primary)",
              },
            },
          },
        },
      },
    });
  });
});
