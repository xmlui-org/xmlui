import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  Identifier} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_BINARY_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_SEQUENCE_EXPRESSION,
  T_UNARY_EXPRESSION,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - primary expressions", () => {
  it("null", () => {
    // --- Arrange
    const wParser = new Parser("null");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_LITERAL);
  });

  it("undefined", () => {
    // --- Arrange
    const wParser = new Parser("undefined");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_LITERAL);
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
      expect(expr.type).equal(T_IDENTIFIER);
      const literal = expr as Identifier;
      expect(literal.name).equal(c.exp);
    });
  });

  const parenthesizedCases = [
    { src: "(123)", exp: T_LITERAL },
    { src: "(a+b)", exp: T_BINARY_EXPRESSION },
    { src: "(a ? b : c)", exp: T_CONDITIONAL_EXPRESSION },
    { src: "(!a)", exp: T_UNARY_EXPRESSION },
    { src: "(a)", exp: T_IDENTIFIER },
    { src: "(a, b)", exp: T_SEQUENCE_EXPRESSION },
    { src: "(c(a, b))", exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "(a.b)", exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "(a[b])", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
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
    expect(expr.type).equal(T_FUNCTION_INVOCATION_EXPRESSION);
    expect(expr.parenthesized).equal(1);
  });
});
