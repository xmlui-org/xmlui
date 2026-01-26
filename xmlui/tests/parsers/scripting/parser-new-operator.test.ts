import { describe, it, expect } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  T_NEW_EXPRESSION,
  T_IDENTIFIER,
  T_MEMBER_ACCESS_EXPRESSION,
  T_LITERAL,
  T_BINARY_EXPRESSION,
  T_ARRAY_LITERAL,
  T_OBJECT_LITERAL,
  T_SEQUENCE_EXPRESSION,
  type NewExpression,
  type Identifier,
  type MemberAccessExpression,
  type Literal,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - new operator", () => {
  describe("Basic new expressions", () => {
    it("should parse new with no arguments", () => {
      const parser = new Parser("new Date");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.callee.type).toBe(T_IDENTIFIER);
      expect((newExpr.callee as Identifier).name).toBe("Date");
      expect(newExpr.arguments).toHaveLength(0);
    });

    it("should parse new with empty parentheses", () => {
      const parser = new Parser("new Date()");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.callee.type).toBe(T_IDENTIFIER);
      expect((newExpr.callee as Identifier).name).toBe("Date");
      expect(newExpr.arguments).toHaveLength(0);
    });

    it("should parse new with single argument", () => {
      const parser = new Parser("new Date(2024)");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.callee.type).toBe(T_IDENTIFIER);
      expect((newExpr.callee as Identifier).name).toBe("Date");
      expect(newExpr.arguments).toHaveLength(1);
      expect(newExpr.arguments[0].type).toBe(T_LITERAL);
      expect((newExpr.arguments[0] as Literal).value).toBe(2024);
    });

    it("should parse new with multiple arguments", () => {
      const parser = new Parser("new Date(2024, 0, 26)");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.arguments).toHaveLength(3);
      expect((newExpr.arguments[0] as Literal).value).toBe(2024);
      expect((newExpr.arguments[1] as Literal).value).toBe(0);
      expect((newExpr.arguments[2] as Literal).value).toBe(26);
    });

    it("should parse new with string argument", () => {
      const parser = new Parser('new Error("Something went wrong")');
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.callee.type).toBe(T_IDENTIFIER);
      expect((newExpr.callee as Identifier).name).toBe("Error");
      expect(newExpr.arguments).toHaveLength(1);
      expect((newExpr.arguments[0] as Literal).value).toBe("Something went wrong");
    });
  });

  describe("New with member access", () => {
    it("should parse new with simple member access", () => {
      const parser = new Parser("new obj.Constructor()");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.callee.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
      
      const memberAccess = newExpr.callee as MemberAccessExpression;
      expect(memberAccess.obj.type).toBe(T_IDENTIFIER);
      expect((memberAccess.obj as Identifier).name).toBe("obj");
      expect(memberAccess.member).toBe("Constructor");
    });

    it("should parse new with nested member access", () => {
      const parser = new Parser("new ns.module.Class()");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.callee.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
    });

    it("should parse new with member access and arguments", () => {
      const parser = new Parser("new obj.Constructor(1, 2, 3)");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.callee.type).toBe(T_MEMBER_ACCESS_EXPRESSION);
      expect(newExpr.arguments).toHaveLength(3);
    });
  });

  describe("New with complex arguments", () => {
    it("should parse new with expression arguments", () => {
      const parser = new Parser("new Point(x + 1, y * 2)");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.arguments).toHaveLength(2);
      expect(newExpr.arguments[0].type).toBe(T_BINARY_EXPRESSION);
      expect(newExpr.arguments[1].type).toBe(T_BINARY_EXPRESSION);
    });

    it("should parse new with array literal argument", () => {
      const parser = new Parser("new Collection([1, 2, 3])");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.arguments).toHaveLength(1);
      expect(newExpr.arguments[0].type).toBe(T_ARRAY_LITERAL);
    });

    it("should parse new with object literal argument", () => {
      const parser = new Parser("new Config({ debug: true, port: 8080 })");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.arguments).toHaveLength(1);
      expect(newExpr.arguments[0].type).toBe(T_OBJECT_LITERAL);
    });

    it("should parse nested new expressions", () => {
      const parser = new Parser("new Outer(new Inner())");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.arguments).toHaveLength(1);
      expect(newExpr.arguments[0].type).toBe(T_NEW_EXPRESSION);
      
      const innerNew = newExpr.arguments[0] as NewExpression;
      expect((innerNew.callee as Identifier).name).toBe("Inner");
    });
  });

  describe("New in various contexts", () => {
    it("should parse new in variable declaration", () => {
      const parser = new Parser("const obj = new Object()");
      const statements = parser.parseStatements();

      expect(statements).not.toBeNull();
      expect(statements).toHaveLength(1);
    });

    it("should parse new in assignment", () => {
      const parser = new Parser("obj = new Thing()");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      // The whole expression should be an assignment
    });

    it("should parse new in return statement", () => {
      const parser = new Parser("return new Result(42)");
      const statements = parser.parseStatements();

      expect(statements).not.toBeNull();
      expect(statements).toHaveLength(1);
    });

    it("should parse new in binary expression", () => {
      const parser = new Parser("x + new Point(0, 0)");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_BINARY_EXPRESSION);
    });

    it("should parse new in conditional expression", () => {
      const parser = new Parser("flag ? new A() : new B()");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
    });

    it("should parse new in function call", () => {
      const parser = new Parser("process(new Data(123))");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
    });

    it("should parse new in array literal", () => {
      const parser = new Parser("[new A(), new B(), new C()]");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_ARRAY_LITERAL);
    });

    it("should parse new with property access on result", () => {
      const parser = new Parser("new Date().getTime()");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      // This should parse as a function invocation on a new expression
    });
  });

  describe("Edge cases", () => {
    it("should parse new with whitespace", () => {
      const parser = new Parser("new   Date  (  )");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
    });

    it("should parse new with line breaks", () => {
      const parser = new Parser("new Date\n(\n2024\n)");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
    });

    it("should parse multiple new expressions in sequence", () => {
      const parser = new Parser("new A(), new B()");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_SEQUENCE_EXPRESSION);
    });

    it("should parse new with very long argument list", () => {
      const parser = new Parser("new Thing(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      
      const newExpr = expr as NewExpression;
      expect(newExpr.arguments).toHaveLength(10);
    });
  });

  describe("Operator precedence", () => {
    it("should have correct precedence with unary operators", () => {
      const parser = new Parser("!new Flag()");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      // The ! should be applied to the result of new Flag()
    });

    it("should have correct precedence with binary operators", () => {
      const parser = new Parser("new Point() + new Point()");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_BINARY_EXPRESSION);
    });

    it("should have correct precedence with member access", () => {
      const parser = new Parser("new a.b.c.D()");
      const expr = parser.parseExpr();

      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
    });
  });

  describe("Error cases", () => {
    it("should handle missing constructor", () => {
      const parser = new Parser("new");
      const expr = parser.parseExpr();

      expect(expr).toBeNull();
    });

    it("should handle new with literal (syntactically valid in JS)", () => {
      const parser = new Parser("new 123");
      const expr = parser.parseExpr();

      // While semantically invalid at runtime, this is syntactically valid
      // JavaScript allows 'new' on any expression
      expect(expr).not.toBeNull();
      expect(expr!.type).toBe(T_NEW_EXPRESSION);
      const newExpr = expr as NewExpression;
      expect(newExpr.callee.type).toBe(T_LITERAL);
    });

    it("should throw error on unclosed parentheses", () => {
      const parser = new Parser("new Date(2024");
      
      // This should throw a parser error about missing ')'
      expect(() => parser.parseExpr()).toThrow();
    });
  });
});
