import { describe, it, expect } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  T_IMPORT_DECLARATION,
  T_IMPORT_SPECIFIER,
  T_IDENTIFIER,
  T_LITERAL,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - Multiple Import Specifiers", () => {
  it("should parse import with two identifiers", () => {
    const source = `import { foo, bar } from './helpers.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.type).toBe(T_IMPORT_DECLARATION);
    expect(importDecl.specifiers).toHaveLength(2);

    expect(importDecl.specifiers[0].imported.text).toBe("foo");
    expect(importDecl.specifiers[0].local).toBeUndefined();

    expect(importDecl.specifiers[1].imported.text).toBe("bar");
    expect(importDecl.specifiers[1].local).toBeUndefined();
  });

  it("should parse import with three identifiers", () => {
    const source = `import { alpha, beta, gamma } from './utils.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(3);

    expect(importDecl.specifiers[0].imported.text).toBe("alpha");
    expect(importDecl.specifiers[1].imported.text).toBe("beta");
    expect(importDecl.specifiers[2].imported.text).toBe("gamma");
  });

  it("should parse import with five or more identifiers", () => {
    const source = `import { a, b, c, d, e, f } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(6);

    const names = importDecl.specifiers.map((s: any) => s.imported.text);
    expect(names).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("should report error for trailing comma before closing brace", () => {
    const source = `import { foo, bar, } from './mod.xs';`;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      // Trailing commas not supported - expect error
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W033");
    }
  });

  it("should parse imports with various spacing", () => {
    const source = `import{a,b,c}from'./mod.xs'`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(3);
  });

  it("should parse imports with lots of whitespace", () => {
    const source = `import { foo , bar , baz } from './helpers.xs' ;`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(3);
  });

  it("should report error for missing comma between imports", () => {
    const source = `import { foo bar } from './mod.xs';`;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W035");
    }
  });

  it("should report error for unexpected token after identifier", () => {
    const source = `import { foo. bar } from './mod.xs';`;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
    }
  });

  it("should preserve import order", () => {
    const source = `import { first, second, third, fourth } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    const names = importDecl.specifiers.map((s: any) => s.imported.text);
    expect(names).toEqual(["first", "second", "third", "fourth"]);
  });

  it("should handle long identifier names in multiple imports", () => {
    const source = `import { calculateTotalPrice, formatCurrencyValue, validateUserInput } from './utils.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(3);

    const names = importDecl.specifiers.map((s: any) => s.imported.text);
    expect(names).toEqual([
      "calculateTotalPrice",
      "formatCurrencyValue",
      "validateUserInput",
    ]);
  });

  it("should parse multiple imports followed by code", () => {
    const source = `
      import { helper1, helper2, helper3 } from './helpers.xs';
      var result = helper1();
    `;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(2);
    expect(statements![0].type).toBe(T_IMPORT_DECLARATION);

    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(3);
  });

  it("should handle each specifier with correct AST node structure", () => {
    const source = `import { a, b, c } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    importDecl.specifiers.forEach((spec: any, idx: number) => {
      expect(spec.type).toBe(T_IMPORT_SPECIFIER);
      expect(spec.imported).toBeDefined();
      expect(spec.imported.type).toBe(T_IDENTIFIER);
      expect(spec.startToken).toBeDefined();
      expect(spec.endToken).toBeDefined();
    });
  });

  it("should handle imports of special identifier names", () => {
    const source = `import { _private, $dollar, camelCase, PascalCase, CONSTANT } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(5);

    const names = importDecl.specifiers.map((s: any) => s.imported.text);
    expect(names).toEqual([
      "_private",
      "$dollar",
      "camelCase",
      "PascalCase",
      "CONSTANT",
    ]);
  });

  it("should parse multiple imports with semicolon correctly", () => {
    const source = `import { foo, bar }from'./mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(2);
  });
});
