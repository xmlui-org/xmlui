import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isStrictCompilationEnabled,
  resetStrictCompilationForTests,
  setStrictCompilationEnabled,
  StrictCompilationViolationError,
} from "../../../src/components-core/script-compiler/strict-compilation";
import {
  applyStrictCompilationSetting,
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

  it("names the arrow door when an arrow body is about to be walked", () => {
    // --- A lazy arrow: compiled binding evaluation hands the body back to the
    // --- interpreter, which is invisible to every existing diagnostic.
    setStrictCompilationEnabled(true);
    try {
      evalBinding(new Parser("({ f: (x) => x + 1 }).f(1)").parseExpr()!, bindingContext(true));
      expect.unreachable("the guard should have fired");
    } catch (error) {
      expect((error as StrictCompilationViolationError).violation.door).toBe("arrow");
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
    expect(isStrictCompilationEnabled()).toBe(true);
    applyStrictCompilationSetting({ compileScripts: true });
    expect(isStrictCompilationEnabled()).toBe(false);
  });
});
