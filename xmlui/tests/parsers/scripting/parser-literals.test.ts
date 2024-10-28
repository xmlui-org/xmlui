import { describe, expect, it } from "vitest";

import { Parser } from "@parsers/scripting/Parser";
import {
  ArrayLiteral,
  BinaryExpression,
  Expression,
  Literal,
  ObjectLiteral,
  TemplateLiteralExpression,
} from "@abstractions/scripting/ScriptingSourceTree";
import exp from "constants";

describe("Parser - literals", () => {
  const boolCases = [
    { src: "true", exp: true },
    { src: "false", exp: false },
  ];
  boolCases.forEach((c) => {
    it(`Boolean literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("LitE");
      expect(expr.value).equal(c.exp);
      const literal = expr as Literal;
      expect(literal.value).equal(c.exp);
      expect(literal.source).equal(c.src);
    });
  });

  const binaryCases = [
    { src: "0b0", exp: 0 },
    { src: "0b0_0", exp: 0 },
    { src: "0b1_0", exp: 2 },
    { src: "0b011100110", exp: 230 },
    { src: "0b0111_0011_0", exp: 230 },
    {
      src: "0b11111111_11111111_11111111_11111111_11111111_11111111_11111111_11111111",
      exp: BigInt("0xffffffffffffffff"),
    },
  ];
  binaryCases.forEach((c) => {
    it(`Binary literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("LitE");
      expect(expr.value).equal(c.exp);
      const literal = expr as Literal;
      expect(literal.value).equal(c.exp);
      expect(literal.source).equal(c.src);
    });
  });

  const decimalCases = [
    { src: "0", exp: 0 },
    { src: "1", exp: 1 },
    { src: "2", exp: 2 },
    { src: "3", exp: 3 },
    { src: "4", exp: 4 },
    { src: "5", exp: 5 },
    { src: "6", exp: 6 },
    { src: "7", exp: 7 },
    { src: "8", exp: 8 },
    { src: "9", exp: 9 },
    { src: "0123", exp: 123 },
    { src: "0_123", exp: 123 },
    { src: "123_456_678_912_345", exp: 123456678912345 },
    { src: "999999_123_456_678_912_345", exp: BigInt("999999123456678912345") },
  ];
  decimalCases.forEach((c) => {
    it(`Decimal literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("LitE");
      expect(expr.value).equal(c.exp);
      const literal = expr as Literal;
      expect(literal.value).equal(c.exp);
      expect(literal.source).equal(c.src);
    });
  });

  const hexadecimalCases = [
    { src: "0x0", exp: 0x0 },
    { src: "0x0_0", exp: 0x0 },
    { src: "0x1_0", exp: 0x10 },
    { src: "0x12ac34", exp: 0x12ac34 },
    { src: "0x12_ac34", exp: 0x12ac34 },
    {
      src: "0xffffffffffffffff",
      exp: BigInt("0xffffffffffffffff"),
    },
  ];
  hexadecimalCases.forEach((c) => {
    it(`Binary literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("LitE");
      expect(expr.value).equal(c.exp);
      const literal = expr as Literal;
      expect(literal.value).equal(c.exp);
      expect(literal.source).equal(c.src);
    });
  });

  const realCases = [
    { src: "0.0", exp: 0.0 },
    { src: "1.0", exp: 1.0 },
    { src: "2.1", exp: 2.1 },
    { src: "3.12", exp: 3.12 },
    { src: "4.123", exp: 4.123 },
    { src: "5.1234", exp: 5.1234 },
    { src: "6.12345", exp: 6.12345 },
    { src: "7.123_456", exp: 7.123456 },
    { src: "8.12", exp: 8.12 },
    { src: "9.12", exp: 9.12 },
    { src: "01.0", exp: 1.0 },
    { src: "1_.0", exp: 1.0 },
    { src: "543_210.012_345_6", exp: 543210.0123456 },

    { src: "0e0", exp: 0 },
    { src: "1e0", exp: 1 },
    { src: "2e0", exp: 2 },
    { src: "3e0", exp: 3 },
    { src: "4e0", exp: 4 },
    { src: "5e0", exp: 5 },
    { src: "6e0", exp: 6 },
    { src: "7e0", exp: 7 },
    { src: "8e0", exp: 8 },
    { src: "9e0", exp: 9 },
    { src: "123e0", exp: 123 },
    { src: "23_4e0", exp: 234 },
    { src: "123e13", exp: 123e13 },
    { src: "123e+13", exp: 123e13 },
    { src: "123e-13", exp: 123e-13 },
    { src: "123.456e13", exp: 123.456e13 },
    { src: "123.45_6e+13", exp: 123.456e13 },
    { src: "123.4_56e-13", exp: 123.456e-13 },

    { src: ".0", exp: 0.0 },
    { src: ".12_34", exp: 0.1234 },
    { src: ".456e13", exp: 0.456e13 },
    { src: ".45_6e+13", exp: 0.456e13 },
    { src: ".4_56e-13", exp: 0.456e-13 },

    { src: "Infinity", exp: Infinity },
  ];
  realCases.forEach((c) => {
    it(`Real literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("LitE");
      expect(expr.value).equal(c.exp);
      const literal = expr as Literal;
      expect(literal.value).equal(c.exp);
      expect(literal.source).equal(c.src);
    });
  });

  it("NaN literal", () => {
    // --- Arrange
    const wParser = new Parser("NaN");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("LitE");
    expect(isNaN(expr.value)).equal(true);
    const literal = expr as Literal;
    expect(isNaN(literal.value)).equal(true);
    expect(literal.source).equal("NaN");
  });

  const stringCases = [
    { src: '"\\S"', exp: "\xa0" },
    { src: '"Hello"', exp: "Hello" },
    { src: '"Hello\b"', exp: "Hello\b" },
    { src: '"Hello\\b"', exp: "Hello\b" },
    { src: '"Hello\\\\b"', exp: "Hello\\b" },
    { src: '"Hello\b1"', exp: "Hello\b1" },
    { src: '"Hello\\b1"', exp: "Hello\b1" },
    { src: '"Hello\\\\b1"', exp: "Hello\\b1" },

    { src: '"Hello\f"', exp: "Hello\f" },
    { src: '"Hello\\f"', exp: "Hello\f" },
    { src: '"Hello\\\\f"', exp: "Hello\\f" },
    { src: '"Hello\f1"', exp: "Hello\f1" },
    { src: '"Hello\\f1"', exp: "Hello\f1" },
    { src: '"Hello\\\\f1"', exp: "Hello\\f1" },

    { src: '"Hello\\n"', exp: "Hello\n" },
    { src: '"Hello\\\\n"', exp: "Hello\\n" },
    { src: '"Hello\\n1"', exp: "Hello\n1" },
    { src: '"Hello\\\\n1"', exp: "Hello\\n1" },

    { src: '"Hello\\r"', exp: "Hello\r" },
    { src: '"Hello\\\\r"', exp: "Hello\\r" },
    { src: '"Hello\\r1"', exp: "Hello\r1" },
    { src: '"Hello\\\\r1"', exp: "Hello\\r1" },

    { src: '"Hello\\q"', exp: "Hello\\q" },

    { src: '"Hello\t"', exp: "Hello\t" },
    { src: '"Hello\\t"', exp: "Hello\t" },
    { src: '"Hello\\\\t"', exp: "Hello\\t" },
    { src: '"Hello\t1"', exp: "Hello\t1" },
    { src: '"Hello\\t1"', exp: "Hello\t1" },
    { src: '"Hello\\\\t1"', exp: "Hello\\t1" },

    { src: '"Hello\v"', exp: "Hello\v" },
    { src: '"Hello\\v"', exp: "Hello\v" },
    { src: '"Hello\\\\v"', exp: "Hello\\v" },
    { src: '"Hello\v1"', exp: "Hello\v1" },
    { src: '"Hello\\v1"', exp: "Hello\v1" },
    { src: '"Hello\\\\v1"', exp: "Hello\\v1" },

    { src: '"Hello\0"', exp: "Hello\u0000" },
    { src: '"Hello\\0"', exp: "Hello\u0000" },
    { src: '"Hello\\\\0"', exp: "Hello\\0" },
    { src: '"Hello\\01"', exp: "Hello\u00001" },
    { src: '"Hello\\\\01"', exp: "Hello\\01" },

    { src: '"Hello\\x02"', exp: "Hello\u0002" },
    { src: '"Hello\\xa4"', exp: "Hello\u00a4" },
    { src: '"Hello❤️"', exp: "Hello❤️" },
  ];
  stringCases.forEach((c) => {
    it(`String literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("LitE");
      expect(expr.value).equal(c.exp);
      const literal = expr as Literal;
      expect(literal.value).equal(c.exp);
      expect(literal.source).equal(c.src);
    });
  });

  it("template string, no placeholder", () => {
    // --- Arrange
    const wParser = new Parser("`hi`");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    expect(expr.type).equal("TempLitE");
    const literal = expr as TemplateLiteralExpression;
    expect(literal.segments).toHaveLength(1);
    expect(literal.segments[0].type).equal("LitE");
    expect(literal.segments[0].value).equal("hi");
  });

  it("template string, expr placeholder", () => {
    // --- Arrange
    const wParser = new Parser("`hi ${ 1 + 2 } there`");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    expect(expr.type).equal("TempLitE");
    const literal = expr as TemplateLiteralExpression;

    expect(literal.segments).toHaveLength(3);
    expect(literal.segments[0].type).equal("LitE");
    expect(literal.segments[0].value).equal("hi ");

    const binary = literal.segments[1] as BinaryExpression;
    expect(binary.type).equal("BinaryE");
    expect(binary.operator).equal("+");
    expect(binary.left.type).equal("LitE");
    expect(binary.left.value).equal(1);
    expect(binary.right.type).equal("LitE");
    expect(binary.right.value).equal(2);

    expect(literal.segments[2].type).equal("LitE");
    expect(literal.segments[2].value).equal(" there");
  });
  it("template string, no str before placeholder", () => {
    // --- Arrange
    const wParser = new Parser("`${ 1 + 2 } there`");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    expect(expr.type).equal("TempLitE");
    const literal = expr as TemplateLiteralExpression;

    expect(literal.segments).toHaveLength(2);

    const binary = literal.segments[0] as BinaryExpression;
    expect(binary.type).equal("BinaryE");
    expect(binary.operator).equal("+");
    expect(binary.left.type).equal("LitE");
    expect(binary.left.value).equal(1);
    expect(binary.right.type).equal("LitE");
    expect(binary.right.value).equal(2);

    expect(literal.segments[1].type).equal("LitE");
    expect(literal.segments[1].value).equal(" there");
  });
  it("template string, no str after placeholder", () => {
    // --- Arrange
    const wParser = new Parser("`hi ${ 1 + 2 }`");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    expect(expr.type).equal("TempLitE");
    const literal = expr as TemplateLiteralExpression;

    expect(literal.segments).toHaveLength(2);
    expect(literal.segments[0].type).equal("LitE");
    expect(literal.segments[0].value).equal("hi ");

    const binary = literal.segments[1] as BinaryExpression;
    expect(binary.type).equal("BinaryE");
    expect(binary.operator).equal("+");
    expect(binary.left.type).equal("LitE");
    expect(binary.left.value).equal(1);
    expect(binary.right.type).equal("LitE");
    expect(binary.right.value).equal(2);
  });
  it("template string, nested template string placeholder", () => {
    // --- Arrange
    const wParser = new Parser("`hi ${ `all ${2} people` } there`");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    expect(expr.type).equal("TempLitE");
    const literal = expr as TemplateLiteralExpression;

    expect(literal.segments).toHaveLength(3);
    expect(literal.segments[0].type).equal("LitE");
    expect(literal.segments[0].value).equal("hi ");

    {
      const literalNested = literal.segments[1] as TemplateLiteralExpression;
      expect(literalNested.type).equal("TempLitE");

      expect(literalNested.segments).toHaveLength(3);
      expect(literalNested.segments[0].type).equal("LitE");
      expect(literalNested.segments[0].value).equal("all ");

      const literalNestedNum = literalNested.segments[0] as TemplateLiteralExpression;
      expect(literalNestedNum.type).equal("LitE");
      expect(literalNestedNum.segments).equal(2);

      expect(literalNested.segments[2].type).equal("LitE");
      expect(literalNested.segments[2].value).equal(" people");
    }

    expect(literal.segments[2].type).equal("LitE");
    expect(literal.segments[2].value).equal(" there");
  });
  const arrayCases = [
    { src: "[]", len: 0, idx: -1, exp: null },
    { src: "[1, a, a+b]", len: 3, idx: 0, exp: "LitE" },
    { src: "[1, a, a+b]", len: 3, idx: 1, exp: "IdE" },
    { src: "[1, a, a+b]", len: 3, idx: 2, exp: "BinaryE" },
    { src: "[[b], a+b]", len: 2, idx: 0, exp: "ALitE" },
    { src: "[[b], a+b]", len: 2, idx: 1, exp: "BinaryE" },
  ];
  arrayCases.forEach((c) => {
    it(`Array literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("ALitE");
      const array = expr as ArrayLiteral;
      expect(array.items.length).equal(c.len);
      if (c.len > 0) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(array.items[c.idx].type).equal(c.exp);
      }
      expect(array.source).equal(c.src);
    });
  });

  const objectCases = [
    { src: "{ abc }", len: 1, idx: 0, name: "IdE", val: "IdE" },
    { src: "{ abc: 123, b:2, }", len: 2, idx: 0, name: "IdE", val: "LitE" },
    { src: "{}", len: 0, idx: -1, name: null, val: null },
    { src: "{ abc: 123 }", len: 1, idx: 0, name: "IdE", val: "LitE" },
    { src: "{ 12: 123 }", len: 1, idx: 0, name: "LitE", val: "LitE" },
    { src: '{ "Hello": 123 }', len: 1, idx: 0, name: "LitE", val: "LitE" },
    { src: "{ abc: 123, }", len: 1, idx: 0, name: "IdE", val: "LitE" },
    { src: "{ abc: 123, 12: !a}", len: 2, idx: 0, name: "IdE", val: "LitE" },
    { src: "{ abc: 123, 12: !a}", len: 2, idx: 1, name: "LitE", val: "UnaryE" },
    { src: "{ abc: { a: b }, 12: [a, b, c]}", len: 2, idx: 0, name: "IdE", val: "OLitE" },
    { src: "{ abc: { a: b }, 12: [a, b, c]}", len: 2, idx: 1, name: "LitE", val: "ALitE" },
  ];
  objectCases.forEach((c) => {
    it(`Object literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("OLitE");
      const array = expr as ObjectLiteral;
      expect(array.props.length).equal(c.len);
      if (c.len > 0) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect((array.props[c.idx] as [Expression, Expression])[0].type).equal(c.name);
        // eslint-disable-next-line jest/no-conditional-expect
        expect((array.props[c.idx] as [Expression, Expression])[1].type).equal(c.val);
      }
      expect(array.source).equal(c.src);
    });
  });
});
