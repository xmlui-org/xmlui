import { describe, expect, it } from "vitest";
import { generatePaddingSegments } from "../../../src/components-core/theming/transformThemeVars";

describe("generatePaddingSegments", () => {
  it("No padding", () => {
    const newTheme: Record<string, string> = {
      "color-border-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "color-border-AppHeader": "xxx",
    });
  });

  it("paddingHorizontal only", () => {
    const newTheme: Record<string, string> = {
      "paddingHorizontal-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "paddingHorizontal-AppHeader": "xxx",
      "padding-left-AppHeader": "xxx",
      "padding-right-AppHeader": "xxx",
    });
  });

  it("paddingVertical only", () => {
    const newTheme: Record<string, string> = {
      "paddingVertical-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-bottom-AppHeader": "xxx",
      "padding-top-AppHeader": "xxx",
      "paddingVertical-AppHeader": "xxx",
    });
  });

  it("paddingHorizontal and paddingVertical", () => {
    const newTheme: Record<string, string> = {
      "paddingHorizontal-AppHeader": "xxx",
      "paddingVertical-AppHeader": "yyy",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-bottom-AppHeader": "yyy",
      "paddingHorizontal-AppHeader": "xxx",
      "padding-left-AppHeader": "xxx",
      "padding-right-AppHeader": "xxx",
      "padding-top-AppHeader": "yyy",
      "paddingVertical-AppHeader": "yyy",
    });
  });

  it("padding-top only", () => {
    const newTheme: Record<string, string> = {
      "padding-top-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-top-AppHeader": "xxx",
    });
  });

  it("padding-right only", () => {
    const newTheme: Record<string, string> = {
      "padding-right-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-right-AppHeader": "xxx",
    });
  });

  it("padding-bottom only", () => {
    const newTheme: Record<string, string> = {
      "padding-bottom-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-bottom-AppHeader": "xxx",
    });
  });

  it("padding-left only", () => {
    const newTheme: Record<string, string> = {
      "padding-left-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-left-AppHeader": "xxx",
    });
  });

  it("padding with one value", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "4px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "4px",
    });
  });

  it("padding with one value and padding-top override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "padding-top-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-top-AppHeader": "8px",
      "padding-right-AppHeader": "4px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "4px",
    });
  });

  it("padding with one value and padding-right override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "4px",
    });
  });

  it("padding with one value and padding-bottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "padding-bottom-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "4px",
      "padding-bottom-AppHeader": "8px",
      "padding-left-AppHeader": "4px",
    });
  });

  it("padding with one value and padding-left override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "padding-left-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "4px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with one value and paddingHorizontal override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingHorizontal-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingHorizontal-AppHeader": "8px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with one value and paddingHorizontal and padding-left override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingHorizontal-AppHeader": "8px",
      "padding-left-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingHorizontal-AppHeader": "8px",
      "padding-left-AppHeader": "16px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "4px",
    });
  });

  it("padding with one value and paddingHorizontal and padding-right override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingHorizontal-AppHeader": "8px",
      "padding-right-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingHorizontal-AppHeader": "8px",
      "padding-right-AppHeader": "16px",
      "padding-top-AppHeader": "4px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with one value and paddingVertical override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingVertical-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingVertical-AppHeader": "8px",
      "padding-top-AppHeader": "8px",
      "padding-right-AppHeader": "4px",
      "padding-bottom-AppHeader": "8px",
      "padding-left-AppHeader": "4px",
    });
  });

  it("padding with one value and paddingVertical and padding-top override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingVertical-AppHeader": "8px",
      "padding-top-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingVertical-AppHeader": "8px",
      "padding-top-AppHeader": "16px",
      "padding-right-AppHeader": "4px",
      "padding-bottom-AppHeader": "8px",
      "padding-left-AppHeader": "4px",
    });
  });

  it("padding with one value and paddingVertical and padding-bottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingVertical-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingVertical-AppHeader": "8px",
      "padding-top-AppHeader": "8px",
      "padding-right-AppHeader": "4px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "4px",
    });
  });

  it("padding with two values", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with two values and padding-top override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "padding-top-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "padding-top-AppHeader": "16px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with two values and padding-right override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "padding-right-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "16px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with two values and paddingHorizontal override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "paddingHorizontal-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "paddingHorizontal-AppHeader": "16px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "16px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "16px",
    });
  });

  it("padding with two values and padding-bottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "padding-bottom-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with two values and padding-left override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "padding-left-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "16px",
    });
  });

  it("padding with two values and paddingVertical override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "paddingVertical-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "paddingVertical-AppHeader": "16px",
      "padding-top-AppHeader": "16px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with two values and paddingHorizontal override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "paddingHorizontal-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "paddingHorizontal-AppHeader": "16px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "16px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "16px",
    });
  });

  it("padding with two values and paddingVertical override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "paddingVertical-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "paddingVertical-AppHeader": "16px",
      "padding-top-AppHeader": "16px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with three values", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with three values and padding-top override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "padding-top-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "padding-top-AppHeader": "32px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with three values and padding-right override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "padding-right-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "32px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with three values and padding-bottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "padding-bottom-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "32px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with three values and padding-left override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "padding-left-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "32px",
    });
  });

  it("padding with three values and paddingHorizontal override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "paddingHorizontal-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "paddingHorizontal-AppHeader": "32px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "32px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "32px",
    });
  });

  it("padding with three values and paddingVertical override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "paddingVertical-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "paddingVertical-AppHeader": "32px",
      "padding-top-AppHeader": "32px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "32px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with four values", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "32px",
    });
  });

  it("padding with four values and padding-top override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-top-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-top-AppHeader": "64px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "32px",
    });
  });

  it("padding with four values and padding-right override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-right-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "64px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "32px",
    });
  });

  it("padding with four values and padding-bottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-bottom-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "64px",
      "padding-left-AppHeader": "32px",
    });
  });

  it("padding with four values and padding-left override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-left-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "64px",
    });
  });

  it("padding with four values and paddingHorizontal override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingHorizontal-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingHorizontal-AppHeader": "64px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "64px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "64px",
    });
  });

  it("padding with four values and paddingVertical override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingVertical-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingVertical-AppHeader": "64px",
      "padding-top-AppHeader": "64px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "64px",
      "padding-left-AppHeader": "32px",
    });
  });
});
