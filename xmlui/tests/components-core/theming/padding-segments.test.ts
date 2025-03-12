import { describe, expect, it } from "vitest";
import { generatePaddingSegments } from "../../../src/components-core/theming/transformThemeVars";

describe("generatePaddingSegments", () => {
  it("No padding", () => {
    const newTheme: Record<string, string> = {
      "borderColor-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "borderColor-AppHeader": "xxx",
    });
  });

  it("paddingHorizontal only", () => {
    const newTheme: Record<string, string> = {
      "paddingHorizontal-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "paddingHorizontal-AppHeader": "xxx",
      "paddingLeft-AppHeader": "xxx",
      "paddingRight-AppHeader": "xxx",
    });
  });

  it("paddingVertical only", () => {
    const newTheme: Record<string, string> = {
      "paddingVertical-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "paddingBottom-AppHeader": "xxx",
      "paddingTop-AppHeader": "xxx",
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
      "paddingBottom-AppHeader": "yyy",
      "paddingHorizontal-AppHeader": "xxx",
      "paddingLeft-AppHeader": "xxx",
      "paddingRight-AppHeader": "xxx",
      "paddingTop-AppHeader": "yyy",
      "paddingVertical-AppHeader": "yyy",
    });
  });

  it("paddingTop only", () => {
    const newTheme: Record<string, string> = {
      "paddingTop-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "paddingTop-AppHeader": "xxx",
    });
  });

  it("paddingRight only", () => {
    const newTheme: Record<string, string> = {
      "paddingRight-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "paddingRight-AppHeader": "xxx",
    });
  });

  it("paddingBottom only", () => {
    const newTheme: Record<string, string> = {
      "paddingBottom-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "paddingBottom-AppHeader": "xxx",
    });
  });

  it("paddingLeft only", () => {
    const newTheme: Record<string, string> = {
      "paddingLeft-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "paddingLeft-AppHeader": "xxx",
    });
  });

  it("padding with one value", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "4px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "4px",
    });
  });

  it("padding with one value and paddingTop override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingTop-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingTop-AppHeader": "8px",
      "paddingRight-AppHeader": "4px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "4px",
    });
  });

  it("padding with one value and paddingRight override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "4px",
    });
  });

  it("padding with one value and paddingBottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingBottom-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "4px",
      "paddingBottom-AppHeader": "8px",
      "paddingLeft-AppHeader": "4px",
    });
  });

  it("padding with one value and paddingLeft override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingLeft-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "4px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "8px",
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
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "8px",
    });
  });

  it("padding with one value and paddingHorizontal and paddingLeft override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingHorizontal-AppHeader": "8px",
      "paddingLeft-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingHorizontal-AppHeader": "8px",
      "paddingLeft-AppHeader": "16px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "4px",
    });
  });

  it("padding with one value and paddingHorizontal and paddingRight override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingHorizontal-AppHeader": "8px",
      "paddingRight-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingHorizontal-AppHeader": "8px",
      "paddingRight-AppHeader": "16px",
      "paddingTop-AppHeader": "4px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "8px",
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
      "paddingTop-AppHeader": "8px",
      "paddingRight-AppHeader": "4px",
      "paddingBottom-AppHeader": "8px",
      "paddingLeft-AppHeader": "4px",
    });
  });

  it("padding with one value and paddingVertical and paddingTop override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingVertical-AppHeader": "8px",
      "paddingTop-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingVertical-AppHeader": "8px",
      "paddingTop-AppHeader": "16px",
      "paddingRight-AppHeader": "4px",
      "paddingBottom-AppHeader": "8px",
      "paddingLeft-AppHeader": "4px",
    });
  });

  it("padding with one value and paddingVertical and paddingBottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "paddingVertical-AppHeader": "8px",
      "paddingBottom-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "paddingVertical-AppHeader": "8px",
      "paddingTop-AppHeader": "8px",
      "paddingRight-AppHeader": "4px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "4px",
    });
  });

  it("padding with two values", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "8px",
    });
  });

  it("padding with two values and paddingTop override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "paddingTop-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "paddingTop-AppHeader": "16px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "8px",
    });
  });

  it("padding with two values and paddingRight override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "paddingRight-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "16px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "8px",
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
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "16px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "16px",
    });
  });

  it("padding with two values and paddingBottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "paddingBottom-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "8px",
    });
  });

  it("padding with two values and paddingLeft override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "paddingLeft-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "16px",
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
      "paddingTop-AppHeader": "16px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "8px",
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
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "16px",
      "paddingBottom-AppHeader": "4px",
      "paddingLeft-AppHeader": "16px",
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
      "paddingTop-AppHeader": "16px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "8px",
    });
  });

  it("padding with three values", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "8px",
    });
  });

  it("padding with three values and paddingTop override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "paddingTop-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "paddingTop-AppHeader": "32px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "8px",
    });
  });

  it("padding with three values and paddingRight override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "paddingRight-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "32px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "8px",
    });
  });

  it("padding with three values and paddingBottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "paddingBottom-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "32px",
      "paddingLeft-AppHeader": "8px",
    });
  });

  it("padding with three values and paddingLeft override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "paddingLeft-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "32px",
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
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "32px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "32px",
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
      "paddingTop-AppHeader": "32px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "32px",
      "paddingLeft-AppHeader": "8px",
    });
  });

  it("padding with four values", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "32px",
    });
  });

  it("padding with four values and paddingTop override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingTop-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingTop-AppHeader": "64px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "32px",
    });
  });

  it("padding with four values and paddingRight override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingRight-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "64px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "32px",
    });
  });

  it("padding with four values and paddingBottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingBottom-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "64px",
      "paddingLeft-AppHeader": "32px",
    });
  });

  it("padding with four values and paddingLeft override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingLeft-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "64px",
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
      "paddingTop-AppHeader": "4px",
      "paddingRight-AppHeader": "64px",
      "paddingBottom-AppHeader": "16px",
      "paddingLeft-AppHeader": "64px",
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
      "paddingTop-AppHeader": "64px",
      "paddingRight-AppHeader": "8px",
      "paddingBottom-AppHeader": "64px",
      "paddingLeft-AppHeader": "32px",
    });
  });
});
