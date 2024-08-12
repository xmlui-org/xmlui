import { describe, expect, it, test } from "vitest";
import { toCssVar } from "@parsers/style-parser/StyleParser";
import { compileLayout } from "@parsers/style-parser/style-compiler";

describe("Style parser - themes", () => {
  const themeIdCases = ["$mySize", "$my-size_lower"];
  const themeVarsForThemeIdCases = {
    mySize: "12px",
    "my-size_lower": "234px",
  };
  // --- width
  test.each(themeIdCases)(`width: %s`, (c) => {
    const result = compileLayout({ width: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.width).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- minWidth
  test.each(themeIdCases)(`minWidth: %s`, (c) => {
    const result = compileLayout({ minWidth: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.minWidth).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- maxWidth
  test.each(themeIdCases)(`maxWidth: %s`, (c) => {
    const result = compileLayout({ maxWidth: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.maxWidth).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- height
  test.each(themeIdCases)(`height: %s`, (c) => {
    const result = compileLayout({ height: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.height).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- minHeight
  test.each(themeIdCases)(`minHeight: %s`, (c) => {
    const result = compileLayout({ minHeight: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.minHeight).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- maxHeight
  test.each(themeIdCases)(`maxHeight: %s`, (c) => {
    const result = compileLayout({ maxHeight: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.maxHeight).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- padding
  test.each(themeIdCases)(`padding: %s`, (c) => {
    const result = compileLayout({ padding: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.padding).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- horizontalPadding
  test.each(themeIdCases)(`horizontalPadding: %s`, (c) => {
    const result = compileLayout({ horizontalPadding: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.paddingLeft).equal(toCssVar(c));
    expect(result.cssProps?.paddingRight).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- verticalPadding
  test.each(themeIdCases)(`verticalPadding: %s`, (c) => {
    const result = compileLayout({ verticalPadding: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.paddingTop).equal(toCssVar(c));
    expect(result.cssProps?.paddingBottom).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- paddingLeft
  test.each(themeIdCases)(`paddingLeft: %s`, (c) => {
    const result = compileLayout({ paddingLeft: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.paddingLeft).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- paddingRight
  test.each(themeIdCases)(`paddingRight: %s`, (c) => {
    const result = compileLayout({ paddingRight: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.paddingRight).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- paddingTop
  test.each(themeIdCases)(`paddingTop: %s`, (c) => {
    const result = compileLayout({ paddingTop: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.paddingTop).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- paddingBottom
  test.each(themeIdCases)(`paddingBottom: %s`, (c) => {
    const result = compileLayout({ paddingBottom: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.paddingBottom).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- horizontalOverflow
  test.each(themeIdCases)(`horizontalOverflow: %s`, (c) => {
    const result = compileLayout({ horizontalOverflow: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.overflowX).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- verticalOverflow
  test.each(themeIdCases)(`verticalOverflow: %s`, (c) => {
    const result = compileLayout({ verticalOverflow: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.overflowY).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- direction
  test.each(themeIdCases)(`direction: %s`, (c) => {
    const result = compileLayout({ direction: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.direction).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- fontFamily
  test.each(themeIdCases)(`fontFamily: %s`, (c) => {
    const result = compileLayout({ fontFamily: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.fontFamily).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- fontWeight
  test.each(themeIdCases)(`fontWeight: %s`, (c) => {
    const result = compileLayout({ fontWeight: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.fontWeight).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- zIndex
  test.each(themeIdCases)(`zIndex: %s`, (c) => {
    const result = compileLayout({ zIndex: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.zIndex).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- backgroundColor
  test.each(themeIdCases)(`backgroundColor: %s`, (c) => {
    const result = compileLayout({ backgroundColor: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.backgroundColor).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- color
  test.each(themeIdCases)(`color: %s`, (c) => {
    const result = compileLayout({ color: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.color).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  // --- italic
  test.each(themeIdCases)(`italic: %s`, (c) => {
    const result = compileLayout({ italic: c }, themeVarsForThemeIdCases);
    expect(result.cssProps?.fontStyle).equal(toCssVar(c));
    expect(result.issues).equal(undefined);
  });

  const borderProps = ["border", "borderTop", "borderRight", "borderBottom", "borderLeft"];
  const borderCases = [
    { src: "$myTheme", exp: `${toCssVar("$myTheme")}` },
    { src: "$myTheme 1px", exp: `${toCssVar("$myTheme")} 1px` },
    { src: "1px $myTheme", exp: `${toCssVar("$myTheme")} 1px` },
    { src: "$myTheme dotted", exp: `${toCssVar("$myTheme")} dotted` },
    { src: "dotted $myTheme", exp: `${toCssVar("$myTheme")} dotted` },
    { src: "$myTheme red", exp: `${toCssVar("$myTheme")} red` },
    { src: "red $myTheme", exp: `${toCssVar("$myTheme")} red` },
    { src: "1px dotted $myTheme", exp: `${toCssVar("$myTheme")} 1px dotted` },
    { src: "1px $myTheme dotted", exp: `${toCssVar("$myTheme")} 1px dotted` },
    { src: "dotted 1px $myTheme", exp: `${toCssVar("$myTheme")} 1px dotted` },
    { src: "dotted $myTheme 1px", exp: `${toCssVar("$myTheme")} 1px dotted` },
    { src: "1px red $myTheme", exp: `${toCssVar("$myTheme")} 1px red` },
    { src: "1px $myTheme red", exp: `${toCssVar("$myTheme")} 1px red` },
    { src: "red 1px $myTheme", exp: `${toCssVar("$myTheme")} 1px red` },
    { src: "red $myTheme 1px", exp: `${toCssVar("$myTheme")} 1px red` },
    { src: "$myTheme $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")}` },
    { src: "1px $myTheme $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} 1px` },
    { src: "$myTheme 1px $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} 1px` },
    { src: "$myTheme $otherTheme 1px", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} 1px` },
    { src: "dotted $myTheme $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} dotted` },
    { src: "$myTheme dotted $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} dotted` },
    { src: "$myTheme $otherTheme dotted", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} dotted` },
    { src: "red $myTheme $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} red` },
    { src: "$myTheme red $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} red` },
    { src: "$myTheme $otherTheme red", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} red` },
    {
      src: "$myTheme $otherTheme $third",
      exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} ${toCssVar("$third")}`,
    },
  ];

  borderProps.forEach((bc) => {
    borderCases.forEach((b) => {
      it(`${bc}: ${b.src}`, () => {
        const result = compileLayout({ [bc]: b.src }, {myTheme: "123px", otherTheme: "23px"});
        expect((result.cssProps as any)?.[bc]).equal(b.exp);
        expect(result.issues).equal(undefined);
      });
    });
  });

  // --- textDecoration with themeId
  const textDecorCases = [
    { src: "none", exp: `none` },
    { src: "$myTheme", exp: `${toCssVar("$myTheme")}` },
    { src: "$myTheme underline", exp: `${toCssVar("$myTheme")} underline` },
    { src: "underline $myTheme", exp: `${toCssVar("$myTheme")} underline` },
    { src: "$myTheme wavy", exp: `${toCssVar("$myTheme")} wavy` },
    { src: "wavy $myTheme", exp: `${toCssVar("$myTheme")} wavy` },
    { src: "$myTheme red", exp: `${toCssVar("$myTheme")} red` },
    { src: "$myTheme underline wavy", exp: `${toCssVar("$myTheme")} underline wavy` },
    { src: "underline $myTheme wavy", exp: `${toCssVar("$myTheme")} underline wavy` },
    { src: "underline wavy $myTheme", exp: `${toCssVar("$myTheme")} underline wavy` },
    { src: "$myTheme underline red", exp: `${toCssVar("$myTheme")} underline red` },
    { src: "underline $myTheme red", exp: `${toCssVar("$myTheme")} underline red` },
    { src: "$myTheme $otherTheme underline", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} underline` },
    { src: "underline $myTheme $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} underline` },
    { src: "$myTheme underline $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} underline` },
    { src: "$myTheme $otherTheme wavy", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} wavy` },
    { src: "wavy $myTheme $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} wavy` },
    { src: "$myTheme wavy $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} wavy` },
    { src: "$myTheme $otherTheme red", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} red` },
    { src: "red $myTheme $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} red` },
    { src: "$myTheme red $otherTheme", exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} red` },
    {
      src: "$myTheme $otherTheme $third",
      exp: `${toCssVar("$myTheme")} ${toCssVar("$otherTheme")} ${toCssVar("$third")}`,
    },
  ];
  textDecorCases.forEach((c) =>
    it(`textDecoration: ${c.src}`, () => {
      const result = compileLayout({ textDecoration: c.src }, {myTheme: "123px", otherTheme: "23px"});
      expect(result.cssProps?.textDecoration).equal(c.exp);
      expect(result.issues).equal(undefined);
    })
  );

  const radiusProps = [
    {
      prop: "radius",
      css: "borderRadius",
    },
    {
      prop: "radiusTopLeft",
      css: "borderTopLeftRadius",
    },
    {
      prop: "radiusTopRight",
      css: "borderTopRightRadius",
    },
    {
      prop: "radiusBottomLeft",
      css: "borderBottomLeftRadius",
    },
    {
      prop: "radiusBottomRight",
      css: "borderBottomRightRadius",
    },
  ];
  const radiusCases = [
    { src: "$myTheme", exp: `${toCssVar("$myTheme")}` },
    { src: "$myTheme 10px", exp: `${toCssVar("$myTheme")} / 10px` },
    { src: "10px $myTheme", exp: `10px / ${toCssVar("$myTheme")}` },
    { src: "$myTheme $otherTheme", exp: `${toCssVar("$myTheme")} / ${toCssVar("$otherTheme")}` },
  ];

  radiusProps.forEach((rc) => {
    radiusCases.forEach((b) => {
      it(`${rc.prop}: ${b.src}`, () => {
        const result = compileLayout({ [rc.prop]: b.src }, {myTheme: "123px", otherTheme: "23px"});
        expect((result.cssProps as any)?.[rc.css]).equal(b.exp);
        expect(result.issues).equal(undefined);
      });
    });
  });

  const shadowCases = [{ src: "$myTheme", exp: `${toCssVar("$myTheme")}` }];
  shadowCases.forEach((b) => {
    it(`shadow: ${b.src}`, () => {
      const result = compileLayout({ shadow: b.src }, {myTheme: "123px"});
      expect(result.cssProps?.boxShadow).equal(b.exp);
      expect(result.issues).equal(undefined);
    });
  });
});
