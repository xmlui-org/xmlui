import { assert, describe, expect, it } from "vitest";
import { Parser } from "../../../src/parsers/scripting-exp/Parser";
import {
  FunctionDeclaration,
  T_BLOCK_STATEMENT,
  T_FUNCTION_DECLARATION,
} from "../../../src/abstractions/scripting/ScriptingSourceTreeExp";

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
    expect(stmt.type).equal(T_FUNCTION_DECLARATION);
    expect(stmt.exp).equal(true);
    expect(stmt.id.name).equal("myFunc");
    expect(stmt.args.length).equal(0);
    expect(stmt.stmt.type).equal(T_BLOCK_STATEMENT);
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
