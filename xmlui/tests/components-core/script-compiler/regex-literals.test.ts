import { describe, expect, it } from "vitest";

import { compileBindingSyncExpressionSource } from "../../../src/components-core/script-compiler/targets/binding-sync";
import { compileEventAsyncStatementSource } from "../../../src/components-core/script-compiler";
import { evalBinding } from "../../../src/components-core/script-runner/eval-tree-sync";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { serializeAstForJs } from "../../../src/components-core/script-compiler/literals";

/**
 * Regular expressions are the only non-primitive literal the parser produces
 * (`Parser.parseRegExpLiteral`), and both compiler targets used to hand them to
 * `JSON.stringify`, which renders one as `{}`.
 *
 * In `binding-sync` that was silent: `text.replace(/ /g, "-")` compiled to a call with an
 * empty object as its pattern and returned the text unchanged — a wrong answer with no
 * error, no fallback marker, and a build that reported success. In `event-async` a guard
 * turned the same case into a fallback, so it was merely slow. Both now render the
 * pattern as a real regular expression.
 */
function evaluate(source: string, compile: boolean, state: Record<string, any> = {}) {
  return evalBinding(new Parser(source).parseExpr()!, {
    localContext: { ...state },
    appContext: { xmluiConfig: {} },
    options: { defaultToOptionalMemberAccess: true, ...(compile ? { compileScripts: true } : {}) },
  } as any);
}

async function runHandler(source: string, compile: boolean, state: Record<string, any> = {}) {
  const evalContext: any = {
    localContext: { ...state },
    appContext: { xmluiConfig: {} },
    options: { defaultToOptionalMemberAccess: true, ...(compile ? { compileScripts: true } : {}) },
  };
  await processStatementQueueAsync(new Parser(source).parseStatements(), evalContext);
  return evalContext.mainThread?.returnValue;
}

describe("regular expression literals in bindings", () => {
  it.each([
    ["replace", "text.replace(/ /g, '-')", { text: "a b c" }, "a-b-c"],
    ["split", "text.split(/,\\s*/)", { text: "a, b, c" }, ["a", "b", "c"]],
    ["test", "/^a/.test(text)", { text: "abc" }, true],
    ["match", "text.match(/b(c)/)[1]", { text: "abc" }, "c"],
    ["search", "text.search(/c/)", { text: "abc" }, 2],
    ["flags preserved", "text.replace(/A/gi, 'x')", { text: "aAa" }, "xxx" ],
    ["escaped delimiter", "text.replace(/a\\/b/, 'x')", { text: "a/b" }, "x"],
    ["character class", "text.replace(/[^a-z]+/g, '')", { text: "a1b2c" }, "abc"],
    ["as a value", "re.test(text)", { re: /^a/, text: "abc" }, true],
  ])("%s agrees with the interpreter", (_name, source, state, expected) => {
    expect(evaluate(source as string, false, state as any)).toEqual(expected);
    expect(evaluate(source as string, true, state as any)).toEqual(expected);
  });

  it("compiles rather than flattening the pattern to an empty object", () => {
    const js = compileBindingSyncExpressionSource("text.replace(/a/g, 'x')", "t").js;
    expect(js).toContain('new RegExp("a", "g")');
    expect(js).not.toContain("{}");
  });

  it("builds a fresh instance per evaluation, as a literal does in JavaScript", () => {
    // --- A `g` pattern carries `lastIndex`. Sharing one instance across evaluations made
    // --- the fourth call disagree with the first three.
    const expr = new Parser("/a/g.test(text)").parseExpr()!;
    const run = (compile: boolean) =>
      [0, 1, 2, 3].map(() =>
        evalBinding(expr, {
          localContext: { text: "aaa" },
          appContext: { xmluiConfig: {} },
          options: {
            defaultToOptionalMemberAccess: true,
            ...(compile ? { compileScripts: true } : {}),
          },
        } as any),
      );
    expect(run(false)).toEqual([true, true, true, true]);
    expect(run(true)).toEqual([true, true, true, true]);
  });
});

describe("regular expression literals in event handlers", () => {
  it.each([
    ["replace", "return text.replace(/ /g, '-');", { text: "a b c" }, "a-b-c"],
    ["declared then used", "const re = /a+/; return text.replace(re, 'x');", { text: "aab" }, "xb"],
    ["inside a condition", "if (/^a/.test(text)) { return 'yes'; } return 'no';", { text: "abc" }, "yes"],
    ["split", "return text.split(/,\\s*/);", { text: "a, b" }, ["a", "b"]],
  ])("%s agrees with the interpreter", async (_name, source, state, expected) => {
    await expect(runHandler(source as string, false, state as any)).resolves.toEqual(expected);
    await expect(runHandler(source as string, true, state as any)).resolves.toEqual(expected);
  });

  it("no longer falls back to interpretation", () => {
    // --- This used to throw, which is why a handler containing a regex ran interpreted.
    const artifact = compileEventAsyncStatementSource("x = text.replace(/a/, 'b');", "t");
    expect(artifact.js).toContain('new RegExp("a", "")');
  });
});

describe("regular expressions inside a lazy arrow", () => {
  // --- Arrows in value position are emitted as serialized AST for the interpreter to
  // --- walk. That serialization is JSON, so a pattern used to flatten to `{}` there too.
  it.each([
    ["object literal value", "({ f: (s) => s.replace(/a/, 'X') }).f(text)", { text: "aaa" }, "Xaa"],
    ["array literal element", "[(s) => s.replace(/a/, 'X')][0](text)", { text: "aaa" }, "Xaa"],
  ])("%s agrees with the interpreter", (_name, source, state, expected) => {
    expect(evaluate(source as string, false, state as any)).toEqual(expected);
    expect(evaluate(source as string, true, state as any)).toEqual(expected);
  });
});

describe("serializeAstForJs", () => {
  it("leaves nodes without a pattern byte-identical to JSON.stringify", () => {
    const node = new Parser("(s) => s.trim()").parseExpr()!;
    expect(serializeAstForJs(node)).toBe(JSON.stringify(node));
  });

  it("renders a pattern instead of dropping it", () => {
    expect(serializeAstForJs({ value: /a+/gi })).toBe('{"value":new RegExp("a+", "gi")}');
  });

  it("picks a marker that cannot collide with string data in the script", () => {
    // --- The placeholder is chosen only after checking it is absent from the node's own
    // --- serialized form, so source text that happens to look like the marker is safe.
    const node = { text: "$xmluiRegExp$0", value: /a/ };
    expect(serializeAstForJs(node)).toBe('{"text":"$xmluiRegExp$0","value":new RegExp("a", "")}');
  });
});
