import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  compileEventAsyncStatements,
  executeCompiledEventAsyncArtifact,
  executeCompiledEventAsyncHandler,
  serializeCompiledScriptArtifact,
  UnsupportedCompiledScriptNodeError,
} from "../../../src/components-core/script-compiler";
import { Parser } from "../../../src/parsers/scripting/Parser";

const NO_YIELD_CHECK = "runtime.afterStatement(evalContext, undefined, { checkYield: false })";

function expectSkipsYieldCheck(source: string): void {
  const artifact = compileEventAsyncStatementSource(source, `Main.xmlui#event-safe:${source}`);

  expect(artifact.js).toContain(NO_YIELD_CHECK);
}

function expectKeepsYieldCheck(source: string): void {
  const artifact = compileEventAsyncStatementSource(source, `Main.xmlui#event-yield:${source}`);

  expect(artifact.js).toContain("runtime.afterStatement(evalContext);");
  expect(artifact.js).not.toContain(NO_YIELD_CHECK);
}

const SAFE_MATH_CALLS = [
  "Math.abs(-1);",
  "Math.acos(0.5);",
  "Math.acosh(2);",
  "Math.asin(0.5);",
  "Math.asinh(1);",
  "Math.atan(1);",
  "Math.atan2(1, 2);",
  "Math.atanh(0.5);",
  "Math.cbrt(8);",
  "Math.ceil(1.2);",
  "Math.clz32(1);",
  "Math.cos(1);",
  "Math.cosh(1);",
  "Math.exp(1);",
  "Math.expm1(1);",
  "Math.floor(1.8);",
  "Math.fround(1.5);",
  "Math.hypot(3, 4);",
  "Math.imul(2, 3);",
  "Math.log(2);",
  "Math.log10(10);",
  "Math.log1p(1);",
  "Math.log2(8);",
  "Math.max(1, 2);",
  "Math.min(1, 2);",
  "Math.pow(2, 3);",
  "Math.random();",
  "Math.round(1.5);",
  "Math.sign(-1);",
  "Math.sin(1);",
  "Math.sinh(1);",
  "Math.sqrt(4);",
  "Math.tan(1);",
  "Math.tanh(1);",
  "Math.trunc(1.2);",
];

const SAFE_NUMBER_STATIC_CALLS = [
  "Number.isFinite(1);",
  "Number.isInteger(1);",
  "Number.isNaN(NaN);",
  "Number.isSafeInteger(1);",
  "Number.parseFloat('1.5');",
  "Number.parseInt('10', 10);",
];

const SAFE_STRING_STATIC_CALLS = [
  "String.fromCharCode(65);",
  "String.fromCodePoint(65);",
  "String.raw({ raw: ['a'] });",
];

const SAFE_ARRAY_STATIC_CALLS = ["Array.isArray([]);"];

const SAFE_STRING_PROTOTYPE_CALLS = [
  "'alpha'.at(0);",
  "'alpha'.charAt(0);",
  "'alpha'.charCodeAt(0);",
  "'alpha'.codePointAt(0);",
  "'alpha'.concat('beta');",
  "'alpha'.endsWith('a');",
  "'alpha'.includes('ph');",
  "'alpha'.indexOf('p');",
  "'alpha'.lastIndexOf('a');",
  "'alpha'.localeCompare('beta');",
  "'alpha'.match('a');",
  "'alpha'.matchAll('a');",
  "'alpha'.normalize();",
  "'alpha'.padEnd(8);",
  "'alpha'.padStart(8);",
  "'alpha'.repeat(2);",
  "'alpha'.replace('a', 'b');",
  "'alpha'.replaceAll('a', 'b');",
  "'alpha'.search('a');",
  "'alpha'.slice(1);",
  "'alpha'.split('p');",
  "'alpha'.startsWith('a');",
  "'alpha'.substring(1);",
  "'alpha'.toLocaleLowerCase();",
  "'alpha'.toLocaleUpperCase();",
  "'alpha'.toLowerCase();",
  "'alpha'.toString();",
  "'alpha'.toUpperCase();",
  "' alpha '.trim();",
  "' alpha '.trimEnd();",
  "' alpha '.trimStart();",
  "'alpha'.valueOf();",
];

const SAFE_NUMBER_PROTOTYPE_CALLS = [
  "(1).toExponential();",
  "(1).toFixed(2);",
  "(1).toLocaleString();",
  "(1).toPrecision(2);",
  "(1).toString();",
  "(1).valueOf();",
];

