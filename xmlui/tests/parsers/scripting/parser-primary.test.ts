import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import { Identifier } from "../../../src/abstractions/scripting/ScriptingSourceTree";

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
    expect(expr.source).equal("null");
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
    expect(expr.source).equal("undefined");
  });

  const identifierCases = [
    { src: "$id", exp: "$id" },
    { src: "ident", exp: "ident" },
    { src: "_alma$123", exp: "_alma$123" }
  ];

  identifierCases.forEach(c => {
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
      expect(literal.source).equal(c.exp);
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
    { src: "(a[b])", exp: "CMembE" }
  ];
  parenthesizedCases.forEach(c => {
    it(`Parenthesized expression: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(c.exp);
      expect(expr.source).equal(c.src);
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
    expect(expr.source).equal("(c(a, b))");
    expect(expr.parenthesized).equal(1);
  });
});
