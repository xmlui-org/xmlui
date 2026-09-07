import { describe, expect, it, vi } from "vitest";

import { executeCompiledStatementSync } from "../../../src/components-core/script-compiler";
import { compileStatementSyncStatements } from "../../../src/components-core/script-compiler/targets/binding-sync";
import { processStatementQueue } from "../../../src/components-core/script-runner/process-statement-sync";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { T_ARROW_EXPRESSION_STATEMENT } from "../../../src/parsers/scripting/ScriptingNodeTypes";

/**
 * Phase 3.3 of `.plan/strict-compilation-mode.md`.
 *
 * The synchronous statement queue had no compiled target, so `compileScripts` compiled the
 * leaf expressions of a sync callback and left its control flow interpreted — measurably
 * *slower* than interpreting the lot, on the shapes this path actually serves.
 *
 * `statement-sync` is an entry point rather than a second compiler: `binding-sync` already
 * emitted every synchronous statement form, because arrow bodies need them. What was
 * missing was a way in from a `Statement[]`.
 */
function context(compiled: boolean, localContext: Record<string, any> = {}, eventArgs: any[] = []) {
  return {
    localContext: { ...localContext },
    eventArgs,
    appContext: { xmluiConfig: {} },
    options: { defaultToOptionalMemberAccess: true, ...(compiled ? { compileScripts: true } : {}) },
  } as any;
}

/** The interpreter parks its result on the thread, or on the last block. */
function interpretedResult(source: string, localContext: Record<string, any>, eventArgs: any[] = []) {
  const evalContext = context(false, localContext, eventArgs);
  processStatementQueue(new Parser(source).parseStatements(), evalContext);
  const blocks = evalContext.mainThread?.blocks;
  return {
    value: evalContext.mainThread?.returnValue ?? blocks?.[blocks.length - 1]?.returnValue,
    localContext: evalContext.localContext,
  };
}

function compiledResult(source: string, localContext: Record<string, any>, eventArgs: any[] = []) {
  const evalContext = context(true, localContext, eventArgs);
  const value = executeCompiledStatementSync(new Parser(source).parseStatements(), evalContext);
  return { value, localContext: evalContext.localContext };
}

describe("statement-sync agrees with the interpreter", () => {
  it.each([
    ["predicate", "return $item.status === 'done';", { $item: { status: "done" } }, true],
    ["branch", "if (n > 3) { return 'hi'; } return 'lo';", { n: 5 }, "hi"],
    ["for loop", "let s = 0; for (let i = 0; i < 4; i++) { s += i; } return s;", {}, 6],
    ["for-of", "let s = 0; for (const x of xs) { s += x; } return s;", { xs: [1, 2, 3] }, 6],
    ["for-in", "let k = []; for (const p in o) { k.push(p); } return k;", { o: { a: 1, b: 2 } }, ["a", "b"]],
    ["while with break", "let n = 0; while (true) { n++; if (n > 2) break; } return n;", {}, 3],
    ["switch", "switch (n) { case 1: return 'one'; default: return 'other'; }", { n: 1 }, "one"],
    ["try/catch/finally", "let o = ''; try { throw 'x'; } catch (e) { o += e; } finally { o += 'f'; } return o;", {}, "xf"],
    ["nested function", "function d(x) { return x * 2; } return d(3);", {}, 6],
    ["destructuring declaration", "const { a, b: c } = o; return a + c;", { o: { a: 1, b: 2 } }, 3],
    ["array methods with callbacks", "return xs.filter(x => x > 1).map(x => x * 2);", { xs: [1, 2, 3] }, [4, 6]],
    ["closure over context", "return xs.map(x => x * factor);", { xs: [1, 2], factor: 3 }, [3, 6]],
    ["no return value", "let a = 1;", {}, undefined],
  ])("%s", (_name, source, localContext, expected) => {
    const interpreted = interpretedResult(source as string, localContext as any);
    const compiled = compiledResult(source as string, localContext as any);
    expect(compiled.value).toEqual(interpreted.value);
    expect(compiled.value).toEqual(expected);
    // --- Effects on the surrounding scope must match too, not only the result.
    expect(compiled.localContext).toEqual(interpreted.localContext);
  });

  it("writes to the surrounding scope the same way", () => {
    expect(compiledResult("n = n + 5; return n;", { n: 1 })).toEqual(
      interpretedResult("n = n + 5; return n;", { n: 1 }),
    );
  });

  it("propagates a throw rather than swallowing it", () => {
    expect(() => compiledResult("throw new Error('boom');", {})).toThrow("boom");
  });
});

describe("handlers written as an arrow", () => {
  // --- The shape most synchronous callbacks take: `rowDisabledPredicate="{(row) => …}"`
  // --- is wrapped in a synthetic statement by the caller. A target that refused this
  // --- would have compiled almost nothing that matters.
  const wrap = (source: string) => [
    { type: T_ARROW_EXPRESSION_STATEMENT, expr: new Parser(source).parseExpr() } as any,
  ];

  it.each([
    ["row predicate", "(row) => row.locked", [{ locked: true }], true],
    ["two arguments", "(a, b) => a + b", [2, 3], 5],
    ["block body", "(row) => { if (row.n > 1) { return 'hi'; } return 'lo'; }", [{ n: 5 }], "hi"],
    ["destructured parameter", "({ id }) => id", [{ id: 7 }], 7],
    ["no arguments", "() => 42", [], 42],
    ["closes over the surrounding scope", "(x) => x * factor", [3], 30],
  ])("%s", (_name, source, args, expected) => {
    const evalContext = context(true, { factor: 10 }, args as any[]);
    expect(executeCompiledStatementSync(wrap(source as string), evalContext)).toEqual(expected);
  });

  it("does not share one artifact between unrelated handlers", () => {
    // --- A synthesized statement has no `nodeId`, so keying the artifact cache on the
    // --- statement alone gave every arrow handler the same key: the first one compiled
    // --- answered for all the rest. One table's row predicate would have decided
    // --- another's. The inner expression is a real parsed node and does carry an id.
    const evalContext = context(true, {}, [{ locked: true }]);
    expect(executeCompiledStatementSync(wrap("(row) => row.locked"), evalContext)).toBe(true);
    expect(executeCompiledStatementSync(wrap("() => 'second'"), context(true, {}, []))).toBe(
      "second",
    );
    expect(executeCompiledStatementSync(wrap("(a, b) => a + b"), context(true, {}, [1, 2]))).toBe(3);
  });
});

