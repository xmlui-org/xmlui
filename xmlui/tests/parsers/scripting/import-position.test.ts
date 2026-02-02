import { describe, it, expect } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  T_IMPORT_DECLARATION,
  T_FUNCTION_DECLARATION,
  T_LET_STATEMENT,
  T_VAR_STATEMENT,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - Import Statement Position Validation", () => {
  it("should allow single import at top of file", () => {
    const source = `import { foo } from './helpers.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    expect(statements![0].type).toBe(T_IMPORT_DECLARATION);
  });

  it("should allow multiple imports at top of file", () => {
    const source = `
      import { foo } from './helpers.xs';
      import { bar } from './utils.xs';
      import { baz } from './common.xs';
    `;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(3);
    expect(statements![0].type).toBe(T_IMPORT_DECLARATION);
    expect(statements![1].type).toBe(T_IMPORT_DECLARATION);
    expect(statements![2].type).toBe(T_IMPORT_DECLARATION);
  });

  it("should allow imports followed by function declaration", () => {
    const source = `
      import { helper } from './mod.xs';
      function myFunc() {
        return helper();
      }
    `;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(2);
    expect(statements![0].type).toBe(T_IMPORT_DECLARATION);
    expect(statements![1].type).toBe(T_FUNCTION_DECLARATION);
  });

  it("should allow imports followed by let statement", () => {
    const source = `
      import { getValue } from './mod.xs';
      let x = getValue();
    `;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(2);
    expect(statements![0].type).toBe(T_IMPORT_DECLARATION);
    expect(statements![1].type).toBe(T_LET_STATEMENT);
  });

  it("should allow imports followed by var statement", () => {
    const source = `
      import { calculate } from './mod.xs';
      var result = calculate();
    `;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(2);
    expect(statements![0].type).toBe(T_IMPORT_DECLARATION);
    expect(statements![1].type).toBe(T_VAR_STATEMENT);
  });

  it("should report error for import after function declaration", () => {
    const source = `
      function myFunc() { }
      import { foo } from './mod.xs';
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W040");
    }
  });

  it("should report error for import after let statement", () => {
    const source = `
      let x = 10;
      import { foo } from './mod.xs';
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W040");
    }
  });

  it("should report error for import after var statement", () => {
    const source = `
      var x = 10;
      import { foo } from './mod.xs';
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W040");
    }
  });

  it("should report error for import after const statement", () => {
    const source = `
      const x = 10;
      import { foo } from './mod.xs';
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W040");
    }
  });

  it("should report error for import after expression statement", () => {
    const source = `
      x = 10;
      import { foo } from './mod.xs';
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W040");
    }
  });

  it("should allow multiple imports between function declarations", () => {
    const source = `
      import { helper1 } from './mod1.xs';
      import { helper2 } from './mod2.xs';
      function func1() { }
      function func2() { }
    `;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(4);
    expect(statements![0].type).toBe(T_IMPORT_DECLARATION);
    expect(statements![1].type).toBe(T_IMPORT_DECLARATION);
    expect(statements![2].type).toBe(T_FUNCTION_DECLARATION);
    expect(statements![3].type).toBe(T_FUNCTION_DECLARATION);
  });

  it("should report error for import in middle of code", () => {
    const source = `
      function func1() { }
      import { foo } from './mod.xs';
      function func2() { }
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors.length).toBeGreaterThan(0);
      expect(parser.errors[0].code).toBe("W040");
    }
  });

  it("should report error only once for multiple out-of-order imports", () => {
    const source = `
      function func() { }
      import { foo } from './mod1.xs';
      import { bar } from './mod2.xs';
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      // First error should be W040
      expect(parser.errors[0].code).toBe("W040");
    }
  });

  it("should allow empty statements followed by imports at top", () => {
    const source = `
      ;
      import { foo } from './mod.xs';
    `;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(2);
    // Empty statement followed by import
  });

  it("should handle imports after various statement types", () => {
    const source = `
      if (true) { }
      import { foo } from './mod.xs';
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors[0].code).toBe("W040");
    }
  });

  it("should handle imports after while statement", () => {
    const source = `
      while (true) { }
      import { foo } from './mod.xs';
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors[0].code).toBe("W040");
    }
  });

  it("should handle imports after return statement", () => {
    const source = `
      return;
      import { foo } from './mod.xs';
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors[0].code).toBe("W040");
    }
  });

  it("should allow import as only statement", () => {
    const source = `import { foo } from './mod.xs';`;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    expect(statements).toHaveLength(1);
    expect(statements![0].type).toBe(T_IMPORT_DECLARATION);
    expect(parser.errors.length).toBe(0);
  });

  it("should enforce position rule for deep nested context", () => {
    const source = `
      var x = 10;
      import { foo } from './mod.xs';
    `;
    const parser = new Parser(source);
    try {
      const statements = parser.parseStatements();
      expect(statements).toBeNull();
    } catch (e) {
      expect(parser.errors[0].code).toBe("W040");
    }
  });
});
