import { describe, expect, it } from "vitest";

import { CORPUS, type CorpusCase } from "./corpus";
import { evalBinding } from "../../../../src/components-core/script-runner/eval-tree-sync";
import { processStatementQueueAsync } from "../../../../src/components-core/script-runner/process-statement-async";
import { compileBindingSyncExpressionSource } from "../../../../src/components-core/script-compiler/targets/binding-sync";
import { compileEventAsyncStatementSource } from "../../../../src/components-core/script-compiler";
import { Parser } from "../../../../src/parsers/scripting/Parser";

/**
 * Differential execution: interpreter versus compiler, over the whole corpus.
 *
 * The interpreter is the reference implementation — XMLScript has no written semantics —
 * so where the two disagree the compiler is wrong, unless the divergence is recorded as a
 * deliberate decision.
 */
function options(compile: boolean) {
  return { defaultToOptionalMemberAccess: true, ...(compile ? { compileScripts: true } : {}) };
}

function runBinding(source: string, context: Record<string, any>, compile: boolean) {
  return evalBinding(new Parser(source).parseExpr()!, {
    localContext: { ...context },
    appContext: { xmluiConfig: {} },
    options: options(compile),
  } as any);
}

async function runStatements(source: string, context: Record<string, any>, compile: boolean) {
  const evalContext: any = {
    localContext: { ...context },
    appContext: { xmluiConfig: {} },
    options: options(compile),
  };
  await processStatementQueueAsync(new Parser(source).parseStatements(), evalContext);
  return { value: evalContext.mainThread?.returnValue, context: evalContext.localContext };
}

/** Compiles the case the way its target would, so a refusal surfaces here. */
function compileCase(entry: CorpusCase) {
  return entry.kind === "binding"
    ? compileBindingSyncExpressionSource(entry.source, `corpus:${entry.name}`)
    : compileEventAsyncStatementSource(entry.source, `corpus:${entry.name}`);
}

const COMPILABLE = CORPUS.filter((entry) => !entry.knownFallback && !entry.expectThrows);
const KNOWN_FALLBACKS = CORPUS.filter((entry) => entry.knownFallback);
const BOUNDARIES = CORPUS.filter((entry) => entry.expectThrows);

describe("conformance: compiled and interpreted agree", () => {
  it.each(COMPILABLE.map((entry) => [entry.name, entry] as const))("%s", async (_name, entry) => {
    const context = entry.context ?? {};
    if (entry.kind === "binding") {
      const interpreted = runBinding(entry.source, context, false);
      const compiled = runBinding(entry.source, context, true);
      expect(compiled).toEqual(interpreted);
      expect(compiled).toEqual(entry.expected);
      return;
    }
    const interpreted = await runStatements(entry.source, context, false);
    const compiled = await runStatements(entry.source, context, true);
    expect(compiled.value).toEqual(interpreted.value);
    expect(compiled.value).toEqual(entry.expected);
    // --- Not only the result: a handler's effect on its own scope must match too.
    expect(compiled.context).toEqual(interpreted.context);
  });
});

describe("conformance: constructs both paths reject", () => {
  it.each(BOUNDARIES.map((entry) => [entry.name, entry] as const))("%s", async (_name, entry) => {
    const context = entry.context ?? {};
    if (entry.kind === "binding") {
      expect(() => runBinding(entry.source, context, false)).toThrow();
      expect(() => runBinding(entry.source, context, true)).toThrow();
      return;
    }
    await expect(runStatements(entry.source, context, false)).rejects.toThrow();
    await expect(runStatements(entry.source, context, true)).rejects.toThrow();
  });
});

/**
 * The gaps, pinned. Each case asserts the compiler still refuses *and* that the
 * interpreter still produces a value, so the construct is known-good XMLScript that
 * merely does not compile yet. When a gap closes, the first assertion fails — which is
 * the reminder to move the case up to the parity block above.
 */
describe("conformance: known gaps still refuse to compile", () => {
  it.each(KNOWN_FALLBACKS.map((entry) => [entry.name, entry] as const))(
    "%s",
    async (_name, entry) => {
      expect(() => compileCase(entry)).toThrow(
        new RegExp(entry.knownFallback!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      );
      const context = entry.context ?? {};
      if (entry.kind === "binding") {
        expect(() => runBinding(entry.source, context, false)).not.toThrow();
      } else {
        await expect(runStatements(entry.source, context, false)).resolves.toBeDefined();
      }
    },
  );

  it("reports the current gap inventory", () => {
    // --- Not an assertion so much as a published number: Phase 3 closes these, and this
    // --- is where the count comes from.
    // --- Empty. Every construct the corpus covers either compiles or is refused by both
    // --- paths alike. The last entry, `async` in callback position, was resolved as a
    // --- language boundary rather than a compiler gap: it is now refused everywhere
    // --- instead of running with the keyword ignored in one position only.
    expect(KNOWN_FALLBACKS.map((entry) => entry.name)).toEqual([]);
  });
});
