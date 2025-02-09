import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  FunctionInvocationExpression,
  MemberAccessExpression, PostfixOpExpression, PrefixOpExpression,
  SequenceExpression,
  SpreadExpression
} from "../../../src/abstractions/scripting/ScriptingSourceTree";

describe("Parser - miscellaneous expressions", () => {
  const sequenceCases = [
    { src: "a, b, a+b", len: 3, idx: 0, exp: "IdE" },
    { src: "a, b, a+b", len: 3, idx: 1, exp: "IdE" },
    { src: "a, b, a+b", len: 3, idx: 2, exp: "BinaryE" },
    { src: "a(b), b.a, a[b], !a", len: 4, idx: 0, exp: "InvokeE" },
    { src: "a(b), b.a, a[b], !a", len: 4, idx: 1, exp: "MembE" },
    { src: "a(b), b.a, a[b], !a", len: 4, idx: 2, exp: "CMembE" },
    { src: "a(b), b.a, a[b], !a", len: 4, idx: 3, exp: "UnaryE" },
    { src: 'a, 12.3, "Hello"', len: 3, idx: 1, exp: "LitE" },
    { src: 'a, 12.3, "Hello"', len: 3, idx: 2, exp: "LitE" }
  ];
  sequenceCases.forEach(c => {
    it(`Sequence expression: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("SeqE");
      const sequence = expr as SequenceExpression;
      expect(sequence.expressions.length).equal(c.len);
      expect(sequence.expressions[c.idx].type).equal(c.exp);
      expect(sequence.source).equal(c.src)
    });
  });

  const invocationCases = [
    { src: "func()", len: 0, idx: -1, exp: null },
    { src: "func(a, b)", len: 2, idx: 0, exp: "IdE" },
    { src: "func(a, b)", len: 2, idx: 1, exp: "IdE" },
    { src: "func(123, a+b, a[b])", len: 3, idx: 0, exp: "LitE" },
    { src: "func(123, a+b, a[b])", len: 3, idx: 1, exp: "BinaryE" },
    { src: "func(123, a+b, a[b])", len: 3, idx: 2, exp: "CMembE" }
  ];
  invocationCases.forEach(c => {
    it(`FunctionInvocation: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("InvokeE");
      const invocation = expr as FunctionInvocationExpression;
      expect(invocation.object.type).equal("IdE");
      expect(invocation.arguments.length).equal(c.len);
      if (c.len > 0) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(invocation.arguments[c.idx].type).equal(c.exp);
      }
      expect(invocation.source).equal(c.src);
    });
  });

  const objectCases = [
    { src: "func()", exp: "IdE" },
    { src: "(+a)()", exp: "UnaryE" },
    { src: "(a+b)()", exp: "BinaryE" },
    { src: "(a ? b : c)()", exp: "CondE" },
    { src: "(123)()", exp: "LitE" },
    { src: '("Hello")()', exp: "LitE" },
    { src: "(func(a, b))()", exp: "InvokeE" },
    { src: "(a.b)()", exp: "MembE" },
    { src: "(a[b])()", exp: "CMembE" }
  ];
  objectCases.forEach(c => {
    it(`FunctionInvocation object: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("InvokeE");
      const invocation = expr as FunctionInvocationExpression;
      expect(invocation.object.type).equal(c.exp);
      expect(invocation.source).equal(c.src);
    });
  });

  const memberAccessCases = [
    { src: "a.b", exp: "IdE" },
    { src: "(+a).b", exp: "UnaryE" },
    { src: "(a+b).b", exp: "BinaryE" },
    { src: "(a ? b : c).b", exp: "CondE" },
    { src: "(123).b", exp: "LitE" },
    { src: '("Hello").b', exp: "LitE" },
    { src: "(func(a, b)).b", exp: "InvokeE" },
    { src: "(a.b).b", exp: "MembE" },
    { src: "(a[b]).b", exp: "CMembE" }
  ];
  memberAccessCases.forEach(c => {
    it(`MemberAccess: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("MembE");
      const memberAcc = expr as MemberAccessExpression;
      expect(memberAcc.member).eq("b");
      expect(memberAcc.object.type).equal(c.exp);
      expect(memberAcc.source).equal(c.src);
    });
  });

  const spreadCases = [
    { src: "...[1, 2, 3]", exp: "ALitE" },
    { src: "...apple", exp: "IdE" }
  ];
  spreadCases.forEach(c => {
    it(`Spread: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("SpreadE");
      const spread = expr as SpreadExpression;
      expect(spread.operand.type).equal(c.exp);
      expect(spread.source).equal(c.src);
    });
  });

  const prefixCases = [
    { src: "++i", op: "++", exp: "IdE" },
    { src: "++j[2]", op: "++", exp: "CMembE" },
    { src: "--i", op: "--", exp: "IdE" },
    { src: "--j[2]", op: "--", exp: "CMembE" },
  ];
  prefixCases.forEach(c => {
    it(`Prefix: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("PrefE");
      const prefixExpr = expr as PrefixOpExpression;
      expect(prefixExpr.operand.type).equal(c.exp);
      expect(prefixExpr.operator).equal(c.op);
      expect(prefixExpr.source).equal(c.src);
    });
  });

  const postfixCases = [
    { src: "i++", op: "++", exp: "IdE" },
    { src: "j[2]++", op: "++", exp: "CMembE" },
    { src: "i--", op: "--", exp: "IdE" },
    { src: "j[2]--", op: "--", exp: "CMembE" },
  ];
  postfixCases.forEach(c => {
    it(`Postfix: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal("PostfE");
      const postfixExpr = expr as PostfixOpExpression;
      expect(postfixExpr.operand.type).equal(c.exp);
      expect(postfixExpr.operator).equal(c.op);
      expect(postfixExpr.source).equal(c.src);
    });
  });
});
