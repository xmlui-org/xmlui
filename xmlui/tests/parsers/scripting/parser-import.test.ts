import { assert, describe, expect, it } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { ImportDeclaration } from "../../../src/abstractions/scripting/ScriptingSourceTree";

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
    expect(stmt.type).toEqual("ImportD");
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
    expect(stmt.type).toEqual("ImportD");
    expect(Object.keys(stmt.imports).length).toEqual(1);
    expect(stmt.imports.a).toEqual("a");
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
    expect(stmt.type).toEqual("ImportD");
    expect(Object.keys(stmt.imports).length).toEqual(3);
    expect(stmt.imports.a).toEqual("a");
    expect(stmt.imports.b).toEqual("b");
    expect(stmt.imports.c).toEqual("c");
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
    expect(stmt.type).toEqual("ImportD");
    expect(Object.keys(stmt.imports).length).toEqual(1);
    expect(stmt.imports.b).toEqual("a");
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
    expect(stmt.type).toEqual("ImportD");
    expect(Object.keys(stmt.imports).length).toEqual(3);
    expect(stmt.imports.b).toEqual("a");
    expect(stmt.imports.d).toEqual("c");
    expect(stmt.imports.f).toEqual("e");
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
