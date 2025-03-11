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
      "borderLeft-Card": "xxx",
      "borderRight-Card": "xxx",
    });
  });

  it("borderVertical only", () => {
    const newTheme: Record<string, string> = {
      "borderVertical-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottom-Card": "xxx",
      "borderTop-Card": "xxx",
      "borderVertical-Card": "xxx",
    });
  });

  it("borderTop only", () => {
    const newTheme: Record<string, string> = {
      "borderTop-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderTop-Card": "xxx",
    });
  });

  it("borderRight only", () => {
    const newTheme: Record<string, string> = {
      "borderRight-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderRight-Card": "xxx",
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

  it("borderLeft only", () => {
    const newTheme: Record<string, string> = {
      "borderLeft-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderLeft-Card": "xxx",
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
      "borderLeftWidth-Card": "xxx",
      "borderRightWidth-Card": "xxx",
      "borderTopWidth-Card": "xxx",
    });
  });

  it("borderHorizontalWidth only", () => {
    const newTheme: Record<string, string> = {
      "borderHorizontalWidth-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontalWidth-Card": "xxx",
      "borderLeftWidth-Card": "xxx",
      "borderRightWidth-Card": "xxx",
    });
  });

  it("borderVerticalWidth only", () => {
    const newTheme: Record<string, string> = {
      "borderVerticalWidth-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottomWidth-Card": "xxx",
      "borderTopWidth-Card": "xxx",
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
      "borderLeftStyle-Card": "xxx",
      "borderRightStyle-Card": "xxx",
      "borderTopStyle-Card": "xxx",
    });
  });

  it("borderHorizontalStyle only", () => {
    const newTheme: Record<string, string> = {
      "borderHorizontalStyle-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontalStyle-Card": "xxx",
      "borderLeftStyle-Card": "xxx",
      "borderRightStyle-Card": "xxx",
    });
  });

  it("borderVerticalStyle only", () => {
    const newTheme: Record<string, string> = {
      "borderVerticalStyle-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottomStyle-Card": "xxx",
      "borderTopStyle-Card": "xxx",
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
      "borderLeftColor-Card": "xxx",
      "borderRightColor-Card": "xxx",
      "borderTopColor-Card": "xxx",
    });
  });

  it("borderHorizontalColor only", () => {
    const newTheme: Record<string, string> = {
      "borderHorizontalColor-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontalColor-Card": "xxx",
      "borderLeftColor-Card": "xxx",
      "borderRightColor-Card": "xxx",
    });
  });

  it("borderVerticalColor only", () => {
    const newTheme: Record<string, string> = {
      "borderVerticalColor-Card": "xxx",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderBottomColor-Card": "xxx",
      "borderTopColor-Card": "xxx",
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
      "borderLeft-Card": "1px solid $color-border",
      "borderRight-Card": "1px solid $color-border",
      "borderTop-Card": "1px solid $color-border",
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
      "borderLeft-Card": "1px solid rgb(0,0,0)",
      "borderRight-Card": "1px solid rgb(0,0,0)",
      "borderTop-Card": "1px solid rgb(0,0,0)",
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
      "borderLeft-Card": "1px solid #000",
      "borderRight-Card": "1px solid #000",
      "borderTop-Card": "1px solid #000",
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
      "borderLeft-Card": "1px solid #000000",
      "borderRight-Card": "1px solid #000000",
      "borderTop-Card": "1px solid #000000",
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
      "borderLeft-Card": "1px solid hsl(0,0%,0%)",
      "borderRight-Card": "1px solid hsl(0,0%,0%)",
      "borderTop-Card": "1px solid hsl(0,0%,0%)",
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
      "borderLeft-Card": "1px solid hsl(0,0%,0%)",
      "borderRight-Card": "1px solid hsl(0,0%,0%)",
      "borderTop-Card": "1px solid hsl(0,0%,0%)",
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
      "borderLeft-Card": "1px solid hsl(0,0%,0%)",
      "borderRight-Card": "1px solid hsl(0,0%,0%)",
      "borderTop-Card": "1px solid hsl(0,0%,0%)",
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
      "borderLeft-Card": "1px solid hsla(0,0%,0%,0.5)",
      "borderRight-Card": "1px solid hsla(0,0%,0%,0.5)",
      "borderTop-Card": "1px solid hsla(0,0%,0%,0.5)",
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
      "borderLeft-Card": "1px solid rgba(0,0,0,0.5)",
      "borderRight-Card": "1px solid rgba(0,0,0,0.5)",
      "borderTop-Card": "1px solid rgba(0,0,0,0.5)",
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
      "borderLeft-Card": "1px red solid",
      "borderRight-Card": "1px red solid",
      "borderTop-Card": "1px red solid",
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
      "borderLeft-Card": "solid 1px red",
      "borderRight-Card": "solid 1px red",
      "borderTop-Card": "solid 1px red",
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
      "borderLeft-Card": "solid red 1px",
      "borderRight-Card": "solid red 1px",
      "borderTop-Card": "solid red 1px",
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
      "borderLeft-Card": "red 1px solid",
      "borderRight-Card": "red 1px solid",
      "borderTop-Card": "red 1px solid",
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
      "borderLeft-Card": "red solid 1px",
      "borderRight-Card": "red solid 1px",
      "borderTop-Card": "red solid 1px",
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
      "borderLeft-Card": "1px red",
      "borderRight-Card": "1px red",
      "borderTop-Card": "1px red",
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
      "borderLeft-Card": "1px solid",
      "borderRight-Card": "1px solid",
      "borderTop-Card": "1px solid",
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
      "borderLeft-Card": "1px red",
      "borderRight-Card": "1px red",
      "borderTop-Card": "1px red",
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
      "borderLeft-Card": "1px solid $some-color",
      "borderRight-Card": "1px solid $some-color",
      "borderTop-Card": "1px solid $some-color",
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
      "borderLeft-Card": "solid 1px $some-color",
      "borderRight-Card": "solid 1px $some-color",
      "borderTop-Card": "solid 1px $some-color",
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
      "borderLeft-Card": "1px $some-style red",
      "borderRight-Card": "1px $some-style red",
      "borderTop-Card": "1px $some-style red",
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
      "borderLeft-Card": "red $some-style 1px",
      "borderRight-Card": "red $some-style 1px",
      "borderTop-Card": "red $some-style 1px",
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
      "borderLeft-Card": "$some-thickness solid red",
      "borderRight-Card": "$some-thickness solid red",
      "borderTop-Card": "$some-thickness solid red",
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
      "borderLeft-Card": "$some-thickness red solid",
      "borderRight-Card": "$some-thickness red solid",
      "borderTop-Card": "$some-thickness red solid",
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
      "borderLeft-Card": "1px $some-style $some-color",
      "borderRight-Card": "1px $some-style $some-color",
      "borderTop-Card": "1px $some-style $some-color",
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
      "borderLeft-Card": "$some-thickness solid $some-color",
      "borderRight-Card": "$some-thickness solid $some-color",
      "borderTop-Card": "$some-thickness solid $some-color",
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
      "borderLeft-Card": "$some-thickness $some-style red",
      "borderRight-Card": "$some-thickness $some-style red",
      "borderTop-Card": "$some-thickness $some-style red",
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
      "borderLeft-Card": "$some-thickness $some-style $some-color",
      "borderRight-Card": "$some-thickness $some-style $some-color",
      "borderTop-Card": "$some-thickness $some-style $some-color",
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
      "borderLeft-Card": "dotted rgb(255, 0, 0) 5px",
      "borderRight-Card": "dotted rgb(255, 0, 0) 5px",
      "borderTop-Card": "dotted rgb(255, 0, 0) 5px",
      "color-border-Card": "rgb(255, 0, 0)",
      "style-border-Card": "dotted",
      "thickness-border-Card": "5px",
    });
  });

  it("borderLeft: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "borderLeft-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderLeft-Card": "1px solid red",
      "borderLeftColor-Card": "red",
      "borderLeftStyle-Card": "solid",
      "borderLeftWidth-Card": "1px",
    });
  });

  it("borderRight: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "borderRight-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderRight-Card": "1px solid red",
      "borderRightColor-Card": "red",
      "borderRightStyle-Card": "solid",
      "borderRightWidth-Card": "1px",
    });
  });

  it("borderHorizontal: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "borderHorizontal-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderHorizontal-Card": "1px solid red",
      "borderLeft-Card": "1px solid red",
      "borderRight-Card": "1px solid red",
      "borderLeftColor-Card": "red",
      "borderRightColor-Card": "red",
      "borderLeftStyle-Card": "solid",
      "borderRightStyle-Card": "solid",
      "borderLeftWidth-Card": "1px",
      "borderRightWidth-Card": "1px",
    });
  });

  it("borderTop: thickness, style, color", () => {
    const newTheme: Record<string, string> = {
      "borderTop-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderTop-Card": "1px solid red",
      "borderTopColor-Card": "red",
      "borderTopStyle-Card": "solid",
      "borderTopWidth-Card": "1px",
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
      "borderTop-Card": "1px solid red",
      "borderVertical-Card": "1px solid red",
      "borderBottomColor-Card": "red",
      "borderTopColor-Card": "red",
      "borderBottomStyle-Card": "solid",
      "borderTopStyle-Card": "solid",
      "borderBottomWidth-Card": "1px",
      "borderTopWidth-Card": "1px",
    });
  });

  it("borderLeft: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "borderLeft-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderLeft-Card": "1px solid red",
      "borderLeftColor-Card": "red",
      "style-border-Card": "dotted",
      "borderBottomStyle-Card": "dotted",
      "borderLeftStyle-Card": "solid",
      "borderRightStyle-Card": "dotted",
      "borderTopStyle-Card": "dotted",
      "borderLeftWidth-Card": "1px",
    });
  });

  it("borderLeft: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "borderLeft-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderLeft-Card": "1px solid red",
      "borderLeftColor-Card": "red",
      "borderLeftStyle-Card": "solid",
      "thickness-border-Card": "2px",
      "borderBottomWidth-Card": "2px",
      "borderLeftWidth-Card": "1px",
      "borderRightWidth-Card": "2px",
      "borderTopWidth-Card": "2px",
    });
  });

  it("borderLeft: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "borderLeft-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderLeft-Card": "1px solid red",
      "color-border-Card": "blue",
      "borderBottomColor-Card": "blue",
      "borderLeftColor-Card": "red",
      "borderRightColor-Card": "blue",
      "borderTopColor-Card": "blue",
      "borderLeftStyle-Card": "solid",
      "borderLeftWidth-Card": "1px",
    });
  });

  it("borderRight: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "borderRight-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderRight-Card": "1px solid red",
      "borderRightColor-Card": "red",
      "style-border-Card": "dotted",
      "borderBottomStyle-Card": "dotted",
      "borderLeftStyle-Card": "dotted",
      "borderRightStyle-Card": "solid",
      "borderTopStyle-Card": "dotted",
      "borderRightWidth-Card": "1px",
    });
  });

  it("borderRight: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "borderRight-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderRight-Card": "1px solid red",
      "borderRightColor-Card": "red",
      "borderRightStyle-Card": "solid",
      "thickness-border-Card": "2px",
      "borderBottomWidth-Card": "2px",
      "borderLeftWidth-Card": "2px",
      "borderRightWidth-Card": "1px",
      "borderTopWidth-Card": "2px",
    });
  });

  it("borderRight: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "borderRight-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderRight-Card": "1px solid red",
      "color-border-Card": "blue",
      "borderBottomColor-Card": "blue",
      "borderLeftColor-Card": "blue",
      "borderRightColor-Card": "red",
      "borderTopColor-Card": "blue",
      "borderRightStyle-Card": "solid",
      "borderRightWidth-Card": "1px",
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
      "borderLeft-Card": "1px solid red",
      "borderRight-Card": "1px solid red",
      "borderLeftColor-Card": "red",
      "borderRightColor-Card": "red",
      "style-border-Card": "dotted",
      "borderBottomStyle-Card": "dotted",
      "borderLeftStyle-Card": "solid",
      "borderRightStyle-Card": "solid",
      "borderTopStyle-Card": "dotted",
      "borderLeftWidth-Card": "1px",
      "borderRightWidth-Card": "1px",
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
      "borderLeft-Card": "1px solid red",
      "borderRight-Card": "1px solid red",
      "borderLeftColor-Card": "red",
      "borderRightColor-Card": "red",
      "borderLeftStyle-Card": "solid",
      "borderRightStyle-Card": "solid",
      "thickness-border-Card": "2px",
      "borderBottomWidth-Card": "2px",
      "borderLeftWidth-Card": "1px",
      "borderRightWidth-Card": "1px",
      "borderTopWidth-Card": "2px",
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
      "borderLeft-Card": "1px solid red",
      "borderRight-Card": "1px solid red",
      "color-border-Card": "blue",
      "borderBottomColor-Card": "blue",
      "borderLeftColor-Card": "red",
      "borderRightColor-Card": "red",
      "borderTopColor-Card": "blue",
      "borderLeftStyle-Card": "solid",
      "borderRightStyle-Card": "solid",
      "borderLeftWidth-Card": "1px",
      "borderRightWidth-Card": "1px",
    });
  });

  it("borderTop: style override", () => {
    const newTheme: Record<string, string> = {
      "style-border-Card": "dotted",
      "borderTop-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderTop-Card": "1px solid red",
      "borderTopColor-Card": "red",
      "style-border-Card": "dotted",
      "borderBottomStyle-Card": "dotted",
      "borderLeftStyle-Card": "dotted",
      "borderRightStyle-Card": "dotted",
      "borderTopStyle-Card": "solid",
      "borderTopWidth-Card": "1px",
    });
  });

  it("borderTop: thickness override", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-Card": "2px",
      "borderTop-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderTop-Card": "1px solid red",
      "borderTopColor-Card": "red",
      "borderTopStyle-Card": "solid",
      "thickness-border-Card": "2px",
      "borderBottomWidth-Card": "2px",
      "borderLeftWidth-Card": "2px",
      "borderRightWidth-Card": "2px",
      "borderTopWidth-Card": "1px",
    });
  });

  it("borderTop: color override", () => {
    const newTheme: Record<string, string> = {
      "color-border-Card": "blue",
      "borderTop-Card": "1px solid red",
    };

    const result = generateBorderSegments(newTheme);

    expect(result).deep.equal({
      "borderTop-Card": "1px solid red",
      "color-border-Card": "blue",
      "borderBottomColor-Card": "blue",
      "borderLeftColor-Card": "blue",
      "borderRightColor-Card": "blue",
      "borderTopColor-Card": "red",
      "borderTopStyle-Card": "solid",
      "borderTopWidth-Card": "1px",
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
      "borderLeftStyle-Card": "dotted",
      "borderRightStyle-Card": "dotted",
      "borderTopStyle-Card": "dotted",
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
      "borderLeftWidth-Card": "2px",
      "borderRightWidth-Card": "2px",
      "borderTopWidth-Card": "2px",
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
      "borderLeftColor-Card": "blue",
      "borderRightColor-Card": "blue",
      "borderTopColor-Card": "blue",
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
      "borderTop-Card": "1px solid red",
      "borderVertical-Card": "1px solid red",
      "borderBottomColor-Card": "red",
      "borderTopColor-Card": "red",
      "style-border-Card": "dotted",
      "borderBottomStyle-Card": "solid",
      "borderLeftStyle-Card": "dotted",
      "borderRightStyle-Card": "dotted",
      "borderTopStyle-Card": "solid",
      "borderBottomWidth-Card": "1px",
      "borderTopWidth-Card": "1px",
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
      "borderTop-Card": "1px solid red",
      "borderVertical-Card": "1px solid red",
      "borderBottomColor-Card": "red",
      "borderTopColor-Card": "red",
      "borderBottomStyle-Card": "solid",
      "borderTopStyle-Card": "solid",
      "thickness-border-Card": "2px",
      "borderBottomWidth-Card": "1px",
      "borderLeftWidth-Card": "2px",
      "borderRightWidth-Card": "2px",
      "borderTopWidth-Card": "1px",
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
      "borderTop-Card": "1px solid red",
      "borderVertical-Card": "1px solid red",
      "color-border-Card": "blue",
      "borderBottomColor-Card": "red",
      "borderLeftColor-Card": "blue",
      "borderRightColor-Card": "blue",
      "borderTopColor-Card": "red",
      "borderBottomStyle-Card": "solid",
      "borderTopStyle-Card": "solid",
      "borderBottomWidth-Card": "1px",
      "borderTopWidth-Card": "1px",
    });
  });
});
