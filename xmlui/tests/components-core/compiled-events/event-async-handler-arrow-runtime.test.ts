import { describe, expect, it, vi } from "vitest";

/**
 * Runtime proof that arrow-function event handlers are genuinely compiled.
 *
 * Inspecting the generated JavaScript shows what the compiler *emitted*; this file asserts
 * what actually *runs*. `executeArrowExpression` is the tree-walking interpreter's arrow
 * executor, and it is the only way a `runtime.arrow` payload can be evaluated. A handler
 * that is truly compiled must therefore never reach it.
 *
 * The spy wraps the real implementation rather than replacing it, so the interpreted
 * fallback below still executes normally — which is what makes the "never called" assertion
 * meaningful instead of vacuous.
 */
vi.mock("../../../src/components-core/script-runner/eval-tree-async", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("../../../src/components-core/script-runner/eval-tree-async")
  >();
  return { ...actual, executeArrowExpression: vi.fn(actual.executeArrowExpression) };
});

import {
  compileEventAsyncStatements,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";
import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { executeArrowExpression } from "../../../src/components-core/script-runner/eval-tree-async";
import {
  parseHandlerCode,
  prepareHandlerStatements,
} from "../../../src/components-core/utils/statementUtils";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { UnsupportedCompiledScriptNodeError } from "../../../src/components-core/script-compiler";

const interpreterEntries = executeArrowExpression as unknown as ReturnType<typeof vi.fn>;

/**
 * Runs a handler the way `container/event-handlers.ts` does: compiled when the target
 * supports the source, interpreted when compilation reports an unsupported node.
 * Returns how many times the tree-walking arrow executor was entered.
 */
async function runCompiledHandler(source: string, localContext: Record<string, any>) {
  interpreterEntries.mockClear();
  const evalContext = createEvalContext({
    localContext,
    eventArgs: [],
    options: { compileScripts: true, defaultToOptionalMemberAccess: true },
  });
  const statements = prepareHandlerStatements(parseHandlerCode(source));
  try {
    const artifact = compileEventAsyncStatements(statements, {
      sourceId: `test:runtime-proof:${source}`,
    });
    await executeCompiledEventAsyncArtifact(artifact, evalContext);
  } catch (error) {
    if (!(error instanceof UnsupportedCompiledScriptNodeError)) {
      throw error;
    }
    await processStatementQueueAsync(statements, evalContext);
  }
  return interpreterEntries.mock.calls.length;
}

/** The handler shape reported against v0.14.24. */
const LIFECYCLE_ON_MOUNT = `() => {
  if ($props.scrollToCaseId != null && rows.some(item => item.id === $props.scrollToCaseId)) {
    casesTable.scrollToId($props.scrollToCaseId);
    emitEvent('scrolledToCase', $props.scrollToCaseId);
  }
}`;

describe("arrow event handlers execute as compiled code, not interpreted AST", () => {
  it("runs the reported onMount handler without entering the interpreter", async () => {
    const calls: any[] = [];
    const entries = await runCompiledHandler(LIFECYCLE_ON_MOUNT, {
      $props: { scrollToCaseId: 7 },
      rows: [{ id: 3 }, { id: 7 }],
      casesTable: { scrollToId: (id: number) => calls.push(["scroll", id]) },
      emitEvent: (name: string, payload: any) => calls.push([name, payload]),
    });

    // --- The handler did its work, including the nested `rows.some(...)` callback...
    expect(calls).toEqual([
      ["scroll", 7],
      ["scrolledToCase", 7],
    ]);
    // --- ...without the tree-walking interpreter running any part of it.
    expect(entries).toBe(0);
  });

  it("runs a parameterised handler without entering the interpreter", async () => {
    const opened: any[] = [];
    const entries = await runCompiledHandler("() => caseMenu.openAt($item)", {
      caseMenu: { openAt: (item: any) => opened.push(item) },
      $item: { id: 12 },
    });

    expect(opened).toEqual([{ id: 12 }]);
    expect(entries).toBe(0);
  });

  it("control: an arrow inside a data literal still runs through the interpreter", async () => {
    // --- Callback arguments and arrow-valued declarations are compiled natively, but an
    // --- arrow stored inside an object literal keeps the lazy representation, so calling
    // --- it enters the tree-walking executor. This proves the spy genuinely detects
    // --- interpreted execution, making `toBe(0)` above a real signal rather than a spy
    // --- that was never wired up.
    const seen: any[] = [];
    const entries = await runCompiledHandler(
      "() => { const ops = { double: item => item * 2 }; collect(ops.double(21)); }",
      { collect: (...args: any[]) => seen.push(args) },
    );

    expect(seen).toEqual([[42]]);
    expect(entries).toBeGreaterThan(0);
  });
});
