import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  ArrowExpression,
  AwaitExpression,
  FunctionDeclaration,
  Identifier,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_ARROW_EXPRESSION,
  T_ASYNC_FUNCTION_DECLARATION,
  T_AWAIT_EXPRESSION,
  T_BLOCK_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FUNCTION_DECLARATION,
  T_IDENTIFIER,
  T_RETURN_STATEMENT,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - async/await", () => {
  describe("Async function declarations", () => {
    it("async function with no parameters", () => {
      // --- Arrange
      const source = "async function myFunc() { return 42; }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const stmt = stmts[0] as FunctionDeclaration;
      expect(stmt.type).toEqual(T_ASYNC_FUNCTION_DECLARATION);
      expect(stmt.async).toBe(true);
      expect(stmt.id.name).toEqual("myFunc");
      expect(stmt.args.length).toEqual(0);
      expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
    });

    it("async function with single parameter", () => {
      // --- Arrange
      const source = "async function fetchData(url) { return await fetch(url); }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const stmt = stmts[0] as FunctionDeclaration;
      expect(stmt.type).toEqual(T_ASYNC_FUNCTION_DECLARATION);
      expect(stmt.async).toBe(true);
      expect(stmt.id.name).toEqual("fetchData");
      expect(stmt.args.length).toEqual(1);
      expect(stmt.args[0].type).toEqual(T_IDENTIFIER);
      expect((stmt.args[0] as Identifier).name).toEqual("url");
    });

    it("async function with multiple parameters", () => {
      // --- Arrange
      const source = "async function process(x, y, z) { return x + y + z; }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const stmt = stmts[0] as FunctionDeclaration;
      expect(stmt.type).toEqual(T_ASYNC_FUNCTION_DECLARATION);
      expect(stmt.async).toBe(true);
      expect(stmt.id.name).toEqual("process");
      expect(stmt.args.length).toEqual(3);
      expect((stmt.args[0] as Identifier).name).toEqual("x");
      expect((stmt.args[1] as Identifier).name).toEqual("y");
      expect((stmt.args[2] as Identifier).name).toEqual("z");
    });

    it("async function with destructured parameters", () => {
      // --- Arrange
      const source = "async function myFunc({x, y}) { return x + y; }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const stmt = stmts[0] as FunctionDeclaration;
      expect(stmt.type).toEqual(T_ASYNC_FUNCTION_DECLARATION);
      expect(stmt.async).toBe(true);
      expect(stmt.id.name).toEqual("myFunc");
      expect(stmt.args.length).toEqual(1);
    });

    it("regular function is not async", () => {
      // --- Arrange
      const source = "function myFunc() { return 42; }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const stmt = stmts[0] as FunctionDeclaration;
      expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
      expect(stmt.async).toBeUndefined();
    });
  });

  describe("Async arrow functions", () => {
    it("async arrow function with no parameters", () => {
      // --- Arrange
      const source = "const f = async () => { return 42; }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      expect(stmts[0].type).toEqual(6); // T_CONST_STATEMENT
      const constStmt = stmts[0] as any;
      const arrowExpr = constStmt.decls[0].expr as ArrowExpression;
      expect(arrowExpr.type).toEqual(T_ARROW_EXPRESSION);
      expect(arrowExpr.async).toBe(true);
      expect(arrowExpr.args.length).toEqual(0);
    });

    it("async arrow function with single parameter", () => {
      // --- Arrange
      const source = "const f = async (x) => x * 2";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      const arrowExpr = constStmt.decls[0].expr as ArrowExpression;
      expect(arrowExpr.type).toEqual(T_ARROW_EXPRESSION);
      expect(arrowExpr.async).toBe(true);
      expect(arrowExpr.args.length).toEqual(1);
      expect((arrowExpr.args[0] as Identifier).name).toEqual("x");
    });

    it("async arrow function with single parameter without parentheses", () => {
      // --- Arrange
      const source = "const f = async x => x * 2";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      const arrowExpr = constStmt.decls[0].expr as ArrowExpression;
      expect(arrowExpr.type).toEqual(T_ARROW_EXPRESSION);
      expect(arrowExpr.async).toBe(true);
      expect(arrowExpr.args.length).toEqual(1);
      expect((arrowExpr.args[0] as Identifier).name).toEqual("x");
    });

    it("async arrow function with multiple parameters", () => {
      // --- Arrange
      const source = "const f = async (x, y) => x + y";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      const arrowExpr = constStmt.decls[0].expr as ArrowExpression;
      expect(arrowExpr.type).toEqual(T_ARROW_EXPRESSION);
      expect(arrowExpr.async).toBe(true);
      expect(arrowExpr.args.length).toEqual(2);
      expect((arrowExpr.args[0] as Identifier).name).toEqual("x");
      expect((arrowExpr.args[1] as Identifier).name).toEqual("y");
    });

    it("async arrow function with block statement", () => {
      // --- Arrange
      const source = "const f = async (x) => { return await doSomething(x); }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      const arrowExpr = constStmt.decls[0].expr as ArrowExpression;
      expect(arrowExpr.type).toEqual(T_ARROW_EXPRESSION);
      expect(arrowExpr.async).toBe(true);
      expect(arrowExpr.statement.type).toEqual(T_BLOCK_STATEMENT);
    });

    it("regular arrow function is not async", () => {
      // --- Arrange
      const source = "const f = (x) => x * 2";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      const arrowExpr = constStmt.decls[0].expr as ArrowExpression;
      expect(arrowExpr.type).toEqual(T_ARROW_EXPRESSION);
      expect(arrowExpr.async).toBeUndefined();
    });
  });

  describe("Async function expressions", () => {
    it("async function expression with name", () => {
      // --- Arrange
      const source = "const f = async function myFunc(x) { return x * 2; }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      const funcExpr = constStmt.decls[0].expr as ArrowExpression;
      expect(funcExpr.type).toEqual(T_ARROW_EXPRESSION);
      expect(funcExpr.async).toBe(true);
      expect(funcExpr.name).toEqual("myFunc");
      expect(funcExpr.args.length).toEqual(1);
    });

    it("async function expression without name", () => {
      // --- Arrange
      const source = "const f = async function(x) { return x * 2; }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      const funcExpr = constStmt.decls[0].expr as ArrowExpression;
      expect(funcExpr.type).toEqual(T_ARROW_EXPRESSION);
      expect(funcExpr.async).toBe(true);
      expect(funcExpr.name).toBeUndefined();
    });
  });

  describe("Await expressions", () => {
    it("simple await expression", () => {
      // --- Arrange
      const source = "await promise";
      const wParser = new Parser(source);

      // --- Act
      const expr = wParser.parseExpr()!;

      // --- Assert
      expect(expr.type).toEqual(T_AWAIT_EXPRESSION);
      const awaitExpr = expr as AwaitExpression;
      expect(awaitExpr.expr.type).toEqual(T_IDENTIFIER);
      expect((awaitExpr.expr as Identifier).name).toEqual("promise");
    });

    it("await function call", () => {
      // --- Arrange
      const source = "await fetch(url)";
      const wParser = new Parser(source);

      // --- Act
      const expr = wParser.parseExpr()!;

      // --- Assert
      expect(expr.type).toEqual(T_AWAIT_EXPRESSION);
      const awaitExpr = expr as AwaitExpression;
      expect(awaitExpr.expr.type).toEqual(104); // T_FUNCTION_INVOCATION_EXPRESSION
    });

    it("await member access", () => {
      // --- Arrange
      const source = "await obj.promise";
      const wParser = new Parser(source);

      // --- Act
      const expr = wParser.parseExpr()!;

      // --- Assert
      expect(expr.type).toEqual(T_AWAIT_EXPRESSION);
      const awaitExpr = expr as AwaitExpression;
      expect(awaitExpr.expr.type).toEqual(105); // T_MEMBER_ACCESS_EXPRESSION
    });

    it("await in return statement", () => {
      // --- Arrange
      const source = "return await promise";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      expect(stmts[0].type).toEqual(T_RETURN_STATEMENT);
      const returnStmt = stmts[0] as any;
      expect(returnStmt.expr.type).toEqual(T_AWAIT_EXPRESSION);
    });

    it("await in variable declaration", () => {
      // --- Arrange
      const source = "const result = await fetchData()";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      expect(constStmt.decls[0].expr.type).toEqual(T_AWAIT_EXPRESSION);
    });

    it("chained await expressions", () => {
      // --- Arrange
      const source = "await await promise";
      const wParser = new Parser(source);

      // --- Act
      const expr = wParser.parseExpr()!;

      // --- Assert
      expect(expr.type).toEqual(T_AWAIT_EXPRESSION);
      const outerAwait = expr as AwaitExpression;
      expect(outerAwait.expr.type).toEqual(T_AWAIT_EXPRESSION);
    });

    it("await in binary expression", () => {
      // --- Arrange
      const source = "(await a) + (await b)";
      const wParser = new Parser(source);

      // --- Act
      const expr = wParser.parseExpr()!;

      // --- Assert
      expect(expr.type).toEqual(101); // T_BINARY_EXPRESSION
      const binaryExpr = expr as any;
      expect(binaryExpr.left.type).toEqual(T_AWAIT_EXPRESSION);
      expect(binaryExpr.right.type).toEqual(T_AWAIT_EXPRESSION);
    });
  });

  describe("Combined async/await usage", () => {
    it("async function with await in body", () => {
      // --- Arrange
      const source = "async function fetchUser(id) { const data = await fetch(id); return data; }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const funcDecl = stmts[0] as FunctionDeclaration;
      expect(funcDecl.type).toEqual(T_ASYNC_FUNCTION_DECLARATION);
      expect(funcDecl.async).toBe(true);
      expect(funcDecl.stmt.stmts.length).toEqual(2);
      // First statement should be const with await
      expect(funcDecl.stmt.stmts[0].type).toEqual(6); // T_CONST_STATEMENT
    });

    it("async arrow function with await", () => {
      // --- Arrange
      const source = "const f = async (x) => await process(x)";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      const arrowExpr = constStmt.decls[0].expr as ArrowExpression;
      expect(arrowExpr.async).toBe(true);
      expect(arrowExpr.statement.type).toEqual(T_EXPRESSION_STATEMENT);
      const exprStmt = arrowExpr.statement as any;
      expect(exprStmt.expr.type).toEqual(T_AWAIT_EXPRESSION);
    });

    it("nested async functions", () => {
      // --- Arrange
      const source = "async function outer() { async function inner() { return await x; } return await inner(); }";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const outerFunc = stmts[0] as FunctionDeclaration;
      expect(outerFunc.type).toEqual(T_ASYNC_FUNCTION_DECLARATION);
      expect(outerFunc.async).toBe(true);
      expect(outerFunc.stmt.stmts.length).toEqual(2);
      // First statement should be inner async function
      const innerFunc = outerFunc.stmt.stmts[0] as FunctionDeclaration;
      expect(innerFunc.type).toEqual(T_ASYNC_FUNCTION_DECLARATION);
      expect(innerFunc.async).toBe(true);
    });

    it("async in expression position", () => {
      // --- Arrange
      const source = "const funcs = [async () => 1, async () => 2]";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      const arrayLiteral = constStmt.decls[0].expr;
      expect(arrayLiteral.type).toEqual(110); // T_ARRAY_LITERAL
      expect(arrayLiteral.items.length).toEqual(2);
      expect(arrayLiteral.items[0].type).toEqual(T_ARROW_EXPRESSION);
      expect(arrayLiteral.items[0].async).toBe(true);
      expect(arrayLiteral.items[1].type).toEqual(T_ARROW_EXPRESSION);
      expect(arrayLiteral.items[1].async).toBe(true);
    });
  });

  describe("Edge cases and contextual keywords", () => {
    it("async as variable name", () => {
      // --- Arrange
      const source = "const async = 42";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      expect(constStmt.decls[0].id).toEqual("async");
    });

    it("await as variable name", () => {
      // --- Arrange
      const source = "const await = 42";
      const wParser = new Parser(source);

      // --- Act
      const stmts = wParser.parseStatements()!;

      // --- Assert
      expect(stmts.length).toEqual(1);
      const constStmt = stmts[0] as any;
      expect(constStmt.decls[0].id).toEqual("await");
    });

    it("async property access", () => {
      // --- Arrange
      const source = "obj.async";
      const wParser = new Parser(source);

      // --- Act
      const expr = wParser.parseExpr()!;

      // --- Assert
      expect(expr.type).toEqual(105); // T_MEMBER_ACCESS_EXPRESSION
      const memberExpr = expr as any;
      expect(memberExpr.member).toEqual("async");
    });

    it("await property access", () => {
      // --- Arrange
      const source = "obj.await";
      const wParser = new Parser(source);

      // --- Act
      const expr = wParser.parseExpr()!;

      // --- Assert
      expect(expr.type).toEqual(105); // T_MEMBER_ACCESS_EXPRESSION
      const memberExpr = expr as any;
      expect(memberExpr.member).toEqual("await");
    });
  });
});
