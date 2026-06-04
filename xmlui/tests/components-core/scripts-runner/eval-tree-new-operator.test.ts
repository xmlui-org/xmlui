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

    it("new Number() creates a Number object", () => {
      const wParser = new Parser('new Number(42)');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(Number);
      expect(value.valueOf()).equal(42);
    });

    it("new Boolean() creates a Boolean object", () => {
      const wParser = new Parser('new Boolean(true)');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(Boolean);
      expect(value.valueOf()).equal(true);
    });

    it("new RegExp() creates a RegExp object", () => {
      const wParser = new Parser('new RegExp("^xml", "i")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(RegExp);
      expect(value.test("XMLUI")).equal(true);
    });

    it("new Array() creates an Array", () => {
      const wParser = new Parser('new Array(1, 2, 3)');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).eql([1, 2, 3]);
    });

    it("new Object() creates a plain object", () => {
      const wParser = new Parser('new Object({ a: 1 })');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).eql({ a: 1 });
    });

    it("new Map() creates a Map", () => {
      const wParser = new Parser('new Map([["a", 1], ["b", 2]])');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(Map);
      expect(value.get("a")).equal(1);
      expect(value.get("b")).equal(2);
    });

    it("new Set() creates a Set", () => {
      const wParser = new Parser('new Set([1, 2, 2, 3])');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(Set);
      expect([...value]).eql([1, 2, 3]);
    });

    it("new WeakMap() creates a WeakMap", () => {
      const wParser = new Parser('new WeakMap()');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(WeakMap);
    });

    it("new WeakSet() creates a WeakSet", () => {
      const wParser = new Parser('new WeakSet()');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(WeakSet);
    });

    it("new URL() creates a URL object", () => {
      const wParser = new Parser('new URL("https://example.com/items?id=42")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(URL);
      expect(value.searchParams.get("id")).equal("42");
    });

    it("new URLSearchParams() creates URLSearchParams", () => {
      const wParser = new Parser('new URLSearchParams("a=1&b=2")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(URLSearchParams);
      expect(value.get("b")).equal("2");
    });

    it("new TextEncoder() creates a TextEncoder", () => {
      if (typeof TextEncoder === "undefined") return;
      const wParser = new Parser('new TextEncoder()');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(TextEncoder);
      expect([...value.encode("A")]).eql([65]);
    });

    it("new TextDecoder() creates a TextDecoder", () => {
      if (typeof TextDecoder === "undefined") return;
      const wParser = new Parser('new TextDecoder()');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(TextDecoder);
      expect(value.decode(new Uint8Array([65]))).equal("A");
    });

    it("new ArrayBuffer() creates an ArrayBuffer", () => {
      const wParser = new Parser('new ArrayBuffer(8)');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(ArrayBuffer);
      expect(value.byteLength).equal(8);
    });

    it("new DataView() creates a DataView", () => {
      const wParser = new Parser('new DataView(new ArrayBuffer(8))');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(DataView);
      expect(value.byteLength).equal(8);
    });

    it("new Uint8Array() creates a typed array", () => {
      const wParser = new Parser('new Uint8Array([1, 2, 3])');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(Uint8Array);
      expect([...value]).eql([1, 2, 3]);
    });

    it("new BigInt64Array() creates a typed array when available", () => {
      if (typeof BigInt64Array === "undefined") return;
      const wParser = new Parser('new BigInt64Array(2)');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(BigInt64Array);
      expect(value.length).equal(2);
    });

    it("new TypeError() creates a TypeError", () => {
      const wParser = new Parser('new TypeError("bad value")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(TypeError);
      expect(value.message).equal("bad value");
    });

    it("new AggregateError() creates an AggregateError when available", () => {
      if (typeof AggregateError === "undefined") return;
      const wParser = new Parser('new AggregateError([new Error("inner")], "outer")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(AggregateError);
      expect(value.message).equal("outer");
    });

    it("new DOMException() creates a DOMException when available", () => {
      if (typeof DOMException === "undefined") return;
      const wParser = new Parser('new DOMException("blocked", "SecurityError")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });
      const value = evalBinding(expr, context);

      expect(value).toBeInstanceOf(DOMException);
      expect(value.name).equal("SecurityError");
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

    it("new Promise() throws an error", () => {
      const wParser = new Parser('new Promise(() => {})');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });

      expect(() => evalBinding(expr, context)).toThrow(
        /XMLUI does not support the new operator with constructor 'Promise'/
      );
    });

    it("new WebSocket() throws an error when available", () => {
      if (typeof WebSocket === "undefined") return;
      const wParser = new Parser('new WebSocket("ws://example.com")');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: {} });

      expect(() => evalBinding(expr, context)).toThrow(
        /XMLUI does not support the new operator with constructor 'WebSocket'/
      );
    });

    it("allowed constructor names cannot be spoofed by local custom constructors", () => {
      class UnsafeMap {}
      const wParser = new Parser('new Map()');
      const expr = wParser.parseExpr();
      expect(expr).not.equal(null);
      if (!expr) return;

      const context = createEvalContext({ localContext: { Map: UnsafeMap } });

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
