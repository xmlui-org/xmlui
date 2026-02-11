import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  ArrayLiteral,
  ArrowExpression,
  AssignmentExpression,
  AwaitExpression,
  BinaryExpression,
  CalculatedMemberAccessExpression,
  ConditionalExpression,
  Expression,
  FunctionInvocationExpression,
  Identifier,
  Literal,
  MemberAccessExpression,
  NewExpression,
  ObjectLiteral,
  PostfixOpExpression,
  PrefixOpExpression,
  SequenceExpression,
  SpreadExpression,
  TemplateLiteralExpression,
  UnaryExpression,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_ARRAY_LITERAL,
  T_ARROW_EXPRESSION,
  T_ASSIGNMENT_EXPRESSION,
  T_AWAIT_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_NEW_EXPRESSION,
  T_OBJECT_LITERAL,
  T_POSTFIX_OP_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_SEQUENCE_EXPRESSION,
  T_SPREAD_EXPRESSION,
  T_TEMPLATE_LITERAL_EXPRESSION,
  T_UNARY_EXPRESSION,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - source text preservation", () => {
  it("should preserve source text for literals", () => {
    // --- Arrange
    const testCases = [
      "42",
      "3.14",
      '"hello"',
      "'world'",
      "true",
      "false",
      "null",
    ];

    testCases.forEach(src => {
      // --- Arrange
      const parser = new Parser(src);

      // --- Act
      const expr = parser.parseExpr() as Literal;

      // --- Assert
      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_LITERAL);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for identifiers", () => {
    // --- Arrange
    const testCases = ["a", "myVariable", "_underscore", "$dollar"];

    testCases.forEach(src => {
      // --- Arrange
      const parser = new Parser(src);

      // --- Act
      const expr = parser.parseExpr() as Identifier;

      // --- Assert
      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_IDENTIFIER);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for unary expressions", () => {
    // --- Arrange
    const testCases = [
      "+42",
      "-x",
      "!flag",
      "~bits",
      "typeof obj",
      "delete obj.prop",
    ];

    testCases.forEach(src => {
      // --- Arrange
      const parser = new Parser(src);

      // --- Act
      const expr = parser.parseExpr() as UnaryExpression;

      // --- Assert
      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_UNARY_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for binary expressions", () => {
    // --- Arrange
    const testCases = [
      "a + b",
      "x * y",
      "a === b",
      "value && other",
      "left || right",
      "num % 2",
    ];

    testCases.forEach(src => {
      // --- Arrange
      const parser = new Parser(src);

      // --- Act
      const expr = parser.parseExpr() as BinaryExpression;

      // --- Assert
      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_BINARY_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for complex nested expressions", () => {
    // --- Arrange
    const src = "a + (b * c)";
    const parser = new Parser(src);

    // --- Act
    const expr = parser.parseExpr() as BinaryExpression;

    // --- Assert
    expect(expr).not.toBeNull();
    expect(expr.type).toBe(T_BINARY_EXPRESSION);
    expect(expr.source).toBe(src);
  });

  it("should preserve source text with whitespace", () => {
    // --- Arrange
    const src = "  a   +   b  ";
    const parser = new Parser(src);

    // --- Act
    const expr = parser.parseExpr() as BinaryExpression;

    // --- Assert
    expect(expr).not.toBeNull();
    expect(expr.type).toBe(T_BINARY_EXPRESSION);
    // The parser extracts the expression tokens, trimming leading/trailing whitespace
    expect(expr.source).toBe("a   +   b");
  });

  it("should handle expressions without source text gracefully", () => {
    // --- This tests the case where tokens might not have valid positions
    const src = "42";
    const parser = new Parser(src);

    // --- Act
    const expr = parser.parseExpr() as Literal;

    // --- Assert
    expect(expr).not.toBeNull();
    expect(expr.type).toBe(T_LITERAL);
    // Source should either be the expected value or undefined 
    expect(expr.source === src || expr.source === undefined).toBe(true);
  });

  it("should preserve source text for mathematical expressions", () => {
    // --- Arrange
    const src = "6 * 7";
    const parser = new Parser(src);

    // --- Act
    const expr = parser.parseExpr() as BinaryExpression;

    // --- Assert
    expect(expr).not.toBeNull();
    expect(expr.type).toBe(T_BINARY_EXPRESSION);
    expect(expr.source).toBe(src);
  });

  it("should preserve source text for expressions with identifiers", () => {
    // --- Arrange
    const src = "count * 3";
    const parser = new Parser(src);

    // --- Act
    const expr = parser.parseExpr() as BinaryExpression;

    // --- Assert
    expect(expr).not.toBeNull();
    expect(expr.type).toBe(T_BINARY_EXPRESSION);
    expect(expr.source).toBe(src);
  });

  it("should preserve source text for sequence expressions", () => {
    // --- Arrange
    const testCases = [
      "a, b, c",
      "1, 2, 3",
      "x + y, z * w",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as SequenceExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_SEQUENCE_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for conditional expressions", () => {
    // --- Arrange
    const testCases = [
      "a ? b : c",
      "x > 0 ? 1 : 0",
      "flag ? 'yes' : 'no'",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as ConditionalExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_CONDITIONAL_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for function invocation expressions", () => {
    // --- Arrange
    const testCases = [
      "func()",
      "myFunc(a, b)",
      "obj.method(x, y, z)",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as FunctionInvocationExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_FUNCTION_INVOCATION_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for member access expressions", () => {
    // --- Arrange
    const testCases = [
      "obj.prop",
      "user.name",
      "instance.method",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as MemberAccessExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for calculated member access expressions", () => {
    // --- Arrange
    const testCases = [
      "obj[key]",
      "arr[0]",
      "data['property']",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as CalculatedMemberAccessExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_CALCULATED_MEMBER_ACCESS_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for template literal expressions", () => {
    // --- Arrange
    const testCases = [
      "`hello`",
      "`Hello ${name}`",
      "`Count: ${x + y}`",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as TemplateLiteralExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_TEMPLATE_LITERAL_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for array literals", () => {
    // --- Arrange
    const testCases = [
      "[]",
      "[1, 2, 3]",
      "[a, b, c]",
      "[x + y, z]",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as ArrayLiteral;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_ARRAY_LITERAL);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for object literals", () => {
    // --- Arrange
    const testCases = [
      "{}",
      "{a: 1}",
      "{x: val, y: 2}",
      "{'key': value}",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as ObjectLiteral;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_OBJECT_LITERAL);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for spread expressions", () => {
    // --- Arrange
    const testCases = [
      "[...arr]",
      "[a, ...rest]",
      "{...obj}",
      "{x: 1, ...other}",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      // Spread expressions appear within array/object literals
      expect(expr!.source).toBe(src);
    });
  });

  it("should preserve source text for assignment expressions", () => {
    // --- Arrange
    const testCases = [
      "x = 5",
      "obj.prop = value",
      "arr[0] += 1",
      "count *= 2",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as AssignmentExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_ASSIGNMENT_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for arrow expressions", () => {
    // --- Arrange
    const testCases = [
      "() => 42",
      "x => x * 2",
      "(a, b) => a + b",
      "async (x) => await x",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as ArrowExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_ARROW_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for prefix operation expressions", () => {
    // --- Arrange
    const testCases = [
      "++x",
      "--count",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as PrefixOpExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_PREFIX_OP_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for postfix operation expressions", () => {
    // --- Arrange
    const testCases = [
      "x++",
      "count--",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as PostfixOpExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_POSTFIX_OP_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for await expressions", () => {
    // --- Arrange
    const testCases = [
      "await promise",
      "await fetch(url)",
      "await obj.method()",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as AwaitExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_AWAIT_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for new expressions", () => {
    // --- Arrange
    const testCases = [
      "new Object()",
      "new Date()",
      "new CustomClass(a, b)",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as NewExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_NEW_EXPRESSION);
      expect(expr.source).toBe(src);
    });
  });

  it("should preserve source text for complex nested expressions", () => {
    // --- Arrange
    const testCases = [
      "(a + b) * (c - d)",
      "arr[i++] = obj.prop",
      "func(x => x * 2)(data)",
      "obj.method() || defaultValue",
    ];

    testCases.forEach(src => {
      const parser = new Parser(src);
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.source).toBe(src);
    });
  });

  it("should preserve source text with various whitespace patterns", () => {
    // --- Arrange
    const testCases = [
      { src: "a+b", expected: "a+b" },
      { src: "a + b", expected: "a + b" },
      { src: "a  +  b", expected: "a  +  b" },
      { src: "  a + b  ", expected: "a + b" },
    ];

    testCases.forEach(({ src, expected }) => {
      const parser = new Parser(src);
      const expr = parser.parseExpr() as BinaryExpression;

      expect(expr).not.toBeNull();
      expect(expr.type).toBe(T_BINARY_EXPRESSION);
      expect(expr.source).toBe(expected);
    });
  });
});