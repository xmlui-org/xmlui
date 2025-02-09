import { assert, describe, expect, it } from "vitest";
import { Parser } from "../../../src/parsers/scripting-exp/Parser";
import {
  ImportDeclaration,
  T_IMPORT_DECLARATION,
} from "../../../src/abstractions/scripting/ScriptingSourceTreeExp";

describe("Parser - import statement", () => {
  it("Empty import", () => {
    // --- Arrange
    const source = "import {} from 'myModule'";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as ImportDeclaration;
    expect(stmt.type).toEqual(T_IMPORT_DECLARATION);
    expect(Object.keys(stmt.imports).length).toEqual(0);
    expect(stmt.moduleFile).toEqual("myModule");
  });

  it("Single import", () => {
    // --- Arrange
    const source = "import {a} from 'myModule'";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as ImportDeclaration;
    expect(stmt.type).toEqual(T_IMPORT_DECLARATION);
    expect(Object.keys(stmt.imports).length).toEqual(1);
    expect(!!stmt.imports.find((item) => item.id.name === "a")).toEqual(true);
    expect(stmt.moduleFile).toEqual("myModule");
  });

  it("Multiple imports", () => {
    // --- Arrange
    const source = "import {a, b, c} from 'myModule'";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as ImportDeclaration;
    expect(stmt.type).toEqual(T_IMPORT_DECLARATION);
    expect(Object.keys(stmt.imports).length).toEqual(3);
    expect(!!stmt.imports.find((item) => item.id.name === "a")).toEqual(true);
    expect(!!stmt.imports.find((item) => item.id.name === "b")).toEqual(true);
    expect(!!stmt.imports.find((item) => item.id.name === "c")).toEqual(true);
    expect(stmt.moduleFile).toEqual("myModule");
  });

  it("Single import with alias", () => {
    // --- Arrange
    const source = "import {a as b} from 'myModule'";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as ImportDeclaration;
    expect(stmt.type).toEqual(T_IMPORT_DECLARATION);
    expect(Object.keys(stmt.imports).length).toEqual(1);
    expect(!!stmt.imports.find((item) => item.id.name === "b")).toEqual(true);
    expect(stmt.moduleFile).toEqual("myModule");
  });

  it("Multiple imports with alias", () => {
    // --- Arrange
    const source = "import {a as b, c as d, e as f} from 'myModule'";
    const wParser = new Parser(source);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).toEqual(1);
    const stmt = stmts[0] as ImportDeclaration;
    expect(stmt.type).toEqual(T_IMPORT_DECLARATION);
    expect(Object.keys(stmt.imports).length).toEqual(3);
    expect(!!stmt.imports.find((item) => item.id.name === "b")).toEqual(true);
    expect(!!stmt.imports.find((item) => item.id.name === "d")).toEqual(true);
    expect(!!stmt.imports.find((item) => item.id.name === "f")).toEqual(true);
    expect(stmt.moduleFile).toEqual("myModule");
  });

  it("import fails #1", () => {
    // --- Arrange
    const source = "import from 'myModule'";
    const wParser = new Parser(source);

    // --- Act
    try {
      const stmts = wParser.parseStatements()!;
    } catch (e) {
      expect(wParser.errors.length).equal(1);
      expect(wParser.errors[0].code).equal("W012");
      return;
    }
    assert.fail("Exception expected");
  });

  it("import fails #2", () => {
    // --- Arrange
    const source = "import { 123 } from 'myModule'";
    const wParser = new Parser(source);

    // --- Act
    try {
      const stmts = wParser.parseStatements()!;
    } catch (e) {
      expect(wParser.errors.length).equal(1);
      expect(wParser.errors[0].code).equal("W003");
      return;
    }
    assert.fail("Exception expected");
  });

  it("import fails #3", () => {
    // --- Arrange
    const source = "import { dummy as 123 } from 'myModule'";
    const wParser = new Parser(source);

    // --- Act
    try {
      const stmts = wParser.parseStatements()!;
    } catch (e) {
      expect(wParser.errors.length).equal(1);
      expect(wParser.errors[0].code).equal("W003");
      return;
    }
    assert.fail("Exception expected");
  });

  it("import fails #4", () => {
    // --- Arrange
    const source = "import { dummy } 'myModule'";
    const wParser = new Parser(source);

    // --- Act
    try {
      const stmts = wParser.parseStatements()!;
    } catch (e) {
      expect(wParser.errors.length).equal(1);
      expect(wParser.errors[0].code).equal("W025");
      return;
    }
    assert.fail("Exception expected");
  });

  it("import fails #5", () => {
    // --- Arrange
    const source = "import { dummy } from 123";
    const wParser = new Parser(source);

    // --- Act
    try {
      const stmts = wParser.parseStatements()!;
    } catch (e) {
      expect(wParser.errors.length).equal(1);
      expect(wParser.errors[0].code).equal("W026");
      return;
    }
    assert.fail("Exception expected");
  });
});
