import { describe, expect, it } from "vitest";

import { Parser } from "@parsers/scripting-exp/Parser";
import { Identifier } from "@abstractions/scripting/ScriptingSourceTreeExp";

describe("Parser - primary expressions", () => {
  it("null", () => {
    // --- Arrange
    const wParser = new Parser("null");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("LitE");
  });

  it("undefined", () => {
    // --- Arrange
    const wParser = new Parser("undefined");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("LitE");
  });

  const identifierCases = [
    { src: "$id", exp: "$id" },
    { src: "ident", exp: "ident" },
    { src: "_alma$123", exp: "_alma$123" },
  ];

  identifierCases.forEach((c) => {
    it(`Identifier: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("IdE");
      const literal = expr as Identifier;
      expect(literal.name).equal(c.exp);
    });
  });

  const parenthesizedCases = [
    { src: "(123)", exp: "LitE" },
    { src: "(a+b)", exp: "BinaryE" },
    { src: "(a ? b : c)", exp: "CondE" },
    { src: "(!a)", exp: "UnaryE" },
    { src: "(a)", exp: "IdE" },
    { src: "(a, b)", exp: "SeqE" },
    { src: "(c(a, b))", exp: "InvokeE" },
    { src: "(a.b)", exp: "MembE" },
    { src: "(a[b])", exp: "CMembE" },
  ];
  parenthesizedCases.forEach((c) => {
    it(`Parenthesized expression: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(c.exp);
      expect(expr.parenthesized).equal(1);
    });
  });

  it(`Parenthesized expression`, () => {
    // --- Arrange
    const wParser = new Parser("(c(a, b))");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("InvokeE");
    expect(expr.parenthesized).equal(1);
  });
});
