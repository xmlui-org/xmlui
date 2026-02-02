import { describe, it, expect } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  T_IMPORT_DECLARATION,
  T_IMPORT_SPECIFIER,
  T_IDENTIFIER,
  T_LITERAL,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - Import with Aliases", () => {
  it("should parse single import with alias", () => {
    const source = `import { foo as myFoo } from './helpers.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.type).toBe(T_IMPORT_DECLARATION);
    expect(importDecl.specifiers).toHaveLength(1);

    const specifier = importDecl.specifiers[0];
    expect(specifier.imported.text).toBe("foo");
    expect(specifier.local).toBeDefined();
    expect(specifier.local.text).toBe("myFoo");
  });

  it("should parse multiple imports with mixed aliases", () => {
    const source = `import { foo as myFoo, bar, baz as myBaz } from './helpers.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(3);

    // First specifier: aliased
    expect(importDecl.specifiers[0].imported.text).toBe("foo");
    expect(importDecl.specifiers[0].local.text).toBe("myFoo");

    // Second specifier: no alias
    expect(importDecl.specifiers[1].imported.text).toBe("bar");
    expect(importDecl.specifiers[1].local).toBeUndefined();

    // Third specifier: aliased
    expect(importDecl.specifiers[2].imported.text).toBe("baz");
    expect(importDecl.specifiers[2].local.text).toBe("myBaz");
  });

  it("should parse all imports with aliases", () => {
    const source = `import { foo as f, bar as b, baz as z } from './utils.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(3);

    importDecl.specifiers.forEach((spec: any) => {
      expect(spec.imported).toBeDefined();
      expect(spec.local).toBeDefined();
    });
  });

  it("should parse alias with different naming conventions", () => {
    const source = `import { camelCase as pascalCase, snake_case as camelCased, CONSTANT as constant } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(3);

    const mappings = importDecl.specifiers.map((s: any) => ({
      imported: s.imported.text,
      local: s.local.text,
    }));

    expect(mappings[0]).toEqual({ imported: "camelCase", local: "pascalCase" });
    expect(mappings[1]).toEqual({ imported: "snake_case", local: "camelCased" });
    expect(mappings[2]).toEqual({ imported: "CONSTANT", local: "constant" });
  });

  it("should handle whitespace variations around as keyword", () => {
    const source = `import { foo as myFoo, bar as myBar } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(2);
    expect(importDecl.specifiers[0].local.text).toBe("myFoo");
    expect(importDecl.specifiers[1].local.text).toBe("myBar");
  });

  it("should handle minimal spacing with aliases", () => {
    const source = `import{a as x,b as y}from'./mod.xs'`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(2);
    expect(importDecl.specifiers[0].local.text).toBe("x");
    expect(importDecl.specifiers[1].local.text).toBe("y");
  });

  it("should report error for missing identifier after as", () => {
    const source = `import { foo as } from './mod.xs';`;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W034");
    }
  });

  it("should report error for invalid token after as", () => {
    const source = `import { foo as 123 } from './mod.xs';`;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W034");
    }
  });

  it("should parse long alias names", () => {
    const source = `import { originalFunctionName as renamedFunctionNameForSpecificPurpose } from './helpers.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    expect(importDecl.specifiers[0].imported.text).toBe("originalFunctionName");
    expect(importDecl.specifiers[0].local.text).toBe("renamedFunctionNameForSpecificPurpose");
  });

  it("should handle underscores and dollar signs in aliases", () => {
    const source = `import { foo as _foo, bar as $bar, baz as _$baz } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(3);

    expect(importDecl.specifiers[0].local.text).toBe("_foo");
    expect(importDecl.specifiers[1].local.text).toBe("$bar");
    expect(importDecl.specifiers[2].local.text).toBe("_$baz");
  });

  it("should preserve alias mapping in order", () => {
    const source = `import { alpha as A, beta as B, gamma as C, delta as D } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    const mappings = importDecl.specifiers.map((s: any) => [
      s.imported.text,
      s.local.text,
    ]);

    expect(mappings).toEqual([
      ["alpha", "A"],
      ["beta", "B"],
      ["gamma", "C"],
      ["delta", "D"],
    ]);
  });

  it("should handle ast nodes correctly for aliased imports", () => {
    const source = `import { foo as bar } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    const specifier = importDecl.specifiers[0];

    // Check both imported and local are Identifier nodes
    expect(specifier.imported.type).toBe(T_IDENTIFIER);
    expect(specifier.local.type).toBe(T_IDENTIFIER);

    // Check node IDs are different
    expect(specifier.imported.nodeId).not.toBe(specifier.local.nodeId);

    // Check startToken and endToken
    expect(specifier.startToken).toBeDefined();
    expect(specifier.endToken).toBeDefined();
  });

  it("should parse complex mix of aliased and non-aliased imports", () => {
    const source = `import { a, b as B, c, d as D, e as E, f } from './helpers.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(6);

    // Verify each specifier
    expect(importDecl.specifiers[0].imported.text).toBe("a");
    expect(importDecl.specifiers[0].local).toBeUndefined();

    expect(importDecl.specifiers[1].imported.text).toBe("b");
    expect(importDecl.specifiers[1].local.text).toBe("B");

    expect(importDecl.specifiers[2].imported.text).toBe("c");
    expect(importDecl.specifiers[2].local).toBeUndefined();

    expect(importDecl.specifiers[3].imported.text).toBe("d");
    expect(importDecl.specifiers[3].local.text).toBe("D");

    expect(importDecl.specifiers[4].imported.text).toBe("e");
    expect(importDecl.specifiers[4].local.text).toBe("E");

    expect(importDecl.specifiers[5].imported.text).toBe("f");
    expect(importDecl.specifiers[5].local).toBeUndefined();
  });

  it("should parse imports with aliases followed by code", () => {
    const source = `
      import { calculateTotal as calc, formatCurrency as format } from './helpers.xs';
      var result = calc(items);
    `;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(2);
    expect(statements![0].type).toBe(T_IMPORT_DECLARATION);

    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(2);
    expect(importDecl.specifiers[0].local.text).toBe("calc");
    expect(importDecl.specifiers[1].local.text).toBe("format");
  });

  it("should handle mixed case sensitivity in aliases", () => {
    const source = `import { FOO as foo, foo as FOO } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const importDecl = statements![0] as any;
    expect(importDecl.specifiers).toHaveLength(2);

    expect(importDecl.specifiers[0].imported.text).toBe("FOO");
    expect(importDecl.specifiers[0].local.text).toBe("foo");

    expect(importDecl.specifiers[1].imported.text).toBe("foo");
    expect(importDecl.specifiers[1].local.text).toBe("FOO");
  });
});
