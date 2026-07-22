import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";
import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { Parser } from "../../../src/parsers/scripting/Parser";

async function runCompiled(source: string, localContext: Record<string, any> = {}) {
  const completed: string[] = [];
  const evalContext = createEvalContext({
    localContext,
    options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    onStatementCompleted: () => {
      completed.push("statement");
    },
  });
  const artifact = compileEventAsyncStatementSource(source, `test:event:${source}`);
  const returnValue = await executeCompiledEventAsyncArtifact(artifact, evalContext);
  return { evalContext, localContext, completed, returnValue };
}

async function runInterpreted(source: string, localContext: Record<string, any> = {}) {
  const evalContext = createEvalContext({
    localContext,
    options: { defaultToOptionalMemberAccess: true },
  });
  const parser = new Parser(source);
  await processStatementQueueAsync(parser.parseStatements(), evalContext);
  return { evalContext, localContext };
}

describe("compiled event-async basic statement subset", () => {
  it("executes expression statements and assignments", async () => {
    const compiled = await runCompiled("count = count + 1;", { count: 2 });
    const interpreted = await runInterpreted("count = count + 1;", { count: 2 });

    expect(compiled.localContext.count).toBe(interpreted.localContext.count);
    expect(compiled.completed.length).toBe(1);
  });

  it("executes let/const declarations and return statements", async () => {
    const compiled = await runCompiled("let next = count + 1; const result = next * 2; return result;", {
      count: 2,
    });
    const interpreted = await runInterpreted(
      "let next = count + 1; const result = next * 2; return result;",
      { count: 2 },
    );

    expect(compiled.returnValue).toBe(interpreted.evalContext.mainThread?.returnValue);
    expect(compiled.returnValue).toBe(6);
    expect(compiled.completed.length).toBe(3);
  });

  it("executes if/else branches", async () => {
    const source = "if (enabled) { count = count + 10; } else { count = count - 1; }";
    const compiled = await runCompiled(source, { enabled: true, count: 2 });
    const interpreted = await runInterpreted(source, { enabled: true, count: 2 });

    expect(compiled.localContext.count).toBe(interpreted.localContext.count);
    expect(compiled.localContext.count).toBe(12);
  });

  it("awaits async function calls without explicit await syntax", async () => {
    const localContext = {
      count: 1,
      inc: async (value: number) => value + 1,
    };

    const compiled = await runCompiled("count = inc(count);", { ...localContext });

    expect(compiled.localContext.count).toBe(2);
  });

  it("yields between completed statements", async () => {
    const order: string[] = [];
    const evalContext = createEvalContext({
      localContext: { count: 0 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        order.push("completed");
        setTimeout(() => order.push("timer"), 0);
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "count = count + 1; count = count + 1;",
      "test:event:yield",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.count).toBe(2);
    expect(order).toEqual(["completed", "timer", "completed", "timer"]);
  });
});
