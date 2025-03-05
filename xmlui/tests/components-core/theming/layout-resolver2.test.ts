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

  it("borderHorizontal: 1px solid red", () => {
    const PROP = "borderHorizontal";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderLeft).toBe(VALUE);
    expect(result.cssProps.borderRight).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderLeft overwrites borderHorizontal", () => {
    const PROP = "borderHorizontal";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE, borderLeft: "2px solid blue" });
    expect(result.cssProps.borderLeft).toBe("2px solid blue");
    expect(result.cssProps.borderRight).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderRight overwrites borderHorizontal", () => {
    const PROP = "borderHorizontal";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE, borderRight: "2px solid blue" });
    expect(result.cssProps.borderLeft).toBe(VALUE);
    expect(result.cssProps.borderRight).toBe("2px solid blue");
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderHorizontal (themeVar) 1", () => {
    const PROP = "borderHorizontal";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderLeft).toBe(THEME_ID_VALUE);
    expect(result.cssProps.borderRight).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderHorizontal (themeVar) 2", () => {
    const PROP = "borderHorizontal";
    const VALUE = `${THEME_ID} ${THEME_ID2}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderLeft).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.cssProps.borderRight).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderHorizontal (themeVar) 3", () => {
    const PROP = "borderHorizontal";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderLeft).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.cssProps.borderRight).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderVertical: 1px solid red", () => {
    const PROP = "borderVertical";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderTop).toBe(VALUE);
    expect(result.cssProps.borderBottom).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderVertical (themeVar) 1", () => {
    const PROP = "borderVertical";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderTop).toBe(THEME_ID_VALUE);
    expect(result.cssProps.borderBottom).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderVertical (themeVar) 2", () => {
    const PROP = "borderVertical";
    const VALUE = `${THEME_ID} ${THEME_ID2}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderTop).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.cssProps.borderBottom).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderVertical (themeVar) 3", () => {
    const PROP = "borderVertical";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderTop).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.cssProps.borderBottom).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderTop overwrites borderVertical", () => {
    const PROP = "borderVertical";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE, borderTop: "2px solid blue" });
    expect(result.cssProps.borderTop).toBe("2px solid blue");
    expect(result.cssProps.borderBottom).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderBottom overwrites borderVertical", () => {
    const PROP = "borderVertical";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE, borderBottom: "2px solid blue" });
    expect(result.cssProps.borderTop).toBe(VALUE);
    expect(result.cssProps.borderBottom).toBe("2px solid blue");
    expect(result.issues.has(PROP)).toBe(false);
  });
});
