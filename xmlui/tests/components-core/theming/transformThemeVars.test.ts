import { describe, expect, test } from "vitest";

import { matchThemeVar } from "../../../src/components-core/theming/hvar";
import {
  collectThemeChainByExtends,
  generateBaseFontSizes,
  generateBaseSpacings,
  generateBaseTones,
  generateBootstrapBaseColumns,
  generateBorderSegments,
  generateButtonTones,
  generatePaddingSegments,
  generateTextFontSizes,
  resolveThemeVar,
  resolveThemeVarsWithCssVars,
} from "../../../src/components-core/theming/transformThemeVars";

describe("theme variable transform helpers", () => {
  test("resolves pure $var chains without converting embedded references", () => {
    const theme = {
      color: "#112233",
      alias: "$color",
      nested: "$alias",
      mixed: "1px solid $alias",
    };

    expect(resolveThemeVar("$nested", theme)).toBe("#112233");
    expect(resolveThemeVar("mixed", theme)).toBe("1px solid $alias");
    expect(resolveThemeVarsWithCssVars(theme).mixed).toBe("1px solid var(--xmlui-alias)");
  });

  test("generates base spacing and bootstrap column variables", () => {
    expect(generateBaseSpacings({ "space-base": ".25rem" })).toMatchObject({
      "space-0": "0rem",
      "space-0_5": "0.125rem",
      "space-4": "1rem",
      "space-96": "24rem",
    });

    expect(generateBootstrapBaseColumns({})["col-6"]).toBe("50.0000%");
    expect(generateBootstrapBaseColumns({})["col-12"]).toBe("100.0000%");
  });

  test("generates base and text font-size variables", () => {
    expect(generateBaseFontSizes({ fontSize: "20px" })).toMatchObject({
      "const-fontSize-tiny": "12.5px",
      "const-fontSize-base": "20px",
      "const-fontSize-2xl": "30px",
      "const-fontSize-9xl": "160px",
    });

    expect(generateBaseFontSizes({ fontSize: "1rem" })).toMatchObject({
      "const-fontSize-base": "1rem",
      "const-fontSize-lg": "18px",
    });

    expect(generateTextFontSizes({ "fontSize-Text": "$fontSize", fontSize: "16px" })).toMatchObject({
      "fontSize-Text-keyboard": "calc(var(--xmlui-fontSize-Text) * 0.875)",
      "fontSize-Text-paragraph": "var(--xmlui-fontSize-Text)",
      "fontSize-Text-title": "calc(var(--xmlui-fontSize-Text) * 1.5)",
    });
  });

  test("segments padding values and keeps explicit horizontal and vertical overrides", () => {
    expect(
      generatePaddingSegments({
        "padding-Card": "1px 2px 3px 4px",
        "paddingHorizontal-Card": "8px",
        "paddingVertical-Card": "6px",
      }),
    ).toMatchObject({
      "paddingTop-Card": "6px",
      "paddingRight-Card": "8px",
      "paddingBottom-Card": "6px",
      "paddingLeft-Card": "8px",
    });
  });

  test("segments border shorthands, axes, sides, and longhands", () => {
    expect(
      generateBorderSegments({
        "border-Card": "1px solid red",
        "borderHorizontal-Card": "2px dashed #0000ff",
      }),
    ).toMatchObject({
      "borderLeft-Card": "2px dashed #0000ff",
      "borderRight-Card": "2px dashed #0000ff",
      "borderTop-Card": "1px solid red",
      "borderBottom-Card": "1px solid red",
      "borderLeftWidth-Card": "2px",
      "borderRightStyle-Card": "dashed",
      "borderLeftColor-Card": "#0000ff",
      "borderRightColor-Card": "#0000ff",
    });
  });

  test("generates base tone names and button tone names from closest color variables", () => {
    expect(generateBaseTones({ "color-primary": "#336699" })).toMatchObject({
      "const-color-primary-0": "hsl(210, 50%, 100%)",
      "const-color-primary-500": "hsl(210, 50%, 40%)",
      "const-color-primary-1000": "hsl(210, 50%, 0%)",
    });

    expect(
      generateButtonTones({
        "color-Button-primary": "#336699",
        "color-Button-primary-outlined": "#669933",
        "color-Button-secondary-solid": "#333333",
      }),
    ).toMatchObject({
      "backgroundColor-Button-primary-solid": "#336699",
      "borderColor-Button-primary-outlined": "#669933",
      "backgroundColor-Button-primary-ghost--hover": "rgba(51, 102, 153, 0.1)",
      "backgroundColor-Button-secondary-solid": "#333333",
    });
  });

  test("matches hierarchical theme variables using fallback order", () => {
    const match = matchThemeVar("textColor-Button-primary-solid--hover", [
      { "textColor-Button": "black" },
      { "textColor-Button-primary": "blue" },
    ]);

    expect(match).toMatchObject({
      forValue: "textColor-Button-primary-solid--hover",
      matchedValue: "textColor-Button-primary",
    });
    expect(match?.from.slice(0, 4)).toEqual([
      "textColor-Button-primary-solid--hover",
      "textColor-Button-primary--hover",
      "textColor-Button-solid--hover",
      "textColor-Button--hover",
    ]);
  });

  test("collects theme chain with root defaults before inherited themes", () => {
    const baseTheme = {
      id: "base",
      themeVars: { color: "base" },
    };
    const brandTheme = {
      id: "brand",
      extends: "base",
      themeVars: { color: "brand" },
    };

    const chain = collectThemeChainByExtends(
      brandTheme,
      [baseTheme, brandTheme],
      {
        "padding-Button": "4px",
        dark: { "padding-Button": "8px" },
      },
      {
        id: "root",
        themeVars: { color: "root" },
        tones: { dark: { themeVars: { color: "root-dark" } } },
      },
    );

    expect(chain.map((theme) => theme.id)).toEqual(["root", "base", "brand"]);
    expect(chain[0].themeVars).toMatchObject({
      color: "root",
      "padding-Button": "4px",
    });
    expect(chain[0].tones?.dark.themeVars).toMatchObject({
      color: "root-dark",
      "padding-Button": "8px",
    });
  });
});
