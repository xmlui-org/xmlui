import { describe, expect, assert, it } from "vitest";

import { Parser } from "@parsers/scripting/Parser";
import { Destructure, FunctionDeclaration, Identifier, SpreadExpression } from "@abstractions/scripting/ScriptingSourceTree";

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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(0);
    expect(stmt.statement.type).toEqual("BlockS");
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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual("IdE");
    expect((stmt.args[0] as Identifier).name).toEqual("v");
    expect(stmt.statement.type).toEqual("BlockS");
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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(2);
    expect(stmt.args[0].type).toEqual("IdE");
    expect((stmt.args[0] as Identifier).name).toEqual("v");
    expect(stmt.args[1].type).toEqual("IdE");
    expect((stmt.args[1] as Identifier).name).toEqual("w");
    expect(stmt.statement.type).toEqual("BlockS");
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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual("Destr");
    expect((stmt.args[0] as Destructure).objectDestruct!.length).toEqual(2);
    expect((stmt.args[0] as Destructure).objectDestruct![0].id).toEqual("x");
    expect((stmt.args[0] as Destructure).objectDestruct![1].id).toEqual("y");
    expect(stmt.statement.type).toEqual("BlockS");
  });

  it("Single object destructure #2", () => {
    // --- Arrange
    const source = "function myFunc({x, y:q}) { return 2*v; }";
    const wParser = new Parser(source)!;

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual("Destr");
    expect((stmt.args[0] as Destructure).objectDestruct!.length).toEqual(2);
    expect((stmt.args[0] as Destructure).objectDestruct![0].id).toEqual("x");
    expect((stmt.args[0] as Destructure).objectDestruct![1].id).toEqual("y");
    expect((stmt.args[0] as Destructure).objectDestruct![1].alias).toEqual("q");
    expect(stmt.statement.type).toEqual("BlockS");
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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual("Destr");
    expect((stmt.args[0] as Destructure).objectDestruct![0].id).toEqual("x");
    expect((stmt.args[0] as Destructure).objectDestruct![1].objectDestruct!.length).toEqual(2);
    expect((stmt.args[0] as Destructure).objectDestruct![1].objectDestruct![0].id).toEqual("v");
    expect((stmt.args[0] as Destructure).objectDestruct![1].objectDestruct![1].id).toEqual("w");
    expect(stmt.statement.type).toEqual("BlockS");
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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual("Destr");
    expect((stmt.args[0] as Destructure).arrayDestruct!.length).toEqual(2);
    expect((stmt.args[0] as Destructure).arrayDestruct![0].id).toEqual("x");
    expect((stmt.args[0] as Destructure).arrayDestruct![1].id).toEqual("y");
    expect(stmt.statement.type).toEqual("BlockS");
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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual("Destr");
    expect((stmt.args[0] as Destructure).arrayDestruct!.length).toEqual(3);
    expect((stmt.args[0] as Destructure).arrayDestruct![0].id).toEqual("x");
    expect((stmt.args[0] as Destructure).arrayDestruct![1].id).toEqual(undefined);
    expect((stmt.args[0] as Destructure).arrayDestruct![2].id).toEqual("y");
    expect(stmt.statement.type).toEqual("BlockS");
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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(2);
    expect(stmt.args[0].type).toEqual("Destr");
    expect((stmt.args[0] as Destructure).arrayDestruct!.length).toEqual(3);
    expect((stmt.args[0] as Destructure).arrayDestruct![0].id).toEqual("a");
    expect((stmt.args[0] as Destructure).arrayDestruct![1].id).toEqual(undefined);
    expect((stmt.args[0] as Destructure).arrayDestruct![2].id).toEqual("b");
    expect(stmt.args[1].type).toEqual("Destr");
    expect((stmt.args[1] as Destructure).objectDestruct!.length).toEqual(2);
    expect((stmt.args[1] as Destructure).objectDestruct![0].id).toEqual("c");
    expect((stmt.args[1] as Destructure).objectDestruct![1].id).toEqual("y");
    expect((stmt.args[1] as Destructure).objectDestruct![1].alias).toEqual("d");
    expect(stmt.statement.type).toEqual("BlockS");
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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(3);
    expect(stmt.args[0].type).toEqual("Destr");
    expect((stmt.args[0] as Destructure).arrayDestruct!.length).toEqual(3);
    expect((stmt.args[0] as Destructure).arrayDestruct![0].id).toEqual("a");
    expect((stmt.args[0] as Destructure).arrayDestruct![1].id).toEqual(undefined);
    expect((stmt.args[0] as Destructure).arrayDestruct![2].id).toEqual("b");
    expect(stmt.args[1].type).toEqual("Destr");
    expect((stmt.args[1] as Destructure).objectDestruct!.length).toEqual(2);
    expect((stmt.args[1] as Destructure).objectDestruct![0].id).toEqual("c");
    expect((stmt.args[1] as Destructure).objectDestruct![1].id).toEqual("y");
    expect((stmt.args[1] as Destructure).objectDestruct![1].alias).toEqual("d");
    expect(stmt.args[2].type).toEqual("IdE");
    expect((stmt.args[2] as Identifier).name).toEqual("e");
    expect(stmt.statement.type).toEqual("BlockS");
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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(1);
    expect(stmt.args[0].type).toEqual("SpreadE");
    const spread = stmt.args[0] as SpreadExpression;
    expect((spread.operand as Identifier).name).toEqual("v");
    expect(stmt.statement.type).toEqual("BlockS");
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
    expect(stmt.type).toEqual("FuncD");
    expect(stmt.name).toEqual("myFunc");
    expect(stmt.args.length).toEqual(2);
    expect(stmt.args[0].type).toEqual("IdE");
    expect((stmt.args[0] as Identifier).name).toEqual("v");
    expect(stmt.args[1].type).toEqual("SpreadE");
    const spread = stmt.args[1] as SpreadExpression;
    expect((spread.operand as Identifier).name).toEqual("w");
    expect(stmt.statement.type).toEqual("BlockS");
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
