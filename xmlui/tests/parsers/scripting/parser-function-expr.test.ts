import { describe, expect, it, assert } from "vitest";

import { Parser } from "@parsers/scripting/Parser";
import {
  ArrowExpression,
  BlockStatement,
  Destructure,
  FunctionInvocationExpression,
  Identifier,
  SpreadExpression,
} from "@abstractions/scripting/ScriptingSourceTree";

describe("Parser - function expressions", () => {
  it("No param", () => {
    // --- Arrange
    const source = "function () {2*v}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(0);
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("No param with name", () => {
    // --- Arrange
    const source = "function myFunc () {2*v}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(0);
    expect(arrowExpr.name).equal("myFunc");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("Single param", () => {
    // --- Arrange
    const source = "function(v) {2*v}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Identifier).name).equal("v");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("Multiple params", () => {
    // --- Arrange
    const source = "function (v, w) {2*v + w}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(2);
    expect((arrowExpr.args[0] as Identifier).name).equal("v");
    expect((arrowExpr.args[1] as Identifier).name).equal("w");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("Block statement #2", () => {
    // --- Arrange
    const source = "function (v, w) { let x = 3; 2*v + w + x }";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(2);
    expect((arrowExpr.args[0] as Identifier).name).equal("v");
    expect((arrowExpr.args[1] as Identifier).name).equal("w");
    expect(arrowExpr.statement.type).equal("BlockS");
    const stmts = arrowExpr.statement as BlockStatement;
    expect(stmts.statements.length).equal(2);
    expect(stmts.statements[0].type).equal("LetS");
    expect(stmts.statements[1].type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("Function invocation #1", () => {
    // --- Arrange
    const source = "(function() {2*v})()";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("InvokeE");
    const funcExpr = expr as FunctionInvocationExpression;
    expect(funcExpr.arguments.length).equal(0);
    expect(funcExpr.object.type).equal("ArrowE");
    expect(funcExpr.source).equal(source);
  });

  it("Function invocation #2", () => {
    // --- Arrange
    const source = "(function (x, y) {x + y})(12, 23)";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("InvokeE");
    const funcExpr = expr as FunctionInvocationExpression;
    expect(funcExpr.arguments.length).equal(2);
    expect(funcExpr.object.type).equal("ArrowE");
    expect(funcExpr.source).equal(source);
  });

  it("Single object destructure #1", () => {
    // --- Arrange
    const source = "function ({x, y}) {x + y}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Destructure).objectDestruct![0].id).equal("x");
    expect((arrowExpr.args[0] as Destructure).objectDestruct![1].id).equal("y");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("Single object destructure #2", () => {
    // --- Arrange
    const source = "function ({x, y:q}) {x + q}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Destructure).objectDestruct![0].id).equal("x");
    expect((arrowExpr.args[0] as Destructure).objectDestruct![1].id).equal("y");
    expect((arrowExpr.args[0] as Destructure).objectDestruct![1].alias).equal("q");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("Single object destructure #3", () => {
    // --- Arrange
    const source = "function ({x, y: {v, w}}) {3}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Destructure).objectDestruct![0].id).equal("x");
    expect((arrowExpr.args[0] as Destructure).objectDestruct![1].objectDestruct![0].id).equal("v");
    expect((arrowExpr.args[0] as Destructure).objectDestruct![1].objectDestruct![1].id).equal("w");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("Single array destructure #1", () => {
    // --- Arrange
    const source = "function ([x, y]) {return x + y}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![0].id).equal("x");
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![1].id).equal("y");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("RetS");
    expect(arrowExpr.source).equal(source);
  });

  it("Single array destructure #2", () => {
    // --- Arrange
    const source = "function ([x,, y]) {x + y}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![0].id).equal("x");
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![1].id).equal(undefined);
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![2].id).equal("y");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("Complex destructure #1", () => {
    // --- Arrange
    const source = "function ([a,, b], {c, y:d}) {1}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(2);
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![0].id).equal("a");
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![1].id).equal(undefined);
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![2].id).equal("b");
    expect((arrowExpr.args[1] as Destructure).objectDestruct![0].id).equal("c");
    expect((arrowExpr.args[1] as Destructure).objectDestruct![1].id).equal("y");
    expect((arrowExpr.args[1] as Destructure).objectDestruct![1].alias).equal("d");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("Complex destructure #2", () => {
    // --- Arrange
    const source = "function ([a,, b], {c, y:d}, e) {1}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(3);
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![0].id).equal("a");
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![1].id).equal(undefined);
    expect((arrowExpr.args[0] as Destructure).arrayDestruct![2].id).equal("b");
    expect((arrowExpr.args[1] as Destructure).objectDestruct![0].id).equal("c");
    expect((arrowExpr.args[1] as Destructure).objectDestruct![1].id).equal("y");
    expect((arrowExpr.args[2] as Identifier).name).equal("e");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
    expect(arrowExpr.source).equal(source);
  });

  it("Single rest param", () => {
    // --- Arrange
    const source = "function (...v) {2*v}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    const spread = arrowExpr.args[0] as SpreadExpression;
    expect((spread.operand as Identifier).name).equal("v");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
  });

  it("Multiple rest param", () => {
    // --- Arrange
    const source = "function (v, ...w) {2*v}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("ArrowE");
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(2);
    const id = arrowExpr.args[0] as Identifier;
    expect(id.name).equal("v");
    const spread = arrowExpr.args[1] as SpreadExpression;
    expect((spread.operand as Identifier).name).equal("w");
    const stmt = (arrowExpr.statement as BlockStatement).statements[0];
    expect(stmt.type).equal("ExprS");
  });

  it("Fails with rest params #1", () => {
    // --- Arrange
    const source = "function myFunc(...a, b) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    try {
      wParser.parseStatements()!;
    } catch (err) {
      // --- Assert
      expect(err.toString().includes("argument")).toBe(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("Fails with rest params #2", () => {
    // --- Arrange
    const source = "function (...(a+b)) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    try {
      wParser.parseExpr()!;
    } catch (err) {
      // --- Assert
      expect(err.toString().includes("argument")).toBe(true);
      return;
    }
    assert.fail("Exception expected");
  });
});
