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

  it("borderHorizontal only", () => {
    const newTheme: Record<string, string> = {
      "borderHorizontal-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontal-Card": "xxx",
      "border-left-Card": "xxx",
      "border-right-Card": "xxx",
    });
  });

  it("borderVertical only", () => {
    const newTheme: Record<string, string> = {
      "borderVertical-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "xxx",
      "border-top-Card": "xxx",
      "borderVertical-Card": "xxx",
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

  it("borderBottom only", () => {
    const newTheme: Record<string, string> = {
      "borderBottom-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "xxx",
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
      "borderBottomWidth-Card": "xxx",
      "thickness-border-left-Card": "xxx",
      "thickness-border-right-Card": "xxx",
      "thickness-border-top-Card": "xxx",
    });
  });

  it("borderHorizontalWidth only", () => {
    const newTheme: Record<string, string> = {
      "borderHorizontalWidth-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontalWidth-Card": "xxx",
      "thickness-border-left-Card": "xxx",
      "thickness-border-right-Card": "xxx",
    });
  });

  it("borderVerticalWidth only", () => {
    const newTheme: Record<string, string> = {
      "borderVerticalWidth-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottomWidth-Card": "xxx",
      "thickness-border-top-Card": "xxx",
      "borderVerticalWidth-Card": "xxx",
    });
  });

  it("style-border only", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "style-border-Card": "xxx",
      "borderBottomStyle-Card": "xxx",
      "style-border-left-Card": "xxx",
      "style-border-right-Card": "xxx",
      "style-border-top-Card": "xxx",
    });
  });

  it("borderHorizontalStyle only", () => {
    const newTheme: Record<string, string> = {
      "borderHorizontalStyle-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontalStyle-Card": "xxx",
      "style-border-left-Card": "xxx",
      "style-border-right-Card": "xxx",
    });
  });

  it("borderVerticalStyle only", () => {
    const newTheme: Record<string, string> = {
      "borderVerticalStyle-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottomStyle-Card": "xxx",
      "style-border-top-Card": "xxx",
      "borderVerticalStyle-Card": "xxx",
    });
  });

  it("color-border only", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "color-border-Card": "xxx",
      "borderBottomColor-Card": "xxx",
      "color-border-left-Card": "xxx",
      "color-border-right-Card": "xxx",
      "color-border-top-Card": "xxx",
    });
  });

  it("borderHorizontalColor only", () => {
    const newTheme: Record<string, string> = {
      "borderHorizontalColor-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontalColor-Card": "xxx",
      "color-border-left-Card": "xxx",
      "color-border-right-Card": "xxx",
    });
  });

  it("borderVerticalColor only", () => {
    const newTheme: Record<string, string> = {
      "borderVerticalColor-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottomColor-Card": "xxx",
      "color-border-top-Card": "xxx",
      "borderVerticalColor-Card": "xxx",
    });
  });

  it("border: thickness, style, color #1", () => {
    const newTheme: Record<string, string> = {
      "border-Card": "1px solid $color-border",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "border-Card": "1px solid $color-border",
      "borderBottom-Card": "1px solid $color-border",
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
      "borderBottom-Card": "1px solid rgb(0,0,0)",
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
      "borderBottom-Card": "1px solid #000",
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
      "borderBottom-Card": "1px solid #000000",
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
      "borderBottom-Card": "1px solid hsl(0,0%,0%)",
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
      "borderBottom-Card": "1px solid hsl(0,0%,0%)",
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
      "borderBottom-Card": "1px solid hsl(0,0%,0%)",
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
      "borderBottom-Card": "1px solid hsla(0,0%,0%,0.5)",
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
      "borderBottom-Card": "1px solid rgba(0,0,0,0.5)",
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
      "borderBottom-Card": "1px red solid",
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
      "borderBottom-Card": "solid 1px red",
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
      "borderBottom-Card": "solid red 1px",
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
      "borderBottom-Card": "red 1px solid",
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
      "borderBottom-Card": "red solid 1px",
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
      "borderBottom-Card": "1px red",
      "border-left-Card": "1px red",
      "border-right-Card": "1px red",
      "border-top-Card": "1px red",
      "color-border-Card": "red",
      "style-border-Card": undefined,
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
      "borderBottom-Card": "1px solid",
      "border-left-Card": "1px solid",
      "border-right-Card": "1px solid",
      "border-top-Card": "1px solid",
      "color-border-Card": undefined,
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
      "borderBottom-Card": "1px red",
      "border-left-Card": "1px red",
      "border-right-Card": "1px red",
      "border-top-Card": "1px red",
      "color-border-Card": "red",
      "style-border-Card": undefined,
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
      "borderBottom-Card": "1px solid $some-color",
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
      "borderBottom-Card": "solid 1px $some-color",
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
      "borderBottom-Card": "1px $some-style red",
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
      "borderBottom-Card": "red $some-style 1px",
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
      "borderBottom-Card": "$some-thickness solid red",
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
      "borderBottom-Card": "$some-thickness red solid",
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
      "borderBottom-Card": "1px $some-style $some-color",
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
      "borderBottom-Card": "$some-thickness solid $some-color",
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
      "borderBottom-Card": "$some-thickness $some-style red",
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
      "borderBottom-Card": "$some-thickness $some-style $some-color",
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
      "borderBottom-Card": "dotted rgb(255, 0, 0) 5px",
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

  it("borderHorizontal: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "borderHorizontal-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontal-Card": "1px solid red",
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

  it("borderBottom: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "borderBottom-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "1px solid red",
      "borderBottomColor-Card": "red",
      "borderBottomStyle-Card": "solid",
      "borderBottomWidth-Card": "1px",
    });
  });

  it("borderVertical: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "borderVertical-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "1px solid red",
      "border-top-Card": "1px solid red",
      "borderVertical-Card": "1px solid red",
      "borderBottomColor-Card": "red",
      "color-border-top-Card": "red",
      "borderBottomStyle-Card": "solid",
      "style-border-top-Card": "solid",
      "borderBottomWidth-Card": "1px",
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
      "borderBottomStyle-Card": "dotted",
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
      "borderBottomWidth-Card": "2px",
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
      "borderBottomColor-Card": "blue",
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
      "borderBottomStyle-Card": "dotted",
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
      "borderBottomWidth-Card": "2px",
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
      "borderBottomColor-Card": "blue",
      "color-border-left-Card": "blue",
      "color-border-right-Card": "red",
      "color-border-top-Card": "blue",
      "style-border-right-Card": "solid",
      "thickness-border-right-Card": "1px",
    });
  });

  it("borderHorizontal: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "borderHorizontal-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontal-Card": "1px solid red",
      "border-left-Card": "1px solid red",
      "border-right-Card": "1px solid red",
      "color-border-left-Card": "red",
      "color-border-right-Card": "red",
      "style-border-Card": "dotted",
      "borderBottomStyle-Card": "dotted",
      "style-border-left-Card": "solid",
      "style-border-right-Card": "solid",
      "style-border-top-Card": "dotted",
      "thickness-border-left-Card": "1px",
      "thickness-border-right-Card": "1px",
    });
  });

  it("borderHorizontal: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "borderHorizontal-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontal-Card": "1px solid red",
      "border-left-Card": "1px solid red",
      "border-right-Card": "1px solid red",
      "color-border-left-Card": "red",
      "color-border-right-Card": "red",
      "style-border-left-Card": "solid",
      "style-border-right-Card": "solid",
      "thickness-border-Card": "2px",
      "borderBottomWidth-Card": "2px",
      "thickness-border-left-Card": "1px",
      "thickness-border-right-Card": "1px",
      "thickness-border-top-Card": "2px",
    });
  });

  it("borderHorizontal: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "borderHorizontal-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontal-Card": "1px solid red",
      "border-left-Card": "1px solid red",
      "border-right-Card": "1px solid red",
      "color-border-Card": "blue",
      "borderBottomColor-Card": "blue",
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
      "borderBottomStyle-Card": "dotted",
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
      "borderBottomWidth-Card": "2px",
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
      "borderBottomColor-Card": "blue",
      "color-border-left-Card": "blue",
      "color-border-right-Card": "blue",
      "color-border-top-Card": "red",
      "style-border-top-Card": "solid",
      "thickness-border-top-Card": "1px",
    });
  });

  it("borderBottom: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "borderBottom-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "1px solid red",
      "borderBottomColor-Card": "red",
      "style-border-Card": "dotted",
      "borderBottomStyle-Card": "solid",
      "style-border-left-Card": "dotted",
      "style-border-right-Card": "dotted",
      "style-border-top-Card": "dotted",
      "borderBottomWidth-Card": "1px",
    });
  });

  it("borderBottom: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "borderBottom-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "1px solid red",
      "borderBottomColor-Card": "red",
      "borderBottomStyle-Card": "solid",
      "thickness-border-Card": "2px",
      "borderBottomWidth-Card": "1px",
      "thickness-border-left-Card": "2px",
      "thickness-border-right-Card": "2px",
      "thickness-border-top-Card": "2px",
    });
  });

  it("borderBottom: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "borderBottom-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "1px solid red",
      "color-border-Card": "blue",
      "borderBottomColor-Card": "red",
      "color-border-left-Card": "blue",
      "color-border-right-Card": "blue",
      "color-border-top-Card": "blue",
      "borderBottomStyle-Card": "solid",
      "borderBottomWidth-Card": "1px",
    });
  });

  it("borderVertical: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "borderVertical-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "1px solid red",
      "border-top-Card": "1px solid red",
      "borderVertical-Card": "1px solid red",
      "borderBottomColor-Card": "red",
      "color-border-top-Card": "red",
      "style-border-Card": "dotted",
      "borderBottomStyle-Card": "solid",
      "style-border-left-Card": "dotted",
      "style-border-right-Card": "dotted",
      "style-border-top-Card": "solid",
      "borderBottomWidth-Card": "1px",
      "thickness-border-top-Card": "1px",
    });
  });

  it("borderVertical: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "borderVertical-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "1px solid red",
      "border-top-Card": "1px solid red",
      "borderVertical-Card": "1px solid red",
      "borderBottomColor-Card": "red",
      "color-border-top-Card": "red",
      "borderBottomStyle-Card": "solid",
      "style-border-top-Card": "solid",
      "thickness-border-Card": "2px",
      "borderBottomWidth-Card": "1px",
      "thickness-border-left-Card": "2px",
      "thickness-border-right-Card": "2px",
      "thickness-border-top-Card": "1px",
    });
  });

  it("borderVertical: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "borderVertical-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "1px solid red",
      "border-top-Card": "1px solid red",
      "borderVertical-Card": "1px solid red",
      "color-border-Card": "blue",
      "borderBottomColor-Card": "red",
      "color-border-left-Card": "blue",
      "color-border-right-Card": "blue",
      "color-border-top-Card": "red",
      "borderBottomStyle-Card": "solid",
      "style-border-top-Card": "solid",
      "borderBottomWidth-Card": "1px",
      "thickness-border-top-Card": "1px",
    });
  });
});
