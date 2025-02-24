import { describe, expect, it } from "vitest";
import { generateBorderSegments } from "../../../src/components-core/theming/transformThemeVars";

describe("generateBorderSegments", () => {
  it("No border", () => {
    const newTheme: Record<string, string> = {
      "color-bg-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "color-bg-Card": "xxx",
    });
  });

  it("border-horizontal only", () => {
    const newTheme: Record<string, string> = {
      "border-horizontal-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-horizontal-Card": "xxx",
      "border-left-Card": "xxx",
      "border-right-Card": "xxx",
    });
  });

  it("border-vertical only", () => {
    const newTheme: Record<string, string> = {
      "border-vertical-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-Card": "xxx",
      "border-top-Card": "xxx",
      "border-vertical-Card": "xxx",
    });
  });

  it("border-top only", () => {
    const newTheme: Record<string, string> = {
      "border-top-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-top-Card": "xxx",
    });
  });

  it("border-right only", () => {
    const newTheme: Record<string, string> = {
      "border-right-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-right-Card": "xxx",
    });
  });

  it("border-bottom only", () => {
    const newTheme: Record<string, string> = {
      "border-bottom-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-Card": "xxx",
    });
  });

  it("border-left only", () => {
    const newTheme: Record<string, string> = {
      "border-left-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-left-Card": "xxx",
    });
  });

  it("thickness-border only", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "thickness-border-Card": "xxx",
      "thickness-border-bottom-Card": "xxx",
      "thickness-border-left-Card": "xxx",
      "thickness-border-right-Card": "xxx",
      "thickness-border-top-Card": "xxx",
    });
  });

  it("thickness-border-horizontal only", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-horizontal-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "thickness-border-horizontal-Card": "xxx",
      "thickness-border-left-Card": "xxx",
      "thickness-border-right-Card": "xxx",
    });
  });

  it("thickness-border-vertical only", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-vertical-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "thickness-border-bottom-Card": "xxx",
      "thickness-border-top-Card": "xxx",
      "thickness-border-vertical-Card": "xxx",
    });
  });

  it("style-border only", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "style-border-Card": "xxx",
      "style-border-bottom-Card": "xxx",
      "style-border-left-Card": "xxx",
      "style-border-right-Card": "xxx",
      "style-border-top-Card": "xxx",
    });
  });

  it("style-border-horizontal only", () => {
    const newTheme: Record<string, string> = {
      "style-border-horizontal-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "style-border-horizontal-Card": "xxx",
      "style-border-left-Card": "xxx",
      "style-border-right-Card": "xxx",
    });
  });

  it("style-border-vertical only", () => {
    const newTheme: Record<string, string> = {
      "style-border-vertical-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "style-border-bottom-Card": "xxx",
      "style-border-top-Card": "xxx",
      "style-border-vertical-Card": "xxx",
    });
  });

  it("color-border only", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "color-border-Card": "xxx",
      "color-border-bottom-Card": "xxx",
      "color-border-left-Card": "xxx",
      "color-border-right-Card": "xxx",
      "color-border-top-Card": "xxx",
    });
  });

  it("color-border-horizontal only", () => {
    const newTheme: Record<string, string> = {
      "color-border-horizontal-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "color-border-horizontal-Card": "xxx",
      "color-border-left-Card": "xxx",
      "color-border-right-Card": "xxx",
    });
  });

  it("color-border-vertical only", () => {
    const newTheme: Record<string, string> = {
      "color-border-vertical-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "color-border-bottom-Card": "xxx",
      "color-border-top-Card": "xxx",
      "color-border-vertical-Card": "xxx",
    });
  });

  it("border: thickness, style, color #1", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid $color-border",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid $color-border",
      "border-bottom-Card": "1px solid $color-border",
      "border-left-Card": "1px solid $color-border",
      "border-right-Card": "1px solid $color-border",
      "border-top-Card": "1px solid $color-border",
      "color-border-Card": "$color-border",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, style, color #2", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid rgb(0,0,0)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid rgb(0,0,0)",
      "border-bottom-Card": "1px solid rgb(0,0,0)",
      "border-left-Card": "1px solid rgb(0,0,0)",
      "border-right-Card": "1px solid rgb(0,0,0)",
      "border-top-Card": "1px solid rgb(0,0,0)",
      "color-border-Card": "rgb(0,0,0)",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, style, color #3", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid #000",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid #000",
      "border-bottom-Card": "1px solid #000",
      "border-left-Card": "1px solid #000",
      "border-right-Card": "1px solid #000",
      "border-top-Card": "1px solid #000",
      "color-border-Card": "#000",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, style, color #4", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid #000000",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid #000000",
      "border-bottom-Card": "1px solid #000000",
      "border-left-Card": "1px solid #000000",
      "border-right-Card": "1px solid #000000",
      "border-top-Card": "1px solid #000000",
      "color-border-Card": "#000000",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, style, color #5", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid hsl(0,0%,0%)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid hsl(0,0%,0%)",
      "border-bottom-Card": "1px solid hsl(0,0%,0%)",
      "border-left-Card": "1px solid hsl(0,0%,0%)",
      "border-right-Card": "1px solid hsl(0,0%,0%)",
      "border-top-Card": "1px solid hsl(0,0%,0%)",
      "color-border-Card": "hsl(0,0%,0%)",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, style, color #6", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid hsl(0,0%,0%)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid hsl(0,0%,0%)",
      "border-bottom-Card": "1px solid hsl(0,0%,0%)",
      "border-left-Card": "1px solid hsl(0,0%,0%)",
      "border-right-Card": "1px solid hsl(0,0%,0%)",
      "border-top-Card": "1px solid hsl(0,0%,0%)",
      "color-border-Card": "hsl(0,0%,0%)",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, style, color #7", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid hsl(0,0%,0%)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid hsl(0,0%,0%)",
      "border-bottom-Card": "1px solid hsl(0,0%,0%)",
      "border-left-Card": "1px solid hsl(0,0%,0%)",
      "border-right-Card": "1px solid hsl(0,0%,0%)",
      "border-top-Card": "1px solid hsl(0,0%,0%)",
      "color-border-Card": "hsl(0,0%,0%)",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, style, color #8", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid hsla(0,0%,0%,0.5)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid hsla(0,0%,0%,0.5)",
      "border-bottom-Card": "1px solid hsla(0,0%,0%,0.5)",
      "border-left-Card": "1px solid hsla(0,0%,0%,0.5)",
      "border-right-Card": "1px solid hsla(0,0%,0%,0.5)",
      "border-top-Card": "1px solid hsla(0,0%,0%,0.5)",
      "color-border-Card": "hsla(0,0%,0%,0.5)",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, style, color #9", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid rgba(0,0,0,0.5)",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid rgba(0,0,0,0.5)",
      "border-bottom-Card": "1px solid rgba(0,0,0,0.5)",
      "border-left-Card": "1px solid rgba(0,0,0,0.5)",
      "border-right-Card": "1px solid rgba(0,0,0,0.5)",
      "border-top-Card": "1px solid rgba(0,0,0,0.5)",
      "color-border-Card": "rgba(0,0,0,0.5)",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, color, style", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px red solid",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px red solid",
      "border-bottom-Card": "1px red solid",
      "border-left-Card": "1px red solid",
      "border-right-Card": "1px red solid",
      "border-top-Card": "1px red solid",
      "color-border-Card": "red",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: style, thickness, color", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "solid 1px red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "solid 1px red",
      "border-bottom-Card": "solid 1px red",
      "border-left-Card": "solid 1px red",
      "border-right-Card": "solid 1px red",
      "border-top-Card": "solid 1px red",
      "color-border-Card": "red",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: style, color, thickness", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "solid red 1px",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "solid red 1px",
      "border-bottom-Card": "solid red 1px",
      "border-left-Card": "solid red 1px",
      "border-right-Card": "solid red 1px",
      "border-top-Card": "solid red 1px",
      "color-border-Card": "red",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: color, thickness, style", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "red 1px solid",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "red 1px solid",
      "border-bottom-Card": "red 1px solid",
      "border-left-Card": "red 1px solid",
      "border-right-Card": "red 1px solid",
      "border-top-Card": "red 1px solid",
      "color-border-Card": "red",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: color, style, thickness", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "red solid 1px",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "red solid 1px",
      "border-bottom-Card": "red solid 1px",
      "border-left-Card": "red solid 1px",
      "border-right-Card": "red solid 1px",
      "border-top-Card": "red solid 1px",
      "color-border-Card": "red",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, color", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px red",
      "border-bottom-Card": "1px red",
      "border-left-Card": "1px red",
      "border-right-Card": "1px red",
      "border-top-Card": "1px red",
      "color-border-Card": "red",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, style", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid",
      "border-bottom-Card": "1px solid",
      "border-left-Card": "1px solid",
      "border-right-Card": "1px solid",
      "border-top-Card": "1px solid",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, color", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px red",
      "border-bottom-Card": "1px red",
      "border-left-Card": "1px red",
      "border-right-Card": "1px red",
      "border-top-Card": "1px red",
      "color-border-Card": "red",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, style, VAR", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid $some-color",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid $some-color",
      "border-bottom-Card": "1px solid $some-color",
      "border-left-Card": "1px solid $some-color",
      "border-right-Card": "1px solid $some-color",
      "border-top-Card": "1px solid $some-color",
      "color-border-Card": "$some-color",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: style, thickness, VAR", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "solid 1px $some-color",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "solid 1px $some-color",
      "border-bottom-Card": "solid 1px $some-color",
      "border-left-Card": "solid 1px $some-color",
      "border-right-Card": "solid 1px $some-color",
      "border-top-Card": "solid 1px $some-color",
      "color-border-Card": "$some-color",
      "style-border-Card": "solid",
      "thickness-border-Card": "1px",
    });
  });

  it("border: thickness, VAR, color", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px $some-style red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px $some-style red",
      "border-bottom-Card": "1px $some-style red",
      "border-left-Card": "1px $some-style red",
      "border-right-Card": "1px $some-style red",
      "border-top-Card": "1px $some-style red",
      "color-border-Card": "red",
      "style-border-Card": "$some-style",
      "thickness-border-Card": "1px",
    });
  });

  it("border: color, VAR, thickness", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "red $some-style 1px",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "red $some-style 1px",
      "border-bottom-Card": "red $some-style 1px",
      "border-left-Card": "red $some-style 1px",
      "border-right-Card": "red $some-style 1px",
      "border-top-Card": "red $some-style 1px",
      "color-border-Card": "red",
      "style-border-Card": "$some-style",
      "thickness-border-Card": "1px",
    });
  });

  it("border: VAR, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "$some-thickness solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "$some-thickness solid red",
      "border-bottom-Card": "$some-thickness solid red",
      "border-left-Card": "$some-thickness solid red",
      "border-right-Card": "$some-thickness solid red",
      "border-top-Card": "$some-thickness solid red",
      "color-border-Card": "red",
      "style-border-Card": "solid",
      "thickness-border-Card": "$some-thickness",
    });
  });

  it("border: VAR, color, style", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "$some-thickness red solid",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "$some-thickness red solid",
      "border-bottom-Card": "$some-thickness red solid",
      "border-left-Card": "$some-thickness red solid",
      "border-right-Card": "$some-thickness red solid",
      "border-top-Card": "$some-thickness red solid",
      "color-border-Card": "red",
      "style-border-Card": "solid",
      "thickness-border-Card": "$some-thickness",
    });
  });

  it("border: thickness, VAR1, VAR2", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px $some-style $some-color",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px $some-style $some-color",
      "border-bottom-Card": "1px $some-style $some-color",
      "border-left-Card": "1px $some-style $some-color",
      "border-right-Card": "1px $some-style $some-color",
      "border-top-Card": "1px $some-style $some-color",
      "color-border-Card": "$some-color",
      "style-border-Card": "$some-style",
      "thickness-border-Card": "1px",
    });
  });

  it("border: VAR1, style, VAR2", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "$some-thickness solid $some-color",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "$some-thickness solid $some-color",
      "border-bottom-Card": "$some-thickness solid $some-color",
      "border-left-Card": "$some-thickness solid $some-color",
      "border-right-Card": "$some-thickness solid $some-color",
      "border-top-Card": "$some-thickness solid $some-color",
      "color-border-Card": "$some-color",
      "style-border-Card": "solid",
      "thickness-border-Card": "$some-thickness",
    });
  });

  it("border: VAR1, VAR2, color", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "$some-thickness $some-style red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "$some-thickness $some-style red",
      "border-bottom-Card": "$some-thickness $some-style red",
      "border-left-Card": "$some-thickness $some-style red",
      "border-right-Card": "$some-thickness $some-style red",
      "border-top-Card": "$some-thickness $some-style red",
      "color-border-Card": "red",
      "style-border-Card": "$some-style",
      "thickness-border-Card": "$some-thickness",
    });
  });

  it("border: VAR1, VAR2, VAR3", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "$some-thickness $some-style $some-color",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "$some-thickness $some-style $some-color",
      "border-bottom-Card": "$some-thickness $some-style $some-color",
      "border-left-Card": "$some-thickness $some-style $some-color",
      "border-right-Card": "$some-thickness $some-style $some-color",
      "border-top-Card": "$some-thickness $some-style $some-color",
      "color-border-Card": "$some-color",
      "style-border-Card": "$some-style",
      "thickness-border-Card": "$some-thickness",
    });
  });

  it("border-Card", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "dotted rgb(255, 0, 0) 5px",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "dotted rgb(255, 0, 0) 5px",
      "border-bottom-Card": "dotted rgb(255, 0, 0) 5px",
      "border-left-Card": "dotted rgb(255, 0, 0) 5px",
      "border-right-Card": "dotted rgb(255, 0, 0) 5px",
      "border-top-Card": "dotted rgb(255, 0, 0) 5px",
      "color-border-Card": "rgb(255, 0, 0)",
      "style-border-Card": "dotted",
      "thickness-border-Card": "5px",
    });
  });

  it("border-left: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-left-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-left-Card": "1px solid red",
      "color-border-left-Card": "red",
      "style-border-left-Card": "solid",
      "thickness-border-left-Card": "1px",
    });
  });

  it("border-right: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-right-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-right-Card": "1px solid red",
      "color-border-right-Card": "red",
      "style-border-right-Card": "solid",
      "thickness-border-right-Card": "1px",
    });
  });

  it("border-horizontal: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-horizontal-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-horizontal-Card": "1px solid red",
      "border-left-Card": "1px solid red",
      "border-right-Card": "1px solid red",
      "color-border-left-Card": "red",
      "color-border-right-Card": "red",
      "style-border-left-Card": "solid",
      "style-border-right-Card": "solid",
      "thickness-border-left-Card": "1px",
      "thickness-border-right-Card": "1px",
    });
  });

  it("border-top: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-top-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-top-Card": "1px solid red",
      "color-border-top-Card": "red",
      "style-border-top-Card": "solid",
      "thickness-border-top-Card": "1px",
    });
  });

  it("border-bottom: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-bottom-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-Card": "1px solid red",
      "color-border-bottom-Card": "red",
      "style-border-bottom-Card": "solid",
      "thickness-border-bottom-Card": "1px",
    });
  });

  it("border-vertical: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "border-vertical-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-Card": "1px solid red",
      "border-top-Card": "1px solid red",
      "border-vertical-Card": "1px solid red",
      "color-border-bottom-Card": "red",
      "color-border-top-Card": "red",
      "style-border-bottom-Card": "solid",
      "style-border-top-Card": "solid",
      "thickness-border-bottom-Card": "1px",
      "thickness-border-top-Card": "1px",
    });
  });

  it("border-left: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "border-left-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-left-Card": "1px solid red",
      "color-border-left-Card": "red",
      "style-border-Card": "dotted",
      "style-border-bottom-Card": "dotted",
      "style-border-left-Card": "solid",
      "style-border-right-Card": "dotted",
      "style-border-top-Card": "dotted",
      "thickness-border-left-Card": "1px",
    });
  });

  it("border-left: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "border-left-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-left-Card": "1px solid red",
      "color-border-left-Card": "red",
      "style-border-left-Card": "solid",
      "thickness-border-Card": "2px",
      "thickness-border-bottom-Card": "2px",
      "thickness-border-left-Card": "1px",
      "thickness-border-right-Card": "2px",
      "thickness-border-top-Card": "2px",
    });
  });

  it("border-left: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "border-left-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-left-Card": "1px solid red",
      "color-border-Card": "blue",
      "color-border-bottom-Card": "blue",
      "color-border-left-Card": "red",
      "color-border-right-Card": "blue",
      "color-border-top-Card": "blue",
      "style-border-left-Card": "solid",
      "thickness-border-left-Card": "1px",
    });
  });

  it("border-right: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "border-right-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-right-Card": "1px solid red",
      "color-border-right-Card": "red",
      "style-border-Card": "dotted",
      "style-border-bottom-Card": "dotted",
      "style-border-left-Card": "dotted",
      "style-border-right-Card": "solid",
      "style-border-top-Card": "dotted",
      "thickness-border-right-Card": "1px",
    });
  });

  it("border-right: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "border-right-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-right-Card": "1px solid red",
      "color-border-right-Card": "red",
      "style-border-right-Card": "solid",
      "thickness-border-Card": "2px",
      "thickness-border-bottom-Card": "2px",
      "thickness-border-left-Card": "2px",
      "thickness-border-right-Card": "1px",
      "thickness-border-top-Card": "2px",
    });
  });

  it("border-right: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "border-right-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-right-Card": "1px solid red",
      "color-border-Card": "blue",
      "color-border-bottom-Card": "blue",
      "color-border-left-Card": "blue",
      "color-border-right-Card": "red",
      "color-border-top-Card": "blue",
      "style-border-right-Card": "solid",
      "thickness-border-right-Card": "1px",
    });
  });

  it("border-horizontal: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "border-horizontal-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-horizontal-Card": "1px solid red",
      "border-left-Card": "1px solid red",
      "border-right-Card": "1px solid red",
      "color-border-left-Card": "red",
      "color-border-right-Card": "red",
      "style-border-Card": "dotted",
      "style-border-bottom-Card": "dotted",
      "style-border-left-Card": "solid",
      "style-border-right-Card": "solid",
      "style-border-top-Card": "dotted",
      "thickness-border-left-Card": "1px",
      "thickness-border-right-Card": "1px",
    });
  });

  it("border-horizontal: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "border-horizontal-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-horizontal-Card": "1px solid red",
      "border-left-Card": "1px solid red",
      "border-right-Card": "1px solid red",
      "color-border-left-Card": "red",
      "color-border-right-Card": "red",
      "style-border-left-Card": "solid",
      "style-border-right-Card": "solid",
      "thickness-border-Card": "2px",
      "thickness-border-bottom-Card": "2px",
      "thickness-border-left-Card": "1px",
      "thickness-border-right-Card": "1px",
      "thickness-border-top-Card": "2px",
    });
  });

  it("border-horizontal: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "border-horizontal-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-horizontal-Card": "1px solid red",
      "border-left-Card": "1px solid red",
      "border-right-Card": "1px solid red",
      "color-border-Card": "blue",
      "color-border-bottom-Card": "blue",
      "color-border-left-Card": "red",
      "color-border-right-Card": "red",
      "color-border-top-Card": "blue",
      "style-border-left-Card": "solid",
      "style-border-right-Card": "solid",
      "thickness-border-left-Card": "1px",
      "thickness-border-right-Card": "1px",
    });
  });

  it("border-top: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "border-top-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-top-Card": "1px solid red",
      "color-border-top-Card": "red",
      "style-border-Card": "dotted",
      "style-border-bottom-Card": "dotted",
      "style-border-left-Card": "dotted",
      "style-border-right-Card": "dotted",
      "style-border-top-Card": "solid",
      "thickness-border-top-Card": "1px",
    });
  });

  it("border-top: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "border-top-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-top-Card": "1px solid red",
      "color-border-top-Card": "red",
      "style-border-top-Card": "solid",
      "thickness-border-Card": "2px",
      "thickness-border-bottom-Card": "2px",
      "thickness-border-left-Card": "2px",
      "thickness-border-right-Card": "2px",
      "thickness-border-top-Card": "1px",
    });
  });

  it("border-top: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "border-top-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-top-Card": "1px solid red",
      "color-border-Card": "blue",
      "color-border-bottom-Card": "blue",
      "color-border-left-Card": "blue",
      "color-border-right-Card": "blue",
      "color-border-top-Card": "red",
      "style-border-top-Card": "solid",
      "thickness-border-top-Card": "1px",
    });
  });

  it("border-bottom: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "border-bottom-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-Card": "1px solid red",
      "color-border-bottom-Card": "red",
      "style-border-Card": "dotted",
      "style-border-bottom-Card": "solid",
      "style-border-left-Card": "dotted",
      "style-border-right-Card": "dotted",
      "style-border-top-Card": "dotted",
      "thickness-border-bottom-Card": "1px",
    });
  });

  it("border-bottom: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "border-bottom-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-Card": "1px solid red",
      "color-border-bottom-Card": "red",
      "style-border-bottom-Card": "solid",
      "thickness-border-Card": "2px",
      "thickness-border-bottom-Card": "1px",
      "thickness-border-left-Card": "2px",
      "thickness-border-right-Card": "2px",
      "thickness-border-top-Card": "2px",
    });
  });

  it("border-bottom: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "border-bottom-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-Card": "1px solid red",
      "color-border-Card": "blue",
      "color-border-bottom-Card": "red",
      "color-border-left-Card": "blue",
      "color-border-right-Card": "blue",
      "color-border-top-Card": "blue",
      "style-border-bottom-Card": "solid",
      "thickness-border-bottom-Card": "1px",
    });
  });

  it("border-vertical: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "border-vertical-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-Card": "1px solid red",
      "border-top-Card": "1px solid red",
      "border-vertical-Card": "1px solid red",
      "color-border-bottom-Card": "red",
      "color-border-top-Card": "red",
      "style-border-Card": "dotted",
      "style-border-bottom-Card": "solid",
      "style-border-left-Card": "dotted",
      "style-border-right-Card": "dotted",
      "style-border-top-Card": "solid",
      "thickness-border-bottom-Card": "1px",
      "thickness-border-top-Card": "1px",
    });
  });

  it("border-vertical: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "border-vertical-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-Card": "1px solid red",
      "border-top-Card": "1px solid red",
      "border-vertical-Card": "1px solid red",
      "color-border-bottom-Card": "red",
      "color-border-top-Card": "red",
      "style-border-bottom-Card": "solid",
      "style-border-top-Card": "solid",
      "thickness-border-Card": "2px",
      "thickness-border-bottom-Card": "1px",
      "thickness-border-left-Card": "2px",
      "thickness-border-right-Card": "2px",
      "thickness-border-top-Card": "1px",
    });
  });

  it("border-vertical: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "border-vertical-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-bottom-Card": "1px solid red",
      "border-top-Card": "1px solid red",
      "border-vertical-Card": "1px solid red",
      "color-border-Card": "blue",
      "color-border-bottom-Card": "red",
      "color-border-left-Card": "blue",
      "color-border-right-Card": "blue",
      "color-border-top-Card": "red",
      "style-border-bottom-Card": "solid",
      "style-border-top-Card": "solid",
      "thickness-border-bottom-Card": "1px",
      "thickness-border-top-Card": "1px",
    });
  });
});
