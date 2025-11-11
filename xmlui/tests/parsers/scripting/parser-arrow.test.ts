import { describe, expect, it, assert } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  ArrowExpression,
  BlockStatement,
  Destructure,
  FunctionInvocationExpression,
  Identifier,
  SpreadExpression} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_ARROW_EXPRESSION,
  T_BLOCK_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_LET_STATEMENT,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - arrow expressions", () => {
  it("No param", () => {
    // --- Arrange
    const source = "() => 2*v";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(0);
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Single param", () => {
    // --- Arrange
    const source = "v => 2*v";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Identifier).name).equal("v");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Single (param)", () => {
    // --- Arrange
    const source = "(v) => 2*v";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Identifier).name).equal("v");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  const invalidLeftCases = [
    "2 => 2*v",
    "a+2 => 2*v",
    "(a, a+2) => 2*v",
    "(a+2) => 2*v",
    "(!a) => 2*v",
    "((a)) => 2*v",
  ];
  invalidLeftCases.forEach((c) => {
    it(`Invalid param: '${c}' `, () => {
      // --- Arrange
      const wParser = new Parser(c);

      // --- Act/Assert
      try {
        wParser.parseExpr();
      } catch (err: any) {
        expect(err.toString()).contains("Invalid");
        return;
      }
      assert.fail("Exception expected");
    });
  });

  it("multiple params", () => {
    // --- Arrange
    const source = "(v, w) => 2*v + w";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(2);
    expect((arrowExpr.args[0] as Identifier).name).equal("v");
    expect((arrowExpr.args[1] as Identifier).name).equal("w");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Block statement #1", () => {
    // --- Arrange
    const source = "(v, w) => { 2*v + w }";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(2);
    expect((arrowExpr.args[0] as Identifier).name).equal("v");
    expect((arrowExpr.args[1] as Identifier).name).equal("w");
    expect(arrowExpr.statement.type).equal(T_BLOCK_STATEMENT);
    const stmts = arrowExpr.statement as BlockStatement;
    expect(stmts.stmts.length).equal(1);
    expect(stmts.stmts[0].type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Block statement #2", () => {
    // --- Arrange
    const source = "(v, w) => { let x = 3; 2*v + w + x }";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(2);
    expect((arrowExpr.args[0] as Identifier).name).equal("v");
    expect((arrowExpr.args[1] as Identifier).name).equal("w");
    expect(arrowExpr.statement.type).equal(T_BLOCK_STATEMENT);
    const stmts = arrowExpr.statement as BlockStatement;
    expect(stmts.stmts.length).equal(2);
    expect(stmts.stmts[0].type).equal(T_LET_STATEMENT);
    expect(stmts.stmts[1].type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Block statement #3", () => {
    // --- Arrange
    const source = "() => { Action.somethings() }";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(0);
    expect(arrowExpr.statement.type).equal(T_BLOCK_STATEMENT);
  });

  it("Block statement #4", () => {
    // --- Arrange
    const source =
      "(item) => { \n" +
      "  Actions.DeleteEntityAction({\n" +
      '    entityId: "apiFile",\n' +
      "    entityDisplayName: item,\n" +
      "    params: {\n" +
      "      nodeId: $props.nodeId,\n" +
      "      id: item\n" +
      "    }\n" +
      "  })\n" +
      "}";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect(arrowExpr.statement.type).equal(T_BLOCK_STATEMENT);
  });

  it("Arrow function invocation #1", () => {
    // --- Arrange
    const source = "(() => 2*v)()";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_FUNCTION_INVOCATION_EXPRESSION);
    const funcExpr = expr as FunctionInvocationExpression;
    expect(funcExpr.arguments.length).equal(0);
    expect(funcExpr.obj.type).equal(T_ARROW_EXPRESSION);
  });

  it("Arrow function invocation #2", () => {
    // --- Arrange
    const source = "((x, y) => x + y)(12, 23)";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_FUNCTION_INVOCATION_EXPRESSION);
    const funcExpr = expr as FunctionInvocationExpression;
    expect(funcExpr.arguments.length).equal(2);
    expect(funcExpr.obj.type).equal(T_ARROW_EXPRESSION);
  });

  it("Arrow function invocation #2", () => {
    // --- Arrange
    const source = "((x, y) => x + y)(12, 23)";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_FUNCTION_INVOCATION_EXPRESSION);
    const funcExpr = expr as FunctionInvocationExpression;
    expect(funcExpr.arguments.length).equal(2);
    expect(funcExpr.obj.type).equal(T_ARROW_EXPRESSION);
  });

  it("Single object destructure #1", () => {
    // --- Arrange
    const source = "({x, y}) => x + y";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Destructure).oDestr![0].id).equal("x");
    expect((arrowExpr.args[0] as Destructure).oDestr![1].id).equal("y");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Single object destructure #2", () => {
    // --- Arrange
    const source = "({x, y:q}) => x + q";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Destructure).oDestr![0].id).equal("x");
    expect((arrowExpr.args[0] as Destructure).oDestr![1].id).equal("y");
    expect((arrowExpr.args[0] as Destructure).oDestr![1].alias).equal("q");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Single object destructure #3", () => {
    // --- Arrange
    const source = "({x, y: {v, w}}) => 3";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Destructure).oDestr![0].id).equal("x");
    expect((arrowExpr.args[0] as Destructure).oDestr![1].oDestr![0].id).equal("v");
    expect((arrowExpr.args[0] as Destructure).oDestr![1].oDestr![1].id).equal("w");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Single array destructure #1", () => {
    // --- Arrange
    const source = "([x, y]) => x + y";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Destructure).aDestr![0].id).equal("x");
    expect((arrowExpr.args[0] as Destructure).aDestr![1].id).equal("y");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Single array destructure #2", () => {
    // --- Arrange
    const source = "([x,, y]) => x + y";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    expect((arrowExpr.args[0] as Destructure).aDestr![0].id).equal("x");
    expect((arrowExpr.args[0] as Destructure).aDestr![1].id).equal(undefined);
    expect((arrowExpr.args[0] as Destructure).aDestr![2].id).equal("y");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Complex destructure #1", () => {
    // --- Arrange
    const source = "([a,, b], {c, y:d}) => 1";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(2);
    expect((arrowExpr.args[0] as Destructure).aDestr![0].id).equal("a");
    expect((arrowExpr.args[0] as Destructure).aDestr![1].id).equal(undefined);
    expect((arrowExpr.args[0] as Destructure).aDestr![2].id).equal("b");
    expect((arrowExpr.args[1] as Destructure).oDestr![0].id).equal("c");
    expect((arrowExpr.args[1] as Destructure).oDestr![1].id).equal("y");
    expect((arrowExpr.args[1] as Destructure).oDestr![1].alias).equal("d");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Complex destructure #2", () => {
    // --- Arrange
    const source = "([a,, b], {c, y:d}, e) => 1";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(3);
    expect((arrowExpr.args[0] as Destructure).aDestr![0].id).equal("a");
    expect((arrowExpr.args[0] as Destructure).aDestr![1].id).equal(undefined);
    expect((arrowExpr.args[0] as Destructure).aDestr![2].id).equal("b");
    expect((arrowExpr.args[1] as Destructure).oDestr![0].id).equal("c");
    expect((arrowExpr.args[1] as Destructure).oDestr![1].id).equal("y");
    expect((arrowExpr.args[2] as Identifier).name).equal("e");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Single rest param", () => {
    // --- Arrange
    const source = "(...v) => 2*v";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(1);
    const spread = arrowExpr.args[0] as SpreadExpression;
    expect((spread.expr as Identifier).name).equal("v");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Multiple rest param", () => {
    // --- Arrange
    const source = "(v, ...w) => 2*v";
    const wParser = new Parser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ARROW_EXPRESSION);
    const arrowExpr = expr as ArrowExpression;
    expect(arrowExpr.args.length).equal(2);
    const id = arrowExpr.args[0] as Identifier;
    expect(id.name).equal("v");
    const spread = arrowExpr.args[1] as SpreadExpression;
    expect((spread.expr as Identifier).name).equal("w");
    expect(arrowExpr.statement.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Fails with rest params #1", () => {
    // --- Arrange
    const source = "(...a, b) => { return 2*v; }";
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
    const source = "(...(a+b)) => { return 2*v; }";
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
});
