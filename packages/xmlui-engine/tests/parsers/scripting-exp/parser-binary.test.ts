import { describe, expect, it } from "vitest";

import { Parser } from "@parsers/scripting-exp/Parser";
import { BinaryExpression } from "@parsers/scripting-exp/source-tree";

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
      expect(expr.type).equal("BinaryE");
      const binary = expr as BinaryExpression;
      expect(binary.op).equal(c.op);
    });
  });

  const binaryLeftOperandCases = [
    { src: "a+b", op: "+", exp: "IdE" },
    { src: "a+(b+c)", op: "+", exp: "IdE" },
    { src: "a+b+c", op: "+", exp: "BinaryE" },
    { src: "a+b*c", op: "+", exp: "IdE" },
    { src: "!a+b", op: "+", exp: "UnaryE" },
    { src: "a.c+b", op: "+", exp: "MembE" },
    { src: "a[c]+b", op: "+", exp: "CMembE" },
    { src: "(a ? b : c)+b", op: "+", exp: "CondE" },
    { src: "123+b", op: "+", exp: "LitE" },
    { src: "a(b,c)+b", op: "+", exp: "InvokeE" },
    { src: "(123, 1+c)+b", op: "+", exp: "SeqE" },
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
      expect(expr.type).equal("BinaryE");
      const binary = expr as BinaryExpression;
      expect(binary.op).equal(c.op);
      expect(binary.left.type).equal(c.exp);
    });
  });

  const binaryRightOperandCases = [
    { src: "a+b", op: "+", exp: "IdE" },
    { src: "a+(b+c)", op: "+", exp: "BinaryE" },
    { src: "a+b+c", op: "+", exp: "IdE" },
    { src: "a+b*c", op: "+", exp: "BinaryE" },
    { src: "a*b+c", op: "+", exp: "IdE" },
    { src: "a+!b", op: "+", exp: "UnaryE" },
    { src: "a+b.c", op: "+", exp: "MembE" },
    { src: "a+b[c]", op: "+", exp: "CMembE" },
    { src: "a +(a ? b : c)", op: "+", exp: "CondE" },
    { src: "b+123", op: "+", exp: "LitE" },
    { src: "b+a(b,c)", op: "+", exp: "InvokeE" },
    { src: "b+(123, 1+c)", op: "+", exp: "SeqE" },
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
      expect(expr.type).equal("BinaryE");
      const binary = expr as BinaryExpression;
      expect(binary.op).equal(c.op);
      expect(binary.right.type).equal(c.exp);
    });
  });
});
