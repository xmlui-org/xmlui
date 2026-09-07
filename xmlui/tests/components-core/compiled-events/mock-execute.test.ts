import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatements,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import {
  parseHandlerCode,
  prepareHandlerStatements,
} from "../../../src/components-core/utils/statementUtils";

/**
 * Phase 3.5 of `.plan/strict-compilation-mode.md`.
 *
 * `mockExecute` was the one event excluded from compilation, with no reason recorded in
 * the commit that added it, its plan notes, or a comment. It is the one handler whose
 * *return value* is load-bearing — it replaces an API response outright — and the original
 * compilation experiment predated the normalisation that copies a compiled handler's
 * result onto `mainThread.returnValue`. These pin that both paths now agree, across the
 * shapes a real `mockExecute` takes.
 */
function evalContext(localContext: Record<string, any>) {
  return {
    localContext: { ...localContext },
    eventArgs: [],
    appContext: { xmluiConfig: {} },
    options: { defaultToOptionalMemberAccess: true, compileScripts: true },
  } as any;
}

async function interpreted(source: string, localContext: Record<string, any>) {
  const context = evalContext(localContext);
  const statements = prepareHandlerStatements(parseHandlerCode(source), context);
  await processStatementQueueAsync(statements, context);
  const blocks = context.mainThread?.blocks;
  return context.mainThread?.returnValue ?? blocks?.[blocks.length - 1]?.returnValue;
}

async function compiled(source: string, localContext: Record<string, any>) {
  const context = evalContext(localContext);
  const statements = prepareHandlerStatements(parseHandlerCode(source), context);
  const artifact = compileEventAsyncStatements(statements, { sourceId: `mock:${source}` });
  return executeCompiledEventAsyncArtifact(artifact, context);
}

describe("a compiled mockExecute returns what the interpreted one does", () => {
  it.each([
    ["a literal response", "return { ok: true };", {}, { ok: true }],
    [
      "the injected request context",
      "return { q: $queryParams.page, b: $requestBody.name, h: $requestHeaders.a, c: $cookies.s };",
      { $queryParams: { page: 2 }, $requestBody: { name: "ada" }, $requestHeaders: { a: 1 }, $cookies: { s: "x" } },
      { q: 2, b: "ada", h: 1, c: "x" },
    ],
    [
      "a branch on a request value",
      "if ($queryParams.page > 1) { return 'next'; } return 'first';",
      { $queryParams: { page: 3 } },
      "next",
    ],
    ["the arrow form", "() => ({ ok: $requestBody.n })", { $requestBody: { n: 7 } }, { ok: 7 }],
    [
      "the arrow form with a block body",
      "() => { if ($queryParams.page > 1) { return 'next'; } return 'first'; }",
      { $queryParams: { page: 3 } },
      "next",
    ],
    [
      "an awaited delegate",
      "const r = fetchIt(); return r;",
      { fetchIt: () => Promise.resolve({ v: 1 }) },
      { v: 1 },
    ],
  ])("%s", async (_name, source, localContext, expected) => {
    await expect(compiled(source as string, localContext as any)).resolves.toEqual(expected);
    await expect(interpreted(source as string, localContext as any)).resolves.toEqual(expected);
  });
});

describe("the exclusion is gone", () => {
  it("no longer names mockExecute in the dispatch decision", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const source = readFileSync(
      join(__dirname, "..", "..", "..", "src", "components-core", "container", "event-handlers.ts"),
      "utf-8",
    );
    // --- The dispatch gate must not special-case an event name again without a reason
    // --- next to it. The word survives only in the comment explaining why it left.
    expect(source).not.toContain('effectiveOptions?.eventName !== "mockExecute"');
    expect(source).not.toContain("ignoredMockExecute");
  });
});
