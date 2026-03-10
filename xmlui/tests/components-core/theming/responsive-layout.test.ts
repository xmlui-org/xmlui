import { describe, expect, it } from "vitest";
import {
  buildResponsiveStyleObjects,
  buildCompositeStyleObject,
  COMPONENT_PART_KEY,
} from "../../../src/components-core/theming/responsive-layout";
import { toCssPropertyNames } from "../../../src/components-core/theming/parse-layout-props";

describe("buildResponsiveStyleObjects", () => {
  it("returns empty object when props is empty", () => {
    expect(buildResponsiveStyleObjects({})).toEqual({});
  });

  it("ignores non-layout property keys", () => {
    const result = buildResponsiveStyleObjects({ label: "Hello", onClick: "handler" });
    expect(result).toEqual({});
  });

  it("maps a simple base prop to the component part", () => {
    const result = buildResponsiveStyleObjects({ fontSize: "16px" });
    expect(result[COMPONENT_PART_KEY]).toBeDefined();
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({ "font-size": "16px" });
  });

  it("maps color prop correctly (standard CSS property)", () => {
    const result = buildResponsiveStyleObjects({ color: "red" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({ color: "red" });
  });

  it("expands paddingVertical shorthand into padding-top and padding-bottom", () => {
    const result = buildResponsiveStyleObjects({ paddingVertical: "8px" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({ "padding-top": "8px", "padding-bottom": "8px" });
  });

  it("maps a breakpoint-suffixed prop to @media rule", () => {
    const result = buildResponsiveStyleObjects({ "fontSize-sm": "14px" });
    const compStyles = result[COMPONENT_PART_KEY];
    expect(compStyles).toBeDefined();
    expect(compStyles["@media (min-width: 576px)"]).toBeDefined();
    expect((compStyles["@media (min-width: 576px)"] as any)["&"]).toEqual({ "font-size": "14px" });
  });

  it("maps xs breakpoint as base rule (no @media)", () => {
    const result = buildResponsiveStyleObjects({ "fontSize-xs": "12px" });
    const compStyles = result[COMPONENT_PART_KEY];
    expect(compStyles["&"]).toEqual({ "font-size": "12px" });
    expect(Object.keys(compStyles).filter(k => k.startsWith("@media"))).toHaveLength(0);
  });

  it("maps all breakpoints to correct min-widths", () => {
    const result = buildResponsiveStyleObjects({
      "padding-sm": "4px",
      "padding-md": "8px",
      "padding-lg": "12px",
      "padding-xl": "16px",
      "padding-xxl": "20px",
    });
    const c = result[COMPONENT_PART_KEY];
    expect((c["@media (min-width: 576px)"] as any)["&"]).toEqual({ padding: "4px" });
    expect((c["@media (min-width: 768px)"] as any)["&"]).toEqual({ padding: "8px" });
    expect((c["@media (min-width: 992px)"] as any)["&"]).toEqual({ padding: "12px" });
    expect((c["@media (min-width: 1200px)"] as any)["&"]).toEqual({ padding: "16px" });
    expect((c["@media (min-width: 1400px)"] as any)["&"]).toEqual({ padding: "20px" });
  });

  it("maps a part-targeted prop to a separate part key", () => {
    const result = buildResponsiveStyleObjects({ "fontSize-label": "14px" });
    expect(result[COMPONENT_PART_KEY]).toBeUndefined();
    expect(result["label"]).toBeDefined();
    expect(result["label"]["&"]).toEqual({ "font-size": "14px" });
  });

  it("maps a part+breakpoint prop correctly", () => {
    const result = buildResponsiveStyleObjects({ "fontSize-label-md": "18px" });
    expect(result["label"]).toBeDefined();
    expect(result["label"]["&"]).toBeUndefined();
    expect((result["label"]["@media (min-width: 768px)"] as any)["&"]).toEqual({
      "font-size": "18px",
    });
  });

  it("combines multiple props for the same part", () => {
    const result = buildResponsiveStyleObjects({
      "fontSize-input": "14px",
      "color-input": "blue",
    });
    expect(result["input"]["&"]).toEqual({ "font-size": "14px", color: "blue" });
  });

  it("handles multiple parts independently", () => {
    const result = buildResponsiveStyleObjects({
      "fontSize-label": "12px",
      "fontSize-input": "16px",
      fontSize: "14px",
    });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({ "font-size": "14px" });
    expect(result["label"]["&"]).toEqual({ "font-size": "12px" });
    expect(result["input"]["&"]).toEqual({ "font-size": "16px" });
  });

  it("resolves theme variable references", () => {
    const result = buildResponsiveStyleObjects({ fontSize: "$myFontSize" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({
      "font-size": "var(--xmlui-myFontSize)",
    });
  });

  it("resolves theme variables within breakpoint rules", () => {
    const result = buildResponsiveStyleObjects({ "fontSize-md": "$myFontSize" });
    expect((result[COMPONENT_PART_KEY]["@media (min-width: 768px)"] as any)["&"]).toEqual({
      "font-size": "var(--xmlui-myFontSize)",
    });
  });

  it("skips component-scoped props (those with uppercase component segment)", () => {
    // parseLayoutProperty returns error for component names when parseComponent=false,
    // so these should be silently ignored
    const result = buildResponsiveStyleObjects({ "fontSize-Button": "16px" });
    expect(result).toEqual({});
  });

  it("skips invalid / non-layout props", () => {
    const result = buildResponsiveStyleObjects({ "--invalid": "value", "123bad": "val" });
    expect(result).toEqual({});
  });

  it("returns nothing for undefined/empty values", () => {
    const result = buildResponsiveStyleObjects({ fontSize: undefined, color: "" });
    expect(result).toEqual({});
  });
});

describe("buildCompositeStyleObject", () => {
  it("returns empty object when input is empty", () => {
    expect(buildCompositeStyleObject({})).toEqual({});
  });

  it("merges component-root base styles directly onto the composite", () => {
    const styleObjects = buildResponsiveStyleObjects({ fontSize: "16px", color: "red" });
    const composite = buildCompositeStyleObject(styleObjects);
    expect(composite["font-size"]).toBe("16px");
    expect(composite["color"]).toBe("red");
  });

  it("merges component-root @media rules directly", () => {
    const styleObjects = buildResponsiveStyleObjects({ "fontSize-md": "18px" });
    const composite = buildCompositeStyleObject(styleObjects);
    expect((composite["@media (min-width: 768px)"] as any)["&"]).toEqual({ "font-size": "18px" });
  });

  it("scopes named part base styles under data-part-id selector", () => {
    const styleObjects = buildResponsiveStyleObjects({ "fontSize-label": "12px" });
    const composite = buildCompositeStyleObject(styleObjects);
    const partSelector = '& [data-part-id="label"]';
    expect(composite[partSelector]).toBeDefined();
    expect((composite[partSelector] as any)["font-size"]).toBe("12px");
  });

  it("scopes named part @media styles under data-part-id inside @media rule", () => {
    const styleObjects = buildResponsiveStyleObjects({ "fontSize-label-md": "14px" });
    const composite = buildCompositeStyleObject(styleObjects);
    const media = composite["@media (min-width: 768px)"] as any;
    expect(media).toBeDefined();
    const partSelector = '& [data-part-id="label"]';
    expect(media[partSelector]).toBeDefined();
    expect(media[partSelector]["font-size"]).toBe("14px");
  });

  it("combines component-root and part styles in one object", () => {
    const styleObjects = buildResponsiveStyleObjects({
      fontSize: "16px",
      "color-label": "blue",
    });
    const composite = buildCompositeStyleObject(styleObjects);
    expect(composite["font-size"]).toBe("16px");
    expect((composite['& [data-part-id="label"]'] as any)["color"]).toBe("blue");
  });

  // --- Non-CSS layout properties (must produce no CSS output) ---

  it("ignores orientation (non-CSS layout prop)", () => {
    expect(buildResponsiveStyleObjects({ orientation: "horizontal" })).toEqual({});
  });

  it("ignores orientation with breakpoint suffix", () => {
    expect(buildResponsiveStyleObjects({ "orientation-md": "vertical" })).toEqual({});
  });

  it("ignores horizontalAlignment (non-CSS layout prop)", () => {
    expect(buildResponsiveStyleObjects({ horizontalAlignment: "center" })).toEqual({});
  });

  it("ignores verticalAlignment (non-CSS layout prop)", () => {
    expect(buildResponsiveStyleObjects({ verticalAlignment: "start" })).toEqual({});
  });

  it("ignores wrapContent (non-CSS layout prop)", () => {
    expect(buildResponsiveStyleObjects({ wrapContent: "true" })).toEqual({});
  });

  it("ignores canShrink (non-CSS layout prop)", () => {
    expect(buildResponsiveStyleObjects({ canShrink: "true" })).toEqual({});
  });

  // --- Renamed CSS properties ---

  it("maps radiusTopLeft to border-top-left-radius", () => {
    const result = buildResponsiveStyleObjects({ radiusTopLeft: "8px" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({ "border-top-left-radius": "8px" });
  });

  it("maps radiusTopRight to border-top-right-radius", () => {
    const result = buildResponsiveStyleObjects({ radiusTopRight: "8px" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({ "border-top-right-radius": "8px" });
  });

  it("maps radiusBottomLeft to border-bottom-left-radius", () => {
    const result = buildResponsiveStyleObjects({ radiusBottomLeft: "8px" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({ "border-bottom-left-radius": "8px" });
  });

  it("maps radiusBottomRight to border-bottom-right-radius", () => {
    const result = buildResponsiveStyleObjects({ radiusBottomRight: "8px" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({ "border-bottom-right-radius": "8px" });
  });

  it("maps radiusTopLeft with breakpoint suffix to @media rule", () => {
    const result = buildResponsiveStyleObjects({ "radiusTopLeft-md": "12px" });
    const compStyles = result[COMPONENT_PART_KEY];
    expect((compStyles["@media (min-width: 768px)"] as any)["&"]).toEqual({
      "border-top-left-radius": "12px",
    });
  });
});

describe("toCssPropertyNames", () => {
  it("returns single CSS property for a regular prop", () => {
    expect(toCssPropertyNames("fontSize")).toEqual(["font-size"]);
  });

  it("returns renamed property for textColor", () => {
    expect(toCssPropertyNames("textColor")).toEqual(["color"]);
  });

  it("returns empty array for non-CSS layout prop (orientation)", () => {
    expect(toCssPropertyNames("orientation")).toEqual([]);
  });

  it("returns empty array for non-CSS layout prop (horizontalAlignment)", () => {
    expect(toCssPropertyNames("horizontalAlignment")).toEqual([]);
  });

  it("returns empty array for non-CSS layout prop (verticalAlignment)", () => {
    expect(toCssPropertyNames("verticalAlignment")).toEqual([]);
  });

  it("returns empty array for non-CSS layout prop (wrapContent)", () => {
    expect(toCssPropertyNames("wrapContent")).toEqual([]);
  });

  it("returns empty array for non-CSS layout prop (canShrink)", () => {
    expect(toCssPropertyNames("canShrink")).toEqual([]);
  });

  it("expands paddingVertical to padding-top and padding-bottom", () => {
    expect(toCssPropertyNames("paddingVertical")).toEqual(["padding-top", "padding-bottom"]);
  });

  it("expands paddingHorizontal to padding-left and padding-right", () => {
    expect(toCssPropertyNames("paddingHorizontal")).toEqual(["padding-left", "padding-right"]);
  });

  it("expands marginVertical to margin-top and margin-bottom", () => {
    expect(toCssPropertyNames("marginVertical")).toEqual(["margin-top", "margin-bottom"]);
  });

  it("expands marginHorizontal to margin-left and margin-right", () => {
    expect(toCssPropertyNames("marginHorizontal")).toEqual(["margin-left", "margin-right"]);
  });

  it("expands borderVertical to border-top and border-bottom", () => {
    expect(toCssPropertyNames("borderVertical")).toEqual(["border-top", "border-bottom"]);
  });

  it("expands borderHorizontal to border-left and border-right", () => {
    expect(toCssPropertyNames("borderHorizontal")).toEqual(["border-left", "border-right"]);
  });
});

describe("buildResponsiveStyleObjects — compound property expansion", () => {
  it("expands paddingVertical into padding-top and padding-bottom", () => {
    const result = buildResponsiveStyleObjects({ paddingVertical: "8px" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({
      "padding-top": "8px",
      "padding-bottom": "8px",
    });
  });

  it("expands paddingHorizontal into padding-left and padding-right", () => {
    const result = buildResponsiveStyleObjects({ paddingHorizontal: "12px" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({
      "padding-left": "12px",
      "padding-right": "12px",
    });
  });

  it("paddingTop overrides paddingVertical's padding-top (specific wins, declared after)", () => {
    const result = buildResponsiveStyleObjects({ paddingVertical: "8px", paddingTop: "16px" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({
      "padding-top": "16px",
      "padding-bottom": "8px",
    });
  });

  it("paddingTop overrides paddingVertical's padding-top (specific wins, declared before)", () => {
    // Order in source object should not matter — compound always applied first
    const result = buildResponsiveStyleObjects({ paddingTop: "16px", paddingVertical: "8px" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({
      "padding-top": "16px",
      "padding-bottom": "8px",
    });
  });

  it("both paddingTop and paddingBottom override paddingVertical", () => {
    const result = buildResponsiveStyleObjects({
      paddingVertical: "8px",
      paddingTop: "16px",
      paddingBottom: "4px",
    });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({
      "padding-top": "16px",
      "padding-bottom": "4px",
    });
  });

  it("paddingLeft overrides paddingHorizontal's padding-left", () => {
    const result = buildResponsiveStyleObjects({ paddingHorizontal: "12px", paddingLeft: "24px" });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({
      "padding-left": "24px",
      "padding-right": "12px",
    });
  });

  it("marginVertical expands at a breakpoint", () => {
    const result = buildResponsiveStyleObjects({ "marginVertical-md": "16px" });
    const media = result[COMPONENT_PART_KEY]["@media (min-width: 768px)"] as any;
    expect(media["&"]).toEqual({ "margin-top": "16px", "margin-bottom": "16px" });
  });

  it("marginTop at same breakpoint overrides marginVertical-md regardless of declaration order", () => {
    const result = buildResponsiveStyleObjects({
      "marginTop-md": "32px",
      "marginVertical-md": "16px",
    });
    const media = result[COMPONENT_PART_KEY]["@media (min-width: 768px)"] as any;
    expect(media["&"]).toEqual({ "margin-top": "32px", "margin-bottom": "16px" });
  });
});

