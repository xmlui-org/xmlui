import { describe, expect, it } from "vitest";
import { checkThemeContrast, contrastRatio, parseColor } from "../../../src/components-core/accessibility";

describe("accessibility contrast checker", () => {
  it("parses hex and rgb colors", () => {
    expect(parseColor("#fff")).toEqual([255, 255, 255]);
    expect(parseColor("#000000")).toEqual([0, 0, 0]);
    expect(parseColor("rgb(12, 34, 56)")).toEqual([12, 34, 56]);
  });

  it("computes WCAG contrast ratios", () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 0);
    expect(contrastRatio([255, 255, 255], [255, 255, 255])).toBeCloseTo(1, 2);
  });

  it("reports low contrast pairs", () => {
    const diags = checkThemeContrast(
      new Map([
        ["textColor", "#ffffff"],
        ["backgroundColor", "#ffffff"],
      ]),
      [{ foreground: "textColor", background: "backgroundColor", minimumRatio: 4.5 }],
    );
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({ code: "color-contrast-low", severity: "warn" });
  });

  it("does not report passing pairs", () => {
    const diags = checkThemeContrast(
      new Map([
        ["textColor", "#000000"],
        ["backgroundColor", "#ffffff"],
      ]),
      [{ foreground: "textColor", background: "backgroundColor", minimumRatio: 4.5 }],
    );
    expect(diags).toEqual([]);
  });
});
