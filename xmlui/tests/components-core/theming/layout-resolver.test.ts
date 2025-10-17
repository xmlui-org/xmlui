import { describe, expect, it } from "vitest";
import { resolveLayoutProps, toCssVar } from "../../../src/components-core/theming/layout-resolver";

describe("Layout resolver", () => {
  const THEME_ID = "$some-theme-id_x";
  const THEME_ID_VALUE = toCssVar(THEME_ID);
  const THEME_ID2 = "$some-theme-id2";
  const THEME_ID2_VALUE = toCssVar(THEME_ID2);
  const THEME_ID3 = "$some-theme-id3";
  const THEME_ID3_VALUE = toCssVar(THEME_ID3);
  const THEME_ID4 = "$some-theme-id4";
  const THEME_ID4_VALUE = toCssVar(THEME_ID4);

  // --- Dimensions & Positions
  const sizeCases = ["0", "1px", "2.5rem", "50%", "4vmin"];

  sizeCases.forEach((c) => {
    it(`width: ${c}`, () => {
      const PROP = "width";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`minWidth: ${c}`, () => {
      const PROP = "minWidth";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`maxWidth: ${c}`, () => {
      const PROP = "maxWidth";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`height: ${c}`, () => {
      const PROP = "height";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`minHeight: ${c}`, () => {
      const PROP = "minHeight";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`maxHeight: ${c}`, () => {
      const PROP = "maxHeight";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`top: ${c}`, () => {
      const PROP = "top";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`right: ${c}`, () => {
      const PROP = "right";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`bottom: ${c}`, () => {
      const PROP = "bottom";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`left: ${c}`, () => {
      const PROP = "left";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`gap: ${c}`, () => {
      const PROP = "gap";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.issues.has(PROP)).toBe(false);
    });
  });

  // --- Star sizes (width & height)
  it("width: star size (*) with no layout context", () => {
    const PROP = "width";
    const VALUE = "*";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBeUndefined();
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("width: star size (*) with empty layout context", () => {
    const PROP = "width";
    const VALUE = "*";
    const result = resolveLayoutProps({ [PROP]: VALUE }, {});
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBe(0);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("width: star size (*) with horizontal layout context", () => {
    const PROP = "width";
    const VALUE = "*";
    const result = resolveLayoutProps(
      { [PROP]: VALUE },
      { type: "Stack", orientation: "horizontal" },
    );
    expect(result.cssProps.flex).toBe(1);
    expect(result.cssProps.flexShrink).toBe(1);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("width: star size (*) with vertical layout context", () => {
    const PROP = "width";
    const VALUE = "*";
    const result = resolveLayoutProps(
      { [PROP]: VALUE },
      { type: "Stack", orientation: "vertical" },
    );
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBe(0);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("width: star size (3*) with no layout context", () => {
    const PROP = "width";
    const VALUE = "3*";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBeUndefined();
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("width: star size (3*) with empty layout context", () => {
    const PROP = "width";
    const VALUE = "3*";
    const result = resolveLayoutProps({ [PROP]: VALUE }, {});
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBe(0);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("width: star size (3*) with horizontal layout context", () => {
    const PROP = "width";
    const VALUE = "3*";
    const result = resolveLayoutProps(
      { [PROP]: VALUE },
      { type: "Stack", orientation: "horizontal" },
    );
    expect(result.cssProps.flex).toBe(3);
    expect(result.cssProps.flexShrink).toBe(1);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("width: star size (3*) with vertical layout context", () => {
    const PROP = "width";
    const VALUE = "3*";
    const result = resolveLayoutProps(
      { [PROP]: VALUE },
      { type: "Stack", orientation: "vertical" },
    );
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBe(0);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("height: star size (*) with no layout context", () => {
    const PROP = "height";
    const VALUE = "*";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBeUndefined();
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("height: star size (*) with empty layout context", () => {
    const PROP = "height";
    const VALUE = "*";
    const result = resolveLayoutProps({ [PROP]: VALUE }, {});
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBe(0);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("height: star size (*) with horizontal layout context", () => {
    const PROP = "height";
    const VALUE = "*";
    const result = resolveLayoutProps(
      { [PROP]: VALUE },
      { type: "Stack", orientation: "horizontal" },
    );
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBe(0);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("height: star size (*) with vertical layout context", () => {
    const PROP = "height";
    const VALUE = "*";
    const result = resolveLayoutProps(
      { [PROP]: VALUE },
      { type: "Stack", orientation: "vertical" },
    );
    expect(result.cssProps.flex).toBe(1);
    expect(result.cssProps.flexShrink).toBe(1);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("height: star size (3*) with no layout context", () => {
    const PROP = "height";
    const VALUE = "3*";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBeUndefined();
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("height: star size (3*) with empty layout context", () => {
    const PROP = "height";
    const VALUE = "3*";
    const result = resolveLayoutProps({ [PROP]: VALUE }, {});
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBe(0);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("height: star size (3*) with horizontal layout context", () => {
    const PROP = "height";
    const VALUE = "3*";
    const result = resolveLayoutProps(
      { [PROP]: VALUE },
      { type: "Stack", orientation: "horizontal" },
    );
    expect(result.cssProps.flex).toBeUndefined();
    expect(result.cssProps.flexShrink).toBe(0);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("height: star size (3*) with vertical layout context", () => {
    const PROP = "height";
    const VALUE = "3*";
    const result = resolveLayoutProps(
      { [PROP]: VALUE },
      { type: "Stack", orientation: "vertical" },
    );
    expect(result.cssProps.flex).toBe(3);
    expect(result.cssProps.flexShrink).toBe(1);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("width (themeVar)", () => {
    const PROP = "width";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("minWidth (themeVar)", () => {
    const PROP = "minWidth";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("maxWidth (themeVar)", () => {
    const PROP = "maxWidth";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("height (themeVar)", () => {
    const PROP = "height";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("minHeight (themeVar)", () => {
    const PROP = "minHeight";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("maxHeight (themeVar)", () => {
    const PROP = "maxHeight";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("top (themeVar)", () => {
    const PROP = "top";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("right (themeVar)", () => {
    const PROP = "right";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("bottom (themeVar)", () => {
    const PROP = "bottom";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("left (themeVar)", () => {
    const PROP = "left";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("gap (themeVar)", () => {
    const PROP = "gap";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  // --- Paddings
  sizeCases.forEach((c) => {
    it(`padding: ${c}`, () => {
      const PROP = "padding";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.cssProps.paddingLeft).toBeUndefined();
      expect(result.cssProps.paddingRight).toBeUndefined();
      expect(result.cssProps.paddingTop).toBeUndefined();
      expect(result.cssProps.paddingBottom).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`paddingLeft: ${c}`, () => {
      const PROP = "paddingLeft";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.padding).toBeUndefined();
      expect(result.cssProps.paddingLeft).toBe(c);
      expect(result.cssProps.paddingRight).toBeUndefined();
      expect(result.cssProps.paddingTop).toBeUndefined();
      expect(result.cssProps.paddingBottom).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`paddingRight: ${c}`, () => {
      const PROP = "paddingRight";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.padding).toBeUndefined();
      expect(result.cssProps.paddingLeft).toBeUndefined();
      expect(result.cssProps.paddingRight).toBe(c);
      expect(result.cssProps.paddingTop).toBeUndefined();
      expect(result.cssProps.paddingBottom).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`paddingTop: ${c}`, () => {
      const PROP = "paddingTop";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.padding).toBeUndefined();
      expect(result.cssProps.paddingTop).toBe(c);
      expect(result.cssProps.paddingBottom).toBeUndefined();
      expect(result.cssProps.paddingLeft).toBeUndefined();
      expect(result.cssProps.paddingRight).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`paddingBottom: ${c}`, () => {
      const PROP = "paddingBottom";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.padding).toBeUndefined();
      expect(result.cssProps.paddingTop).toBeUndefined();
      expect(result.cssProps.paddingBottom).toBe(c);
      expect(result.cssProps.paddingLeft).toBeUndefined();
      expect(result.cssProps.paddingRight).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });
  });

  it("padding (themeVar) 1", () => {
    const PROP = "padding";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("padding (themeVar) 2", () => {
    const PROP = "padding";
    const VALUE = `${THEME_ID} ${THEME_ID2}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("padding (themeVar) 3", () => {
    const PROP = "padding";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("padding (themeVar) 4", () => {
    const PROP = "padding";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3} ${THEME_ID4}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(
      `${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE} ${THEME_ID4_VALUE}`,
    );
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("paddingHorizontal (themeVar)", () => {
    const PROP = "paddingHorizontal";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.paddingLeft).toBe(THEME_ID_VALUE);
    expect(result.cssProps.paddingRight).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("paddingVertical (themeVar)", () => {
    const PROP = "paddingVertical";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.paddingTop).toBe(THEME_ID_VALUE);
    expect(result.cssProps.paddingBottom).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("paddingTop (themeVar)", () => {
    const PROP = "paddingTop";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.paddingTop).toBe(THEME_ID_VALUE);
    expect(result.cssProps.paddingBottom).toBeUndefined();
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("paddingBottom (themeVar)", () => {
    const PROP = "paddingBottom";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.paddingTop).toBeUndefined();
    expect(result.cssProps.paddingBottom).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("paddingLeft (themeVar)", () => {
    const PROP = "paddingLeft";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.paddingLeft).toBe(THEME_ID_VALUE);
    expect(result.cssProps.paddingRight).toBeUndefined();
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("paddingRight (themeVar)", () => {
    const PROP = "paddingRight";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.paddingLeft).toBeUndefined();
    expect(result.cssProps.paddingRight).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  sizeCases.forEach((c) => {
    it(`paddingHorizontal goes to left and right: ${c}`, () => {
      const PROP = "paddingHorizontal";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.paddingLeft).toBe(c);
      expect(result.cssProps.paddingRight).toBe(c);
      expect(result.cssProps.paddingTop).toBeUndefined();
      expect(result.cssProps.paddingBottom).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`paddingVertical goes to top and bottom: ${c}`, () => {
      const PROP = "paddingVertical";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.paddingTop).toBe(c);
      expect(result.cssProps.paddingBottom).toBe(c);
      expect(result.cssProps.paddingLeft).toBeUndefined();
      expect(result.cssProps.paddingRight).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`paddingLeft: ${c}`, () => {
      const PROP = "paddingLeft";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.paddingLeft).toBe(c);
      expect(result.cssProps.paddingRight).toBeUndefined();
      expect(result.cssProps.paddingTop).toBeUndefined();
      expect(result.cssProps.paddingBottom).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`paddingRight: ${c}`, () => {
      const PROP = "paddingRight";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.paddingLeft).toBeUndefined();
      expect(result.cssProps.paddingRight).toBe(c);
      expect(result.cssProps.paddingTop).toBeUndefined();
      expect(result.cssProps.paddingBottom).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`paddingTop: ${c}`, () => {
      const PROP = "paddingTop";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.paddingTop).toBe(c);
      expect(result.cssProps.paddingBottom).toBeUndefined();
      expect(result.cssProps.paddingLeft).toBeUndefined();
      expect(result.cssProps.paddingRight).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`paddingBottom: ${c}`, () => {
      const PROP = "paddingBottom";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.paddingTop).toBeUndefined();
      expect(result.cssProps.paddingBottom).toBe(c);
      expect(result.cssProps.paddingLeft).toBeUndefined();
      expect(result.cssProps.paddingRight).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });
  });

  it(`paddingLeft overrides paddingHorizontal`, () => {
    const PROP = "paddingLeft";
    const VALUE = "1px";
    const OVERRIDE = "2px";
    const result = resolveLayoutProps({ paddingHorizontal: OVERRIDE, [PROP]: VALUE });
    expect(result.cssProps.paddingLeft).toBe(VALUE);
    expect(result.cssProps.paddingRight).toBe(OVERRIDE);
    expect(result.issues.has("paddingHorizontal")).toBe(false);
  });

  it(`paddingRight overrides paddingHorizontal`, () => {
    const PROP = "paddingRight";
    const VALUE = "1px";
    const OVERRIDE = "2px";
    const result = resolveLayoutProps({ paddingHorizontal: OVERRIDE, [PROP]: VALUE });
    expect(result.cssProps.paddingLeft).toBe(OVERRIDE);
    expect(result.cssProps.paddingRight).toBe(VALUE);
    expect(result.issues.has("paddingHorizontal")).toBe(false);
  });

  it(`paddingTop overrides paddingVertical`, () => {
    const PROP = "paddingTop";
    const VALUE = "1px";
    const OVERRIDE = "2px";
    const result = resolveLayoutProps({ paddingVertical: OVERRIDE, [PROP]: VALUE });
    expect(result.cssProps.paddingTop).toBe(VALUE);
    expect(result.cssProps.paddingBottom).toBe(OVERRIDE);
    expect(result.issues.has("paddingVertical")).toBe(false);
  });

  it(`paddingBottom overrides paddingVertical`, () => {
    const PROP = "paddingBottom";
    const VALUE = "1px";
    const OVERRIDE = "2px";
    const result = resolveLayoutProps({ paddingVertical: OVERRIDE, [PROP]: VALUE });
    expect(result.cssProps.paddingTop).toBe(OVERRIDE);
    expect(result.cssProps.paddingBottom).toBe(VALUE);
    expect(result.issues.has("paddingVertical")).toBe(false);
  });

  // --- Borders
  it("border: 1px solid red", () => {
    const PROP = "border";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("border (themeVar) 1", () => {
    const PROP = "border";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("border (themeVar) 2", () => {
    const PROP = "border";
    const VALUE = `${THEME_ID} ${THEME_ID2}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("border (themeVar) 3", () => {
    const PROP = "border";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderTop: 1px solid red", () => {
    const PROP = "borderTop";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderTop (themeVar) 1", () => {
    const PROP = "borderTop";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderTop (themeVar) 2", () => {
    const PROP = "borderTop";
    const VALUE = `${THEME_ID} ${THEME_ID2}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderTop (themeVar) 3", () => {
    const PROP = "borderTop";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderRight: 1px solid red", () => {
    const PROP = "borderRight";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderRight (themeVar) 1", () => {
    const PROP = "borderRight";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderRight (themeVar) 2", () => {
    const PROP = "borderRight";
    const VALUE = `${THEME_ID} ${THEME_ID2}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderRight (themeVar) 3", () => {
    const PROP = "borderRight";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderBottom: 1px solid red", () => {
    const PROP = "borderBottom";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderBottom (themeVar) 1", () => {
    const PROP = "borderBottom";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderBottom (themeVar) 2", () => {
    const PROP = "borderBottom";
    const VALUE = `${THEME_ID} ${THEME_ID2}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderBottom (themeVar) 3", () => {
    const PROP = "borderBottom";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderLeft: 1px solid red", () => {
    const PROP = "borderLeft";
    const VALUE = "1px solid red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderLeft (themeVar) 1", () => {
    const PROP = "borderLeft";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderLeft (themeVar) 2", () => {
    const PROP = "borderLeft";
    const VALUE = `${THEME_ID} ${THEME_ID2}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderLeft (themeVar) 3", () => {
    const PROP = "borderLeft";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderColor: red", () => {
    const PROP = "borderColor";
    const VALUE = "red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderColor (themeVar) 1", () => {
    const PROP = "borderColor";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderStyle: solid", () => {
    const PROP = "borderStyle";
    const VALUE = "solid";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderStyle (themeVar) 1", () => {
    const PROP = "borderStyle";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderWidth: 1px", () => {
    const PROP = "borderWidth";
    const VALUE = "1px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderWidth (themeVar) 1", () => {
    const PROP = "borderWidth";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  // --- Margins
  sizeCases.forEach((c) => {
    it(`margin: ${c}`, () => {
      const PROP = "margin";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps[PROP]).toBe(c);
      expect(result.cssProps.marginLeft).toBeUndefined();
      expect(result.cssProps.marginRight).toBeUndefined();
      expect(result.cssProps.marginTop).toBeUndefined();
      expect(result.cssProps.marginBottom).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`marginLeft: ${c}`, () => {
      const PROP = "marginLeft";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.margin).toBeUndefined();
      expect(result.cssProps.marginLeft).toBe(c);
      expect(result.cssProps.marginRight).toBeUndefined();
      expect(result.cssProps.marginTop).toBeUndefined();
      expect(result.cssProps.marginBottom).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });
  });

  it("margin (themeVar) 1", () => {
    const PROP = "margin";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("margin (themeVar) 2", () => {
    const PROP = "margin";
    const VALUE = `${THEME_ID} ${THEME_ID2}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("margin (themeVar) 3", () => {
    const PROP = "margin";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("margin (themeVar) 4", () => {
    const PROP = "margin";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3} ${THEME_ID4}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(
      `${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE} ${THEME_ID4_VALUE}`,
    );
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("marginHorizontal (themeVar)", () => {
    const PROP = "marginHorizontal";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.marginLeft).toBe(THEME_ID_VALUE);
    expect(result.cssProps.marginRight).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("marginVertical (themeVar)", () => {
    const PROP = "marginVertical";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.marginTop).toBe(THEME_ID_VALUE);
    expect(result.cssProps.marginBottom).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("marginTop (themeVar)", () => {
    const PROP = "marginTop";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.marginTop).toBe(THEME_ID_VALUE);
    expect(result.cssProps.marginBottom).toBeUndefined();
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("marginBottom (themeVar)", () => {
    const PROP = "marginBottom";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.marginTop).toBeUndefined();
    expect(result.cssProps.marginBottom).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("marginLeft (themeVar)", () => {
    const PROP = "marginLeft";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.marginLeft).toBe(THEME_ID_VALUE);
    expect(result.cssProps.marginRight).toBeUndefined();
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("marginRight (themeVar)", () => {
    const PROP = "marginRight";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.marginLeft).toBeUndefined();
    expect(result.cssProps.marginRight).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  sizeCases.forEach((c) => {
    it(`marginHorizontal goes to left and right: ${c}`, () => {
      const PROP = "marginHorizontal";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.marginLeft).toBe(c);
      expect(result.cssProps.marginRight).toBe(c);
      expect(result.cssProps.marginTop).toBeUndefined();
      expect(result.cssProps.marginBottom).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });

    it(`marginVertical goes to top and bottom: ${c}`, () => {
      const PROP = "marginVertical";
      const result = resolveLayoutProps({ [PROP]: c });
      expect(result.cssProps.marginTop).toBe(c);
      expect(result.cssProps.marginBottom).toBe(c);
      expect(result.cssProps.marginLeft).toBeUndefined();
      expect(result.cssProps.marginRight).toBeUndefined();
      expect(result.issues.has(PROP)).toBe(false);
    });
  });

  it(`marginLeft overrides marginHorizontal`, () => {
    const PROP = "marginLeft";
    const VALUE = "1px";
    const OVERRIDE = "2px";
    const result = resolveLayoutProps({ marginHorizontal: OVERRIDE, [PROP]: VALUE });
    expect(result.cssProps.marginLeft).toBe(VALUE);
    expect(result.cssProps.marginRight).toBe(OVERRIDE);
    expect(result.issues.has("marginHorizontal")).toBe(false);
  });

  it(`marginRight overrides marginHorizontal`, () => {
    const PROP = "marginRight";
    const VALUE = "1px";
    const OVERRIDE = "2px";
    const result = resolveLayoutProps({ marginHorizontal: OVERRIDE, [PROP]: VALUE });
    expect(result.cssProps.marginLeft).toBe(OVERRIDE);
    expect(result.cssProps.marginRight).toBe(VALUE);
    expect(result.issues.has("marginHorizontal")).toBe(false);
  });

  it(`marginTop overrides marginVertical`, () => {
    const PROP = "marginTop";
    const VALUE = "1px";
    const OVERRIDE = "2px";
    const result = resolveLayoutProps({ marginVertical: OVERRIDE, [PROP]: VALUE });
    expect(result.cssProps.marginTop).toBe(VALUE);
    expect(result.cssProps.marginBottom).toBe(OVERRIDE);
    expect(result.issues.has("marginVertical")).toBe(false);
  });

  it(`marginBottom overrides marginVertical`, () => {
    const PROP = "marginBottom";
    const VALUE = "1px";
    const OVERRIDE = "2px";
    const result = resolveLayoutProps({ marginVertical: OVERRIDE, [PROP]: VALUE });
    expect(result.cssProps.marginTop).toBe(OVERRIDE);
    expect(result.cssProps.marginBottom).toBe(VALUE);
    expect(result.issues.has("marginVertical")).toBe(false);
  });

  // --- Radius
  it("borderRadius: 4px", () => {
    const PROP = "borderRadius";
    const VALUE = "4px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderRadius).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("borderRadius (themeVar)", () => {
    const PROP = "borderRadius";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderRadius).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("radiusTopLeft: 4px", () => {
    const PROP = "radiusTopLeft";
    const VALUE = "4px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderTopLeftRadius).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("radiusTopLeft (themeVar)", () => {
    const PROP = "radiusTopLeft";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderTopLeftRadius).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("radiusTopRight: 4px", () => {
    const PROP = "radiusTopRight";
    const VALUE = "4px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderTopRightRadius).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("radiusTopRight (themeVar)", () => {
    const PROP = "radiusTopRight";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderTopRightRadius).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("radiusBottomRight: 4px", () => {
    const PROP = "radiusBottomRight";
    const VALUE = "4px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderBottomRightRadius).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("radiusBottomRight (themeVar)", () => {
    const PROP = "radiusBottomRight";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderBottomRightRadius).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("radiusBottomLeft: 4px", () => {
    const PROP = "radiusBottomLeft";
    const VALUE = "4px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderBottomLeftRadius).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("radiusBottomLeft (themeVar)", () => {
    const PROP = "radiusBottomLeft";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.borderBottomLeftRadius).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  // --- Typography
  it("color: red", () => {
    const PROP = "color";
    const VALUE = "red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("color (themeVar)", () => {
    const PROP = "color";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("fontSize: 16px", () => {
    const PROP = "fontSize";
    const VALUE = "16px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("fontSize (themeVar)", () => {
    const PROP = "fontSize";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("fontWeight: bold", () => {
    const PROP = "fontWeight";
    const VALUE = "bold";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("fontWeight (themeVar)", () => {
    const PROP = "fontWeight";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("fontStyle: true", () => {
    const PROP = "fontStyle";
    const VALUE = "true";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("fontStyle (themeVar)", () => {
    const PROP = "fontStyle";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textDecoration: underline", () => {
    const PROP = "textDecoration";
    const VALUE = "underline";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textDecoration (themeVar)", () => {
    const PROP = "textDecoration";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("userSelect: none", () => {
    const PROP = "userSelect";
    const VALUE = "none";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("userSelect (themeVar)", () => {
    const PROP = "userSelect";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("letterSpacing: 1px", () => {
    const PROP = "letterSpacing";
    const VALUE = "1px";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  }); 

  it("letterSpacing (themeVar)", () => {
    const PROP = "letterSpacing";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textTransform: uppercase", () => {
    const PROP = "textTransform";
    const VALUE = "uppercase";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textTransform (themeVar)", () => {
    const PROP = "textTransform";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("lineHeight: 1.5", () => {
    const PROP = "lineHeight";
    const VALUE = "1.5";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("lineHeight (themeVar)", () => {
    const PROP = "lineHeight";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  }); 

  it("textAlign: center", () => {
    const PROP = "textAlign";
    const VALUE = "center";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textAlign (themeVar)", () => {
    const PROP = "textAlign";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textAlignLast: center", () => {
    const PROP = "textAlignLast";
    const VALUE = "center";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textAlignLast (themeVar)", () => {
    const PROP = "textAlignLast";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textWrap: wrap", () => {
    const PROP = "textWrap";
    const VALUE = "wrap";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("textWrap (themeVar)", () => {
    const PROP = "textWrap";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  // --- Other
  it("backgroundColor: red", () => {
    const PROP = "backgroundColor";
    const VALUE = "red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("backgroundColor (themeVar)", () => {
    const PROP = "backgroundColor";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("background: red", () => {
    const PROP = "background";
    const VALUE = "red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.background).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("background (themeVar)", () => {
    const PROP = "background";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.background).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("boxShadow: 1px 1px 1px red", () => {
    const PROP = "boxShadow";
    const VALUE = "1px 1px 1px red";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.boxShadow).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("boxShadow (themeVar) 1", () => {
    const PROP = "boxShadow";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.boxShadow).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("boxShadow (themeVar) 2", () => {
    const PROP = "boxShadow";
    const VALUE = `${THEME_ID} ${THEME_ID2}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.boxShadow).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("boxShadow (themeVar) 3", () => {
    const PROP = "boxShadow";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.boxShadow).toBe(`${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE}`);
    expect(result.issues.has(PROP)).toBe(false);
  }); 

  it("boxShadow (themeVar) 4", () => {
    const PROP = "boxShadow";
    const VALUE = `${THEME_ID} ${THEME_ID2} ${THEME_ID3} ${THEME_ID4}`;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.boxShadow).toBe(
      `${THEME_ID_VALUE} ${THEME_ID2_VALUE} ${THEME_ID3_VALUE} ${THEME_ID4_VALUE}`,
    );
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("direction: rtl", () => {
    const PROP = "direction";
    const VALUE = "rtl";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("direction (themeVar)", () => {
    const PROP = "direction";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("overflowX: auto", () => {
    const PROP = "overflowX";
    const VALUE = "auto";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.overflowX).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("overflowX (themeVar)", () => {
    const PROP = "overflowX";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.overflowX).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  }); 

  it("overflowY: auto", () => {
    const PROP = "overflowY";
    const VALUE = "auto";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.overflowY).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("overflowY (themeVar)", () => {
    const PROP = "overflowY";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.overflowY).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("zIndex: 1", () => {
    const PROP = "zIndex";
    const VALUE = "1";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("zIndex (themeVar)", () => {
    const PROP = "zIndex";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("opacity: 0.5", () => {  
    const PROP = "opacity";
    const VALUE = "0.5";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("opacity (themeVar)", () => {
    const PROP = "opacity";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("zoom: 0.5", () => {
    const PROP = "zoom";
    const VALUE = "0.5";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("zoom (themeVar)", () => {
    const PROP = "zoom";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  }); 

  it("cursor: pointer", () => { 
    const PROP = "cursor";
    const VALUE = "pointer";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("cursor (themeVar)", () => {
    const PROP = "cursor";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("wrapContent: true", () => {
    const PROP = "wrapContent";
    const VALUE = true;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.flexWrap).toBe("wrap");
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("wrapContent: false", () => {
    const PROP = "wrapContent";
    const VALUE = false;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.flexWrap).toBe("nowrap");
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("wrapContent (themeVar)", () => {
    const PROP = "wrapContent";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.flexWrap).toBe("nowrap");
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("canShrink: true", () => { 
    const PROP = "canShrink";
    const VALUE = true;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.flexShrink).toBe(1);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("canShrink: false", () => {
    const PROP = "canShrink";
    const VALUE = false;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.flexShrink).toBe(0);
    expect(result.issues.has(PROP)).toBe(false);
  }); 

  it("canShrink (themeVar)", () => {
    const PROP = "canShrink";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps.flexShrink).toBe(0);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("whiteSpace: nowrap", () => {
    const PROP = "whiteSpace";
    const VALUE = "nowrap";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("whiteSpace (themeVar)", () => {
    const PROP = "whiteSpace";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });

  it("transform", () => {
    const PROP = "transform";
    const VALUE = "rotate(23deg)";
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });
  
  it("transform (themeVar)", () => {
    const PROP = "transform";
    const VALUE = THEME_ID;
    const result = resolveLayoutProps({ [PROP]: VALUE });
    expect(result.cssProps[PROP]).toBe(THEME_ID_VALUE);
    expect(result.issues.has(PROP)).toBe(false);
  });
});
