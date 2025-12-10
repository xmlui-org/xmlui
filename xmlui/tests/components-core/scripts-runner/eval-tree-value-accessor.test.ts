import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  evalBinding,
  evalBindingExpression,
} from "../../../src/components-core/script-runner/eval-tree-sync";
import { createEvalContext } from "./test-helpers";
import { evalBindingAsync } from "../../../src/components-core/script-runner/eval-tree-async";

describe("Evaluate value accessor expression (sync)", () => {
  it("Value accessor with _VALUE_PROP_ returns the property value", () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        obj: { value: 3, other: "something else", _VALUE_PROP_: "value" },
      },
    });
    const result = evalBinding(expr, context);
    expect(result).equal(3);
  });

  it("Value accessor without _VALUE_PROP_ returns the original object", () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const originalObj = { value: 3, other: "something else" };
    const context = createEvalContext({
      localContext: { obj: originalObj },
    });
    const result = evalBinding(expr, context);
    expect(result).toEqual(originalObj);
  });

  it("Value accessor with _VALUE_PROP_ pointing to 'other' property", () => {
    const parser = new Parser("data!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        data: { value: 3, other: "hello world", _VALUE_PROP_: "other" },
      },
    });
    const result = evalBinding(expr, context);
    expect(result).equal("hello world");
  });

  it("Value accessor followed by member access", () => {
    const parser = new Parser("user!.name");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        user: {
          profile: { name: "John", age: 30 },
          other: "something",
          _VALUE_PROP_: "profile",
        },
      },
    });
    const result = evalBinding(expr, context);
    expect(result).equal("John");
  });

  it("Value accessor with null returns null", () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: { obj: null },
    });
    const result = evalBinding(expr, context);
    expect(result).equal(null);
  });

  it("Value accessor with undefined returns undefined", () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: { obj: undefined },
    });
    const result = evalBinding(expr, context);
    expect(result).equal(undefined);
  });

  it("Value accessor with primitive returns primitive", () => {
    const parser = new Parser("num!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: { num: 42 },
    });
    const result = evalBinding(expr, context);
    expect(result).equal(42);
  });

  it("Value accessor with string returns string", () => {
    const parser = new Parser("str!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: { str: "hello" },
    });
    const result = evalBinding(expr, context);
    expect(result).equal("hello");
  });

  it("Value accessor with array and _VALUE_PROP_", () => {
    const parser = new Parser("arr!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const targetArray = [1, 2, 3];
    const context = createEvalContext({
      localContext: {
        arr: { items: targetArray, _VALUE_PROP_: "items" },
      },
    });
    const result = evalBinding(expr, context);
    expect(result).toEqual(targetArray);
  });

  it("Value accessor in binary expression", () => {
    const parser = new Parser("a! + b!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        a: { value: 10, _VALUE_PROP_: "value" },
        b: { value: 20, _VALUE_PROP_: "value" },
      },
    });
    const result = evalBinding(expr, context);
    expect(result).equal(30);
  });

  it("Chained value accessors", () => {
    const parser = new Parser("obj!.inner!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        obj: {
          outer: { inner: { data: 42, _VALUE_PROP_: "data" }, _VALUE_PROP_: "inner" },
          _VALUE_PROP_: "outer",
        },
      },
    });
    const result = evalBinding(expr, context);
    expect(result).equal(42);
  });

  it("Value accessor with non-existent property in _VALUE_PROP_", () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: { obj: { value: 3, _VALUE_PROP_: "nonExistent" } },
    });
    const result = evalBinding(expr, context);
    // Should return undefined when property doesn't exist (accessing a property that doesn't exist returns undefined)
    expect(result).equal(undefined);
  });

  it("Value accessor with _VALUE_PROP_ not a string", () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const originalObj = { value: 3, _VALUE_PROP_: 123 };
    const context = createEvalContext({
      localContext: { obj: originalObj },
    });
    const result = evalBinding(expr, context);
    // Should return original object when _VALUE_PROP_ is not a string
    expect(result).toEqual(originalObj);
  });
});

