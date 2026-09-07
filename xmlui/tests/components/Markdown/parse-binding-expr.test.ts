import { describe, expect, it } from "vitest";

import { parseBindingExpression } from "../../../src/components/Markdown/parse-binding-expr";

/**
 * Markdown renders a function inside a binding expression as `[xmlui function]` rather
 * than dropping it. That is a user-visible contract, covered by smoke tests, and it broke
 * when compiled arrows became real JavaScript functions: the check that produced the
 * placeholder recognised only the interpreter's AST-object representation, so
 * `JSON.stringify` silently dropped a compiled one.
 *
 * These pin the contract against the *value*, whichever shape the engine produced — the
 * extractor is stubbed so the assertions are about rendering, not evaluation.
 */
function render(value: unknown): string {
  return String(parseBindingExpression("@{expr}", (() => value) as any));
}

const AST_ARROW = { type: 115, _ARROW_EXPR_: true, args: [], statement: {} };

describe("a function renders as a placeholder", () => {
  it.each([
    ["a real JavaScript function", () => null],
    ["an interpreter arrow object", AST_ARROW],
  ])("%s at the top level", (_name, value) => {
    expect(render(value)).toBe("[xmlui function]");
  });

  it.each([
    ["a real JavaScript function", () => null],
    ["an interpreter arrow object", AST_ARROW],
  ])("%s nested in an object", (_name, value) => {
    expect(render({ a: value })).toBe('{"a":"[xmlui function]"}');
  });

  it.each([
    ["a real JavaScript function", () => null],
    ["an interpreter arrow object", AST_ARROW],
  ])("%s nested in an array", (_name, value) => {
    // --- Array elements were returned unmapped, so a function inside one rendered as its
    // --- syntax tree while the same function inside an object rendered as a placeholder.
    expect(render({ a: [value] })).toBe('{"a":["[xmlui function]"]}');
  });

  it("mixed through a nested structure", () => {
    expect(render({ a: () => {}, x: null, b: { c: 3, d: "asdadsda", e: AST_ARROW } })).toBe(
      '{"a":"[xmlui function]","x":null,"b":{"c":3,"d":"asdadsda","e":"[xmlui function]"}}',
    );
  });
});

describe("everything else renders unchanged", () => {
  it.each([
    ["a plain object", { a: 1, b: { c: 1 } }, '{"a":1,"b":{"c":1}}'],
    ["an array of values", { a: [1, 2, 3] }, '{"a":[1,2,3]}'],
    ["a null", null, "null"],
    ["a number", 42, "42"],
    ["a string", "hello", "hello"],
  ])("%s", (_name, value, expected) => {
    expect(render(value)).toBe(expected);
  });
});
