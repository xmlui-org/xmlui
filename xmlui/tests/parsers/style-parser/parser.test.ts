import { describe, expect, it, assert } from "vitest";
import { StyleParser } from "@parsers/style-parser/StyleParser";
import { styleKeywords } from "@parsers/style-parser/StyleLexer";
import { StyleTokenType } from "@parsers/style-parser/tokens";

describe("Style parser", () => {
  const sizeCases = [
    { src: "0", val: 0, unit: "" },
    { src: "0px", val: 0, unit: "px" },
    { src: "0cm", val: 0, unit: "cm" },
    { src: "0mm", val: 0, unit: "mm" },
    { src: "0in", val: 0, unit: "in" },
    { src: "0pt", val: 0, unit: "pt" },
    { src: "0pc", val: 0, unit: "pc" },
    { src: "0em", val: 0, unit: "em" },
    { src: "0rem", val: 0, unit: "rem" },
    { src: "0vw", val: 0, unit: "vw" },
    { src: "0vh", val: 0, unit: "vh" },
    { src: "0ex", val: 0, unit: "ex" },
    { src: "0ch", val: 0, unit: "ch" },
    { src: "0vmin", val: 0, unit: "vmin" },
    { src: "0vmax", val: 0, unit: "vmax" },
    { src: "0%", val: 0, unit: "%" },
    { src: "123px", val: 123, unit: "px" },
    { src: "123cm", val: 123, unit: "cm" },
    { src: "123.5mm", val: 123.5, unit: "mm" },
    { src: "123.5in", val: 123.5, unit: "in" },
    { src: "234.5pt", val: 234.5, unit: "pt" },
    { src: "-12.5pc", val: -12.5, unit: "pc" },
    { src: "-123.5em", val: -123.5, unit: "em" },
    { src: "45rem", val: 45, unit: "rem" },
    { src: "55vw", val: 55, unit: "vw" },
    { src: "678vh", val: 678, unit: "vh" },
    { src: "1ex", val: 1, unit: "ex" },
    { src: "3ch", val: 3, unit: "ch" },
    { src: "4vmin", val: 4, unit: "vmin" },
    { src: "-12.5vmax", val: -12.5, unit: "vmax" },
    { src: "66%", val: 66, unit: "%" },
  ];

  sizeCases.forEach((s) =>
    it(`parseSize '${s.src}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s.src);

      // --- Act
      const size = sp.parseSize()!;

      // --- Assert
      expect(size.value).equal(s.val);
      expect(size.unit).equal(s.unit);
    })
  );

  const sizeErrorCases = ["12left", "12wavy"];

  sizeErrorCases.forEach((s) =>
    it(`parseSize '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseSize();
      } catch (err: any) {
        expect(err.toString()).contains("Unexpected");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const alignmentCases = ["start", "center", "end"];

  alignmentCases.forEach((s) =>
    it(`parseAlignment '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const align = sp.parseAlignment()!;
      expect(align.value).equal(s);
    })
  );

  const alignmentErrorCases = ["1", "rgb", "px"];

  alignmentErrorCases.forEach((s) =>
    it(`parseAlignment '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseAlignment();
      } catch (err: any) {
        expect(err.toString()).contains("alignment");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const userSelectCases = ["none", "auto", "all", "text", "contain"];

  userSelectCases.forEach((s) =>
    it(`parseUserSelect '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const userSelect = sp.parseUserSelect()!;
      expect(userSelect.value).equal(s);
    })
  );

  const userSelectErrorCases = ["1", "rgb", "px"];

  userSelectErrorCases.forEach((s) =>
    it(`parseUserSelect '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseUserSelect();
      } catch (err: any) {
        expect(err.toString()).contains("user-select");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const textTransformCases = ["none", "capitalize", "uppercase", "lowercase", "full-width", "full-size-kana"];

  textTransformCases.forEach((s) =>
    it(`parseTextTransform '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const textTransform = sp.parseTextTransform()!;
      expect(textTransform.value).equal(s);
    })
  );

  const textTransformErrorCases = ["1", "rgb", "px"];

  textTransformErrorCases.forEach((s) =>
    it(`parseTextTransform '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseTextTransform();
      } catch (err: any) {
        expect(err.toString()).contains("text transform");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const orientationCases = ["horizontal", "vertical"];

  orientationCases.forEach((s) =>
    it(`parseOrientation '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const align = sp.parseOrientation()!;
      expect(align.value).equal(s);
    })
  );

  const orientationErrorCases = ["center", "ltr", "10"];

  orientationErrorCases.forEach((s) =>
    it(`parseOrientation '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseOrientation();
      } catch (err: any) {
        expect(err.toString()).contains("orientation");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const scrollCases = ["visible", "hidden", "scroll"];

  scrollCases.forEach((s) =>
    it(`parseScrolling '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const scrolling = sp.parseScrolling()!;
      expect(scrolling.value).equal(s);
    })
  );

  const scrollingErrorCases = ["1", "rgb", "px"];

  scrollingErrorCases.forEach((s) =>
    it(`parseScrolling '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseScrolling();
      } catch (err: any) {
        expect(err.toString()).contains("scrolling");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const directionCases = ["ltr", "rtl"];

  directionCases.forEach((s) =>
    it(`parseDirection '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const direction = sp.parseDirection()!;
      expect(direction.value).equal(s);
    })
  );

  const directionErrorCases = ["left-to-right", "lltr", "e1r"];

  directionErrorCases.forEach((s) =>
    it(`parseDirection '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseDirection();
      } catch (err: any) {
        expect(err.toString()).contains("direction");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const fontWeightCases = ["100", "200", "lighter", "normal", "bold", "bolder"];

  fontWeightCases.forEach((s) =>
    it(`parseFontWeight '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const fontWeight = sp.parseFontWeight()!;
      expect(fontWeight.value).equal(s);
    })
  );

  const fontWeightErrorCases = ["px", "italic", "hard"];

  fontWeightErrorCases.forEach((s) =>
    it(`parseFontWeight '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseFontWeight();
      } catch (err: any) {
        expect(err.toString()).contains("fontWeight");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const zIndexCases = ["1", "-1", "0", "99"];

  zIndexCases.forEach((s) =>
    it(`parseZIndex '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const zIndex = sp.parseZIndex()!;
      expect(zIndex.value).equal(s);
    })
  );

  const zIndexErrorCases = ["normal", "bold", "center"];

  zIndexErrorCases.forEach((s) =>
    it(`parseZIndex '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseZIndex();
      } catch (err: any) {
        expect(err.toString()).contains("numeric");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const fontFamilyCases = ["serif", "sansSerif", "mono", "'Courier New'", "'Courier New', monospace"];

  fontFamilyCases.forEach((s) =>
    it(`parseFontFamily '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const fontFamily = sp.parseFontFamily()!;
      expect(fontFamily.value).equal(s);
    })
  );

  const fontFamilyErrorCases = ["12", "23 rem", "#111"];

  fontFamilyErrorCases.forEach((s) =>
    it(`parseFontFamily '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseFontFamily();
      } catch (err: any) {
        expect(err.toString()).contains("fontFamily");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const borderStyleCases = ["none", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"];

  borderStyleCases.forEach((s) =>
    it(`parseBorderStyle '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const borderStyle = sp.parseBorderStyle()!;
      expect(borderStyle.value).equal(s);
    })
  );

  const borderStyleErrorCases = ["1", "rgb", "px"];

  borderStyleErrorCases.forEach((s) =>
    it(`parseBorderStyle '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseBorderStyle();
      } catch (err: any) {
        expect(err.toString()).contains("border style");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  Object.keys(styleKeywords)
    .filter((kw) => styleKeywords[kw] === StyleTokenType.ColorName)
    .forEach((kw) =>
      it(`parseColor '${kw}'`, () => {
        // --- Arrange
        const sp = new StyleParser(kw);

        // --- Act
        const color = sp.parseColor()!;
        expect(color.value).equal(kw);
      })
    );

  const hexColorCases = [
    { src: "#000", val: 0xff },
    { src: "#333", val: 0x333333ff },
    { src: "#2ac", val: 0x22aaccff },
    { src: "#f000", val: 0xff000000 },
    { src: "#c333", val: 0xcc333333 },
    { src: "#42ac", val: 0x4422aacc },
    { src: "#12ca28", val: 0x12ca28ff },
    { src: "#12ca2880", val: 0x12ca2880 },
  ];

  hexColorCases.forEach((s) =>
    it(`parseColor '${s.src}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s.src);

      // --- Act
      const color = sp.parseColor()!;

      // --- Assert
      expect(color.value).equal(s.src);
    })
  );

  const colorFuncCases = [
    "rgb(0 0 0)",
    "rgb(0,0,0)",
    "rgb( 0, 0 , 0   )",
    "rgb(100, 200, 255)",
    "rgb(0% ,0%, 0% )",
    "rgb(11% ,234, 123 )",
    "rgb(234, 11%, 123)",
    "rgb(234, 123, 11%)",
    "rgb(0,0,0)",
    "rgba(0 0 0 0.5)",
    "rgba(0,0,0,0.5)",
    "rgba(0,0,0, 50%)",
    "hsl(0, 0%,0%)",
    "hsl(3.45rad 0% 0%)",
    "hsl(3.45rad, 0%,0%)",
    "hsl(-3.45grad, 0%,0%)",
    "hsl(2.5turn, 0%,0%)",
    "hsl(180, 12.5%, 50% )",
    "hsla(0 0% 0% 0.5)",
    "hsla(0, 0%,0%, 0.5)",
    "hsla(3.45rad, 0%,0%, 45%)",
    "hsla(-3.45grad, 0%,0%, 0.4)",
    "hsla(2.5turn, 0%,0%, 66%)",
    "hsla(180, 12.5%, 50%, 0.66 )",
  ];

  colorFuncCases.forEach((s) =>
    it(`parseColor '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      const color = sp.parseColor()!;

      // --- Assert
      expect(color.value).equal(s);
    })
  );

  const colorFuncErrorCases = [
    { src: "rgb 0,0,0)", err: "S007" },
    { src: "rgb(0,0,0", err: "S010" },
    { src: "rgb(-2,0,0)", err: "S009" },
    { src: "rgb(300,0,0)", err: "S009" },
    { src: "rgb(0,-1,0)", err: "S009" },
    { src: "rgb(0,256,0)", err: "S009" },
    { src: "rgb(0,0,-1)", err: "S009" },
    { src: "rgb(0,0,256)", err: "S009" },
    { src: "rgb(-2%,0,0)", err: "S008" },
    { src: "rgb(123,101%,0)", err: "S008" },
    { src: "rgb(123,0, 101%)", err: "S008" },
    { src: "rgba 0,0,0)", err: "S007" },
    { src: "rgba(0,0,0,0", err: "S010" },
    { src: "rgba(-2,0,0,0)", err: "S009" },
    { src: "rgba(300,0,0,0)", err: "S009" },
    { src: "rgba(0,-1,0,0)", err: "S009" },
    { src: "rgba(0,256,0,0)", err: "S009" },
    { src: "rgba(0,0,-1,0)", err: "S009" },
    { src: "rgba(0,0,256,0)", err: "S009" },
    { src: "rgba(-2%,0,0,0)", err: "S008" },
    { src: "rgba(123,101%,0,0)", err: "S008" },
    { src: "rgba(123,0, 101%,0)", err: "S008" },
    { src: "rgba(123,0,127,-0.1)", err: "S011" },
    { src: "rgba(123,0,127,1.1)", err: "S011" },
    { src: "hsl 0, 0, 0)", err: "S007" },
    { src: "hsl(0px, 0, 0)", err: "S007" },
    { src: "hsl(90, -1%, 0)", err: "S008" },
    { src: "hsl(90, 0%, 101%)", err: "S008" },
    { src: "hsl(0, 0%, 0%", err: "S010" },
    { src: "hsla 0, 0, 0, 0)", err: "S007" },
    { src: "hsla(0px, 0, 0, 0)", err: "S007" },
    { src: "hsla(90, -1%, 0, 0)", err: "S008" },
    { src: "hsla(90, 0%, 101%, 0)", err: "S008" },
    { src: "hsla(0, 0%, 0%, 0", err: "S010" },
  ];

  colorFuncErrorCases.forEach((s) =>
    it(`parseColor '${s.src}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s.src);

      // --- Act

      try {
        sp.parseColor();
      } catch {
        expect(sp.errors[0].code).equal(s.err);
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const colorErrorCases = ["1", "start", "px"];

  colorErrorCases.forEach((s) =>
    it(`parseColor '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseColor();
      } catch (err: any) {
        expect(err.toString()).contains("color value");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const borderCases = [
    { src: "0", wv: 0, wu: "", cv: undefined, sv: undefined },
    { src: "1px", wv: 1, wu: "px", cv: undefined, sv: undefined },
    { src: "dotted", wv: undefined, wu: undefined, cv: undefined, sv: "dotted" },
    { src: "blue", wv: undefined, wu: undefined, cv: "blue", sv: undefined },
    { src: "1px dotted", wv: 1, wu: "px", cv: undefined, sv: "dotted" },
    { src: "dotted 1px", wv: 1, wu: "px", cv: undefined, sv: "dotted" },
    { src: "1px blue", wv: 1, wu: "px", cv: "blue", sv: undefined },
    { src: "blue 1px", wv: 1, wu: "px", cv: "blue", sv: undefined },
    { src: "dotted blue", wv: undefined, wu: undefined, cv: "blue", sv: "dotted" },
    { src: "blue dotted", wv: undefined, wu: undefined, cv: "blue", sv: "dotted" },
    { src: "1px dotted blue", wv: 1, wu: "px", cv: "blue", sv: "dotted" },
    { src: "1px blue dotted", wv: 1, wu: "px", cv: "blue", sv: "dotted" },
    { src: "dotted 1px blue", wv: 1, wu: "px", cv: "blue", sv: "dotted" },
    { src: "dotted blue 1px", wv: 1, wu: "px", cv: "blue", sv: "dotted" },
    { src: "blue dotted 1px", wv: 1, wu: "px", cv: "blue", sv: "dotted" },
    { src: "blue 1px dotted", wv: 1, wu: "px", cv: "blue", sv: "dotted" },
  ];

  borderCases.forEach((c) =>
    it(`parseBorder ${c.src}`, () => {
      // --- Arrange
      const sp = new StyleParser(c.src);

      // --- Act
      const b = sp.parseBorder()!;

      // --- Assert
      expect(b.widthValue).equal(c.wv);
      expect(b.widthUnit).equal(c.wu);
      expect(b.styleValue).equal(c.sv);
      expect(b.color).equal(c.cv);
    })
  );

  const borderErrorCases = ["start"];

  borderErrorCases.forEach((s) =>
    it(`parseBorder error '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseBorder();
      } catch (err: any) {
        expect(err.toString()).contains("Unexpected");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const textDecorationCases = [
    { src: "underline", l: "underline", c: undefined, s: undefined },
    { src: "overline", l: "overline", c: undefined, s: undefined },
    { src: "line-through", l: "line-through", c: undefined, s: undefined },
    { src: "solid", l: undefined, c: undefined, s: "solid" },
    { src: "double", l: undefined, c: undefined, s: "double" },
    { src: "dotted", l: undefined, c: undefined, s: "dotted" },
    { src: "dashed", l: undefined, c: undefined, s: "dashed" },
    { src: "wavy", l: undefined, c: undefined, s: "wavy" },
    { src: "red", l: undefined, c: "red", s: undefined },
    { src: "underline red", l: "underline", c: "red", s: undefined },
    { src: "red underline", l: "underline", c: "red", s: undefined },
    { src: "underline wavy", l: "underline", c: undefined, s: "wavy" },
    { src: "wavy underline", l: "underline", c: undefined, s: "wavy" },
    { src: "underline wavy red", l: "underline", c: "red", s: "wavy" },
    { src: "underline red wavy", l: "underline", c: "red", s: "wavy" },
    { src: "wavy red underline", l: "underline", c: "red", s: "wavy" },
    { src: "wavy underline red", l: "underline", c: "red", s: "wavy" },
    { src: "red wavy underline", l: "underline", c: "red", s: "wavy" },
    { src: "red underline wavy", l: "underline", c: "red", s: "wavy" },
  ];

  textDecorationCases.forEach((c) =>
    it(`parseTextDecoration ${c.src}`, () => {
      // --- Arrange
      const sp = new StyleParser(c.src);

      // --- Act
      const b = sp.parseTextDecoration()!;

      // --- Assert
      expect(b.none).equal(undefined);
      expect(b.color).equal(c.c);
      expect(b.style).equal(c.s);
      expect(b.line).equal(c.l);
    })
  );

  const textDecorationErrorCases = ["start"];

  textDecorationErrorCases.forEach((s) =>
    it(`texDecoration error '${s}'`, () => {
      // --- Arrange
      const sp = new StyleParser(s);

      // --- Act
      try {
        sp.parseTextDecoration();
      } catch (err: any) {
        expect(err.toString()).contains("Unexpected");
        return;
      }
      assert.fail("Exception expected");
    })
  );

  const radiusCases = [
    { src: "0", v1: 0, u1: "", v2: undefined, u2: undefined },
    { src: "4px", v1: 4, u1: "px", v2: undefined, u2: undefined },
    { src: "20%", v1: 20, u1: "%", v2: undefined, u2: undefined },
    { src: "4px 2rem", v1: 4, u1: "px", v2: 2, u2: "rem" },
    { src: "50% 25%", v1: 50, u1: "%", v2: 25, u2: "%" },
  ];

  radiusCases.forEach((c) =>
    it(`parseRadius ${c.src}`, () => {
      // --- Arrange
      const sp = new StyleParser(c.src);

      // --- Act
      const rad = sp.parseRadius()!;

      // --- Assert
      expect(rad.value1).equal(c.v1);
      expect(rad.unit1).equal(c.u1);
      expect(rad.value2).equal(c.v2);
      expect(rad.unit2).equal(c.u2);
    })
  );

  const shadowCases1 = [
    {
      src: "10px 20px",
      i: undefined,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: undefined,
      bu: undefined,
      sv: undefined,
      su: undefined,
      c: undefined,
    },
    {
      src: "inset 10px 20px",
      i: true,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: undefined,
      bu: undefined,
      sv: undefined,
      su: undefined,
      c: undefined,
    },
    {
      src: "10px 20px 40%",
      i: undefined,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: 40,
      bu: "%",
      sv: undefined,
      su: undefined,
      c: undefined,
    },
    {
      src: "inset 10px 20px 40%",
      i: true,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: 40,
      bu: "%",
      sv: undefined,
      su: undefined,
      c: undefined,
    },
    {
      src: "10px 20px 40% 6rem",
      i: undefined,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: 40,
      bu: "%",
      sv: 6,
      su: "rem",
      c: undefined,
    },
    {
      src: "inset 10px 20px 40% 6rem",
      i: true,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: 40,
      bu: "%",
      sv: 6,
      su: "rem",
      c: undefined,
    },
    {
      src: "10px 20px 40% 6rem red",
      i: undefined,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: 40,
      bu: "%",
      sv: 6,
      su: "rem",
      c: "red",
    },
    {
      src: "inset 10px 20px 40% 6rem red",
      i: true,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: 40,
      bu: "%",
      sv: 6,
      su: "rem",
      c: "red",
    },
    {
      src: "10px 20px red",
      i: undefined,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: undefined,
      bu: undefined,
      sv: undefined,
      su: undefined,
      c: "red",
    },
    {
      src: "inset 10px 20px red",
      i: true,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: undefined,
      bu: undefined,
      sv: undefined,
      su: undefined,
      c: "red",
    },
    {
      src: "10px 20px 40% red",
      i: undefined,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: 40,
      bu: "%",
      sv: undefined,
      su: undefined,
      c: "red",
    },
    {
      src: "inset 10px 20px 40% red",
      i: true,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: 40,
      bu: "%",
      sv: undefined,
      su: undefined,
      c: "red",
    },
    {
      src: "10px 20px 40% 5rem red",
      i: undefined,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: 40,
      bu: "%",
      sv: 5,
      su: "rem",
      c: "red",
    },
    {
      src: "inset 10px 20px 40% 5rem red",
      i: true,
      oxv: 10,
      oxu: "px",
      oyv: 20,
      oyu: "px",
      bv: 40,
      bu: "%",
      sv: 5,
      su: "rem",
      c: "red",
    },
  ];

  shadowCases1.forEach((c) =>
    it(`parseShadow ${c.src}`, () => {
      // --- Arrange
      const sp = new StyleParser(c.src);

      // --- Act
      const b = sp.parseShadow()!;
      expect(b.segments!.length).equal(1);
      const s = b.segments![0];

      // --- Assert
      expect(s.inset).equal(c.i);
      expect(s.offsetXValue).equal(c.oxv);
      expect(s.offsetXUnit).equal(c.oxu);
      expect(s.offsetYValue).equal(c.oyv);
      expect(s.offsetYUnit).equal(c.oyu);
      expect(s.blurRadiusValue).equal(c.bv);
      expect(s.blurRadiusUnit).equal(c.bu);
      expect(s.spreadRadiusValue).equal(c.sv);
      expect(s.spreadRadiusUnit).equal(c.su);
      expect(s.blurRadiusValue).equal(c.bv);
      expect(s.color).equal(c.c);
    })
  );

  const shadowCases2 = [
    { src: "10px 10px, inset 20px 20px red", l: 2 },
    { src: "10px 10px 20%, 20px 20px red", l: 2 },
    { src: "10px 10px 20%, 20px 20px red, inset 10px 20px 30px 40px blue", l: 3 },
  ];

  shadowCases2.forEach((c) =>
    it(`parseShadow ${c.src}`, () => {
      // --- Arrange
      const sp = new StyleParser(c.src);

      // --- Act
      const b = sp.parseShadow()!;
      expect(b.segments!.length).equal(c.l);
    })
  );
});