const SAFE_BOOLEAN_PROTOTYPE_CALLS = ["true.toString();", "true.valueOf();"];

const SAFE_ARRAY_PROTOTYPE_CALLS = [
  "[1, 2].at(0);",
  "[1, 2].includes(1);",
  "[1, 2].indexOf(1);",
  "[1, 2].join(',');",
  "[1, 2].lastIndexOf(1);",
  "[1, 2].slice(1);",
  "[1, 2].toLocaleString();",
  "[1, 2].toString();",
];

describe("event-async compiled script target", () => {
  it("creates a serializable event-async artifact from statements", () => {
    const artifact = compileEventAsyncStatementSource("count = count + 1;", "Main.xmlui#event-1");

    expect(artifact).toMatchObject({
      target: "event-async",
      sourceId: "Main.xmlui#event-1",
      sourceText: "count = count + 1;",
      dependencies: [],
      diagnostics: [],
    });
    expect(artifact.js).toContain("return (async () =>");
    expect(serializeCompiledScriptArtifact(artifact)).not.toContain("nativeFn");
  });

  it("preserves source range and mapping information", () => {
    const parser = new Parser("count = count + 1;");
    const statements = parser.parseStatements();
    const artifact = compileEventAsyncStatements(statements, {
      sourceId: "Main.xmlui#event-2",
      sourceText: "count = count + 1;",
    });

    expect(artifact.sourceRange).toMatchObject({
      start: 0,
      end: 17,
      startLine: 1,
      endLine: 1,
    });
    expect(artifact.mappings[0]).toMatchObject({
      sourceId: "Main.xmlui#event-2",
      sourceRange: { start: 0, end: 17 },
    });
  });

  it("executes the supported statement subset", async () => {
    const artifact = compileEventAsyncStatementSource("count = count + 1;", "Main.xmlui#event-3");
    const evalContext = {
      localContext: { count: 1 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    } as any;

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.count).toBe(2);
  });

  it("executes template literals", async () => {
    const artifact = compileEventAsyncStatementSource(
      "message = `Hello ${user.name}, count ${count}`;",
      "Main.xmlui#event-template",
    );
    const evalContext = {
      localContext: { count: 3, user: { name: "Ada" } },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    } as any;

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.message).toBe("Hello Ada, count 3");
  });

  it("compiles the sample toast handler with a template literal", () => {
    const source = `
      const start = Date.now();
      let sum = 0;
      for (let i = 0; i < 10000; i++) {
        sum += i;
      }
      toast.success(\`Sum: \${sum}, Time taken: \${Date.now() - start}ms\`);
    `;
    const parser = new Parser(source);
    const statements = parser.parseStatements();

    const artifact = compileEventAsyncStatements(statements, {
      sourceId: "Main.xmlui#event-toast-template",
      sourceText: source,
    });

    expect(artifact.js).toContain("runtime.call");
    expect(artifact.js).toContain("join('')");
  });

  it("skips yield checks for simple expression statements", () => {
    const artifact = compileEventAsyncStatementSource("value + 1;", "Main.xmlui#event-simple-expr");

    expect(artifact.js).toContain(NO_YIELD_CHECK);
  });

  it("keeps yield checks for expression statements with calls", () => {
    const artifact = compileEventAsyncStatementSource("getValue();", "Main.xmlui#event-call-expr");

    expect(artifact.js).toContain("runtime.afterStatement(evalContext);");
    expect(artifact.js).not.toContain(NO_YIELD_CHECK);
  });

  it("keeps yield checks for bare event handler references", () => {
    const artifact = compileEventAsyncStatementSource("selectItem", "Main.xmlui#event-bare-ref");

    expect(artifact.js).toContain("runtime.afterStatement(evalContext);");
    expect(artifact.js).not.toContain(NO_YIELD_CHECK);
  });

  it("skips yield checks for simple declarations but keeps them for call initializers", () => {
    const simpleArtifact = compileEventAsyncStatementSource(
      "let value = count + 1;",
      "Main.xmlui#event-simple-decl",
    );
    const callArtifact = compileEventAsyncStatementSource(
      "let value = getValue();",
      "Main.xmlui#event-call-decl",
    );

    expect(simpleArtifact.js).toContain(NO_YIELD_CHECK);
    expect(callArtifact.js).toContain("runtime.afterStatement(evalContext);");
    expect(callArtifact.js).not.toContain(NO_YIELD_CHECK);
  });

  it.each(SAFE_MATH_CALLS)("skips yield checks for safe Math call %s", (source) => {
    expectSkipsYieldCheck(source);
  });

  it.each(SAFE_NUMBER_STATIC_CALLS)("skips yield checks for safe Number call %s", (source) => {
    expectSkipsYieldCheck(source);
  });

  it.each(SAFE_STRING_STATIC_CALLS)("skips yield checks for safe String call %s", (source) => {
    expectSkipsYieldCheck(source);
  });

  it.each(SAFE_ARRAY_STATIC_CALLS)("skips yield checks for safe Array call %s", (source) => {
    expectSkipsYieldCheck(source);
  });

  it.each(SAFE_STRING_PROTOTYPE_CALLS)(
    "skips yield checks for safe string prototype call %s",
    (source) => {
      expectSkipsYieldCheck(source);
    },
  );

  it.each(SAFE_NUMBER_PROTOTYPE_CALLS)(
    "skips yield checks for safe number prototype call %s",
    (source) => {
      expectSkipsYieldCheck(source);
    },
  );

  it.each(SAFE_BOOLEAN_PROTOTYPE_CALLS)(
    "skips yield checks for safe boolean prototype call %s",
    (source) => {
      expectSkipsYieldCheck(source);
    },
  );

  it.each(SAFE_ARRAY_PROTOTYPE_CALLS)(
    "skips yield checks for safe array prototype call %s",
    (source) => {
      expectSkipsYieldCheck(source);
    },
  );

  it.each([
    "getValue();",
    "Math[name](value);",
    "value.trim();",
    "JSON.stringify(value);",
    "Date.now();",
    "items.map(item => item + 1);",
    "items.forEach(item => item);",
    "items.reduce((sum, item) => sum + item, 0);",
    "Object.keys(value);",
    "Math.max(getValue(), 1);",
  ])("keeps yield checks for non-safe or argument-yielding call %s", (source) => {
    expectKeepsYieldCheck(source);
  });

  it("keeps yield checks when a safe static global name is shadowed locally", () => {
    const artifact = compileEventAsyncStatementSource(
      "let Math = { max: getValue }; Math.max(1, 2);",
      "Main.xmlui#event-shadowed-math",
    );

    expect(artifact.js).toContain("runtime.afterStatement(evalContext);");
  });

  it("throws a structured unsupported error for unsupported nodes", () => {
    expect(() =>
      compileEventAsyncStatementSource("count = enabled ? 1 : 2;", "Main.xmlui#event-4"),
    ).toThrow(UnsupportedCompiledScriptNodeError);
  });

  it("throws a structured unsupported error for non-serializable literals", () => {
    expect(() =>
      compileEventAsyncStatementSource(
        "(value) => { if (/[^a-z0-9_]/.test(value)) return 'Invalid'; return null; }",
        "Main.xmlui#event-regexp",
      ),
    ).toThrow(UnsupportedCompiledScriptNodeError);
  });

  it("prefers a parse-time artifact over runtime AST compilation", async () => {
    const artifact = compileEventAsyncStatementSource("count = count + 1;", "Main.xmlui#event-5");
    const unsupportedStatements = new Parser("count = enabled ? 1 : 2;").parseStatements();
    const evalContext = {
      localContext: { count: 1, enabled: true },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    } as any;

    await executeCompiledEventAsyncHandler(
      unsupportedStatements,
      evalContext,
      undefined,
      artifact,
      "Main.xmlui#event-unsupported",
      "count = enabled ? 1 : 2;",
    );

    expect(evalContext.localContext.count).toBe(2);
  });

  it("runtime-compiles and cache keys statement handlers when no artifact exists", async () => {
    const unsupportedStatements = new Parser("count = enabled ? 1 : 2;").parseStatements();
    const evalContext = {
      localContext: { count: 1, enabled: true },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    } as any;

    await expect(
      executeCompiledEventAsyncHandler(
        unsupportedStatements,
        evalContext,
        undefined,
        undefined,
        "Main.xmlui#event-runtime",
        "count = enabled ? 1 : 2;",
      ),
    ).rejects.toBeInstanceOf(UnsupportedCompiledScriptNodeError);
  });
});
