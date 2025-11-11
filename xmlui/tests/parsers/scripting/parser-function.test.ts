import { describe, expect, assert, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  Destructure,
  FunctionDeclaration,
  Identifier,
  SpreadExpression} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_BLOCK_STATEMENT,
  T_DESTRUCTURE,
  T_FUNCTION_DECLARATION,
  T_IDENTIFIER,
  T_SPREAD_EXPRESSION,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - function declarations", () => {
  it("No param", () => {
    // --- Arrange
    const source = "function myFunc() { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(0);
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("Single param", () => {
    // --- Arrange
    const source = "function myFunc(v) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual(T_IDENTIFIER);
    expect((stmt.args[0] as Identifier).name).toEqual("v");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("multiple params", () => {
    // --- Arrange
    const source = "function myFunc(v, w) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(2);
    expect(stmt.args[0].type).toEqual(T_IDENTIFIER);
    expect((stmt.args[0] as Identifier).name).toEqual("v");
    expect(stmt.args[1].type).toEqual(T_IDENTIFIER);
    expect((stmt.args[1] as Identifier).name).toEqual("w");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("Single object destructure #1", () => {
    // --- Arrange
    const source = "function myFunc({x, y}) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual(T_DESTRUCTURE);
    expect((stmt.args[0] as Destructure).oDestr!.length).toEqual(2);
    expect((stmt.args[0] as Destructure).oDestr![0].id).toEqual("x");
    expect((stmt.args[0] as Destructure).oDestr![1].id).toEqual("y");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("Single object destructure #2", () => {
    // --- Arrange
    const source = "function myFunc({x, y:q}) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual(T_DESTRUCTURE);
    expect((stmt.args[0] as Destructure).oDestr!.length).toEqual(2);
    expect((stmt.args[0] as Destructure).oDestr![0].id).toEqual("x");
    expect((stmt.args[0] as Destructure).oDestr![1].id).toEqual("y");
    expect((stmt.args[0] as Destructure).oDestr![1].alias).toEqual("q");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("Single object destructure #3", () => {
    // --- Arrange
    const source = "function myFunc({x, y: {v, w}}) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual(T_DESTRUCTURE);
    expect((stmt.args[0] as Destructure).oDestr![0].id).toEqual("x");
    expect((stmt.args[0] as Destructure).oDestr![1].oDestr!.length).toEqual(2);
    expect((stmt.args[0] as Destructure).oDestr![1].oDestr![0].id).toEqual("v");
    expect((stmt.args[0] as Destructure).oDestr![1].oDestr![1].id).toEqual("w");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("Single array destructure #1", () => {
    // --- Arrange
    const source = "function myFunc([x, y]) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual(T_DESTRUCTURE);
    expect((stmt.args[0] as Destructure).aDestr!.length).toEqual(2);
    expect((stmt.args[0] as Destructure).aDestr![0].id).toEqual("x");
    expect((stmt.args[0] as Destructure).aDestr![1].id).toEqual("y");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("Single array destructure #2", () => {
    // --- Arrange
    const source = "function myFunc([x,, y]) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual(T_DESTRUCTURE);
    expect((stmt.args[0] as Destructure).aDestr!.length).toEqual(3);
    expect((stmt.args[0] as Destructure).aDestr![0].id).toEqual("x");
    expect((stmt.args[0] as Destructure).aDestr![1].id).toEqual(undefined);
    expect((stmt.args[0] as Destructure).aDestr![2].id).toEqual("y");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("Complex destructure #1", () => {
    // --- Arrange
    const source = "function myFunc([a,, b], {c, y:d}) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(2);
    expect(stmt.args[0].type).toEqual(T_DESTRUCTURE);
    expect((stmt.args[0] as Destructure).aDestr!.length).toEqual(3);
    expect((stmt.args[0] as Destructure).aDestr![0].id).toEqual("a");
    expect((stmt.args[0] as Destructure).aDestr![1].id).toEqual(undefined);
    expect((stmt.args[0] as Destructure).aDestr![2].id).toEqual("b");
    expect(stmt.args[1].type).toEqual(T_DESTRUCTURE);
    expect((stmt.args[1] as Destructure).oDestr!.length).toEqual(2);
    expect((stmt.args[1] as Destructure).oDestr![0].id).toEqual("c");
    expect((stmt.args[1] as Destructure).oDestr![1].id).toEqual("y");
    expect((stmt.args[1] as Destructure).oDestr![1].alias).toEqual("d");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("Complex destructure #2", () => {
    // --- Arrange
    const source = "function myFunc([a,, b], {c, y:d}, e) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(3);
    expect(stmt.args[0].type).toEqual(T_DESTRUCTURE);
    expect((stmt.args[0] as Destructure).aDestr!.length).toEqual(3);
    expect((stmt.args[0] as Destructure).aDestr![0].id).toEqual("a");
    expect((stmt.args[0] as Destructure).aDestr![1].id).toEqual(undefined);
    expect((stmt.args[0] as Destructure).aDestr![2].id).toEqual("b");
    expect(stmt.args[1].type).toEqual(T_DESTRUCTURE);
    expect((stmt.args[1] as Destructure).oDestr!.length).toEqual(2);
    expect((stmt.args[1] as Destructure).oDestr![0].id).toEqual("c");
    expect((stmt.args[1] as Destructure).oDestr![1].id).toEqual("y");
    expect((stmt.args[1] as Destructure).oDestr![1].alias).toEqual("d");
    expect(stmt.args[2].type).toEqual(T_IDENTIFIER);
    expect((stmt.args[2] as Identifier).name).toEqual("e");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("Single rest param", () => {
    // --- Arrange
    const source = "function myFunc(...v) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual(T_SPREAD_EXPRESSION);
    const spread = stmt.args[0] as SpreadExpression;
    expect((spread.expr as Identifier).name).toEqual("v");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
  });

  it("Multiple params with rest", () => {
    // --- Arrange
    const source = "function myFunc(v, ...w) { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual(T_FUNCTION_DECLARATION);
    expect(stmt.id.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(2);
    expect(stmt.args[0].type).toEqual(T_IDENTIFIER);
    expect((stmt.args[0] as Identifier).name).toEqual("v");
    expect(stmt.args[1].type).toEqual(T_SPREAD_EXPRESSION);
    const spread = stmt.args[1] as SpreadExpression;
    expect((spread.expr as Identifier).name).toEqual("w");
    expect(stmt.stmt.type).toEqual(T_BLOCK_STATEMENT);
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
    const source = "function myFunc(...(a+b)) { return 2*v; }";
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
