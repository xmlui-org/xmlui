import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  BinaryExpression} from "../../../src/components-core/script-runner/ScriptingSourceTree";
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

describe("Parser - Binary operations", () => {
  const binaryOpCases = [
    { src: "a**b", op: "**" },
    { src: "a+b", op: "+" },
    { src: "a-b", op: "-" },
    { src: "a*b", op: "*" },
    { src: "a/b", op: "/" },
    { src: "a%b", op: "%" },
    { src: "a>>b", op: ">>" },
    { src: "a<<b", op: "<<" },
    { src: "a>>>b", op: ">>>" },
    { src: "a == b", op: "==" },
    { src: "a != b", op: "!=" },
    { src: "a < b", op: "<" },
    { src: "a <= b", op: "<=" },
    { src: "a>b", op: ">" },
    { src: "a>=b", op: ">=" },
    { src: "a ?? b", op: "??" },
    { src: "a | b", op: "|" },
    { src: "a & b", op: "&" },
    { src: "a ^ b", op: "^" },
    { src: "a || b", op: "||" },
    { src: "a && b", op: "&&" },
    { src: "a in b", op: "in" },
  ];
  binaryOpCases.forEach((c) => {
    it(`Binary (operator): ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(T_BINARY_EXPRESSION);
      const binary = expr as BinaryExpression;
      expect(binary.op).equal(c.op);
    });
  });

  const binaryLeftOperandCases = [
    { src: "a+b", op: "+", exp: T_IDENTIFIER },
    { src: "a+(b+c)", op: "+", exp: T_IDENTIFIER },
    { src: "a+b+c", op: "+", exp: T_BINARY_EXPRESSION },
    { src: "a+b*c", op: "+", exp: T_IDENTIFIER },
    { src: "!a+b", op: "+", exp: T_UNARY_EXPRESSION },
    { src: "a.c+b", op: "+", exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "a[c]+b", op: "+", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
    { src: "(a ? b : c)+b", op: "+", exp: T_CONDITIONAL_EXPRESSION },
    { src: "123+b", op: "+", exp: T_LITERAL },
    { src: "a(b,c)+b", op: "+", exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "(123, 1+c)+b", op: "+", exp: T_SEQUENCE_EXPRESSION },
  ];
  binaryLeftOperandCases.forEach((c) => {
    it(`Binary (left operand): ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(T_BINARY_EXPRESSION);
      const binary = expr as BinaryExpression;
      expect(binary.op).equal(c.op);
      expect(binary.left.type).equal(c.exp);
    });
  });

  const binaryRightOperandCases = [
    { src: "a+b", op: "+", exp: T_IDENTIFIER },
    { src: "a+(b+c)", op: "+", exp: T_BINARY_EXPRESSION },
    { src: "a+b+c", op: "+", exp: T_IDENTIFIER },
    { src: "a+b*c", op: "+", exp: T_BINARY_EXPRESSION },
    { src: "a*b+c", op: "+", exp: T_IDENTIFIER },
    { src: "a+!b", op: "+", exp: T_UNARY_EXPRESSION },
    { src: "a+b.c", op: "+", exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "a+b[c]", op: "+", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
    { src: "a +(a ? b : c)", op: "+", exp: T_CONDITIONAL_EXPRESSION },
    { src: "b+123", op: "+", exp: T_LITERAL },
    { src: "b+a(b,c)", op: "+", exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "b+(123, 1+c)", op: "+", exp: T_SEQUENCE_EXPRESSION },
  ];
  binaryRightOperandCases.forEach((c) => {
    it(`Binary (left operand): ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(T_BINARY_EXPRESSION);
      const binary = expr as BinaryExpression;
      expect(binary.op).equal(c.op);
      expect(binary.right.type).equal(c.exp);
    });
  });
});
