import { describe, expect, it } from "vitest";
import {
  buildResponsiveStyleObjects,
  buildCompositeStyleObject,
  COMPONENT_PART_KEY,
} from "../../../src/components-core/theming/responsive-layout";

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

  it("skips properties that map to empty string (e.g. paddingVertical shorthand)", () => {
    const result = buildResponsiveStyleObjects({ paddingVertical: "8px" });
    expect(result).toEqual({});
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
});
