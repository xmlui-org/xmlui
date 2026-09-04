import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatements,
  compileEventAsyncStatementSource,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";
import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import type { BindingTreeEvaluationContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import {
  parseHandlerCode,
  prepareHandlerStatements,
} from "../../../src/components-core/utils/statementUtils";

/**
 * Compiles a handler the way the XMLUI transform builds its parse-time artifact: the parsed
 * statements go straight to the event-async target, with no handler-shape preparation.
 */
function compileHandler(source: string, sourceId = `test:handler-arrow:${source}`) {
  return compileEventAsyncStatementSource(source, sourceId);
}

/**
 * Compiles a handler the way the container does when no parse-time artifact is available:
 * `prepareHandlerStatements` first wraps the handler into an `ArrowExpressionStatement`.
 * Both shapes reach the compiler in production, so both are covered here.
 */
function compilePreparedHandler(source: string) {
  return compileEventAsyncStatements(prepareHandlerStatements(parseHandlerCode(source)), {
    sourceId: `test:handler-arrow:prepared:${source}`,
  });
}

/** The interpreter records a handler's value on the innermost block scope. */
function interpretedReturnValue(evalContext: BindingTreeEvaluationContext): any {
  const blocks = evalContext.mainThread?.blocks;
  return blocks?.length ? blocks[blocks.length - 1].returnValue : evalContext.mainThread?.returnValue;
}

async function runCompiled(
  source: string,
  localContext: Record<string, any> = {},
  eventArgs: any[] = [],
) {
  const evalContext = createEvalContext({
    localContext,
    eventArgs,
    options: { compileScripts: true, defaultToOptionalMemberAccess: true },
  });
  const returnValue = await executeCompiledEventAsyncArtifact(
    compilePreparedHandler(source),
    evalContext,
  );
  return { evalContext, localContext, returnValue };
}

async function runInterpreted(
  source: string,
  localContext: Record<string, any> = {},
  eventArgs: any[] = [],
) {
  const evalContext = createEvalContext({
    localContext,
    eventArgs,
    options: { defaultToOptionalMemberAccess: true },
  });
  await processStatementQueueAsync(
    prepareHandlerStatements(parseHandlerCode(source)),
    evalContext,
  );
  return { evalContext, localContext, returnValue: interpretedReturnValue(evalContext) };
}

async function expectHandlerParity(
  source: string,
  localContext: Record<string, any> = {},
  eventArgs: any[] = [],
) {
  const compiled = await runCompiled(source, { ...localContext }, eventArgs);
  const interpreted = await runInterpreted(source, { ...localContext }, eventArgs);

  expect(compiled.returnValue).toEqual(interpreted.returnValue);
  expect(compiled.localContext).toEqual(interpreted.localContext);
  return compiled;
}

/**
 * True when the generated code hands an AST back to the tree-walking interpreter instead of
 * running compiled JavaScript. `runtime.arrow` receives the arrow's serialized source tree,
 * so its presence means nothing inside the arrow was actually compiled.
 */
function usesInterpretedArrow(js: string): boolean {
  return js.includes("runtime.arrow(");
}

/**
 * The exact handler shape reported against v0.14.24: a `Lifecycle` `onMount` written as a
 * zero-argument arrow. Before the fix its whole body was serialized into `runtime.arrow` and
 * re-interpreted at run time.
 */
const LIFECYCLE_ON_MOUNT = `() => {
  if ($props.scrollToCaseId != null && rows.some(item => item.id === $props.scrollToCaseId)) {
    casesTable.scrollToId($props.scrollToCaseId);
    emitEvent('scrolledToCase', $props.scrollToCaseId);
  }
}`;

describe("compiled event handlers written as arrow functions", () => {
  describe("are compiled to native JavaScript", () => {
    it("compiles the reported Lifecycle onMount handler instead of re-interpreting it", () => {
      const { js } = compileHandler(LIFECYCLE_ON_MOUNT);

      expect(usesInterpretedArrow(js)).toBe(false);
      expect(js).toContain("runtime.callNativeArrow(");
      // --- The body's control flow is real emitted JavaScript, not an interpreted AST.
      expect(js).toMatch(/if \(__xmlui_evt_\d+\)/);
      // --- No serialized source tree is embedded in the generated code.
      expect(js).not.toContain("startToken");
    });

    it("compiles the reported handler in its prepared (ArrowExpressionStatement) shape too", () => {
      const { js } = compilePreparedHandler(LIFECYCLE_ON_MOUNT);

      expect(usesInterpretedArrow(js)).toBe(false);
      expect(js).toContain("runtime.callNativeArrow(");
      expect(js).not.toContain("startToken");
    });

    it("binds arrow parameters as real JavaScript parameters", () => {
      const { js } = compileHandler("(event) => caseMenu.openAt(event, $item)");

      expect(usesInterpretedArrow(js)).toBe(false);
      expect(js).toContain("(async (event) =>");
    });

    it("emits markedly less code than the interpreted-arrow payload it replaces", () => {
      // --- The serialized AST carries every token with its source positions, so the old
      // --- lazy-arrow output was several times larger than the compiled body.
      const { js } = compileHandler(LIFECYCLE_ON_MOUNT);
      expect(js.length).toBeLessThan(4000);
    });

    it.each([
      ["block body with control flow", "() => { if (flag) { hits = hits + 1; } }"],
      ["try/catch", "() => { try { hits = risky(); } catch (e) { hits = -1; } }"],
      ["for-of loop", "() => { for (const x of items) { total = total + x; } }"],
      ["switch", "(v) => { switch (v) { case 1: r = 'a'; break; default: r = 'b'; } }"],
      ["template literal", "(n) => { msg = `hi ${n}`; }"],
      ["destructured parameter", "({ a, b }) => { total = a + b; }"],
      ["rest parameter", "(...args) => { total = args.length; }"],
      ["nested callback arrow", "() => { hits = items.filter(x => x > 1).length; }"],
    ])("compiles %s natively", (_label, source) => {
      const { js } = compileHandler(source);
      expect(usesInterpretedArrow(js)).toBe(false);
      expect(js).toContain("runtime.callNativeArrow(");
    });
  });

  describe("behave identically to the interpreted handler", () => {
    it("runs the reported onMount body and its nested callback", async () => {
      const calls: any[] = [];
      const context = () => ({
        $props: { scrollToCaseId: 7 },
        rows: [{ id: 3 }, { id: 7 }],
        casesTable: { scrollToId: (id: number) => calls.push(["scroll", id]) },
        emitEvent: (name: string, payload: any) => calls.push([name, payload]),
      });

      await runCompiled(LIFECYCLE_ON_MOUNT, context());
      expect(calls).toEqual([
        ["scroll", 7],
        ["scrolledToCase", 7],
      ]);

      // --- The guard short-circuits when the anchor row is not present.
      calls.length = 0;
      await runCompiled(LIFECYCLE_ON_MOUNT, { ...context(), $props: { scrollToCaseId: 99 } });
      expect(calls).toEqual([]);
    });

    it("passes event arguments to a single-expression handler", async () => {
      const compiled = await expectHandlerParity("(item) => item.toUpperCase()", {}, ["alpha"]);
      expect(compiled.returnValue).toBe("ALPHA");
    });

    it("passes event arguments to a block-bodied handler", async () => {
      await expectHandlerParity(
        "(item) => { first = item; second = item; }",
        { first: "", second: "" },
        ["alpha"],
      );
    });

    it("returns an explicit value from a block-bodied handler", async () => {
      const compiled = await expectHandlerParity("(a, b) => { return a * b; }", {}, [6, 7]);
      expect(compiled.returnValue).toBe(42);
    });

    it("supports multiple parameters and missing arguments", async () => {
      await expectHandlerParity("(a, b) => { total = (a ?? 0) + (b ?? 0); }", { total: 0 }, [5]);
    });

    it("destructures an event argument", async () => {
      await expectHandlerParity(
        "({ id, name }) => { picked = name + ':' + id; }",
        { picked: "" },
        [{ id: 4, name: "row" }],
      );
    });

    it("collects rest arguments", async () => {
      await expectHandlerParity("(...args) => { total = args.length; }", { total: 0 }, [1, 2, 3]);
    });

    it("mutates container state from inside the arrow body", async () => {
      await expectHandlerParity(
        "(value) => { selected = selected.concat([value]); count = selected.length; }",
        { selected: [], count: 0 },
        ["a"],
      );
    });

    it("runs loops and control flow inside the arrow body", async () => {
      await expectHandlerParity(
        "(items) => { for (const item of items) { if (item > 1) { total = total + item; } } }",
        { total: 0 },
        [[1, 2, 3]],
      );
    });

    it("runs try/catch inside the arrow body", async () => {
      await expectHandlerParity(
        "() => { try { throw new Error('nope'); } catch (e) { caught = e.message; } }",
        { caught: "" },
      );
    });

    it("propagates a thrown error from the arrow body", async () => {
      await expect(runCompiled("() => { throw new Error('boom'); }")).rejects.toThrow("boom");
      await expect(runInterpreted("() => { throw new Error('boom'); }")).rejects.toThrow("boom");
    });
  });

  describe("preserve the interpreted fallback", () => {
    it("compiles spread call arguments natively", async () => {
      // --- Spread arguments used to force the lazy-arrow path; they are now emitted
      // --- natively, with the operand rules the interpreter applies (plan #3879).
      const source = "() => { collect(...items); }";
      const { js } = compileHandler(source);

      expect(usesInterpretedArrow(js)).toBe(false);
      expect(js).toContain("runtime.spreadCallArg(");

      const seen: any[] = [];
      await runCompiled(source, { items: [1, 2, 3], collect: (...args: any[]) => seen.push(args) });
      expect(seen).toEqual([[1, 2, 3]]);
    });

    it("falls back to the lazy arrow when the body uses an unsupported construct", async () => {
      // --- `await` is not part of XMLScript, so the native emitter refuses it and the
      // --- callback keeps the lazy (interpreted) arrow path.
      const source = "() => { collect(await items); }";
      const { js } = compileHandler(source);

      expect(usesInterpretedArrow(js)).toBe(true);
      expect(js).not.toContain("runtime.callNativeArrow(");
    });

    it("fails compilation rather than emitting a lazy arrow that cannot see compiled locals", () => {
      // --- The arrow both references a local declared by an earlier compiled statement and
      // --- uses a construct the native emitter rejects. Emitting the lazy arrow here would
      // --- silently resolve `extra` against the interpreter's scope instead, so compilation
      // --- must fail and let the whole handler fall back to interpreted execution.
      expect(() =>
        compileHandler("const extra = 5; (items) => { collect(extra, await items); }"),
      ).toThrow(/Unsupported/);
    });

    it("still rejects async arrow handlers", () => {
      expect(() => compileHandler("async () => { await save(); }")).toThrow(/Unsupported/);
    });
  });
});
