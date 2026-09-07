import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { extractParam } from "../../../src/components-core/utils/extractParam";
import { mergeXmluiConfig } from "../../../src/components-core/AppContext";
import {
  applyBuildScriptCompilationSettings,
  readBuildScriptCompilationSettings,
} from "../../../src/components-core/script-compiler/build-settings";
import { clearCompiledScriptDebugSourceTraceForTests } from "../../../src/components-core/script-compiler/debug-source-trace";

/**
 * Regression guard for #3892.
 *
 * Binding expressions — every `var.` initializer and every attribute binding — are the
 * only script kind with no build-time artifact: prop values are parsed lazily in the
 * browser, so each binding compiles on its first evaluation. That makes the *runtime*
 * switch the whole story for bindings, and the runtime only ever read it from the app
 * description. An app that set `compileScripts` in `xmlui.config.json` — the documented
 * place for it — got its handlers and declarations compiled at build time and then
 * every binding, i.e. the entire reactive hot path, silently interpreted.
 *
 * The observable signal is the compiled executor's `kind:"debug-source"` Inspector
 * trace: only the compiled path emits it. Counting artifacts in a bundle cannot tell
 * you anything about bindings, which is exactly why the gap went unnoticed.
 */
type TraceEntry = { kind?: string };

function compiledTraceCount(): number {
  return ((globalThis as any).window._xsLogs as TraceEntry[]).filter(
    (entry) => entry.kind === "debug-source",
  ).length;
}

/** Evaluates a `var.`-style initializer through the very path `useVars` uses. */
function evaluateVarInitializer(source: string, xmluiConfig: Record<string, any>) {
  clearCompiledScriptDebugSourceTraceForTests();
  (globalThis as any).window._xsLogs = [];
  const appContext = {
    xmluiConfig: mergeXmluiConfig(undefined, { ...xmluiConfig, xsVerbose: true }),
  } as any;
  const value = extractParam(
    {
      items: [
        { id: 1, on: true },
        { id: 2, on: false },
      ],
    } as any,
    source,
    appContext,
  );
  return { value, compiledTraces: compiledTraceCount() };
}

describe("compileScripts reaches binding evaluation", () => {
  let restoreWindow = false;

  beforeEach(() => {
    if (typeof (globalThis as any).window === "undefined") {
      (globalThis as any).window = {};
      restoreWindow = true;
    }
    (globalThis as any).window._xsLogs = [];
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    if (restoreWindow) {
      delete (globalThis as any).window;
      restoreWindow = false;
    }
  });

  describe("stated in the app description", () => {
    it("compiles a reactive variable initializer that calls a helper", () => {
      const { value, compiledTraces } = evaluateVarInitializer(
        "{items.filter(i => i.on)}",
        { compileScripts: true },
      );
      expect(value).toEqual([{ id: 1, on: true }]);
      expect(compiledTraces).toBeGreaterThan(0);
    });

    it("compiles an initializer carrying a per-element arrow callback", () => {
      const { value, compiledTraces } = evaluateVarInitializer(
        "{items.map(item => item.id)}",
        { compileScripts: true },
      );
      expect(value).toEqual([1, 2]);
      expect(compiledTraces).toBeGreaterThan(0);
    });

    it("control: stays interpreted when compilation is off", () => {
      const { value, compiledTraces } = evaluateVarInitializer("{items.map(item => item.id)}", {});
      expect(value).toEqual([1, 2]);
      expect(compiledTraces).toBe(0);
    });
  });

  describe("stated in xmlui.config.json, baked in as an app define", () => {
    it("compiles bindings even though the app description says nothing", () => {
      vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "true");
      const { value, compiledTraces } = evaluateVarInitializer("{items.map(item => item.id)}", {});
      expect(value).toEqual([1, 2]);
      expect(compiledTraces).toBeGreaterThan(0);
    });

    it("turns compilation off over an app description that asks for it", () => {
      vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "false");
      const { value, compiledTraces } = evaluateVarInitializer("{items.map(item => item.id)}", {
        compileScripts: true,
      });
      expect(value).toEqual([1, 2]);
      expect(compiledTraces).toBe(0);
    });
  });
});

describe("build-resolved script compilation settings", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reads nothing when the build stated nothing", () => {
    expect(readBuildScriptCompilationSettings()).toEqual({});
  });

  it("reads the stated flags, tri-state", () => {
    vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "true");
    expect(readBuildScriptCompilationSettings()).toEqual({ compileScripts: true });
    vi.stubEnv("VITE_XMLUI_REPORT_COMPILE_FALLBACKS", "false");
    expect(readBuildScriptCompilationSettings()).toEqual({
      compileScripts: true,
      reportCompileFallbacks: false,
    });
  });

  it("leaves a merged config untouched when the build stated nothing", () => {
    const merged = { compileScripts: true };
    expect(applyBuildScriptCompilationSettings(merged)).toBe(merged);
  });

  it("wins over the app description, in both directions", () => {
    vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "false");
    expect(applyBuildScriptCompilationSettings({ compileScripts: true })).toMatchObject({
      compileScripts: false,
    });
    vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "true");
    expect(applyBuildScriptCompilationSettings({ compileScripts: false })).toMatchObject({
      compileScripts: true,
    });
  });

  it("mergeXmluiConfig surfaces the build-resolved switch to every consumer", () => {
    vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "true");
    expect(mergeXmluiConfig(undefined, undefined)).toMatchObject({ compileScripts: true });
    expect(mergeXmluiConfig({ compileScripts: false }, undefined)).toMatchObject({
      compileScripts: true,
    });
  });
});
