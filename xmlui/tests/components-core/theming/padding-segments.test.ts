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

  it("padding-horizontal only", () => {
    const newTheme: Record<string, string> = {
      "padding-horizontal-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-horizontal-AppHeader": "xxx",
      "padding-left-AppHeader": "xxx",
      "padding-right-AppHeader": "xxx",
    });
  });

  it("padding-vertical only", () => {
    const newTheme: Record<string, string> = {
      "padding-vertical-AppHeader": "xxx",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-bottom-AppHeader": "xxx",
      "padding-top-AppHeader": "xxx",
      "padding-vertical-AppHeader": "xxx",
    });
  });

  it("padding-horizontal and padding-vertical", () => {
    const newTheme: Record<string, string> = {
      "padding-horizontal-AppHeader": "xxx",
      "padding-vertical-AppHeader": "yyy",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-bottom-AppHeader": "yyy",
      "padding-horizontal-AppHeader": "xxx",
      "padding-left-AppHeader": "xxx",
      "padding-right-AppHeader": "xxx",
      "padding-top-AppHeader": "yyy",
      "padding-vertical-AppHeader": "yyy",
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

  it("padding with one value and padding-horizontal override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "padding-horizontal-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-horizontal-AppHeader": "8px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with one value and padding-horizontal and padding-left override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "padding-horizontal-AppHeader": "8px",
      "padding-left-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-horizontal-AppHeader": "8px",
      "padding-left-AppHeader": "16px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "4px",
    });
  });

  it("padding with one value and padding-horizontal and padding-right override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "padding-horizontal-AppHeader": "8px",
      "padding-right-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-horizontal-AppHeader": "8px",
      "padding-right-AppHeader": "16px",
      "padding-top-AppHeader": "4px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with one value and padding-vertical override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "padding-vertical-AppHeader": "8px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-vertical-AppHeader": "8px",
      "padding-top-AppHeader": "8px",
      "padding-right-AppHeader": "4px",
      "padding-bottom-AppHeader": "8px",
      "padding-left-AppHeader": "4px",
    });
  });

  it("padding with one value and padding-vertical and padding-top override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "padding-vertical-AppHeader": "8px",
      "padding-top-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-vertical-AppHeader": "8px",
      "padding-top-AppHeader": "16px",
      "padding-right-AppHeader": "4px",
      "padding-bottom-AppHeader": "8px",
      "padding-left-AppHeader": "4px",
    });
  });

  it("padding with one value and padding-vertical and padding-bottom override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px",
      "padding-vertical-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px",
      "padding-vertical-AppHeader": "8px",
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

  it("padding with two values and padding-horizontal override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "padding-horizontal-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "padding-horizontal-AppHeader": "16px",
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

  it("padding with two values and padding-vertical override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "padding-vertical-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "padding-vertical-AppHeader": "16px",
      "padding-top-AppHeader": "16px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "8px",
    });
  });

  it("padding with two values and padding-horizontal override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "padding-horizontal-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "padding-horizontal-AppHeader": "16px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "16px",
      "padding-bottom-AppHeader": "4px",
      "padding-left-AppHeader": "16px",
    });
  });

  it("padding with two values and padding-vertical override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px",
      "padding-vertical-AppHeader": "16px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px",
      "padding-vertical-AppHeader": "16px",
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

  it("padding with three values and padding-horizontal override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "padding-horizontal-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "padding-horizontal-AppHeader": "32px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "32px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "32px",
    });
  });

  it("padding with three values and padding-vertical override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px",
      "padding-vertical-AppHeader": "32px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px",
      "padding-vertical-AppHeader": "32px",
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

  it("padding with four values and padding-horizontal override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-horizontal-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-horizontal-AppHeader": "64px",
      "padding-top-AppHeader": "4px",
      "padding-right-AppHeader": "64px",
      "padding-bottom-AppHeader": "16px",
      "padding-left-AppHeader": "64px",
    });
  });

  it("padding with four values and padding-vertical override", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-vertical-AppHeader": "64px",
    };

    const result = generatePaddingSegments(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "4px 8px 16px 32px",
      "padding-vertical-AppHeader": "64px",
      "padding-top-AppHeader": "64px",
      "padding-right-AppHeader": "8px",
      "padding-bottom-AppHeader": "64px",
      "padding-left-AppHeader": "32px",
    });
  });
});