describe("Evaluate value accessor expression (async)", () => {
  it("Value accessor with _VALUE_PROP_ returns the property value (async)", async () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        obj: { value: 3, other: "something else", _VALUE_PROP_: "value" },
      },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal(3);
  });

  it("Value accessor without _VALUE_PROP_ returns the original object (async)", async () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const originalObj = { value: 3, other: "something else" };
    const context = createEvalContext({
      localContext: { obj: originalObj },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).toEqual(originalObj);
  });

  it("Value accessor followed by member access (async)", async () => {
    const parser = new Parser("user!.name");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        user: {
          profile: { name: "John", age: 30 },
          other: "something",
          _VALUE_PROP_: "profile",
        },
      },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal("John");
  });

  it("Value accessor in binary expression (async)", async () => {
    const parser = new Parser("a! + b!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        a: { value: 10, _VALUE_PROP_: "value" },
        b: { value: 20, _VALUE_PROP_: "value" },
      },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal(30);
  });

  it("Chained value accessors (async)", async () => {
    const parser = new Parser("obj!.inner!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        obj: {
          outer: { inner: { data: 42, _VALUE_PROP_: "data" }, _VALUE_PROP_: "inner" },
          _VALUE_PROP_: "outer",
        },
      },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal(42);
  });

  it("Value accessor with Promise value (async)", async () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        obj: { value: Promise.resolve(99), _VALUE_PROP_: "value" },
      },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal(99);
  });

  it("Value accessor with array (async)", async () => {
    const parser = new Parser("arr![1]");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const targetArray = [10, 20, 30];
    const context = createEvalContext({
      localContext: {
        arr: { items: targetArray, _VALUE_PROP_: "items" },
      },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal(20);
  });

  it("Value accessor with null returns null (async)", async () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: { obj: null },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal(null);
  });

  it("Value accessor with undefined returns undefined (async)", async () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: { obj: undefined },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal(undefined);
  });

  it("Value accessor with primitive returns primitive (async)", async () => {
    const parser = new Parser("num!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: { num: 42 },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal(42);
  });

  it("Value accessor with string returns string (async)", async () => {
    const parser = new Parser("str!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: { str: "hello" },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal("hello");
  });

  it("Value accessor with array and _VALUE_PROP_ (async)", async () => {
    const parser = new Parser("arr!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const targetArray = [1, 2, 3];
    const context = createEvalContext({
      localContext: {
        arr: { items: targetArray, _VALUE_PROP_: "items" },
      },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).toEqual(targetArray);
  });

  it("Value accessor with non-existent property in _VALUE_PROP_ (async)", async () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const originalObj = { value: 3, _VALUE_PROP_: "nonExistent" };
    const context = createEvalContext({
      localContext: { obj: originalObj },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    // Should return undefined when property doesn't exist
    expect(result).equal(undefined);
  });

  it("Value accessor with _VALUE_PROP_ not a string (async)", async () => {
    const parser = new Parser("obj!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const originalObj = { value: 3, _VALUE_PROP_: 123 };
    const context = createEvalContext({
      localContext: { obj: originalObj },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    // Should return original object when _VALUE_PROP_ is not a string
    expect(result).toEqual(originalObj);
  });

  it("Value accessor with _VALUE_PROP_ pointing to 'other' property (async)", async () => {
    const parser = new Parser("data!");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const context = createEvalContext({
      localContext: {
        data: { value: 3, other: "hello world", _VALUE_PROP_: "other" },
      },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal("hello world");
  });

  it("Value accessor followed by calculated member access (async)", async () => {
    const parser = new Parser("data![0]");
    const expr = parser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    const targetArray = [99, 88, 77];
    const context = createEvalContext({
      localContext: {
        data: { items: targetArray, _VALUE_PROP_: "items" },
      },
    });
    const result = await evalBindingAsync(expr, context, undefined);
    expect(result).equal(99);
  });
});
