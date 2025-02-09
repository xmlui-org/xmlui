import { describe, expect, it } from "vitest";
import { compileLayout } from "../../../src/parsers/style-parser/style-compiler";
import { toCssVar } from "../../../src/parsers/style-parser/StyleParser";

describe("Style compiler", () => {
  const sizeCases = ["0", "1px", "2.5rem", "50%", "4vmin", "1*"];
  const sizeErrorCases = ["12wavy", "12dotted"];
  const sizeTailCases = ["0 blabla", "2em 23"];

  // --- width
  sizeCases.forEach((c) =>
    it(`width: ${c}`, () => {
      const result = compileLayout({ width: c });
      expect(result.cssProps?.width).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`width (horizontal parent): ${c}`, () => {
      const result = compileLayout({ width: c }, {}, { type: "Stack", orientation: "horizontal" });
      expect(result.cssProps?.width).equal(c);
      expect(result.cssProps?.flexShrink).equal(c.endsWith("*") ? 1 : 0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`width (vertical parent): ${c}`, () => {
      const result = compileLayout({ width: c }, {}, { type: "Stack", orientation: "vertical" });
      expect(result.cssProps?.width).equal(c);
      expect(result.cssProps?.flexShrink).equal(0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeErrorCases.forEach((c) =>
    it(`width error: ${c}`, () => {
      const result = compileLayout({ width: c });
      expect(result.cssProps?.width).equal(c);
      expect(result.issues?.["width"]).contains("Unexpected");
    }),
  );

  sizeTailCases.forEach((c) =>
    it(`width tail error: ${c}`, () => {
      const result = compileLayout({ width: c });
      expect(result.cssProps?.width).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues?.["width"]).contains("tail");
    }),
  );

  // --- minWidth
  sizeCases.forEach((c) =>
    it(`minWidth: ${c}`, () => {
      const result = compileLayout({ minWidth: c });
      expect(result.cssProps?.minWidth).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`minWidth (horizontal parent): ${c}`, () => {
      const result = compileLayout(
        { minWidth: c },
        {},
        { type: "Stack", orientation: "horizontal" },
      );
      expect(result.cssProps?.minWidth).equal(c);
      expect(result.cssProps?.flexShrink).equal(0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`minWidth (vertical parent): ${c}`, () => {
      const result = compileLayout({ minWidth: c }, {}, { type: "Stack", orientation: "vertical" });
      expect(result.cssProps?.minWidth).equal(c);
      expect(result.cssProps?.flexShrink).equal(0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeErrorCases.forEach((c) =>
    it(`minWidth error: ${c}`, () => {
      const result = compileLayout({ minWidth: c });
      expect(result.cssProps?.minWidth).equal(c);
      expect(result.issues?.["minWidth"]).contains("Unexpected");
    }),
  );

  // --- maxWidth
  sizeCases.forEach((c) =>
    it(`maxWidth: ${c}`, () => {
      const result = compileLayout({ maxWidth: c });
      expect(result.cssProps?.maxWidth).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`maxWidth (horizontal parent): ${c}`, () => {
      const result = compileLayout(
        { maxWidth: c },
        {},
        { type: "Stack", orientation: "horizontal" },
      );
      expect(result.cssProps?.maxWidth).equal(c);
      expect(result.cssProps?.flexShrink).equal(0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`maxWidth (vertical parent): ${c}`, () => {
      const result = compileLayout({ maxWidth: c }, {}, { type: "Stack", orientation: "vertical" });
      expect(result.cssProps?.maxWidth).equal(c);
      expect(result.cssProps?.flexShrink).equal(0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeErrorCases.forEach((c) =>
    it(`maxWidth error: ${c}`, () => {
      const result = compileLayout({ maxWidth: c });
      expect(result.cssProps?.maxWidth).equal(c);
      expect(result.issues?.["maxWidth"]).contains("Unexpected");
    }),
  );

  // --- height
  sizeCases.forEach((c) =>
    it(`height: ${c}`, () => {
      const result = compileLayout({ height: c });
      expect(result.cssProps?.height).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`height (vertical parent): ${c}`, () => {
      const result = compileLayout({ height: c }, {}, { type: "Stack", orientation: "vertical" });
      expect(result.cssProps?.height).equal(c);
      if (c.endsWith("*")) {
        expect(result.cssProps?.flexShrink).equal(1);
        expect(result.cssProps?.flex).equal(1);
      } else {
        expect(result.cssProps?.flexShrink).equal(0);
        expect(result.cssProps?.flex).equal(undefined);
      }
      expect(result.issues).equal(undefined);
    }),
  );

  it(`height (vertical parent): 25%`, () => {
    const result = compileLayout({ height: "25%" }, {}, { type: "Stack", orientation: "vertical" });
    expect(result.cssProps?.height).equal("25%");
    expect(result.cssProps?.flexShrink).equal(0);
    expect(result.cssProps?.flex).equal(undefined);
    expect(result.issues).equal(undefined);
  });

  sizeCases.forEach((c) =>
    it(`height (horizontal parent): ${c}`, () => {
      const result = compileLayout({ height: c }, {}, { type: "Stack", orientation: "horizontal" });
      expect(result.cssProps?.height).equal(c);
      expect(result.cssProps?.flexShrink).equal(0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeErrorCases.forEach((c) =>
    it(`height error: ${c}`, () => {
      const result = compileLayout({ height: c });
      expect(result.cssProps?.height).equal(c);
      expect(result.issues?.["height"]).contains("Unexpected");
    }),
  );

  // --- minHeight
  sizeCases.forEach((c) =>
    it(`minHeight: ${c}`, () => {
      const result = compileLayout({ minHeight: c });
      expect(result.cssProps?.minHeight).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`minHeight (vertical parent): ${c}`, () => {
      const result = compileLayout(
        { minHeight: c },
        {},
        { type: "Stack", orientation: "vertical" },
      );
      expect(result.cssProps?.minHeight).equal(c);
      expect(result.cssProps?.flexShrink).equal(0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`minHeight (horizontal parent): ${c}`, () => {
      const result = compileLayout(
        { minHeight: c },
        {},
        { type: "Stack", orientation: "horizontal" },
      );
      expect(result.cssProps?.minHeight).equal(c);
      expect(result.cssProps?.flexShrink).equal(0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeErrorCases.forEach((c) =>
    it(`minHeight error: ${c}`, () => {
      const result = compileLayout({ minHeight: c });
      expect(result.cssProps?.minHeight).equal(c);
      expect(result.issues?.["minHeight"]).contains("Unexpected");
    }),
  );

  // --- maxHeight
  sizeCases.forEach((c) =>
    it(`maxHeight: ${c}`, () => {
      const result = compileLayout({ maxHeight: c });
      expect(result.cssProps?.maxHeight).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`maxHeight (vertical parent): ${c}`, () => {
      const result = compileLayout(
        { maxHeight: c },
        {},
        { type: "Stack", orientation: "vertical" },
      );
      expect(result.cssProps?.maxHeight).equal(c);
      expect(result.cssProps?.flexShrink).equal(0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeCases.forEach((c) =>
    it(`maxHeight (horizontal parent): ${c}`, () => {
      const result = compileLayout(
        { maxHeight: c },
        {},
        { type: "Stack", orientation: "horizontal" },
      );
      expect(result.cssProps?.maxHeight).equal(c);
      expect(result.cssProps?.flexShrink).equal(0);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeErrorCases.forEach((c) =>
    it(`maxHeight error: ${c}`, () => {
      const result = compileLayout({ maxHeight: c });
      expect(result.cssProps?.maxHeight).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues?.["maxHeight"]).contains("Unexpected");
    }),
  );

  // --- top
  sizeCases.forEach((c) =>
    it(`top: ${c}`, () => {
      const result = compileLayout({ top: c });
      expect(result.cssProps?.top).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeErrorCases.forEach((c) =>
    it(`top error: ${c}`, () => {
      const result = compileLayout({ top: c });
      expect(result.cssProps?.top).equal(c);
      expect(result.issues?.["top"]).contains("Unexpected");
    }),
  );

  sizeTailCases.forEach((c) =>
    it(`top tail error: ${c}`, () => {
      const result = compileLayout({ top: c });
      expect(result.cssProps?.top).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues?.["top"]).contains("tail");
    }),
  );

  // --- right
  sizeCases.forEach((c) =>
    it(`right: ${c}`, () => {
      const result = compileLayout({ right: c });
      expect(result.cssProps?.right).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeErrorCases.forEach((c) =>
    it(`right error: ${c}`, () => {
      const result = compileLayout({ right: c });
      expect(result.cssProps?.right).equal(c);
      expect(result.issues?.["right"]).contains("Unexpected");
    }),
  );

  sizeTailCases.forEach((c) =>
    it(`right tail error: ${c}`, () => {
      const result = compileLayout({ right: c });
      expect(result.cssProps?.right).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues?.["right"]).contains("tail");
    }),
  );

  // --- bottom
  sizeCases.forEach((c) =>
    it(`bottom: ${c}`, () => {
      const result = compileLayout({ bottom: c });
      expect(result.cssProps?.bottom).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeErrorCases.forEach((c) =>
    it(`bottom error: ${c}`, () => {
      const result = compileLayout({ bottom: c });
      expect(result.cssProps?.bottom).equal(c);
      expect(result.issues?.["bottom"]).contains("Unexpected");
    }),
  );

  sizeTailCases.forEach((c) =>
    it(`bottom tail error: ${c}`, () => {
      const result = compileLayout({ bottom: c });
      expect(result.cssProps?.bottom).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues?.["bottom"]).contains("tail");
    }),
  );

  // --- left
  sizeCases.forEach((c) =>
    it(`left: ${c}`, () => {
      const result = compileLayout({ left: c });
      expect(result.cssProps?.left).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  sizeErrorCases.forEach((c) =>
    it(`left error: ${c}`, () => {
      const result = compileLayout({ left: c });
      expect(result.cssProps?.left).equal(c);
      expect(result.issues?.["left"]).contains("Unexpected");
    }),
  );

  sizeTailCases.forEach((c) =>
    it(`left tail error: ${c}`, () => {
      const result = compileLayout({ left: c });
      expect(result.cssProps?.left).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues?.["left"]).contains("tail");
    }),
  );

  // --- borderThickness
  sizeCases.forEach((c) =>
    it(`borderThickness: ${c}`, () => {
      const result = compileLayout({ borderThickness: c });
      expect(result.cssProps?.borderWidth).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  const scrollingCases = ["visible", "hidden", "scroll"];

  const scrollingErrorCases = ["1", "12 px", "12 %"];

  const scrollingTailCases = ["visible blabla", "hidden 123"];

  // --- horizontalOverflow
  scrollingCases.forEach((c) =>
    it(`horizontalOverflow: ${c}`, () => {
      const result = compileLayout({ horizontalOverflow: c });
      expect(result.cssProps?.overflowX).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  scrollingErrorCases.forEach((c) =>
    it(`horizontalOverflow error: ${c}`, () => {
      const result = compileLayout({ horizontalOverflow: c });
      expect(result.cssProps?.overflowX).equal(c);
      expect(result.issues?.["horizontalOverflow"]).contains("scrolling");
    }),
  );

  scrollingTailCases.forEach((c) =>
    it(`horizontalOverflow tail: ${c}`, () => {
      const result = compileLayout({ horizontalOverflow: c });
      expect(result.cssProps?.overflowX).equal(c);
      expect(result.issues?.["horizontalOverflow"]).contains("tail");
    }),
  );

  // --- verticalOverflow
  scrollingCases.forEach((c) =>
    it(`verticalOverflow: ${c}`, () => {
      const result = compileLayout({ verticalOverflow: c });
      expect(result.cssProps?.overflowY).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  scrollingErrorCases.forEach((c) =>
    it(`verticalOverflow error: ${c}`, () => {
      const result = compileLayout({ verticalOverflow: c });
      expect(result.cssProps?.overflowY).equal(c);
      expect(result.issues?.["verticalOverflow"]).contains("scrolling");
    }),
  );

  const directionCases = ["ltr", "rtl"];

  const directionErrorCases = ["asd", "12 px", "12 %"];

  const directionTailCases = ["ltr blabla", "rtl 123"];

  // --- direction
  directionCases.forEach((c) =>
    it(`direction: ${c}`, () => {
      const result = compileLayout({ direction: c });
      expect(result.cssProps?.direction).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  directionErrorCases.forEach((c) =>
    it(`direction error: ${c}`, () => {
      const result = compileLayout({ direction: c });
      expect(result.cssProps?.direction).equal(c);
      expect(result.issues?.["direction"]).contains("direction");
    }),
  );

  directionTailCases.forEach((c) =>
    it(`direction tail: ${c}`, () => {
      const result = compileLayout({ direction: c });
      expect(result.cssProps?.direction).equal(c);
      expect(result.issues?.["direction"]).contains("tail");
    }),
  );

  // --- FontFamily

  const fontFamilyCases = ["serif", "sansSerif", "mono"];

  const fontFamilyErrorCases = ["solid", "12 px", "12 %"];

  const fontFamilyTailCases = ["sansSerif 12", "$fontFamily serif"];

  fontFamilyCases.forEach((c) =>
    it(`fontFamily: ${c}`, () => {
      const result = compileLayout({ fontFamily: c });
      expect(result.cssProps?.fontFamily).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  fontFamilyErrorCases.forEach((c) =>
    it(`fontFamily error: ${c}`, () => {
      const result = compileLayout({ fontFamily: c });
      expect(result.cssProps?.fontFamily).equal(c);
      expect(result.issues?.["fontFamily"]).contains("fontFamily");
    }),
  );

  fontFamilyTailCases.forEach((c) =>
    it(`fontFamily tail: ${c}`, () => {
      const result = compileLayout({ fontFamily: c });
      expect(result.cssProps?.fontFamily).equal(c);
      expect(result.issues?.["fontFamily"]).contains("tail");
    }),
  );

  // --- FontWeight

  const fontWeightCases = ["lighter", "normal", "bold", "bolder", "100", "400"];

  const fontWeightErrorCases = ["solid", "12 px", "12 %"];

  const fontWeightTailCases = ["bold 12px", "100 rem"];

  fontWeightCases.forEach((c) =>
    it(`fontWeight: ${c}`, () => {
      const result = compileLayout({ fontWeight: c });
      expect(result.cssProps?.fontWeight).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  fontWeightErrorCases.forEach((c) =>
    it(`fontWeight error: ${c}`, () => {
      const result = compileLayout({ fontWeight: c });
      expect(result.cssProps?.fontWeight).equal(c);
      expect(result.issues?.["fontWeight"]).contains("fontWeight");
    }),
  );

  fontWeightTailCases.forEach((c) =>
    it(`fontWeight tail: ${c}`, () => {
      const result = compileLayout({ fontWeight: c });
      expect(result.cssProps?.fontWeight).equal(c);
      expect(result.issues?.["fontWeight"]).contains("tail");
    }),
  );

  // --- zIndex

  const zIndexCases = ["-1", "0", "1", "99"];

  const zIndexErrorCases = ["10%", "1px solid red", "22px"];

  const zIndexTailCases = ["1 12px", "100 rem"];

  zIndexCases.forEach((c) =>
    it(`zIndex: ${c}`, () => {
      const result = compileLayout({ zIndex: c });
      expect(result.cssProps?.zIndex).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  zIndexErrorCases.forEach((c) =>
    it(`zIndex error: ${c}`, () => {
      const result = compileLayout({ zIndex: c });
      expect(result.cssProps?.zIndex).equal(c);
      expect(result.issues?.["zIndex"]).contains("zIndex");
    }),
  );

  zIndexTailCases.forEach((c) =>
    it(`zIndex tail: ${c}`, () => {
      const result = compileLayout({ zIndex: c });
      expect(result.cssProps?.zIndex).equal(c);
      expect(result.issues?.["zIndex"]).contains("tail");
    }),
  );

  const borderCases = [
    { src: "1px", exp: "1px" },
    { src: "dotted", exp: "dotted" },
    { src: "blue", exp: "blue" },
    { src: "1px dotted", exp: "1px dotted" },
    { src: "dotted 1px", exp: "1px dotted" },
    { src: "1px blue", exp: "1px blue" },
    { src: "blue 1px", exp: "1px blue" },
    { src: "1px dotted blue", exp: "1px dotted blue" },
    { src: "1px blue dotted", exp: "1px dotted blue" },
    { src: "dotted 1px blue", exp: "1px dotted blue" },
    { src: "dotted blue 1px", exp: "1px dotted blue" },
    { src: "blue dotted 1px", exp: "1px dotted blue" },
    { src: "blue 1px dotted", exp: "1px dotted blue" },
    { src: "3px solid #444444", exp: "3px solid #444444" },
  ];

  const borderErrorCases = ["bold", "start", "end"];

  const borderTailCases = ["1px solid red start", "blue 1px solid end", "dotted blue 2px bold"];

  // --- border
  borderCases.forEach((c) =>
    it(`border: ${c.src}`, () => {
      const result = compileLayout({ border: c.src });
      expect(result.cssProps?.border).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  borderErrorCases.forEach((c) =>
    it(`border error: ${c}`, () => {
      const result = compileLayout({ border: c });
      expect(result.cssProps?.border).equal(c);
      expect(result.issues?.["border"]).contains("Unexpected");
    }),
  );

  borderTailCases.forEach((c) =>
    it(`border tail: ${c}`, () => {
      const result = compileLayout({ border: c });
      expect(result.cssProps?.border).equal(c);
      expect(result.issues?.["border"]).contains("tail");
    }),
  );

  // --- borderTop
  borderCases.forEach((c) =>
    it(`borderTop: ${c.src}`, () => {
      const result = compileLayout({ borderTop: c.src });
      expect(result.cssProps?.borderTop).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  borderErrorCases.forEach((c) =>
    it(`borderTop error: ${c}`, () => {
      const result = compileLayout({ borderTop: c });
      expect(result.cssProps?.borderTop).equal(c);
      expect(result.issues?.["borderTop"]).contains("Unexpected");
    }),
  );

  borderTailCases.forEach((c) =>
    it(`borderTop tail: ${c}`, () => {
      const result = compileLayout({ borderTop: c });
      expect(result.cssProps?.borderTop).equal(c);
      expect(result.issues?.["borderTop"]).contains("tail");
    }),
  );

  // --- borderRight
  borderCases.forEach((c) =>
    it(`borderRight: ${c.src}`, () => {
      const result = compileLayout({ borderRight: c.src });
      expect(result.cssProps?.borderRight).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  borderErrorCases.forEach((c) =>
    it(`borderRight error: ${c}`, () => {
      const result = compileLayout({ borderRight: c });
      expect(result.cssProps?.borderRight).equal(c);
      expect(result.issues?.["borderRight"]).contains("Unexpected");
    }),
  );

  borderTailCases.forEach((c) =>
    it(`borderRight tail: ${c}`, () => {
      const result = compileLayout({ borderRight: c });
      expect(result.cssProps?.borderRight).equal(c);
      expect(result.issues?.["borderRight"]).contains("tail");
    }),
  );

  // --- borderBottom
  borderCases.forEach((c) =>
    it(`borderBottom: ${c.src}`, () => {
      const result = compileLayout({ borderBottom: c.src });
      expect(result.cssProps?.borderBottom).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  borderErrorCases.forEach((c) =>
    it(`borderBottom error: ${c}`, () => {
      const result = compileLayout({ borderBottom: c });
      expect(result.cssProps?.borderBottom).equal(c);
      expect(result.issues?.["borderBottom"]).contains("Unexpected");
    }),
  );

  borderTailCases.forEach((c) =>
    it(`borderBottom tail: ${c}`, () => {
      const result = compileLayout({ borderBottom: c });
      expect(result.cssProps?.borderBottom).equal(c);
      expect(result.issues?.["borderBottom"]).contains("tail");
    }),
  );

  // --- borderLeft
  borderCases.forEach((c) =>
    it(`borderLeft: ${c.src}`, () => {
      const result = compileLayout({ borderLeft: c.src });
      expect(result.cssProps?.borderLeft).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  borderErrorCases.forEach((c) =>
    it(`borderLeft error: ${c}`, () => {
      const result = compileLayout({ borderLeft: c });
      expect(result.cssProps?.borderLeft).equal(c);
      expect(result.issues?.["borderLeft"]).contains("Unexpected");
    }),
  );

  borderTailCases.forEach((c) =>
    it(`borderLeft tail: ${c}`, () => {
      const result = compileLayout({ borderLeft: c });
      expect(result.cssProps?.borderLeft).equal(c);
      expect(result.issues?.["borderLeft"]).contains("tail");
    }),
  );

  const textDecorationCases = [
    { src: "underline", exp: "underline" },
    { src: "wavy", exp: "wavy" },
    { src: "red", exp: "red" },
    { src: "underline wavy", exp: "underline wavy" },
    { src: "wavy underline", exp: "underline wavy" },
    { src: "underline wavy red", exp: "underline wavy red" },
    { src: "underline red wavy", exp: "underline wavy red" },
    { src: "red underline wavy", exp: "underline wavy red" },
    { src: "red wavy underline", exp: "underline wavy red" },
    { src: "wavy red underline", exp: "underline wavy red" },
    { src: "wavy underline red", exp: "underline wavy red" },
  ];

  const textDecorationErrorCases = ["bold", "start", "end"];

  const textDecorationTailCases = [
    "underline solid red start",
    "wavy overline blue end",
    "line-through dashed red bold",
  ];

  textDecorationCases.forEach((c) =>
    it(`textDecoration: ${c.src}`, () => {
      const result = compileLayout({ textDecoration: c.src });
      expect(result.cssProps?.textDecoration).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  textDecorationErrorCases.forEach((c) =>
    it(`textDecoration error: ${c}`, () => {
      const result = compileLayout({ textDecoration: c });
      expect(result.cssProps?.textDecoration).equal(c);
      expect(result.issues?.["textDecoration"]).contains("Unexpected");
    }),
  );

  textDecorationTailCases.forEach((c) =>
    it(`textDecoration tail: ${c}`, () => {
      const result = compileLayout({ textDecoration: c });
      expect(result.cssProps?.textDecoration).equal(c);
      expect(result.issues?.["textDecoration"]).contains("tail");
    }),
  );

  const radiusCases = [
    { src: "4px", exp: "4px" },
    { src: "20rem", exp: "20rem" },
    { src: "50%", exp: "50%" },
    { src: "2px 25%", exp: "2px / 25%" },
    { src: "0", exp: "0" },
  ];
  const radiusErrorCases = ["bold", "start", "end"];
  const radiusTailCases = ["2px 25% 23px 34% start"];

  // --- radius
  radiusCases.forEach((c) =>
    it(`radius: ${c}`, () => {
      const result = compileLayout({ radius: c.src });
      expect(result.cssProps?.borderRadius).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  radiusErrorCases.forEach((c) =>
    it(`radius error: ${c}`, () => {
      const result = compileLayout({ radius: c });
      expect(result.cssProps?.borderRadius).equal(c);
      expect(result.issues?.["radius"]).contains("numeric");
    }),
  );

  radiusTailCases.forEach((c) =>
    it(`radius tail: ${c}`, () => {
      const result = compileLayout({ radius: c });
      expect(result.cssProps?.borderRadius).equal(c);
      expect(result.issues?.["radius"]).contains("tail");
    }),
  );

  // --- radiusTopLeft
  radiusCases.forEach((c) =>
    it(`radiusTopLeft: ${c}`, () => {
      const result = compileLayout({ radiusTopLeft: c.src });
      expect(result.cssProps?.borderTopLeftRadius).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  radiusErrorCases.forEach((c) =>
    it(`radiusTopLeft error: ${c}`, () => {
      const result = compileLayout({ radiusTopLeft: c });
      expect(result.cssProps?.borderTopLeftRadius).equal(c);
      expect(result.issues?.["radiusTopLeft"]).contains("numeric");
    }),
  );

  radiusTailCases.forEach((c) =>
    it(`radiusTopLeft tail: ${c}`, () => {
      const result = compileLayout({ radiusTopLeft: c });
      expect(result.cssProps?.borderTopLeftRadius).equal(c);
      expect(result.issues?.["radiusTopLeft"]).contains("tail");
    }),
  );

  // --- radiusTopRight
  radiusCases.forEach((c) =>
    it(`radiusTopRight: ${c}`, () => {
      const result = compileLayout({ radiusTopRight: c.src });
      expect(result.cssProps?.borderTopRightRadius).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  radiusErrorCases.forEach((c) =>
    it(`radiusTopRight error: ${c}`, () => {
      const result = compileLayout({ radiusTopRight: c });
      expect(result.cssProps?.borderTopRightRadius).equal(c);
      expect(result.issues?.["radiusTopRight"]).contains("numeric");
    }),
  );

  radiusTailCases.forEach((c) =>
    it(`radiusTopRight tail: ${c}`, () => {
      const result = compileLayout({ radiusTopRight: c });
      expect(result.cssProps?.borderTopRightRadius).equal(c);
      expect(result.issues?.["radiusTopRight"]).contains("tail");
    }),
  );

  // --- radiusBottomLeft
  radiusCases.forEach((c) =>
    it(`radiusBottomLeft: ${c}`, () => {
      const result = compileLayout({ radiusBottomLeft: c.src });
      expect(result.cssProps?.borderBottomLeftRadius).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  radiusErrorCases.forEach((c) =>
    it(`radiusBottomLeft error: ${c}`, () => {
      const result = compileLayout({ radiusBottomLeft: c });
      expect(result.cssProps?.borderBottomLeftRadius).equal(c);
      expect(result.issues?.["radiusBottomLeft"]).contains("numeric");
    }),
  );

  radiusTailCases.forEach((c) =>
    it(`radiusBottomLeft tail: ${c}`, () => {
      const result = compileLayout({ radiusBottomLeft: c });
      expect(result.cssProps?.borderBottomLeftRadius).equal(c);
      expect(result.issues?.["radiusBottomLeft"]).contains("tail");
    }),
  );

  // --- radiusBottomRight
  radiusCases.forEach((c) =>
    it(`radiusBottomRight: ${c}`, () => {
      const result = compileLayout({ radiusBottomRight: c.src });
      expect(result.cssProps?.borderBottomRightRadius).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  radiusErrorCases.forEach((c) =>
    it(`radiusBottomRight error: ${c}`, () => {
      const result = compileLayout({ radiusBottomRight: c });
      expect(result.cssProps?.borderBottomRightRadius).equal(c);
      expect(result.issues?.["radiusBottomRight"]).contains("numeric");
    }),
  );

  radiusTailCases.forEach((c) =>
    it(`radiusBottomRight tail: ${c}`, () => {
      const result = compileLayout({ radiusBottomRight: c });
      expect(result.cssProps?.borderBottomRightRadius).equal(c);
      expect(result.issues?.["radiusBottomRight"]).contains("tail");
    }),
  );

  const shadowCases = [
    "10px 10px",
    "inset 10px 10px",
    "10px 10px 20%",
    "inset 10px 10px 20%",
    "10px 10px 20% 5rem",
    "inset 10px 10px 20% 5rem",
    "10px 10px 20% 5rem green",
    "10px 10px 20% 5rem #808080",
    "inset 10px 10px 20% 5rem green",
    "10px 10px green",
    "inset 10px 10px green",
    "10px 10px 20% green",
    "inset 10px 10px 20% green",
    "10px 10px, 20px 20px",
    "inset 10px 10px, 20px 20px 5rem yellow",
  ];

  shadowCases.forEach((c) =>
    it(`shadow: ${c}`, () => {
      const result = compileLayout({ shadow: c });
      expect(result.cssProps?.boxShadow).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const alignmentCases = ["start", "center", "end"];

  alignmentCases.forEach((c) =>
    it(`horizontalAlignment: ${c}`, () => {
      const result = compileLayout({ horizontalAlignment: c });
      expect(result.nonCssProps.horizontalAlignment).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  alignmentCases.forEach((c) =>
    it(`verticalAlignment: ${c}`, () => {
      const result = compileLayout({ verticalAlignment: c });
      expect(result.nonCssProps.verticalAlignment).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const userSelectCases = ["none", "auto", "all", "text", "contain"];

  userSelectCases.forEach((c) =>
    it(`userSelect: ${c}`, () => {
      const result = compileLayout({ userSelect: c });
      expect(result.cssProps?.userSelect).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const textTransformCases = [
    "none",
    "capitalize",
    "uppercase",
    "lowercase",
    "full-width",
    "full-size-kana",
  ];

  textTransformCases.forEach((c) =>
    it(`textTransform: ${c}`, () => {
      const result = compileLayout({ textTransform: c });
      expect(result.cssProps?.textTransform).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const orientationCases = ["horizontal", "vertical"];

  orientationCases.forEach((c) =>
    it(`orientation: ${c}`, () => {
      const result = compileLayout({ orientation: c });
      expect(result.nonCssProps.orientation).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const paddingCases = ["0", "10px", "50%", "3rem"];

  // --- padding
  paddingCases.forEach((c) =>
    it(`padding: ${c}`, () => {
      const result = compileLayout({ padding: c });
      expect(result.cssProps?.padding).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  // --- horizontalPadding
  paddingCases.forEach((c) =>
    it(`horizontalPadding: ${c}`, () => {
      const result = compileLayout({ horizontalPadding: c });
      expect(result.cssProps?.paddingLeft).equal(c);
      expect(result.cssProps?.paddingRight).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  // --- verticalPadding
  paddingCases.forEach((c) =>
    it(`verticalPadding: ${c}`, () => {
      const result = compileLayout({ verticalPadding: c });
      expect(result.cssProps?.paddingTop).equal(c);
      expect(result.cssProps?.paddingBottom).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  // --- leftPadding
  paddingCases.forEach((c) =>
    it(`paddingLeft #1: ${c}`, () => {
      const result = compileLayout({ paddingLeft: c });
      expect(result.cssProps?.paddingLeft).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  paddingCases.forEach((c) =>
    it(`paddingLeft #2: ${c}`, () => {
      const result = compileLayout({ paddingLeft: c, horizontalPadding: "20%" });
      expect(result.cssProps?.paddingLeft).equal(c);
      expect(result.cssProps?.paddingRight).equal("20%");
      expect(result.issues).equal(undefined);
    }),
  );

  // --- rightPadding
  paddingCases.forEach((c) =>
    it(`paddingRight #1: ${c}`, () => {
      const result = compileLayout({ paddingRight: c });
      expect(result.cssProps?.paddingRight).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  it(`paddingRight #2: 50%`, () => {
    const result = compileLayout({ paddingRight: "50%", horizontalPadding: "20%" });
    expect(result.cssProps?.paddingRight).equal("50%");
    expect(result.cssProps?.paddingLeft).equal("20%");
    expect(result.issues).equal(undefined);
  });

  paddingCases.forEach((c) =>
    it(`paddingRight #2: ${c}`, () => {
      const result = compileLayout({ paddingRight: c, horizontalPadding: "20%" });
      expect(result.cssProps?.paddingRight).equal(c);
      expect(result.cssProps?.paddingLeft).equal("20%");
      expect(result.issues).equal(undefined);
    }),
  );

  // --- topPadding
  paddingCases.forEach((c) =>
    it(`paddingTop #1: ${c}`, () => {
      const result = compileLayout({ paddingTop: c });
      expect(result.cssProps?.paddingTop).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  paddingCases.forEach((c) =>
    it(`paddingTop #2: ${c}`, () => {
      const result = compileLayout({ paddingTop: c, verticalPadding: "20%" });
      expect(result.cssProps?.paddingTop).equal(c);
      expect(result.cssProps?.paddingBottom).equal("20%");
      expect(result.issues).equal(undefined);
    }),
  );

  // --- bottomPadding
  paddingCases.forEach((c) =>
    it(`paddingBottom #1: ${c}`, () => {
      const result = compileLayout({ paddingBottom: c });
      expect(result.cssProps?.paddingBottom).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  paddingCases.forEach((c) =>
    it(`paddingBottom #2: ${c}`, () => {
      const result = compileLayout({ paddingBottom: c, verticalPadding: "20%" });
      expect(result.cssProps?.paddingBottom).equal(c);
      expect(result.cssProps?.paddingTop).equal("20%");
      expect(result.issues).equal(undefined);
    }),
  );

  const colorCases = ["red", "rgb(100, 200, 250)", "#00aabbcc"];

  colorCases.forEach((c) =>
    it(`color: ${c}`, () => {
      const result = compileLayout({ color: c });
      expect(result.cssProps?.color).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  colorCases.forEach((c) =>
    it(`backgroundColor: ${c}`, () => {
      const result = compileLayout({ backgroundColor: c });
      expect(result.cssProps?.backgroundColor).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  colorCases.forEach((c) =>
    it(`borderColor: ${c}`, () => {
      const result = compileLayout({ borderColor: c });
      expect(result.cssProps?.borderColor).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const fontSizeCases = ["0", "10px", "50%", "3rem"];

  fontSizeCases.forEach((c) =>
    it(`fontSize: ${c}`, () => {
      const result = compileLayout({ fontSize: c });
      expect(result.cssProps?.fontSize).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const italicCases = [
    { src: "true", exp: "italic" },
    { src: "yes", exp: "italic" },
    { src: "on", exp: "italic" },
    { src: "false", exp: "normal" },
    { src: "no", exp: "normal" },
    { src: "off", exp: "normal" },
  ];

  italicCases.forEach((c) =>
    it(`italic: ${c.src}`, () => {
      const result = compileLayout({ italic: c.src });
      expect(result.cssProps?.fontStyle).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  const wrapCases = [
    { src: "true", exp: "wrap" },
    { src: "yes", exp: "wrap" },
    { src: "on", exp: "wrap" },
    { src: "false", exp: "nowrap" },
    { src: "no", exp: "nowrap" },
    { src: "off", exp: "nowrap" },
  ];

  wrapCases.forEach((c) =>
    it(`wrapContent: ${c.src}`, () => {
      const result = compileLayout({ wrapContent: c.src });
      expect(result.cssProps?.flexWrap).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  const shrinkCases = [
    { src: "true", exp: "1" },
    { src: "yes", exp: "1" },
    { src: "on", exp: "1" },
    { src: "false", exp: "0" },
    { src: "no", exp: "0" },
    { src: "off", exp: "0" },
  ];

  shrinkCases.forEach((c) =>
    it(`canShrink: ${c.src}`, () => {
      const result = compileLayout({ canShrink: c.src });
      expect(result.cssProps?.flexShrink).equal(c.exp);
      expect(result.issues).equal(undefined);
    }),
  );

  const marginCases = ["0", "10px", "50%", "3rem", "auto"];

  // --- margin
  marginCases.forEach((c) =>
    it(`margin: ${c}`, () => {
      const result = compileLayout({ margin: c });
      expect(result.cssProps?.margin).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  // --- horizontalMargin
  marginCases.forEach((c) =>
    it(`horizontalMargin: ${c}`, () => {
      const result = compileLayout({ horizontalMargin: c });
      expect(result.cssProps?.marginLeft).equal(c);
      expect(result.cssProps?.marginRight).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  // --- verticalMargin
  marginCases.forEach((c) =>
    it(`verticalMargin: ${c}`, () => {
      const result = compileLayout({ verticalMargin: c });
      expect(result.cssProps?.marginTop).equal(c);
      expect(result.cssProps?.marginBottom).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  // --- leftMargin
  marginCases.forEach((c) =>
    it(`marginLeft #1: ${c}`, () => {
      const result = compileLayout({ marginLeft: c });
      expect(result.cssProps?.marginLeft).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  marginCases.forEach((c) =>
    it(`marginLeft #2: ${c}`, () => {
      const result = compileLayout({ marginLeft: c, horizontalMargin: "20%" });
      expect(result.cssProps?.marginLeft).equal(c);
      expect(result.cssProps?.marginRight).equal("20%");
      expect(result.issues).equal(undefined);
    }),
  );

  // --- rightMargin
  marginCases.forEach((c) =>
    it(`marginRight #1: ${c}`, () => {
      const result = compileLayout({ marginRight: c });
      expect(result.cssProps?.marginRight).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  marginCases.forEach((c) =>
    it(`marginRight #2: ${c}`, () => {
      const result = compileLayout({ marginRight: c, horizontalMargin: "20%" });
      expect(result.cssProps?.marginRight).equal(c);
      expect(result.cssProps?.marginLeft).equal("20%");
      expect(result.issues).equal(undefined);
    }),
  );

  // --- topMargin
  marginCases.forEach((c) =>
    it(`marginTop #1: ${c}`, () => {
      const result = compileLayout({ marginTop: c });
      expect(result.cssProps?.marginTop).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  marginCases.forEach((c) =>
    it(`marginTop #2: ${c}`, () => {
      const result = compileLayout({ marginTop: c, verticalMargin: "20%" });
      expect(result.cssProps?.marginTop).equal(c);
      expect(result.cssProps?.marginBottom).equal("20%");
      expect(result.issues).equal(undefined);
    }),
  );

  // --- bottomMargin
  marginCases.forEach((c) =>
    it(`marginBottom #1: ${c}`, () => {
      const result = compileLayout({ marginBottom: c });
      expect(result.cssProps?.marginBottom).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  marginCases.forEach((c) =>
    it(`marginBottom #2: ${c}`, () => {
      const result = compileLayout({ marginBottom: c, verticalMargin: "20%" });
      expect(result.cssProps?.marginBottom).equal(c);
      expect(result.cssProps?.marginTop).equal("20%");
      expect(result.issues).equal(undefined);
    }),
  );

  // --- letterSpacing
  sizeCases.forEach((c) =>
    it(`letterSpacing: ${c}`, () => {
      const result = compileLayout({ letterSpacing: c });
      expect(result.cssProps?.letterSpacing).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  // --- lineHeight
  sizeCases.forEach((c) =>
    it(`lineHeight: ${c}`, () => {
      const result = compileLayout({ lineHeight: c });
      expect(result.cssProps?.lineHeight).equal(c);
      expect(result.cssProps?.flexShrink).equal(undefined);
      expect(result.issues).equal(undefined);
    }),
  );

  it(`width (themeId)`, () => {
    const result = compileLayout({ width: "$myThemeId" }, { myThemeId: "123" });
    expect(result.cssProps?.width).equal(toCssVar("$myThemeId"));
    expect(result.issues).equal(undefined);
  });

  it(`radiusBottomRight (theme ID)`, () => {
    const result = compileLayout(
      { radiusBottomRight: "$myValue1 $myValue2" },
      { myValue1: "3px", myValue2: "4px" },
    );
    expect(result.cssProps?.borderBottomRightRadius).equal(
      "var(--xmlui-myValue1) / var(--xmlui-myValue2)",
    );
  });

  it(`Default size unit is px`, () => {
    const result = compileLayout({ width: "123" });
    expect(result.cssProps?.width).equal("123px");
    expect(result.issues).equal(undefined);
  });

  it(`Default line height unit is empty`, () => {
    const result = compileLayout({ lineHeight: "123" });
    expect(result.cssProps?.lineHeight).equal("123");
    expect(result.issues).equal(undefined);
  });

  it(`Star size sets flex (horizontal) #1`, () => {
    const result = compileLayout(
      { width: "12.3*" },
      {},
      { type: "Stack", orientation: "horizontal" },
    );
    expect(result.cssProps?.width).equal("12.3*");
    expect(result.cssProps?.flex).equal(12.3);
    expect(result.issues).equal(undefined);
  });

  it(`Star size sets flex (horizontal) #2`, () => {
    const result = compileLayout(
      { height: "12.3*" },
      {},
      { type: "Stack", orientation: "horizontal" },
    );
    expect(result.cssProps?.height).equal("12.3*");
    expect(result.cssProps?.flex).equal(undefined);
    expect(result.issues).equal(undefined);
  });

  it(`Star size sets flex (vertical) #1`, () => {
    const result = compileLayout(
      { width: "12.3*" },
      {},
      { type: "Stack", orientation: "vertical" },
    );
    expect(result.cssProps?.width).equal("12.3*");
    expect(result.cssProps?.flex).equal(undefined);
    expect(result.issues).equal(undefined);
  });

  it(`Star size sets flex (vertical) #2`, () => {
    const result = compileLayout(
      { height: "12.3*" },
      {},
      { type: "Stack", orientation: "vertical" },
    );
    expect(result.cssProps?.height).equal("12.3*");
    expect(result.cssProps?.flex).equal(12.3);
    expect(result.issues).equal(undefined);
  });

  const opacityCases = ["0", "1", "12.3", "50%", "25%"];

  // --- opacity
  opacityCases.forEach((c) =>
    it(`opacity: ${c}`, () => {
      const result = compileLayout({ opacity: c });
      expect(result.cssProps?.opacity).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const cursorCases = [
    "auto",
    "default",
    "none",
    "context-menu",
    "help",
    "pointer",
    "progress",
    "wait",
    "cell",
    "crosshair",
    "text",
    "vertical-text",
    "alias",
    "copy",
    "move",
    "no-drop",
    "not-allowed",
    "grab",
    "grabbing",
    "all-scroll",
    "col-resize",
    "row-resize",
    "n-resize",
    "e-resize",
    "s-resize",
    "w-resize",
    "ne-resize",
    "nw-resize",
    "se-resize",
    "sw-resize",
    "ew-resize",
    "ns-resize",
    "nesw-resize",
    "nwse-resize",
    "zoom-in",
    "zoom-out",
  ];

  // --- cursor
  cursorCases.forEach((c) =>
    it(`cursor: ${c}`, () => {
      const result = compileLayout({ cursor: c });
      expect(result.cssProps?.cursor).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const textAlignCases = ["start", "center", "end", "left", "right", "justify"];

  textAlignCases.forEach((c) =>
    it(`textAlign: ${c}`, () => {
      const result = compileLayout({ textAlign: c });
      expect(result.cssProps.textAlign).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  textAlignCases.forEach((c) =>
    it(`textAlignLast: ${c}`, () => {
      const result = compileLayout({ textAlignLast: c });
      expect(result.cssProps.textAlignLast).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const borderStyleCases = ["dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"];

  // --- opacity
  borderStyleCases.forEach((c) =>
    it(`borderStyle: ${c}`, () => {
      const result = compileLayout({ borderStyle: c });
      expect(result.cssProps?.borderStyle).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );

  const zoomCases = ["0", "1", "12.3", "50%", "25%", "reset", "normal"];

  // --- zoom
  zoomCases.forEach((c) =>
    it(`zoom: ${c}`, () => {
      const result = compileLayout({ zoom: c });
      expect(result.cssProps?.zoom).equal(c);
      expect(result.issues).equal(undefined);
    }),
  );


});
