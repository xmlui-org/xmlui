import { describe, expect, it } from "vitest";
import { buildResponsiveWhenStyleObject } from "../../../src/components-core/utils/extractParam";

describe("buildResponsiveWhenStyleObject", () => {
  // --- Returns null when no responsive rules are defined
  it("returns null when responsiveWhen is undefined", () => {
    expect(buildResponsiveWhenStyleObject(undefined, undefined)).toBeNull();
  });

  it("returns null when responsiveWhen is an empty object", () => {
    expect(buildResponsiveWhenStyleObject(undefined, {})).toBeNull();
  });

  // --- Returns null for dynamic (expression) values
  it("returns null when base when is dynamic", () => {
    expect(buildResponsiveWhenStyleObject("{someExpr}", { md: "false" })).toBeNull();
  });

  it("returns null when a responsive value is dynamic", () => {
    expect(buildResponsiveWhenStyleObject(undefined, { md: "{someExpr}" })).toBeNull();
  });

  it("returns null when xs responsive value is dynamic", () => {
    expect(buildResponsiveWhenStyleObject(undefined, { xs: "{flag}", md: "false" })).toBeNull();
  });

  // --- Returns null when always visible (no CSS needed)
  it("returns null when when-md=true (always visible by default)", () => {
    // md=true means md+ visible, xs-sm fall back to base visible → all visible
    expect(buildResponsiveWhenStyleObject(undefined, { md: "true" })).toBeNull();
  });

  it("returns null when when-xs=true (all visible)", () => {
    expect(buildResponsiveWhenStyleObject(undefined, { xs: "true" })).toBeNull();
  });

  it("returns null when when-md=true and base when=false (md+ visible, xs-sm not → not null)", () => {
    // xs=0, sm=1 → no override → fall back to base when=false → hidden
    // md=2+ → md=true → visible
    // So xs and sm are hidden → should NOT return null
    const result = buildResponsiveWhenStyleObject(false, { md: true });
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("display", "contents");
  });

  // --- Simple hidden at specific breakpoints
  it("when-md=false hides xs(0) and sm(1)", () => {
    // xs/sm fall back (no override at 0/1), base when = undefined = visible
    // md=false → md(2)+ falls through to md → false → hidden
    // Wait — when-md=false means md(2), lg(3), xl(4), xxl(5) are hidden
    // xs(0), sm(1) → no responsive rule, fallback to base (undefined → visible)
    const result = buildResponsiveWhenStyleObject(undefined, { md: "false" });
    expect(result).not.toBeNull();
    expect(result!.display).toBe("contents");
    // md(2), lg(3), xl(4), xxl(5) are hidden
    expect(result!["@container (style(--screenSize: 2) or style(--screenSize: 3) or style(--screenSize: 4) or style(--screenSize: 5))"]).toEqual({ display: "none" });
  });

  it("when-md=false hides md through xxl", () => {
    const result = buildResponsiveWhenStyleObject(undefined, { md: false });
    expect(result).not.toBeNull();
    expect(result!.display).toBe("contents");
    // indices 2, 3, 4, 5 hidden
    const query = "@container (style(--screenSize: 2) or style(--screenSize: 3) or style(--screenSize: 4) or style(--screenSize: 5))";
    expect(result![query]).toEqual({ display: "none" });
  });

  it("when-xs=false propagates to all breakpoints via mobile-first walk, yielding display:none", () => {
    // Mobile-first walk-down: every sizeIndex walks from its own index down to 0.
    // Since xs(0)=false is the only rule, every breakpoint eventually walks to xs=false.
    // sizeIndex 0 (xs): xs=false → hidden
    // sizeIndex 1 (sm): sm not set, xs=false → hidden
    // sizeIndex 2 (md): md, sm not set, xs=false → hidden
    // All six breakpoints are hidden → simple display:none (no container query needed).
    const result = buildResponsiveWhenStyleObject(undefined, { xs: "false" });
    expect(result).toEqual({ display: "none" });
  });

  it("when-xs=false with md override hides xs and sm only", () => {
    // xs(0): xs=false → hidden
    // sm(1): sm not set, xs=false → hidden
    // md(2): md=true → visible
    // lg(3): lg not set, walk to md=true → visible
    // xl(4): walk to md=true → visible
    // xxl(5): walk to md=true → visible
    const result = buildResponsiveWhenStyleObject(undefined, { xs: "false", md: "true" });
    expect(result).not.toBeNull();
    expect(result!.display).toBe("contents");
    const query = "@container (style(--screenSize: 0) or style(--screenSize: 1))";
    expect(result![query]).toEqual({ display: "none" });
  });

  it("boolean true/false values work same as string 'true'/'false'", () => {
    const strResult = buildResponsiveWhenStyleObject(undefined, { xs: "false", md: "true" });
    const boolResult = buildResponsiveWhenStyleObject(undefined, { xs: false, md: true });
    expect(boolResult).toEqual(strResult);
  });

  // --- All hidden
  it("when=false with no responsive overrides renders null (no responsive rules)", () => {
    // No responsiveWhen = empty, returns null
    expect(buildResponsiveWhenStyleObject(false, {})).toBeNull();
  });

  it("when=false base + xs=false yields display:none", () => {
    // All hidden → { display: "none" }
    const result = buildResponsiveWhenStyleObject("false", { xs: "false" });
    expect(result).toEqual({ display: "none" });
  });

  it("all breakpoints hidden yields display:none (no container query)", () => {
    // xs=false, md=false → walk-down: all will inherit xs=false
    // Actually xs=false alone makes all hidden (confirmed above), so:
    const result = buildResponsiveWhenStyleObject(undefined, { xs: false });
    expect(result).toEqual({ display: "none" });
  });

  // --- Complex combinations
  it("when-xs=true with md=false → xs/sm visible, md+ hidden", () => {
    // xs(0): xs=true → visible
    // sm(1): sm not set, xs=true → visible
    // md(2): md=false → hidden
    // lg(3): lg not set, md=false → hidden
    // xl(4): walk to md=false → hidden
    // xxl(5): walk to md=false → hidden
    const result = buildResponsiveWhenStyleObject(undefined, { xs: "true", md: "false" });
    expect(result).not.toBeNull();
    expect(result!.display).toBe("contents");
    const query = "@container (style(--screenSize: 2) or style(--screenSize: 3) or style(--screenSize: 4) or style(--screenSize: 5))";
    expect(result![query]).toEqual({ display: "none" });
  });

  it("when-md=false with lg=true → xs-sm visible, md hidden, lg+ visible", () => {
    // xs(0): no rule → base=visible
    // sm(1): no rule → base=visible
    // md(2): md=false → hidden
    // lg(3): lg=true → visible
    // xl(4): xl not set, walk to lg=true → visible
    // xxl(5): walk to lg=true → visible
    const result = buildResponsiveWhenStyleObject(undefined, { md: "false", lg: "true" });
    expect(result).not.toBeNull();
    expect(result!.display).toBe("contents");
    const query = "@container (style(--screenSize: 2))";
    expect(result![query]).toEqual({ display: "none" });
  });

  // --- Non-boolean non-expression string
  it("returns null for non-boolean non-expression string in base when", () => {
    // "someString" is not a boolean and not {expr} — can't be statically resolved
    expect(buildResponsiveWhenStyleObject("someString", { md: "false" })).toBeNull();
  });

  it("returns null for non-boolean non-expression string in responsive value", () => {
    expect(buildResponsiveWhenStyleObject(undefined, { md: "someString" })).toBeNull();
  });
});
