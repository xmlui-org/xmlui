import { describe, expect, it } from "vitest";
import { resolveLayoutProps, toCssVar } from "../../../src/components-core/theming/layout-resolver";

describe("Layout resolver 2", () => {
  const THEME_ID = "$some-theme-id_x";
  const THEME_ID_VALUE = toCssVar(THEME_ID);
  const THEME_ID2 = "$some-theme-id2";
  const THEME_ID2_VALUE = toCssVar(THEME_ID2);
  const THEME_ID3 = "$some-theme-id3";
  const THEME_ID3_VALUE = toCssVar(THEME_ID3);
  const THEME_ID4 = "$some-theme-id4";
  const THEME_ID4_VALUE = toCssVar(THEME_ID4);

  // --- Borders
  it("textDecoration", () => {
    const PROP = "textDecoration";
    const VALUE = "underline solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textDecorationLine", () => {
    const PROP = "textDecorationLine";
    const VALUE = "overline";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textDecorationColor", () => {
    const PROP = "textDecorationColor";
    const VALUE = "blue";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textDecorationStyle", () => {
    const PROP = "textDecorationStyle";
    const VALUE = "dotted";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textDecorationThickness", () => {
    const PROP = "textDecorationThickness";
    const VALUE = "8px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textUnderlineOffset", () => {
    const PROP = "textUnderlineOffset";
    const VALUE = "8px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("outline", () => {
    const PROP = "outline";
    const VALUE = "3px solid green";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("outlineWidth", () => {
    const PROP = "outlineWidth";
    const VALUE = "3px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("outlineColor", () => {
    const PROP = "outlineColor";
    const VALUE = "green";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("outlineStyle", () => {
    const PROP = "outlineStyle";
    const VALUE = "dotted";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("outlineOffset", () => {
    const PROP = "outlineOffset";
    const VALUE = "5px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });
});
