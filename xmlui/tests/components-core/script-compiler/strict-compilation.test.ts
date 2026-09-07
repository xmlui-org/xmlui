import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getStrictCompilationMode,
  isStrictCompilationEnabled,
  resetStrictCompilationForTests,
  setStrictCompilationEnabled,
  setStrictCompilationMode,
  StrictCompilationViolationError,
} from "../../../src/components-core/script-compiler/strict-compilation";
import {
  applyStrictCompilationSetting,
  resolveStrictCompilationMode,
  shouldEnforceStrictCompilation,
} from "../../../src/components-core/script-runner/eval-options";
import { evalBinding } from "../../../src/components-core/script-runner/eval-tree-sync";
import { processStatementQueue } from "../../../src/components-core/script-runner/process-statement-sync";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { Parser } from "../../../src/parsers/scripting/Parser";

/**
 * Phase 2.1 of `.plan/strict-compilation-mode.md`.
 *
 * The guard's whole value is that it does not ask *why* the interpreter was reached. Each
 * case below arrives at a door for a different reason — the switch is off, the context
 * never carried it, the construct has no compiled target — and the guard treats them
 * alike, because an app author only cares that something is not compiled.
 */
afterEach(() => {
  resetStrictCompilationForTests();
  vi.unstubAllEnvs();
});

function bindingContext(compile: boolean) {
  return {
    localContext: { xs: [1, 2] },
    appContext: { xmluiConfig: {} },
    options: { defaultToOptionalMemberAccess: true, ...(compile ? { compileScripts: true } : {}) },
  } as any;
}

describe("the guard is off until armed", () => {
  it("lets the interpreter run", () => {
    expect(isStrictCompilationEnabled()).toBe(false);
    expect(evalBinding(new Parser("xs.map(x => x)").parseExpr()!, bindingContext(false))).toEqual([
      1, 2,
    ]);
  });
});

describe("armed, every door is an error", () => {
  it("category A/B: a binding the switch never reached", () => {
    setStrictCompilationEnabled(true);
    expect(() =>
      evalBinding(new Parser("xs.map(x => x)").parseExpr()!, bindingContext(false)),
    ).toThrow(StrictCompilationViolationError);
  });

  it("category C: an evaluation context with no options at all", () => {
    // --- The case the existing diagnostics are blind to: nothing threw, nothing fell
    // --- back, the switch simply never arrived.
    setStrictCompilationEnabled(true);
    expect(() =>
      evalBinding(new Parser("xs.map(x => x)").parseExpr()!, {
        localContext: { xs: [1] },
      } as any),
    ).toThrow(StrictCompilationViolationError);
  });

  it("the synchronous statement queue, which has no compiled target", () => {
    setStrictCompilationEnabled(true);
    expect(() =>
      processStatementQueue(new Parser("let a = 1; return a;").parseStatements(), {
        localContext: {},
        options: { compileScripts: true },
      } as any),
    ).toThrow(StrictCompilationViolationError);
  });

  it("the asynchronous statement queue", async () => {
    setStrictCompilationEnabled(true);
    await expect(
      processStatementQueueAsync(new Parser("let a = 1; return a;").parseStatements(), {
        localContext: {},
        options: { compileScripts: true },
      } as any),
    ).rejects.toThrow(StrictCompilationViolationError);
  });

  it("a compiled binding still runs — the guard catches interpretation, not compilation", () => {
    setStrictCompilationEnabled(true);
    expect(evalBinding(new Parser("xs.map(x => x * 2)").parseExpr()!, bindingContext(true))).toEqual(
      [2, 4],
    );
  });
});

describe("what the violation carries", () => {
  it("names the door and quotes the source", () => {
    setStrictCompilationEnabled(true);
    try {
      evalBinding(new Parser("xs.map(x => x)").parseExpr()!, bindingContext(false));
      expect.unreachable("the guard should have fired");
    } catch (error) {
      const violation = (error as StrictCompilationViolationError).violation;
      expect(violation.door).toBe("binding");
      expect(violation.sourceText).toContain("xs.map");
      expect((error as Error).message).toContain("binding expression");
    }
  });

  it("names the arrow door when an arrow body is about to be walked", async () => {
    // --- Forced rather than provoked. An arrow body compiles through the `statement-sync`
    // --- target now, and what that target refuses the language refuses too, so no real
    // --- construct reaches this door any more. It still has to work: the next unsupported
    // --- construct should be reported as interpretation rather than crashing the app.
    const executor = await import(
      "../../../src/components-core/script-compiler/targets/binding-sync-executor"
    );
    const { UnsupportedCompiledScriptNodeError } = await import(
      "../../../src/components-core/script-compiler/errors"
    );
    const spy = vi.spyOn(executor, "executeCompiledStatementSync").mockImplementation(() => {
      throw new UnsupportedCompiledScriptNodeError("115", "forced");
    });
    setStrictCompilationEnabled(true);
    try {
      evalBinding(new Parser("({ f: (x) => x + 1 }).f(1)").parseExpr()!, bindingContext(true));
      expect.unreachable("the guard should have fired");
    } catch (error) {
      expect((error as StrictCompilationViolationError).violation.door).toBe("arrow");
    } finally {
      spy.mockRestore();
    }
  });

});

