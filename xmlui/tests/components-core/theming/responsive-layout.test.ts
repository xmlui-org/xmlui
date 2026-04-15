import { describe, expect, it } from "vitest";
import {
  buildResponsiveStyleObjects,
  buildCompositeStyleObject,
  buildWhenStyleObject,
  COMPONENT_PART_KEY,
} from "../../../src/components-core/theming/responsive-layout";
import { toCssPropertyNames } from "../../../src/components-core/theming/parse-layout-props";
import { StyleRegistry } from "../../../src/components-core/theming/StyleRegistry";

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

  it("scopes named part base styles under both self and descendant data-part-id selectors", () => {
    const styleObjects = buildResponsiveStyleObjects({ "fontSize-label": "12px" });
    const composite = buildCompositeStyleObject(styleObjects);
    const selfSel = '&[data-part-id="label"]';
    const descSel = '& [data-part-id="label"]';
    expect((composite[selfSel] as any)["font-size"]).toBe("12px");
    expect((composite[descSel] as any)["font-size"]).toBe("12px");
  });

  it("scopes named part @media styles under both selectors inside @media rule", () => {
    const styleObjects = buildResponsiveStyleObjects({ "fontSize-label-md": "14px" });
    const composite = buildCompositeStyleObject(styleObjects);
    const media = composite["@media (min-width: 768px)"] as any;
    expect(media).toBeDefined();
    const selfSel = '&[data-part-id="label"]';
    const descSel = '& [data-part-id="label"]';
    expect(media[selfSel]["font-size"]).toBe("14px");
    expect(media[descSel]["font-size"]).toBe("14px");
  });

  it("combines component-root and part styles in one object", () => {
    const styleObjects = buildResponsiveStyleObjects({
      fontSize: "16px",
      "color-label": "blue",
    });
    const composite = buildCompositeStyleObject(styleObjects);
    expect(composite["font-size"]).toBe("16px");
    // Part styles appear under both self and descendant selectors
    expect((composite['&[data-part-id="label"]'] as any)["color"]).toBe("blue");
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

describe("buildResponsiveStyleObjects — pseudo-state support", () => {
  it("maps backgroundColor--hover to &:hover on root", () => {
    const result = buildResponsiveStyleObjects({ "backgroundColor--hover": "blue" });
    expect(result[COMPONENT_PART_KEY]["&:hover"]).toEqual({ "background-color": "blue" });
  });

  it("maps color--focus to &:focus on root", () => {
    const result = buildResponsiveStyleObjects({ "color--focus": "green" });
    expect(result[COMPONENT_PART_KEY]["&:focus"]).toEqual({ color: "green" });
  });

  it("maps opacity--active to &:active on root", () => {
    const result = buildResponsiveStyleObjects({ "opacity--active": "0.5" });
    expect(result[COMPONENT_PART_KEY]["&:active"]).toEqual({ opacity: "0.5" });
  });

  it("maps borderColor--focusVisible to &:focus-visible on root", () => {
    const result = buildResponsiveStyleObjects({ "borderColor--focusVisible": "red" });
    expect(result[COMPONENT_PART_KEY]["&:focus-visible"]).toEqual({ "border-color": "red" });
  });

  it("maps state + breakpoint (backgroundColor-sm--hover) to @media with &:hover", () => {
    const result = buildResponsiveStyleObjects({ "backgroundColor-sm--hover": "yellow" });
    const media = result[COMPONENT_PART_KEY]["@media (min-width: 576px)"] as any;
    expect(media).toBeDefined();
    expect(media["&:hover"]).toEqual({ "background-color": "yellow" });
  });

  it("maps state + part (color-label--hover) to &:hover on label part", () => {
    const result = buildResponsiveStyleObjects({ "color-label--hover": "red" });
    expect(result["label"]).toBeDefined();
    expect(result["label"]["&:hover"]).toEqual({ color: "red" });
  });

  it("maps state + part + breakpoint (fontSize-label-md--focus) to @media with &:focus on part", () => {
    const result = buildResponsiveStyleObjects({ "fontSize-label-md--focus": "18px" });
    const partStyle = result["label"];
    expect(partStyle).toBeDefined();
    const media = partStyle["@media (min-width: 768px)"] as any;
    expect(media).toBeDefined();
    expect(media["&:focus"]).toEqual({ "font-size": "18px" });
  });

  it("ignores unknown state suffixes gracefully", () => {
    const result = buildResponsiveStyleObjects({ "backgroundColor--bogus": "red" });
    expect(result).toEqual({});
  });

  it("combines base and state props for the same part", () => {
    const result = buildResponsiveStyleObjects({
      backgroundColor: "white",
      "backgroundColor--hover": "blue",
    });
    expect(result[COMPONENT_PART_KEY]["&"]).toEqual({ "background-color": "white" });
    expect(result[COMPONENT_PART_KEY]["&:hover"]).toEqual({ "background-color": "blue" });
  });

  it("combines multiple state props on the same element", () => {
    const result = buildResponsiveStyleObjects({
      "backgroundColor--hover": "blue",
      "backgroundColor--focus": "green",
    });
    expect(result[COMPONENT_PART_KEY]["&:hover"]).toEqual({ "background-color": "blue" });
    expect(result[COMPONENT_PART_KEY]["&:focus"]).toEqual({ "background-color": "green" });
  });
});

describe("buildCompositeStyleObject — pseudo-state support", () => {
  it("merges root hover styles as &:hover on composite", () => {
    const styleObjects = buildResponsiveStyleObjects({ "backgroundColor--hover": "blue" });
    const composite = buildCompositeStyleObject(styleObjects);
    expect((composite["&:hover"] as any)["background-color"]).toBe("blue");
  });

  it("merges root hover inside media query", () => {
    const styleObjects = buildResponsiveStyleObjects({ "backgroundColor-md--hover": "yellow" });
    const composite = buildCompositeStyleObject(styleObjects);
    const media = composite["@media (min-width: 768px)"] as any;
    expect(media).toBeDefined();
    expect(media["&:hover"]["background-color"]).toBe("yellow");
  });

  it("nests pseudo-state under part selectors for named parts", () => {
    const styleObjects = buildResponsiveStyleObjects({ "color-label--hover": "red" });
    const composite = buildCompositeStyleObject(styleObjects);
    const selfSel = '&[data-part-id="label"]';
    const descSel = '& [data-part-id="label"]';
    expect((composite[selfSel] as any)["&:hover"]).toEqual({ color: "red" });
    expect((composite[descSel] as any)["&:hover"]).toEqual({ color: "red" });
  });

  it("nests pseudo-state under part selectors inside media queries", () => {
    const styleObjects = buildResponsiveStyleObjects({ "color-label-md--hover": "red" });
    const composite = buildCompositeStyleObject(styleObjects);
    const media = composite["@media (min-width: 768px)"] as any;
    expect(media).toBeDefined();
    const selfSel = '&[data-part-id="label"]';
    const descSel = '& [data-part-id="label"]';
    expect(media[selfSel]["&:hover"]).toEqual({ color: "red" });
    expect(media[descSel]["&:hover"]).toEqual({ color: "red" });
  });

  it("combines base and hover on root in composite", () => {
    const styleObjects = buildResponsiveStyleObjects({
      backgroundColor: "white",
      "backgroundColor--hover": "blue",
    });
    const composite = buildCompositeStyleObject(styleObjects);
    expect(composite["background-color"]).toBe("white");
    expect((composite["&:hover"] as any)["background-color"]).toBe("blue");
  });

  it("combines base and hover for named part in composite", () => {
    const styleObjects = buildResponsiveStyleObjects({
      "color-label": "black",
      "color-label--hover": "red",
    });
    const composite = buildCompositeStyleObject(styleObjects);
    const selfSel = '&[data-part-id="label"]';
    expect((composite[selfSel] as any)["color"]).toBe("black");
    expect((composite[selfSel] as any)["&:hover"]).toEqual({ color: "red" });
  });
});

describe("CSS source order — pseudo selectors before @media", () => {
  it("emits &:hover before @media in buildResponsiveStyleObjects output", () => {
    const result = buildResponsiveStyleObjects({
      "backgroundColor--hover": "purple",
      "backgroundColor-sm--hover": "yellow",
    });
    const keys = Object.keys(result[COMPONENT_PART_KEY]);
    const hoverIdx = keys.indexOf("&:hover");
    const mediaIdx = keys.findIndex((k) => k.startsWith("@media"));
    expect(hoverIdx).toBeGreaterThanOrEqual(0);
    expect(mediaIdx).toBeGreaterThanOrEqual(0);
    expect(hoverIdx).toBeLessThan(mediaIdx);
  });

  it("emits &:hover before @media in composite for root styles", () => {
    const styleObjects = buildResponsiveStyleObjects({
      "backgroundColor--hover": "purple",
      "backgroundColor-sm": "lightgreen",
      "backgroundColor-sm--hover": "yellow",
    });
    const composite = buildCompositeStyleObject(styleObjects);
    const keys = Object.keys(composite);
    const hoverIdx = keys.indexOf("&:hover");
    const mediaIdx = keys.findIndex((k) => k.startsWith("@media"));
    expect(hoverIdx).toBeGreaterThanOrEqual(0);
    expect(mediaIdx).toBeGreaterThanOrEqual(0);
    expect(hoverIdx).toBeLessThan(mediaIdx);
  });

  it("full spinner scenario: base + sm + hover + sm hover", () => {
    const result = buildResponsiveStyleObjects({
      "backgroundColor-sm": "lightgreen",
      "backgroundColor--hover": "purple",
      "backgroundColor-sm--hover": "yellow",
    });

    const comp = result[COMPONENT_PART_KEY];
    // Base hover
    expect(comp["&:hover"]).toEqual({ "background-color": "purple" });
    // sm base
    expect((comp["@media (min-width: 576px)"] as any)["&"]).toEqual({
      "background-color": "lightgreen",
    });
    // sm hover
    expect((comp["@media (min-width: 576px)"] as any)["&:hover"]).toEqual({
      "background-color": "yellow",
    });

    // Key order: &:hover before @media
    const keys = Object.keys(comp);
    expect(keys.indexOf("&:hover")).toBeLessThan(
      keys.findIndex((k) => k.startsWith("@media")),
    );
  });
});

describe("End-to-end CSS generation — pseudo-state + responsive", () => {
  it("generates CSS where :hover comes before @media so @media can override", () => {
    const registry = new StyleRegistry();
    const styleObjects = buildResponsiveStyleObjects({
      "backgroundColor-sm": "lightgreen",
      "backgroundColor--hover": "purple",
      "backgroundColor-sm--hover": "yellow",
    });
    const composite = buildCompositeStyleObject(styleObjects);
    const { css, className } = registry.register(composite);

    // The :hover rule must appear BEFORE the @media rule in the CSS string
    const hoverPattern = `.${className}:hover`;
    const hoverIdx = css.indexOf(hoverPattern);
    const mediaIdx = css.indexOf("@media (min-width: 576px)");
    expect(hoverIdx).toBeGreaterThanOrEqual(0);
    expect(mediaIdx).toBeGreaterThanOrEqual(0);
    expect(hoverIdx).toBeLessThan(mediaIdx);

    // The @media block must contain both the base override and the hover override
    expect(css).toContain("background-color:lightgreen;");
    expect(css).toContain("background-color:yellow;");
  });
});

describe("buildWhenStyleObject", () => {
  it("returns empty object when when is undefined and no responsive rules", () => {
    expect(buildWhenStyleObject(undefined, undefined)).toEqual({});
  });

  it("returns empty object when when is undefined and responsiveWhen is empty", () => {
    expect(buildWhenStyleObject(undefined, {})).toEqual({});
  });

  it("emits display:none for when=false (boolean)", () => {
    expect(buildWhenStyleObject(false, undefined)).toEqual({ display: "none" });
  });

  it("emits display:none for when='false' (string)", () => {
    expect(buildWhenStyleObject("false", undefined)).toEqual({ display: "none" });
  });

  it("emits display:revert for when=true (boolean)", () => {
    expect(buildWhenStyleObject(true, undefined)).toEqual({ display: "revert" });
  });

  it("emits display:revert for when='true' (string)", () => {
    expect(buildWhenStyleObject("true", undefined)).toEqual({ display: "revert" });
  });

  it("does not emit anything for dynamic expressions", () => {
    expect(buildWhenStyleObject("{someVar}", undefined)).toEqual({});
  });

  // --- Responsive rules ---

  it("when='false' + when-md='true' → hidden base, visible at md+", () => {
    const result = buildWhenStyleObject("false", { md: "true" });
    expect(result.display).toBe("none");
    expect((result["@media (min-width: 768px)"] as any)["&"].display).toBe("revert");
  });

  it("when-md='true' (no base when) → hidden base, visible at md+", () => {
    // The lowest responsive rule is truthy → infer display:none as base so it's
    // hidden below md when no explicit base `when` is provided.
    const result = buildWhenStyleObject(undefined, { md: "true" });
    expect(result.display).toBe("none");
    expect((result["@media (min-width: 768px)"] as any)["&"].display).toBe("revert");
  });

  it("when-md='false' → visible base (no display), hidden at md+", () => {
    const result = buildWhenStyleObject(undefined, { md: "false" });
    // No base display rule (when is undefined → no display emitted)
    expect(result.display).toBeUndefined();
    expect((result["@media (min-width: 768px)"] as any)["&"].display).toBe("none");
  });

  it("when='false' when-sm='true' when-xl='false' → range visibility", () => {
    const result = buildWhenStyleObject("false", { sm: "true", xl: "false" });
    // Base: none
    expect(result.display).toBe("none");
    // sm: revert (visible)
    expect((result["@media (min-width: 576px)"] as any)["&"].display).toBe("revert");
    // xl: none (hidden again)
    expect((result["@media (min-width: 1200px)"] as any)["&"].display).toBe("none");
  });

  it("when-xs='false' → base display:none (xs has no media query)", () => {
    const result = buildWhenStyleObject(undefined, { xs: "false" });
    expect(result.display).toBe("none");
    // No @media rules since xs is base
    const mediaKeys = Object.keys(result).filter((k) => k.startsWith("@media"));
    expect(mediaKeys).toHaveLength(0);
  });

  it("skips duplicate rules when visibility doesn't change", () => {
    // when=false, when-sm=false → same value, no @media needed for sm
    const result = buildWhenStyleObject("false", { sm: "false" });
    expect(result.display).toBe("none");
    const mediaKeys = Object.keys(result).filter((k) => k.startsWith("@media"));
    expect(mediaKeys).toHaveLength(0);
  });

  it("skips dynamic expressions in responsiveWhen", () => {
    const result = buildWhenStyleObject("false", { md: "{someExpr}" });
    expect(result.display).toBe("none");
    // md has a dynamic expression → no @media rule generated
    const mediaKeys = Object.keys(result).filter((k) => k.startsWith("@media"));
    expect(mediaKeys).toHaveLength(0);
  });

  it("boolean values in responsiveWhen work correctly", () => {
    const result = buildWhenStyleObject(false, { md: true });
    expect(result.display).toBe("none");
    expect((result["@media (min-width: 768px)"] as any)["&"].display).toBe("revert");
  });

  it("generates correct CSS via StyleRegistry", () => {
    const registry = new StyleRegistry();
    const style = buildWhenStyleObject("false", { md: "true" });
    const { css } = registry.register(style);

    // Base rule: display:none
    expect(css).toContain("display:none;");
    // md rule: display:revert inside @media
    expect(css).toContain("@media (min-width: 768px)");
    expect(css).toContain("display:revert;");
  });
});

