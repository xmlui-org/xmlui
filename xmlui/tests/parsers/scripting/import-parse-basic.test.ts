import { describe, it, expect } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  T_IMPORT_DECLARATION,
  T_IMPORT_SPECIFIER,
  T_IDENTIFIER,
  T_LITERAL,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - Basic Import Statement", () => {
  it("should parse simple import with single identifier", () => {
    const source = `import { foo } from './helpers.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toBeDefined();
    expect(statements).toHaveLength(1);

    const importStmt = statements![0];
    expect(importStmt.type).toBe(T_IMPORT_DECLARATION);

    const importDecl = importStmt as any;
    expect(importDecl.specifiers).toBeDefined();
    expect(importDecl.specifiers).toHaveLength(1);

    const specifier = importDecl.specifiers[0];
    expect(specifier.type).toBe(T_IMPORT_SPECIFIER);
    expect(specifier.imported.type).toBe(T_IDENTIFIER);
    expect(specifier.imported.text).toBe("foo");
    expect(specifier.local).toBeUndefined();

    expect(importDecl.source).toBeDefined();
    expect(importDecl.source.type).toBe(T_LITERAL);
    expect(importDecl.source.value).toBe("./helpers.xs");
  });

  it("should parse import from parent directory", () => {
    const source = `import { bar } from "../utils.xs";`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.type).toBe(T_IMPORT_DECLARATION);
    expect(importDecl.source.value).toBe("../utils.xs");
  });

  it("should parse import without trailing semicolon", () => {
    const source = `import { baz } from './module.xs'`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.type).toBe(T_IMPORT_DECLARATION);
    expect(importDecl.specifiers[0].imported.text).toBe("baz");
  });

  it("should parse import with whitespace variations", () => {
    const source = `import{foo}from'./mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.specifiers[0].imported.text).toBe("foo");
  });

  it("should report error for missing opening brace", () => {
    const source = `import foo } from './mod.xs';`;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W032");
    }
  });

  it("should report error for missing identifier", () => {
    const source = `import { } from './mod.xs';`;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W033");
    }
  });

  it("should report error for missing from keyword", () => {
    const source = `import { foo } './mod.xs';`;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W036");
    }
  });

  it("should report error for missing string literal path", () => {
    const source = `import { foo } from ./mod.xs;`;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W037");
    }
  });

  it("should report error for missing closing brace", () => {
    const source = `import { foo from './mod.xs';`;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W035");
    }
  });

  it("should have correct node positions in AST", () => {
    const source = `import { calcTotal } from './helpers.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    expect(importDecl.startToken).toBeDefined();
    expect(importDecl.startToken.text).toBe("import");
    expect(importDecl.endToken).toBeDefined();

    const specifier = importDecl.specifiers[0];
    expect(specifier.startToken).toBeDefined();
    expect(specifier.endToken).toBeDefined();
  });

  it("should parse import with various identifier names", () => {
    const testCases = [
      `import { getValue } from './mod.xs';`,
      `import { _private } from './mod.xs';`,
      `import { $special } from './mod.xs';`,
      `import { CONSTANT } from './mod.xs';`,
    ];

    testCases.forEach((source) => {
      const parser = new Parser(source);
      const statements = parser.parseStatements();
      expect(statements).toHaveLength(1);
      expect(statements![0].type).toBe(T_IMPORT_DECLARATION);
    });
  });

  it("should parse import with various path formats", () => {
    const testCases = [
      `import { foo } from './file.xs';`,
      `import { foo } from '../utils.xs';`,
      `import { foo } from '../../helpers.xs';`,
      `import { foo } from './subdir/module.xs';`,
      `import { foo } from '../subdir/module.xs';`,
    ];

    testCases.forEach((source) => {
      const parser = new Parser(source);
      const statements = parser.parseStatements();
      expect(statements).toHaveLength(1);
      const importDecl = statements![0] as any;
      expect(importDecl.type).toBe(T_IMPORT_DECLARATION);
      expect(importDecl.source.type).toBe(T_LITERAL);
    });
  });

  it("should allow import statement followed by other statements", () => {
    const source = `
      import { helper } from './mod.xs';
      var x = 10;
      function test() { }
    `;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(3);
    expect(statements![0].type).toBe(T_IMPORT_DECLARATION);
  });
});
