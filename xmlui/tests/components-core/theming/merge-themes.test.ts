import { describe, expect, it } from "vitest";
import { expandTheme } from "../../../src/components-core/theming/extendThemeUtils";

describe("expandTheme", () => {
  it("expandTheme removes color-border", () => {
    const newTheme: Record<string, string> = {
      "color-border-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);
    
    expect(result).deep.equal({
      "color-border-AppHeader": "xxx",
      "color-border-horizontal-AppHeader": "xxx",
      "color-border-vertical-AppHeader": "xxx",
      "color-border-top-AppHeader": "xxx",
      "color-border-right-AppHeader": "xxx",
      "color-border-bottom-AppHeader": "xxx",
      "color-border-left-AppHeader": "xxx"
    });
  });

  it("expandTheme removes color-border-horizontal", () => {
    const newTheme: Record<string, string> = {
      "color-border-horizontal-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "color-border-horizontal-AppHeader": "xxx",
      "color-border-left-AppHeader": "xxx",
      "color-border-right-AppHeader": "xxx"
    });
  });

  it("expandTheme removes color-border-vertical", () => {
    const newTheme: Record<string, string> = {
      "color-border-vertical-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "color-border-vertical-AppHeader": "xxx",
      "color-border-top-AppHeader": "xxx",
      "color-border-bottom-AppHeader": "xxx"
    });
  });

  it("expandTheme removes thickness-border", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "thickness-border-AppHeader": "xxx",
      "thickness-border-horizontal-AppHeader": "xxx",
      "thickness-border-vertical-AppHeader": "xxx",
      "thickness-border-top-AppHeader": "xxx",
      "thickness-border-right-AppHeader": "xxx",
      "thickness-border-bottom-AppHeader": "xxx",
      "thickness-border-left-AppHeader": "xxx"
    });
  });

  it("expandTheme removes thickness-border-horizontal", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-horizontal-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "thickness-border-horizontal-AppHeader": "xxx",
      "thickness-border-left-AppHeader": "xxx",
      "thickness-border-right-AppHeader": "xxx"
    });
  });

  it("expandTheme removes thickness-border-vertical", () => {
    const newTheme: Record<string, string> = {
      "thickness-border-vertical-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "thickness-border-vertical-AppHeader": "xxx",
      "thickness-border-top-AppHeader": "xxx",
      "thickness-border-bottom-AppHeader": "xxx"
    });
  });

  it("expandTheme removes style-border", () => {
    const newTheme: Record<string, string> = {
      "style-border-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "style-border-AppHeader": "xxx",
      "style-border-horizontal-AppHeader": "xxx",
      "style-border-vertical-AppHeader": "xxx",
      "style-border-top-AppHeader": "xxx",
      "style-border-right-AppHeader": "xxx",
      "style-border-bottom-AppHeader": "xxx",
      "style-border-left-AppHeader": "xxx"
    });
  });

  it("expandTheme removes style-border-horizontal", () => {
    const newTheme: Record<string, string> = {
      "style-border-horizontal-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "style-border-horizontal-AppHeader": "xxx",
      "style-border-left-AppHeader": "xxx",
      "style-border-right-AppHeader": "xxx"
    });
  });

  it("expandTheme removes style-border-vertical", () => {
    const newTheme: Record<string, string> = {
      "style-border-vertical-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "style-border-vertical-AppHeader": "xxx",
      "style-border-top-AppHeader": "xxx",
      "style-border-bottom-AppHeader": "xxx"
    });
  });

  it("expandTheme removes border", () => {
    const newTheme: Record<string, string> = {
      "border-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "border-AppHeader": "xxx",
      "border-horizontal-AppHeader": "xxx",
      "border-vertical-AppHeader": "xxx",
      "border-top-AppHeader": "xxx",
      "border-right-AppHeader": "xxx",
      "border-bottom-AppHeader": "xxx",
      "border-left-AppHeader": "xxx"
    });
  });

  it("expandTheme removes border-horizontal", () => {
    const newTheme: Record<string, string> = {
      "border-horizontal-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "border-horizontal-AppHeader": "xxx",
      "border-left-AppHeader": "xxx",
      "border-right-AppHeader": "xxx"
    });
  });

  it("expandTheme removes border-vertical", () => {
    const newTheme: Record<string, string> = {
      "border-vertical-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "border-vertical-AppHeader": "xxx",
      "border-top-AppHeader": "xxx",
      "border-bottom-AppHeader": "xxx"
    });
  });

  it("expandTheme removes padding", () => {
    const newTheme: Record<string, string> = {
      "padding-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "padding-AppHeader": "xxx",
      "padding-horizontal-AppHeader": "xxx",
      "padding-vertical-AppHeader": "xxx",
      "padding-top-AppHeader": "xxx",
      "padding-right-AppHeader": "xxx",
      "padding-bottom-AppHeader": "xxx",
      "padding-left-AppHeader": "xxx"
    });
  });

  it("expandTheme removes padding-horizontal", () => {
    const newTheme: Record<string, string> = {
      "padding-horizontal-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "padding-horizontal-AppHeader": "xxx",
      "padding-left-AppHeader": "xxx",
      "padding-right-AppHeader": "xxx"
    });
  });

  it("expandTheme removes padding-vertical", () => {
    const newTheme: Record<string, string> = {
      "padding-vertical-AppHeader": "xxx",
    };

    const result = expandTheme(newTheme);

    expect(result).deep.equal({
      "padding-vertical-AppHeader": "xxx",
      "padding-top-AppHeader": "xxx",
      "padding-bottom-AppHeader": "xxx"
    });
  });
});