describe("resolving the setting", () => {
  it("is inert without compileScripts — nothing to be strict about", () => {
    expect(
      shouldEnforceStrictCompilation({ xmluiConfig: { strictCompilation: true } } as any),
    ).toBe(false);
  });

  it("is on when both are set", () => {
    expect(
      shouldEnforceStrictCompilation({
        xmluiConfig: { compileScripts: true, strictCompilation: true },
      } as any),
    ).toBe(true);
  });

  it("reads what xmlui.config.json baked in, and lets it win", () => {
    vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "true");
    vi.stubEnv("VITE_XMLUI_STRICT_COMPILATION", "true");
    expect(shouldEnforceStrictCompilation({ xmluiConfig: {} } as any)).toBe(true);
    vi.stubEnv("VITE_XMLUI_STRICT_COMPILATION", "false");
    expect(
      shouldEnforceStrictCompilation({
        xmluiConfig: { compileScripts: true, strictCompilation: true },
      } as any),
    ).toBe(false);
  });

  it("arms the module-level guard from a merged config", () => {
    applyStrictCompilationSetting({ compileScripts: true, strictCompilation: true });
    expect(getStrictCompilationMode()).toBe("error");
    // --- Phase 4.1 changed what "unset" means: with `compileScripts` on it now reports
    // --- rather than staying silent, so the guard is armed either way. This assertion
    // --- used to expect it disarmed.
    applyStrictCompilationSetting({ compileScripts: true });
    expect(getStrictCompilationMode()).toBe("report");
    expect(isStrictCompilationEnabled()).toBe(true);
    applyStrictCompilationSetting({ compileScripts: true, strictCompilation: false });
    expect(isStrictCompilationEnabled()).toBe(false);
  });
});

/**
 * Phase 4.1: `strictCompilation` is on by default whenever `compileScripts` is, but in
 * `"report"` mode rather than `"error"`.
 *
 * A hard-error default would break an app the moment it hit any interpretation nobody
 * predicted — and finding out what nobody predicted is the entire reason to turn this on
 * broadly. One known case proves it: an app that declares `compileScripts` only in its app
 * description gets an interpreted mock backend, so failing by default would break every
 * mock request in it.
 */
describe("the default mode", () => {
  afterEach(() => {
    resetStrictCompilationForTests();
    vi.unstubAllEnvs();
  });

  it("is off entirely without compileScripts", () => {
    expect(resolveStrictCompilationMode({ xmluiConfig: {} } as any)).toBe("off");
    expect(resolveStrictCompilationMode({ xmluiConfig: { strictCompilation: true } } as any)).toBe(
      "off",
    );
  });

  it("reports, rather than failing, when compileScripts is on and nothing is declared", () => {
    expect(resolveStrictCompilationMode({ xmluiConfig: { compileScripts: true } } as any)).toBe(
      "report",
    );
  });

  it("fails only when asked to", () => {
    expect(
      resolveStrictCompilationMode({
        xmluiConfig: { compileScripts: true, strictCompilation: true },
      } as any),
    ).toBe("error");
  });

  it("can be silenced", () => {
    expect(
      resolveStrictCompilationMode({
        xmluiConfig: { compileScripts: true, strictCompilation: false },
      } as any),
    ).toBe("off");
  });

  it("reports each distinct site once, not once per evaluation", () => {
    // --- These guards sit on per-row, per-render paths. A violation logged on every
    // --- evaluation would bury the information it exists to surface. One expression can
    // --- still produce several distinct violations — an outer binding and the arrow it
    // --- invokes are different sites — so the property is that repeating the evaluation
    // --- adds nothing, not that the count is one.
    setStrictCompilationMode("report");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const expr = new Parser("xs.map(x => x)").parseExpr()!;
      expect(evalBinding(expr, bindingContext(false))).toEqual([1, 2]);
      const afterFirst = warn.mock.calls.length;
      expect(afterFirst).toBeGreaterThan(0);
      for (let i = 0; i < 20; i++) {
        evalBinding(expr, bindingContext(false));
      }
      expect(warn.mock.calls.length).toBe(afterFirst);
      expect(warn.mock.calls.map(String).join("\n")).toContain("binding expression");
    } finally {
      warn.mockRestore();
    }
  });

  it("keeps running in report mode, and stops in error mode", () => {
    setStrictCompilationMode("report");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(evalBinding(new Parser("xs.map(x => x)").parseExpr()!, bindingContext(false))).toEqual([
        1, 2,
      ]);
    } finally {
      warn.mockRestore();
    }
    setStrictCompilationMode("error");
    expect(() =>
      evalBinding(new Parser("xs.map(x => x)").parseExpr()!, bindingContext(false)),
    ).toThrow(StrictCompilationViolationError);
  });
});
