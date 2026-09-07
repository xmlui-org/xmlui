import { readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createBindingEvalOptions, createEventEvalOptions } from "../../../src/components-core/script-runner/eval-options";
import * as exec from "../../../src/components-core/script-compiler/targets/binding-sync-executor";

/**
 * Phase 1.2 of `.plan/strict-compilation-mode.md`.
 *
 * Five call sites evaluated XMLScript through a hand-built context or an options-less
 * `extractParam`, so `compileScripts` never reached them and they ran interpreted
 * whatever the app asked for. Nothing downstream re-derives the switch for them.
 *
 * These tests pin the *option plumbing* — that each site now builds its options through
 * `createBindingEvalOptions` / `createEventEvalOptions` rather than inventing them. The
 * behaviour of those helpers is covered in `eval-options.test.ts`; what regressed before
 * was call sites bypassing them entirely.
 */
describe("options helpers carry the switch to context-free call sites", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("binding options read the app context", () => {
    expect(createBindingEvalOptions({ xmluiConfig: { compileScripts: true } } as any)).toMatchObject(
      { compileScripts: true },
    );
  });

  it("event options read the app context", () => {
    expect(createEventEvalOptions({ xmluiConfig: { compileScripts: true } } as any)).toMatchObject({
      compileScripts: true,
    });
  });

  it("both fall back to the build-resolved setting with no app context at all", () => {
    // --- This is the route `Backend.ts` depends on: it builds its evaluation context far
    // --- from React and passes a synthetic app context with no `xmluiConfig`.
    vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "true");
    expect(createEventEvalOptions(undefined)).toMatchObject({ compileScripts: true });
    expect(createBindingEvalOptions(undefined)).toMatchObject({ compileScripts: true });
  });

  it("stay off when nothing asks", () => {
    expect(createEventEvalOptions(undefined)).not.toHaveProperty("compileScripts");
    expect(createBindingEvalOptions(undefined)).not.toHaveProperty("compileScripts");
  });
});

/**
 * `extractParam` re-derives options from an app context, but three of the five sites
 * cannot pass one: widening identifier resolution there would change which expressions
 * resolve. They pass options only, so this asserts that path works.
 */
describe("extractParam compiles when given options but no app context", () => {
  afterEach(() => vi.unstubAllEnvs());

  function compiledEvaluations(run: () => unknown) {
    const spy = vi.spyOn(exec, "evaluateCompiledBinding");
    try {
      run();
      return spy.mock.calls.length;
    } finally {
      spy.mockRestore();
    }
  }

  it("passes the switch through the options argument alone", async () => {
    const { extractParam } = await import("../../../src/components-core/utils/extractParam");
    const state = { items: [{ id: 1 }, { id: 2 }] } as any;

    const off = compiledEvaluations(() =>
      extractParam(state, "{items.map(i => i.id)}", undefined, false, undefined, {}),
    );
    const on = compiledEvaluations(() =>
      extractParam(state, "{items.map(i => i.id)}", undefined, false, undefined, {
        compileScripts: true,
      }),
    );

    expect(off).toBe(0);
    expect(on).toBeGreaterThan(0);
  });

  it("produces the same value either way", async () => {
    const { extractParam } = await import("../../../src/components-core/utils/extractParam");
    const state = { items: [{ id: 1 }, { id: 2 }] } as any;
    expect(extractParam(state, "{items.map(i => i.id)}", undefined, false, undefined, {})).toEqual([
      1, 2,
    ]);
    expect(
      extractParam(state, "{items.map(i => i.id)}", undefined, false, undefined, {
        compileScripts: true,
      }),
    ).toEqual([1, 2]);
  });
});

/**
 * The helpers above are only useful if the call sites actually reach for them. Each of
 * these five evaluated XMLScript through options it invented, or through none at all —
 * which is invisible at runtime, because `eval-tree-sync` stamps a default options object
 * onto a context that arrives without one.
 *
 * A source-level invariant rather than a behavioural test: three of the five sit inside
 * React render paths that would need a full component harness to reach, and the property
 * worth pinning is structural — options come from the shared helpers, not from a literal.
 * The Phase 2 tripwire supersedes this by making interpretation itself observable; until
 * then this is what stops the gap reopening.
 */
describe("the five call sites derive their options from the helpers", () => {
  const SRC = join(__dirname, "..", "..", "..", "src");

  it.each([
    ["container/event-handlers.ts", "runCodeSync — sync callbacks and event handlers"],
    ["rendering/ComponentWrapper.tsx", "loader-reference resolution, per prop per render"],
    ["loader/PageableLoader.tsx", "prev/next page selectors"],
    ["interception/Backend.ts", "emulated backend operations and helpers"],
  ])("%s (%s)", (relativePath) => {
    const source = readFileSync(join(SRC, "components-core", relativePath), "utf-8");
    expect(source).toMatch(/create(Binding|Event)EvalOptions/);
  });

  it("RestApiProxy.ts (arrow-valued request parameters)", () => {
    const source = readFileSync(join(SRC, "components-core", "RestApiProxy.ts"), "utf-8");
    expect(source).toMatch(/create(Binding|Event)EvalOptions/);
  });

  it("runCodeSync no longer opts out — it runs the compiled statement path", () => {
    // --- This assertion used to pin the opposite. `runCodeSync` deliberately disabled
    // --- compilation while the synchronous statement queue had no compiled target,
    // --- because compiling only the leaf expressions was measurably slower than
    // --- interpreting the lot. Phase 3.3 built the target, so the exception is gone —
    // --- and this test failing is what said so.
    const source = readFileSync(join(SRC, "components-core", "container", "event-handlers.ts"), "utf-8");
    expect(source).toContain("executeCompiledStatementSync");
    expect(source).not.toContain("compileScripts: false");
  });
});
