import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { evalBinding } from "../../../src/components-core/script-runner/eval-tree-sync";
import { createBindingEvalOptions } from "../../../src/components-core/script-runner/eval-options";
import { clearCompiledScriptDebugSourceTraceForTests } from "../../../src/components-core/script-compiler/debug-source-trace";
import { Parser } from "../../../src/parsers/scripting/Parser";

/**
 * Runtime proof that `compileScripts` routes binding expressions — the
 * `var.rows="{applyFilters(...)}"` shape — through the compiled executor.
 *
 * Bindings have no build-time artifacts: prop values are parsed lazily in the browser,
 * so counting artifacts in a bundle cannot tell you whether bindings are compiled. The
 * observable signal is the compiled executor's `kind:"debug-source"` Inspector trace,
 * which only the compiled path emits.
 */
type TraceEntry = { kind?: string; target?: string };

function traceBuffer(): TraceEntry[] {
  return (globalThis as any).window._xsLogs as TraceEntry[];
}

function evaluate(source: string, xmluiConfig: Record<string, any>, state: Record<string, any>) {
  clearCompiledScriptDebugSourceTraceForTests();
  (globalThis as any).window._xsLogs = [];
  const expr = new Parser(source).parseExpr()!;
  const value = evalBinding(expr, {
    localContext: state,
    appContext: { xmluiConfig: { ...xmluiConfig, xsVerbose: true } },
    options: createBindingEvalOptions({
      xmluiConfig: { ...xmluiConfig, compiledScriptSourceMaps: "inline" },
    } as any),
  } as any);
  return {
    value,
    compiledTraces: traceBuffer().filter((entry) => entry.kind === "debug-source").length,
  };
}

const ROWS = [
  { id: 1, name: "alpha" },
  { id: 2, name: "beta" },
];

describe("compileScripts routes bindings through the compiled executor", () => {
  let restoreWindow = false;

  beforeEach(() => {
    if (typeof (globalThis as any).window === "undefined") {
      (globalThis as any).window = {};
      restoreWindow = true;
    }
    (globalThis as any).window._xsLogs = [];
  });

  afterEach(() => {
    if (restoreWindow) {
      delete (globalThis as any).window;
      restoreWindow = false;
    }
  });

  it("compiles a helper-call binding", () => {
    const { value, compiledTraces } = evaluate(
      "applyFilters(rows, 'al')",
      { compileScripts: true },
      {
        rows: ROWS,
        applyFilters: (list: any[], q: string) => list.filter((r) => r.name.includes(q)),
      },
    );

    expect(value).toEqual([ROWS[0]]);
    expect(compiledTraces).toBeGreaterThan(0);
  });

  it("compiles a binding with an inline array callback", () => {
    const { value, compiledTraces } = evaluate(
      "rows.filter(row => row.id > 1).length",
      { compileScripts: true },
      { rows: ROWS },
    );

    expect(value).toBe(1);
    expect(compiledTraces).toBeGreaterThan(0);
  });

  it("control: stays interpreted when compilation is off", () => {
    const { value, compiledTraces } = evaluate(
      "rows.filter(row => row.id > 1).length",
      {},
      { rows: ROWS },
    );

    expect(value).toBe(1);
    expect(compiledTraces).toBe(0);
  });

  it("control: compileBindings: false opts bindings out of the umbrella switch", () => {
    const { value, compiledTraces } = evaluate(
      "rows.filter(row => row.id > 1).length",
      { compileScripts: true, compileBindings: false },
      { rows: ROWS },
    );

    expect(value).toBe(1);
    expect(compiledTraces).toBe(0);
  });
});
