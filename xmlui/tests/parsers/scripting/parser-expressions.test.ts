import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  FunctionInvocationExpression,
  MemberAccessExpression,
  PostfixOpExpression,
  PrefixOpExpression,
  SequenceExpression,
  SpreadExpression} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_ARRAY_LITERAL,
  T_BINARY_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_POSTFIX_OP_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_SEQUENCE_EXPRESSION,
  T_SPREAD_EXPRESSION,
  T_UNARY_EXPRESSION,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - miscellaneous expressions", () => {
  const sequenceCases = [
    { src: "a, b, a+b", len: 3, idx: 0, exp: T_IDENTIFIER },
    { src: "a, b, a+b", len: 3, idx: 1, exp: T_IDENTIFIER },
    { src: "a, b, a+b", len: 3, idx: 2, exp: T_BINARY_EXPRESSION },
    { src: "a(b), b.a, a[b], !a", len: 4, idx: 0, exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "a(b), b.a, a[b], !a", len: 4, idx: 1, exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "a(b), b.a, a[b], !a", len: 4, idx: 2, exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
    { src: "a(b), b.a, a[b], !a", len: 4, idx: 3, exp: T_UNARY_EXPRESSION },
    { src: 'a, 12.3, "Hello"', len: 3, idx: 1, exp: T_LITERAL },
    { src: 'a, 12.3, "Hello"', len: 3, idx: 2, exp: T_LITERAL },
  ];
  sequenceCases.forEach((c) => {
    it(`Sequence expression: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;

      expect(expr.type).equal(T_SEQUENCE_EXPRESSION);
      const sequence = expr as SequenceExpression;
      expect(sequence.exprs.length).equal(c.len);
      expect(sequence.exprs[c.idx].type).equal(c.exp);
    });
  });

  const invocationCases = [
    { src: "func()", len: 0, idx: -1, exp: null },
    { src: "func(a, b)", len: 2, idx: 0, exp: T_IDENTIFIER },
    { src: "func(a, b)", len: 2, idx: 1, exp: T_IDENTIFIER },
    { src: "func(123, a+b, a[b])", len: 3, idx: 0, exp: T_LITERAL },
    { src: "func(123, a+b, a[b])", len: 3, idx: 1, exp: T_BINARY_EXPRESSION },
    { src: "func(123, a+b, a[b])", len: 3, idx: 2, exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
  ];
  invocationCases.forEach((c) => {
    it(`FunctionInvocation: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(T_FUNCTION_INVOCATION_EXPRESSION);
      const invocation = expr as FunctionInvocationExpression;
      expect(invocation.obj.type).equal(T_IDENTIFIER);
      expect(invocation.arguments.length).equal(c.len);
      if (c.len > 0) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(invocation.arguments[c.idx].type).equal(c.exp);
      }
    });
  });

  const objectCases = [
    { src: "func()", exp: T_IDENTIFIER },
    { src: "(+a)()", exp: T_UNARY_EXPRESSION },
    { src: "(a+b)()", exp: T_BINARY_EXPRESSION },
    { src: "(a ? b : c)()", exp: T_CONDITIONAL_EXPRESSION },
    { src: "(123)()", exp: T_LITERAL },
    { src: '("Hello")()', exp: T_LITERAL },
    { src: "(func(a, b))()", exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "(a.b)()", exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "(a[b])()", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
  ];
  objectCases.forEach((c) => {
    it(`FunctionInvocation object: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(T_FUNCTION_INVOCATION_EXPRESSION);
      const invocation = expr as FunctionInvocationExpression;
      expect(invocation.obj.type).equal(c.exp);
    });
  });

  const memberAccessCases = [
    { src: "a.b", exp: T_IDENTIFIER },
    { src: "(+a).b", exp: T_UNARY_EXPRESSION },
    { src: "(a+b).b", exp: T_BINARY_EXPRESSION },
    { src: "(a ? b : c).b", exp: T_CONDITIONAL_EXPRESSION },
    { src: "(123).b", exp: T_LITERAL },
    { src: '("Hello").b', exp: T_LITERAL },
    { src: "(func(a, b)).b", exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "(a.b).b", exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "(a[b]).b", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
  ];
  memberAccessCases.forEach((c) => {
    it(`MemberAccess: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(T_MEMBER_ACCESS_EXPRESSION);
      const memberAcc = expr as MemberAccessExpression;
      expect(memberAcc.member).eq("b");
      expect(memberAcc.obj.type).equal(c.exp);
    });
  });

  const spreadCases = [
    { src: "...[1, 2, 3]", exp: T_ARRAY_LITERAL },
    { src: "...apple", exp: T_IDENTIFIER },
  ];
  spreadCases.forEach((c) => {
    it(`Spread: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(T_SPREAD_EXPRESSION);
      const spread = expr as SpreadExpression;
      expect(spread.expr.type).equal(c.exp);
    });
  });

  const prefixCases = [
    { src: "++i", op: "++", exp: T_IDENTIFIER },
    { src: "++j[2]", op: "++", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
    { src: "--i", op: "--", exp: T_IDENTIFIER },
    { src: "--j[2]", op: "--", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
  ];
  prefixCases.forEach((c) => {
    it(`Prefix: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(T_PREFIX_OP_EXPRESSION);
      const prefixExpr = expr as PrefixOpExpression;
      expect(prefixExpr.expr.type).equal(c.exp);
      expect(prefixExpr.op).equal(c.op);
    });
  });

  const postfixCases = [
    { src: "i++", op: "++", exp: T_IDENTIFIER },
    { src: "j[2]++", op: "++", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
    { src: "i--", op: "--", exp: T_IDENTIFIER },
    { src: "j[2]--", op: "--", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
  ];
  postfixCases.forEach((c) => {
    it(`Postfix: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(T_POSTFIX_OP_EXPRESSION);
      const postfixExpr = expr as PostfixOpExpression;
      expect(postfixExpr.expr.type).equal(c.exp);
      expect(postfixExpr.op).equal(c.op);
    });
  });
});

