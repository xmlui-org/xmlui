import { describe, expect, it } from "vitest";
import { generateBorderSegments } from "../../../src/components-core/theming/transformThemeVars";

describe("generateBorderSegments", () => {
  it("No border", () => {
    const newTheme: Record<string, string> = {
      "color-bg-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "color-bg-AppHeader": "xxx",
    });
  });

  it("border-horizontal only", () => {
    const newTheme: Record<string, string> = {
      "border-horizontal-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-horizontal-AppHeader": "xxx",
    });
  });

  it("border-vertical only", () => {
    const newTheme: Record<string, string> = {
      "border-vertical-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-vertical-AppHeader": "xxx",
    });
  });

  it("border-top only", () => {
    const newTheme: Record<string, string> = {
      "border-top-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-top-AppHeader": "xxx",
    });
  });

  it("border-right only", () => {
    const newTheme: Record<string, string> = {
      "border-right-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-right-AppHeader": "xxx",
    });
  });

  it("border-bottom only", () => {
    const newTheme: Record<string, string> = {
      "border-bottom-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-AppHeader": "xxx",
    });
  });

  it("border-left only", () => {
    const newTheme: Record<string, string> = {
      "border-left-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-left-AppHeader": "xxx",
    });
  });

  it("thickness-border only", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "thickness-border-AppHeader": "xxx",
      "thickness-border-bottom-AppHeader": "xxx",
      "thickness-border-left-AppHeader": "xxx",
      "thickness-border-right-AppHeader": "xxx",
      "thickness-border-top-AppHeader": "xxx",
    });
  });

  it("thickness-border-horizontal only", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-horizontal-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "thickness-border-horizontal-AppHeader": "xxx",
      "thickness-border-left-AppHeader": "xxx",
      "thickness-border-right-AppHeader": "xxx",
    });
  });

  it("thickness-border-vertical only", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-vertical-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "thickness-border-bottom-AppHeader": "xxx",
      "thickness-border-bottom-vertical": "xxx",
      "thickness-border-left-vertical": "xxx",
      "thickness-border-right-vertical": "xxx",
      "thickness-border-top-AppHeader": "xxx",
      "thickness-border-top-vertical": "xxx",
      "thickness-border-vertical-AppHeader": "xxx",
    });
  });

  it("style-border only", () => {
    const newTheme: Record<string, string> = {
      "style-border-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "style-border-AppHeader": "xxx",
      "style-border-bottom-AppHeader": "xxx",
      "style-border-left-AppHeader": "xxx",
      "style-border-right-AppHeader": "xxx",
      "style-border-top-AppHeader": "xxx",
    });
  });

  it("style-border-horizontal only", () => {
    const newTheme: Record<string, string> = {
      "style-border-horizontal-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "style-border-horizontal-AppHeader": "xxx",
      "style-border-left-horizontal": "xxx",
      "style-border-right-horizontal": "xxx",
    });
  });

  it("style-border-vertical only", () => {
    const newTheme: Record<string, string> = {
      "style-border-vertical-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "style-border-vertical-AppHeader": "xxx",
      "style-border-bottom-vertical": "xxx",
      "style-border-top-vertical": "xxx",
    });
  });

  it("color-border only", () => {
    const newTheme: Record<string, string> = {
      "color-border-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "color-border-AppHeader": "xxx",
      "color-border-bottom-AppHeader": "xxx",
      "color-border-left-AppHeader": "xxx",
      "color-border-right-AppHeader": "xxx",
      "color-border-top-AppHeader": "xxx",
    });
  });

  it("color-border-horizontal only", () => {
    const newTheme: Record<string, string> = {
      "color-border-horizontal-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "color-border-horizontal-AppHeader": "xxx",
      "color-border-left-horizontal": "xxx",
      "color-border-right-horizontal": "xxx",
    });
  });

  it("color-border-vertical only", () => {
    const newTheme: Record<string, string> = {
      "color-border-vertical-AppHeader": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "color-border-vertical-AppHeader": "xxx",
      "color-border-bottom-vertical": "xxx",
      "color-border-top-vertical": "xxx",
    });
  });

  it("border: thickness, style, color #1", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid red",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "red",
    });
  });

  it("border: thickness, style, color #2", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid rgb(0,0,0)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid rgb(0,0,0)",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "rgb(0,0,0)",
    });
  });

  it("border: thickness, style, color #3", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid #000",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid #000",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "#000",
    });
  });

  it("border: thickness, style, color #4", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid #000000",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid #000000",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "#000000",
    });
  });

  it("border: thickness, style, color #5", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid hsl(0,0%,0%)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid hsl(0,0%,0%)",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "hsl(0,0%,0%)",
    });
  });

  it("border: thickness, style, color #6", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid hsl(0,0%,0%)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid hsl(0,0%,0%)",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "hsl(0,0%,0%)",
    });
  });

  it("border: thickness, style, color #7", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid hsl(0,0%,0%)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid hsl(0,0%,0%)",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "hsl(0,0%,0%)",
    });
  });

  it("border: thickness, style, color #8", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid hsla(0,0%,0%,0.5)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid hsla(0,0%,0%,0.5)",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "hsla(0,0%,0%,0.5)",
    });
  });

  it("border: thickness, style, color #9", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid rgba(0,0,0,0.5)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid rgba(0,0,0,0.5)",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "rgba(0,0,0,0.5)",
    });
  });

  it("border: thickness, color, style", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px red solid",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px red solid",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "red",
    });
  });

  it("border: style, thickness, color", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "solid 1px red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "solid 1px red",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "red",
    });
  });

  it("border: style, color, thickness", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "solid red 1px",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "solid red 1px",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "red",
    });
  });

  it("border: color, thickness, style", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "red 1px solid",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "red 1px solid",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "red",
    });
  });

  it("border: color, style, thickness", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "red solid 1px",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "red solid 1px",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
      "color-border-AppHeader": "red",
    });
  });

  it("border: thickness, color", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px red",
      "thickness-border-AppHeader": "1px",
      "color-border-AppHeader": "red",
    });
  });

  it("border: thickness, style", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid",
      "thickness-border-AppHeader": "1px",
      "style-border-AppHeader": "solid",
    });
  });

  it("border: thickness, color", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px red",
      "thickness-border-AppHeader": "1px",
      "color-border-AppHeader": "red",
    });
  });

  it("border: thickness, style, VAR", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px solid $some-color",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px solid $some-color",
      "color-border-AppHeader": "$some-color",
      "style-border-AppHeader": "solid",
      "thickness-border-AppHeader": "1px",
    });
  });

  it("border: style, thickness, VAR", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "solid 1px $some-color",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "solid 1px $some-color",
      "color-border-AppHeader": "$some-color",
      "style-border-AppHeader": "solid",
      "thickness-border-AppHeader": "1px",
    });
  });

  it("border: thickness, VAR, color", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px $some-style red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px $some-style red",
      "color-border-AppHeader": "red",
      "style-border-AppHeader": "$some-style",
      "thickness-border-AppHeader": "1px",
    });
  });

  it("border: color, VAR, thickness", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "red $some-style 1px",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "red $some-style 1px",
      "color-border-AppHeader": "red",
      "style-border-AppHeader": "$some-style",
      "thickness-border-AppHeader": "1px",
    });
  });

  it("border: VAR, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "$some-thickness solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "$some-thickness solid red",
      "color-border-AppHeader": "red",
      "style-border-AppHeader": "solid",
      "thickness-border-AppHeader": "$some-thickness",
    });
  });

  it("border: VAR, color, style", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "$some-thickness red solid",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "$some-thickness red solid",
      "color-border-AppHeader": "red",
      "style-border-AppHeader": "solid",
      "thickness-border-AppHeader": "$some-thickness",
    });
  });

  it("border: thickness, VAR1, VAR2", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "1px $some-style $some-color",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "1px $some-style $some-color",
      "color-border-AppHeader": "$some-color",
      "style-border-AppHeader": "$some-style",
      "thickness-border-AppHeader": "1px",
    });
  });

  it("border: VAR1, style, VAR2", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "$some-thickness solid $some-color",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "$some-thickness solid $some-color",
      "color-border-AppHeader": "$some-color",
      "style-border-AppHeader": "solid",
      "thickness-border-AppHeader": "$some-thickness",
    });
  });

  it("border: VAR1, VAR2, color", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "$some-thickness $some-style red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "$some-thickness $some-style red",
      "color-border-AppHeader": "red",
      "style-border-AppHeader": "$some-style",
      "thickness-border-AppHeader": "$some-thickness",
    });
  });

  it("border: VAR1, VAR2, VAR3", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "$some-thickness $some-style $some-color",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "$some-thickness $some-style $some-color",
      "color-border-AppHeader": "$some-color",
      "style-border-AppHeader": "$some-style",
      "thickness-border-AppHeader": "$some-thickness",
    });
  });

  it("border-Card", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "dotted rgb(255, 0, 0) 5px",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "dotted rgb(255, 0, 0) 5px",
      "color-border-Card": "rgb(255, 0, 0)",
      "style-border-Card": "dotted",
      "thickness-border-Card": "5px",
    });
  });

  it("border-left: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-left-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-left-AppHeader": "1px solid red",
      "color-border-left-AppHeader": "red",
      "style-border-left-AppHeader": "solid",
      "thickness-border-left-AppHeader": "1px",
    });
  });

  it("border-right: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-right-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-right-AppHeader": "1px solid red",
      "color-border-right-AppHeader": "red",
      "style-border-right-AppHeader": "solid",
      "thickness-border-right-AppHeader": "1px",
    });
  });

  it("border-horizontal: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-horizontal-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-horizontal-AppHeader": "1px solid red",
      "color-border-left-AppHeader": "red",
      "color-border-right-AppHeader": "red",
      "style-border-left-AppHeader": "solid",
      "style-border-right-AppHeader": "solid",
      "thickness-border-left-AppHeader": "1px",
      "thickness-border-right-AppHeader": "1px",
    });
  });

  it("border-top: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-top-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-top-AppHeader": "1px solid red",
      "color-border-top-AppHeader": "red",
      "style-border-top-AppHeader": "solid",
      "thickness-border-top-AppHeader": "1px",
    });
  });

  it("border-bottom: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-bottom-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-AppHeader": "1px solid red",
      "color-border-bottom-AppHeader": "red",
      "style-border-bottom-AppHeader": "solid",
      "thickness-border-bottom-AppHeader": "1px",
    });
  });

  it("border-vertical: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-vertical-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-vertical-AppHeader": "1px solid red",
      "color-border-bottom-AppHeader": "red",
      "color-border-top-AppHeader": "red",
      "style-border-bottom-AppHeader": "solid",
      "style-border-top-AppHeader": "solid",
      "thickness-border-bottom-AppHeader": "1px",
      "thickness-border-top-AppHeader": "1px",
    });
  });

  it("border-left: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-AppHeader": "dotted",
      "border-left-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-left-AppHeader": "1px solid red",
      "color-border-left-AppHeader": "red",
      "style-border-AppHeader": "dotted",
      "style-border-bottom-AppHeader": "dotted",
      "style-border-left-AppHeader": "solid",
      "style-border-right-AppHeader": "dotted",
      "style-border-top-AppHeader": "dotted",
      "thickness-border-left-AppHeader": "1px",
    });
  });

  it("border-left: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-AppHeader": "2px",
      "border-left-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-left-AppHeader": "1px solid red",
      "color-border-left-AppHeader": "red",
      "style-border-left-AppHeader": "solid",
      "thickness-border-AppHeader": "2px",
      "thickness-border-bottom-AppHeader": "2px",
      "thickness-border-left-AppHeader": "1px",
      "thickness-border-right-AppHeader": "2px",
      "thickness-border-top-AppHeader": "2px",
    });
  });

  it("border-left: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-AppHeader": "blue",
      "border-left-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-left-AppHeader": "1px solid red",
      "color-border-AppHeader": "blue",
      "color-border-bottom-AppHeader": "blue",
      "color-border-left-AppHeader": "red",
      "color-border-right-AppHeader": "blue",
      "color-border-top-AppHeader": "blue",
      "style-border-left-AppHeader": "solid",
      "thickness-border-left-AppHeader": "1px",
    });
  });

  it("border-right: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-AppHeader": "dotted",
      "border-right-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-right-AppHeader": "1px solid red",
      "color-border-right-AppHeader": "red",
      "style-border-AppHeader": "dotted",
      "style-border-bottom-AppHeader": "dotted",
      "style-border-left-AppHeader": "dotted",
      "style-border-right-AppHeader": "solid",
      "style-border-top-AppHeader": "dotted",
      "thickness-border-right-AppHeader": "1px",
    });
  });

  it("border-right: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-AppHeader": "2px",
      "border-right-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-right-AppHeader": "1px solid red",
      "color-border-right-AppHeader": "red",
      "style-border-right-AppHeader": "solid",
      "thickness-border-AppHeader": "2px",
      "thickness-border-bottom-AppHeader": "2px",
      "thickness-border-left-AppHeader": "2px",
      "thickness-border-right-AppHeader": "1px",
      "thickness-border-top-AppHeader": "2px",
    });
  });

  it("border-right: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-AppHeader": "blue",
      "border-right-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-right-AppHeader": "1px solid red",
      "color-border-AppHeader": "blue",
      "color-border-bottom-AppHeader": "blue",
      "color-border-left-AppHeader": "blue",
      "color-border-right-AppHeader": "red",
      "color-border-top-AppHeader": "blue",
      "style-border-right-AppHeader": "solid",
      "thickness-border-right-AppHeader": "1px",
    });
  });

  it("border-horizontal: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-AppHeader": "dotted",
      "border-horizontal-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-horizontal-AppHeader": "1px solid red",
      "color-border-left-AppHeader": "red",
      "color-border-right-AppHeader": "red",
      "style-border-AppHeader": "dotted",
      "style-border-bottom-AppHeader": "dotted",
      "style-border-left-AppHeader": "solid",
      "style-border-right-AppHeader": "solid",
      "style-border-top-AppHeader": "dotted",
      "thickness-border-left-AppHeader": "1px",
      "thickness-border-right-AppHeader": "1px",
    });
  });

  it("border-horizontal: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-AppHeader": "2px",
      "border-horizontal-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-horizontal-AppHeader": "1px solid red",
      "color-border-left-AppHeader": "red",
      "color-border-right-AppHeader": "red",
      "style-border-left-AppHeader": "solid",
      "style-border-right-AppHeader": "solid",
      "thickness-border-AppHeader": "2px",
      "thickness-border-bottom-AppHeader": "2px",
      "thickness-border-left-AppHeader": "1px",
      "thickness-border-right-AppHeader": "1px",
      "thickness-border-top-AppHeader": "2px",
    });
  });

  it("border-horizontal: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-AppHeader": "blue",
      "border-horizontal-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-horizontal-AppHeader": "1px solid red",
      "color-border-AppHeader": "blue",
      "color-border-bottom-AppHeader": "blue",
      "color-border-left-AppHeader": "red",
      "color-border-right-AppHeader": "red",
      "color-border-top-AppHeader": "blue",
      "style-border-left-AppHeader": "solid",
      "style-border-right-AppHeader": "solid",
      "thickness-border-left-AppHeader": "1px",
      "thickness-border-right-AppHeader": "1px",
    });
  });

  it("border-top: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-AppHeader": "dotted",
      "border-top-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-top-AppHeader": "1px solid red",
      "color-border-top-AppHeader": "red",
      "style-border-AppHeader": "dotted",
      "style-border-bottom-AppHeader": "dotted",
      "style-border-left-AppHeader": "dotted",
      "style-border-right-AppHeader": "dotted",
      "style-border-top-AppHeader": "solid",
      "thickness-border-top-AppHeader": "1px",
    });
  });

  it("border-top: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-AppHeader": "2px",
      "border-top-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-top-AppHeader": "1px solid red",
      "color-border-top-AppHeader": "red",
      "style-border-top-AppHeader": "solid",
      "thickness-border-AppHeader": "2px",
      "thickness-border-bottom-AppHeader": "2px",
      "thickness-border-left-AppHeader": "2px",
      "thickness-border-right-AppHeader": "2px",
      "thickness-border-top-AppHeader": "1px",
    });
  });

  it("border-top: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-AppHeader": "blue",
      "border-top-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-top-AppHeader": "1px solid red",
      "color-border-AppHeader": "blue",
      "color-border-bottom-AppHeader": "blue",
      "color-border-left-AppHeader": "blue",
      "color-border-right-AppHeader": "blue",
      "color-border-top-AppHeader": "red",
      "style-border-top-AppHeader": "solid",
      "thickness-border-top-AppHeader": "1px",
    });
  });

  it("border-bottom: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-AppHeader": "dotted",
      "border-bottom-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-AppHeader": "1px solid red",
      "color-border-bottom-AppHeader": "red",
      "style-border-AppHeader": "dotted",
      "style-border-bottom-AppHeader": "solid",
      "style-border-left-AppHeader": "dotted",
      "style-border-right-AppHeader": "dotted",
      "style-border-top-AppHeader": "dotted",
      "thickness-border-bottom-AppHeader": "1px",
    });
  });

  it("border-bottom: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-AppHeader": "2px",
      "border-bottom-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-AppHeader": "1px solid red",
      "color-border-bottom-AppHeader": "red",
      "style-border-bottom-AppHeader": "solid",
      "thickness-border-AppHeader": "2px",
      "thickness-border-bottom-AppHeader": "1px",
      "thickness-border-left-AppHeader": "2px",
      "thickness-border-right-AppHeader": "2px",
      "thickness-border-top-AppHeader": "2px",
    });
  });

  it("border-bottom: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-AppHeader": "blue",
      "border-bottom-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-AppHeader": "1px solid red",
      "color-border-AppHeader": "blue",
      "color-border-bottom-AppHeader": "red",
      "color-border-left-AppHeader": "blue",
      "color-border-right-AppHeader": "blue",
      "color-border-top-AppHeader": "blue",
      "style-border-bottom-AppHeader": "solid",
      "thickness-border-bottom-AppHeader": "1px",
    });
  });

  it("border-vertical: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-AppHeader": "dotted",
      "border-vertical-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-vertical-AppHeader": "1px solid red",
      "color-border-bottom-AppHeader": "red",
      "color-border-top-AppHeader": "red",
      "style-border-AppHeader": "dotted",
      "style-border-bottom-AppHeader": "solid",
      "style-border-left-AppHeader": "dotted",
      "style-border-right-AppHeader": "dotted",
      "style-border-top-AppHeader": "solid",
      "thickness-border-bottom-AppHeader": "1px",
      "thickness-border-top-AppHeader": "1px",
    });
  });

  it("border-vertical: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-AppHeader": "2px",
      "border-vertical-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-vertical-AppHeader": "1px solid red",
      "color-border-bottom-AppHeader": "red",
      "color-border-top-AppHeader": "red",
      "style-border-bottom-AppHeader": "solid",
      "style-border-top-AppHeader": "solid",
      "thickness-border-AppHeader": "2px",
      "thickness-border-bottom-AppHeader": "1px",
      "thickness-border-left-AppHeader": "2px",
      "thickness-border-right-AppHeader": "2px",
      "thickness-border-top-AppHeader": "1px",
    });
  });

  it("border-vertical: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-AppHeader": "blue",
      "border-vertical-AppHeader": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-vertical-AppHeader": "1px solid red",
      "color-border-AppHeader": "blue",
      "color-border-bottom-AppHeader": "red",
      "color-border-left-AppHeader": "blue",
      "color-border-right-AppHeader": "blue",
      "color-border-top-AppHeader": "red",
      "style-border-bottom-AppHeader": "solid",
      "style-border-top-AppHeader": "solid",
      "thickness-border-bottom-AppHeader": "1px",
      "thickness-border-top-AppHeader": "1px",
    });
  });
});
