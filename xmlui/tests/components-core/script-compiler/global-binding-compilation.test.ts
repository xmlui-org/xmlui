import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createStandaloneBindingEvalOptions,
  extractGlobals,
} from "../../../src/components-core/StandaloneApp";
import { Parser } from "../../../src/parsers/scripting/Parser";
import * as scriptCompiler from "../../../src/components-core/script-compiler";

// --- `extractGlobals` builds its evaluation context without an appContext, so the
// --- `xsVerbose` Inspector trace other binding tests key off cannot fire here. Spy on
// --- the compiled executor itself instead — it is the same signal, one step earlier.
vi.mock("../../../src/components-core/script-compiler", async (importOriginal) => {
  const actual = await importOriginal<typeof scriptCompiler>();
  return { ...actual, evaluateCompiledBinding: vi.fn(actual.evaluateCompiledBinding) };
});

const compiledBindingCalls = () =>
  (scriptCompiler.evaluateCompiledBinding as unknown as ReturnType<typeof vi.fn>).mock.calls.length;

/**
 * Follow-up to #3892, one layer down.
 *
 * `Globals.xs` variable initializers are binding expressions, but the standalone
 * runtime evaluated them through a hand-built evaluation context that carried no
 * options at all — so they ran interpreted whatever `compileScripts` said. Unlike a
 * component's `var.`, nothing downstream re-derives the switch for these, which is why
 * the gap outlived the main fix.
 *
 * The observable signal is a call into the compiled binding executor; the interpreted
 * path never reaches it.
 *
 * Global *functions* are deliberately not covered here: code-behind collects them as
 * arrow expressions, and `evalBinding` routes arrows to the interpreter by design — a
 * compiled global function comes from its build-time `#function-` artifact instead.
 */
function parsedVar(source: string) {
  return { __PARSED__: true, tree: new Parser(source).parseExpr()! };
}

function evaluateGlobals(vars: Record<string, string>, config: Record<string, any>) {
  const before = compiledBindingCalls();
  const prebuilt = Object.fromEntries(
    Object.entries(vars).map(([name, source]) => [name, parsedVar(source)]),
  );
  const values = extractGlobals(prebuilt, createStandaloneBindingEvalOptions(config as any));
  return { values, compiledEvaluations: compiledBindingCalls() - before };
}

const ROWS = "[{ id: 1, on: true }, { id: 2, on: false }]";

describe("Globals.xs variable initializers honour compileScripts", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("compiles an initializer when the app description asks for it", () => {
    const { values, compiledEvaluations } = evaluateGlobals(
      { rows: ROWS },
      { xmluiConfig: { compileScripts: true } },
    );
    expect(values.rows).toEqual([
      { id: 1, on: true },
      { id: 2, on: false },
    ]);
    expect(compiledEvaluations).toBeGreaterThan(0);
  });

  it("reads the switch from appGlobals too", () => {
    const { compiledEvaluations } = evaluateGlobals(
      { rows: ROWS },
      { appGlobals: { compileScripts: true } },
    );
    expect(compiledEvaluations).toBeGreaterThan(0);
  });

  it("compiles when only xmlui.config.json stated it, baked in as an app define", () => {
    vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "true");
    const { compiledEvaluations } = evaluateGlobals({ rows: ROWS }, {});
    expect(compiledEvaluations).toBeGreaterThan(0);
  });

  it("control: stays interpreted when compilation is off", () => {
    const { values, compiledEvaluations } = evaluateGlobals({ rows: ROWS }, {});
    expect(values.rows).toHaveLength(2);
    expect(compiledEvaluations).toBe(0);
  });

  it("agrees with the interpreter, dependency chains and array callbacks included", () => {
    const vars = {
      rows: ROWS,
      picked: "rows.filter(r => r.on)",
      ids: "picked.map(r => r.id)",
      total: "rows.reduce((sum, r) => sum + r.id, 0)",
      sorted: "[3, 1, 2].sort((a, b) => a - b)",
    };
    const interpreted = evaluateGlobals(vars, {});
    const compiled = evaluateGlobals(vars, { xmluiConfig: { compileScripts: true } });

    expect(compiled.compiledEvaluations).toBeGreaterThan(0);
    expect(interpreted.compiledEvaluations).toBe(0);
    for (const name of ["rows", "picked", "ids", "total", "sorted"]) {
      expect(compiled.values[name]).toEqual(interpreted.values[name]);
    }
    // --- Pin the values themselves, so a shared no-op cannot pass as agreement.
    expect(compiled.values.ids).toEqual([1]);
    expect(compiled.values.total).toBe(3);
    expect(compiled.values.sorted).toEqual([1, 2, 3]);
  });
});

describe("createStandaloneBindingEvalOptions", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("omits the switch when nothing asks for it", () => {
    expect(createStandaloneBindingEvalOptions(undefined)).not.toHaveProperty("compileScripts");
    expect(createStandaloneBindingEvalOptions({} as any)).not.toHaveProperty("compileScripts");
  });

  it("lets xmluiConfig win over appGlobals", () => {
    expect(
      createStandaloneBindingEvalOptions({
        appGlobals: { compileScripts: true },
        xmluiConfig: { compileScripts: false },
      } as any),
    ).not.toHaveProperty("compileScripts");
  });

  it("lets the build-resolved setting win over both", () => {
    vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "true");
    expect(
      createStandaloneBindingEvalOptions({ xmluiConfig: { compileScripts: false } } as any),
    ).toMatchObject({ compileScripts: true });
  });
});
