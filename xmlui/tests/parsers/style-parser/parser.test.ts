import { describe, expect, it, assert } from "vitest";
import { StyleParser } from "../../../src/parsers/style-parser/StyleParser";

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
});
