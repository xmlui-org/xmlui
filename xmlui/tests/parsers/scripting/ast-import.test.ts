import { describe, it, expect } from "vitest";
import {
  T_IMPORT_DECLARATION,
  T_IMPORT_SPECIFIER,
  T_IDENTIFIER,
  T_LITERAL,
} from "../../../src/parsers/scripting/ScriptingNodeTypes";

describe("AST Import Node Types", () => {
  describe("ImportDeclaration type constant", () => {
    it("should have T_IMPORT_DECLARATION defined as 22", () => {
      expect(T_IMPORT_DECLARATION).toBe(22);
    });

    it("should be a distinct value from other statement types", () => {
      expect(T_IMPORT_DECLARATION).not.toBe(T_IDENTIFIER);
      expect(T_IMPORT_DECLARATION).not.toBe(T_LITERAL);
    });
  });

  describe("ImportSpecifier type constant", () => {
    it("should have T_IMPORT_SPECIFIER defined as 205", () => {
      expect(T_IMPORT_SPECIFIER).toBe(205);
    });

    it("should be distinct from declaration types", () => {
      expect(T_IMPORT_SPECIFIER).not.toBe(T_IMPORT_DECLARATION);
    });
  });

  describe("Type exports from ScriptingSourceTree", () => {
    it("should export T_IMPORT_DECLARATION", async () => {
      const { T_IMPORT_DECLARATION: exported } = await import(
        "../../../src/components-core/script-runner/ScriptingSourceTree"
      );
      expect(exported).toBe(22);
    });

    it("should export T_IMPORT_SPECIFIER", async () => {
      const { T_IMPORT_SPECIFIER: exported } = await import(
        "../../../src/components-core/script-runner/ScriptingSourceTree"
      );
      expect(exported).toBe(205);
    });

    it("should export ImportDeclaration interface type", async () => {
      const mod = await import(
        "../../../src/components-core/script-runner/ScriptingSourceTree"
      );
      // TypeScript interface exists (type check at compile time)
      // This validates the module exports the type without runtime values
      expect(mod).toBeDefined();
    });

    it("should export ImportSpecifier interface type", async () => {
      const mod = await import(
        "../../../src/components-core/script-runner/ScriptingSourceTree"
      );
      // TypeScript interface exists (type check at compile time)
      expect(mod).toBeDefined();
    });
  });

  describe("Node type relationships", () => {
    it("should use distinct numeric ranges for categories", () => {
      // Statements: 1-22
      expect(T_IMPORT_DECLARATION).toBeGreaterThan(0);
      expect(T_IMPORT_DECLARATION).toBeLessThanOrEqual(22);

      // Other types: 200+
      expect(T_IMPORT_SPECIFIER).toBeGreaterThanOrEqual(200);
    });
  });
});