describe("the per-statement completion hook", () => {
  it("fires for each statement, as the interpreter does", () => {
    // --- `runCodeSync` flushes accumulated state changes through this hook. Compiled code
    // --- that skipped it would produce the right values while surfacing a handler's
    // --- writes at a different moment.
    const source = "let a = 1; a = a + 1; n = a; return n;";
    const countFor = (compiled: boolean) => {
      const onStatementCompleted = vi.fn();
      const evalContext = { ...context(compiled, { n: 0 }), onStatementCompleted };
      const statements = new Parser(source).parseStatements();
      if (compiled) {
        executeCompiledStatementSync(statements, evalContext);
      } else {
        processStatementQueue(statements, evalContext);
      }
      return onStatementCompleted.mock.calls.length;
    };
    expect(countFor(true)).toBeGreaterThan(0);
    expect(countFor(true)).toBe(countFor(false));
  });
});

describe("the emitted artifact", () => {
  it("is tagged as its own target", () => {
    const artifact = compileStatementSyncStatements(new Parser("return 1;").parseStatements(), {
      sourceId: "t",
    });
    expect(artifact.target).toBe("statement-sync");
  });
});


/**
 * The last common way into the interpreter from compiled code, and the one the original
 * report was actually about.
 *
 * A `Globals.xs` helper or a `<script>` function is stored as an arrow expression, so
 * calling one from a binding — `var.rows="{applyFilters(cases, query)}"` — walked its body
 * on every reactive invalidation, however much of the app had compiled. The build-time
 * artifact on the declaration cannot serve here: it targets `event-async` and returns a
 * promise, which a synchronous binding cannot accept.
 */
describe("declaration functions called from a binding", () => {
  const collect = async () => {
    const { collectCodeBehindFromSource } = await import(
      "../../../src/parsers/scripting/code-behind-collect"
    );
    return (
      collectCodeBehindFromSource(
        "Globals.xs",
        "function applyFilters(rows, q) { return rows.filter(r => r.name.includes(q)); }\n" +
          "function tally(rows) { let s = 0; for (const r of rows) { s += r.n; } return s; }",

        { compileScripts: true } as any,
      ) as any
    ).functions;
  };

  const evaluate = async (source: string, localContext: Record<string, any>, compiled: boolean) => {
    const { evalBinding } = await import("../../../src/components-core/script-runner/eval-tree-sync");
    return evalBinding(new Parser(source).parseExpr()!, {
      localContext: { ...localContext, ...(await collect()) },
      appContext: { xmluiConfig: {} },
      options: { defaultToOptionalMemberAccess: true, ...(compiled ? { compileScripts: true } : {}) },
    } as any);
  };

  it.each([
    ["a helper filtering rows", "applyFilters(rows, 'a')", { rows: [{ name: "ab" }, { name: "zz" }] }, [{ name: "ab" }]],
    ["a helper with a loop", "tally(rows)", { rows: [{ n: 1 }, { n: 2 }] }, 3],
    ["the result used further", "applyFilters(rows, 'a').length", { rows: [{ name: "ab" }] }, 1],
  ])("%s agrees either way", async (_name, source, localContext, expected) => {
    await expect(evaluate(source as string, localContext as any, false)).resolves.toEqual(expected);
    await expect(evaluate(source as string, localContext as any, true)).resolves.toEqual(expected);
  });

  it("no longer enters the interpreter under strict compilation", async () => {
    const { setStrictCompilationEnabled, resetStrictCompilationForTests } = await import(
      "../../../src/components-core/script-compiler/strict-compilation"
    );
    setStrictCompilationEnabled(true);
    try {
      await expect(evaluate("tally(rows)", { rows: [{ n: 4 }] }, true)).resolves.toBe(4);
    } finally {
      resetStrictCompilationForTests();
    }
  });

  it("falls back rather than crashing when the body cannot compile", async () => {
    // --- The safety net, forced rather than provoked. No construct currently reaches it:
    // --- what the emitter refuses, the language now refuses too, so the corpus has no
    // --- remaining fallback case. It still has to work, because the next unsupported
    // --- construct should make a binding slow rather than fatal — the synchronous binding
    // --- path had no catch at all until Phase 4, and a refusal took the app down.
    const executor = await import(
      "../../../src/components-core/script-compiler/targets/binding-sync-executor"
    );
    const { UnsupportedCompiledScriptNodeError } = await import(
      "../../../src/components-core/script-compiler/errors"
    );
    const spy = vi
      .spyOn(executor, "executeCompiledStatementSync")
      .mockImplementation(() => {
        throw new UnsupportedCompiledScriptNodeError("115", "forced");
      });
    try {
      await expect(evaluate("tally(rows)", { rows: [{ n: 4 }] }, true)).resolves.toBe(4);
    } finally {
      spy.mockRestore();
    }
  });
});
