import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import { evalBinding } from "../../../src/components-core/script-runner/eval-tree-sync";
import { evalBindingAsync } from "../../../src/components-core/script-runner/eval-tree-async";
import { createEvalContext } from "./test-helpers";

describe("Evaluate new operator", () => {
  describe("Allowed constructors", () => {
    it("new String() creates a String object", () => {
      const wParser = new Parser('new String("hello")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      
      expect(value).toBeInstanceOf(String);
      expect(value.toString()).equal("hello");
    });

    it("new String() without arguments", () => {
      const wParser = new Parser('new String()');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      
      expect(value).toBeInstanceOf(String);
      expect(value.toString()).equal("");
    });

    it("new Date() creates a Date object", () => {
      const wParser = new Parser('new Date("2024-01-01")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      
      expect(value).toBeInstanceOf(Date);
      expect(value.getFullYear()).equal(2024);
    });

    it("new Date() with timestamp", () => {
      const wParser = new Parser('new Date(1704067200000)');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      
      expect(value).toBeInstanceOf(Date);
      expect(value.getFullYear()).equal(2024);
    });

    it("new Blob() creates a Blob object", () => {
      const wParser = new Parser('new Blob(["hello"])');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      
      expect(value).toBeInstanceOf(Blob);
    });

    it("new Blob() with options", () => {
      const wParser = new Parser('new Blob(["hello"], { type: "text/plain" })');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      
      expect(value).toBeInstanceOf(Blob);
      expect(value.type).equal("text/plain");
    });
  });

  describe("Async evaluation", () => {
    it("new String() works in async context", async () => {
      const wParser = new Parser('new String("async test")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = await evalBindingAsync(expr, context, undefined);
      
      expect(value).toBeInstanceOf(String);
      expect(value.toString()).equal("async test");
    });

    it("new Date() works in async context", async () => {
      const wParser = new Parser('new Date(2024, 0, 1)');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = await evalBindingAsync(expr, context, undefined);
      
      expect(value).toBeInstanceOf(Date);
      expect(value.getFullYear()).equal(2024);
    });
  });

  describe("Forbidden constructors", () => {
    it("new Array() throws an error", () => {
      const wParser = new Parser('new Array(5)');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      
      expect(() => evalBinding(expr, context)).toThrow(
        /XMLUI does not support the new operator with constructor 'Array'/
      );
    });

    it("new Object() throws an error", () => {
      const wParser = new Parser('new Object()');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      
      expect(() => evalBinding(expr, context)).toThrow(
        /XMLUI does not support the new operator with constructor 'Object'/
      );
    });

    it("new Function() throws an error", () => {
      const wParser = new Parser('new Function("return 42")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      
      expect(() => evalBinding(expr, context)).toThrow(
        /XMLUI does not support the new operator with constructor/
      );
    });

    it("new with custom constructor throws an error", () => {
      class CustomClass {}
      const wParser = new Parser('new Custom()');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: { Custom: CustomClass } });
      
      expect(() => evalBinding(expr, context)).toThrow(
        /XMLUI does not support the new operator with constructor/
      );
    });
  });

  describe("With spread operator", () => {
    it("new Date() with spread arguments", () => {
      const wParser = new Parser('new Date(...[2024, 0, 1])');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      
      expect(value).toBeInstanceOf(Date);
      expect(value.getFullYear()).equal(2024);
    });

    it("new String() with spread arguments", () => {
      const wParser = new Parser('new String(...["hello"])');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      
      expect(value).toBeInstanceOf(String);
      expect(value.toString()).equal("hello");
    });
  });

  describe("Edge cases", () => {
    it("new String() with multiple arguments", () => {
      // Note: String constructor ignores extra arguments
      const wParser = new Parser('new String("hello", "world")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      
      expect(value).toBeInstanceOf(String);
      expect(value.toString()).equal("hello");
    });

    it("new Date() with various argument formats", () => {
      const wParser = new Parser('new Date(2024, 5, 15, 12, 30, 45)');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;
      
      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);
      
      expect(value).toBeInstanceOf(Date);
      expect(value.getFullYear()).equal(2024);
      expect(value.getMonth()).equal(5);
      expect(value.getDate()).equal(15);
    });
  });
});
