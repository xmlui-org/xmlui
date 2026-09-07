import { afterEach, describe, expect, it, vi } from "vitest";

import {
  evaluateCondition,
  extractProgress,
} from "../../../src/components/APICall/APICallReact";
import * as scriptCompiler from "../../../src/components-core/script-compiler";

/**
 * Follow-up to #3892. `APICall`'s `progressExtractor` and polling `condition` are
 * binding expressions, but both hand-built their evaluation options as
 * `{ defaultToOptionalMemberAccess: true }` and so dropped `compileScripts` — they ran
 * interpreted whatever the app asked for, on every poll.
 *
 * The signal is a call into the compiled binding executor; the interpreted path never
 * reaches it.
 */
vi.mock("../../../src/components-core/script-compiler", async (importOriginal) => {
  const actual = await importOriginal<typeof scriptCompiler>();
  return { ...actual, evaluateCompiledBinding: vi.fn(actual.evaluateCompiledBinding) };
});

const compiledBindingCalls = () =>
  (scriptCompiler.evaluateCompiledBinding as unknown as ReturnType<typeof vi.fn>).mock.calls.length;

function executionContext(xmluiConfig: Record<string, any>) {
  return { appContext: { xmluiConfig } } as any;
}

const STATUS = { percent: 42, state: "running", items: [{ done: true }, { done: false }] };

function measure(run: () => unknown) {
  const before = compiledBindingCalls();
  const value = run();
  return { value, compiledEvaluations: compiledBindingCalls() - before };
}

describe("APICall progressExtractor honours compileScripts", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("compiles when the app asks for it", () => {
    const { value, compiledEvaluations } = measure(() =>
      extractProgress(STATUS, "{$statusData.percent}", executionContext({ compileScripts: true }), null),
    );
    expect(value).toBe(42);
    expect(compiledEvaluations).toBeGreaterThan(0);
  });

  it("compiles when only xmlui.config.json stated it, baked in as an app define", () => {
    vi.stubEnv("VITE_XMLUI_COMPILE_SCRIPTS", "true");
    const { value, compiledEvaluations } = measure(() =>
      extractProgress(STATUS, "{$statusData.percent}", executionContext({}), null),
    );
    expect(value).toBe(42);
    expect(compiledEvaluations).toBeGreaterThan(0);
  });

  it("control: stays interpreted when compilation is off", () => {
    const { value, compiledEvaluations } = measure(() =>
      extractProgress(STATUS, "{$statusData.percent}", executionContext({}), null),
    );
    expect(value).toBe(42);
    expect(compiledEvaluations).toBe(0);
  });
});

describe("APICall polling condition honours compileScripts", () => {
  it("compiles a condition carrying an array callback", () => {
    const { value, compiledEvaluations } = measure(() =>
      evaluateCondition(
        "{$statusData.items.every(i => i.done)}",
        STATUS,
        0,
        null,
        executionContext({ compileScripts: true }),
      ),
    );
    expect(value).toBe(false);
    expect(compiledEvaluations).toBeGreaterThan(0);
  });

  it("agrees with the interpreter", () => {
    const args = ["{$statusData.items.some(i => i.done)}", STATUS, 0, null] as const;
    const interpreted = measure(() => evaluateCondition(...args, executionContext({})));
    const compiled = measure(() =>
      evaluateCondition(...args, executionContext({ compileScripts: true })),
    );
    expect(interpreted.compiledEvaluations).toBe(0);
    expect(compiled.compiledEvaluations).toBeGreaterThan(0);
    expect(compiled.value).toBe(interpreted.value);
    expect(compiled.value).toBe(true);
  });
});
