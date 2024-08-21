import { assert, describe, expect, it } from "vitest";
import { Parser } from "@parsers/scripting/Parser";
import { ConstStatement, FunctionDeclaration } from "@abstractions/scripting/ScriptingSourceTree";

describe("Parser - export statement", () => {
  it("Exported function", () => {
    // --- Arrange
    const source = "export function myFunc() { return 2*v; }";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const stmt = stmts[0] as FunctionDeclaration;
    expect(stmt.type).equal("FuncD");
    expect(stmt.isExported).equal(true);
    expect(stmt.name).equal("myFunc");
    expect(stmt.args.length).equal(0);
    expect(stmt.statement.type).equal("BlockS");
  });

  it("Exported const", () => {
    // --- Arrange
    const wParser = new Parser("export const x = 3");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ConstS");
    const constStmt = stmts[0] as ConstStatement;
    expect(constStmt.isExported).equal(true);
    expect(constStmt.declarations.length).equal(1);
    expect(constStmt.declarations[0].id).equal("x");
    expect(constStmt.declarations[0].expression).not.equal(null);
    expect(constStmt.declarations[0].expression!.type).equal("LitE");
  });

  it("Export fails with let", () => {
    // --- Arrange
    const wParser = new Parser("export let x = 3");

    // --- Act/Assert
    try {
      wParser.parseStatements()!;
    } catch (err) {
      expect(wParser.errors.length).equal(1);
      expect(wParser.errors[0].code).equal("W024");
      return;
    }
    assert.fail("Exception expected");
  });
});
