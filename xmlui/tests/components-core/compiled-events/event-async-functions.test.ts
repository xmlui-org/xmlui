import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  executeCompiledEventAsyncArtifact,
  UnsupportedCompiledScriptNodeError,
} from "../../../src/components-core/script-compiler";
import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { Parser } from "../../../src/parsers/scripting/Parser";

async function runCompiled(source: string, localContext: Record<string, any> = {}) {
  const evalContext = createEvalContext({
    localContext,
    options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
  });
  const artifact = compileEventAsyncStatementSource(source, `test:event:function:${source}`);
  const returnValue = await executeCompiledEventAsyncArtifact(artifact, evalContext);
  return { evalContext, localContext, returnValue };
}

async function runInterpreted(source: string, localContext: Record<string, any> = {}) {
  const evalContext = createEvalContext({
    localContext,
    options: { defaultToOptionalMemberAccess: true },
  });
  const parser = new Parser(source);
  await processStatementQueueAsync(parser.parseStatements(), evalContext);
  return { evalContext, localContext, returnValue: evalContext.mainThread?.returnValue };
}

async function expectCompiledParity(source: string, localContext: Record<string, any> = {}) {
  const compiled = await runCompiled(source, { ...localContext });
  const interpreted = await runInterpreted(source, { ...localContext });

  expect(compiled.returnValue).toEqual(interpreted.returnValue);
  expect(compiled.localContext).toEqual(interpreted.localContext);
}

describe("compiled event-async function declarations", () => {
  it("hoists function declarations before their source position", async () => {
    await expectCompiledParity("result = add(1, 2); function add(a, b) { return a + b; }", {
      result: 0,
    });
  });

  it("awaits async work inside declared function bodies", async () => {
    await expectCompiledParity(
      "result = addLater(2); function addLater(value) { return inc(value); }",
      {
        result: 0,
        inc: async (value: number) => value + 1,
      },
    );
  });

  it("lets declared functions read and update outer state", async () => {
    await expectCompiledParity(
      "function incBy(step) { count += step; return count; } result = incBy(2); result = incBy(result);",
      {
        count: 1,
        result: 0,
      },
    );
  });

  it("supports recursive declared functions", async () => {
    await expectCompiledParity(
      "function sumTo(n) { if (n <= 0) return 0; return n + sumTo(n - 1); } result = sumTo(4);",
      {
        result: 0,
      },
    );
  });

  it("creates statement boundaries inside declared function bodies", async () => {
    const completed: string[] = [];
    const evalContext = createEvalContext({
      localContext: { result: 0 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        completed.push("statement");
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "result = add(1, 2); function add(a, b) { let value = a + b; return value; }",
      "test:event:function-boundaries",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.result).toBe(3);
    expect(completed.length).toBeGreaterThanOrEqual(4);
  });

  it("rejects unsupported function declaration parameter patterns", () => {
    expect(() =>
      compileEventAsyncStatementSource(
        "function getX({ x }) { return x; } result = getX({ x: 1 });",
        "test:event:function-destructure",
      ),
    ).toThrow(UnsupportedCompiledScriptNodeError);
  });
});
