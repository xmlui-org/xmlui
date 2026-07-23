import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";
import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { Parser } from "../../../src/parsers/scripting/Parser";

async function runCompiled(source: string, localContext: Record<string, any> = {}) {
  const evalContext = createEvalContext({
    localContext,
    options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
  });
  const artifact = compileEventAsyncStatementSource(source, `test:event:var:${source}`);
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

describe("compiled event-async var statements", () => {
  it("keeps top-level var statements as no-ops", async () => {
    const completed: string[] = [];
    const evalContext = createEvalContext({
      localContext: { result: 0 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        completed.push("statement");
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "var x = 3; result = 1;",
      "test:event:var-boundary",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.result).toBe(1);
    expect(completed).toEqual([]);
  });

  it("matches interpreter behavior for top-level var statements", async () => {
    await expectCompiledParity("var x = 3; result = 1;", { result: 0 });
  });

  it("does not reject var statements inside uncalled functions", async () => {
    await expectCompiledParity("function later() { var x = 1; } result = 2;", { result: 0 });
  });

  it("rejects var statements when a function body executes", async () => {
    const source = "function fail() { var x = 1; } fail();";

    await expect(runCompiled(source)).rejects.toThrow(
      "'var' declarations are not allowed within functions",
    );
    await expect(runInterpreted(source)).rejects.toThrow(
      "'var' declarations are not allowed within functions",
    );
  });

  it("does not emit statement completion hooks for rejected var statements inside functions", async () => {
    const completed: string[] = [];
    const evalContext = createEvalContext({
      localContext: {},
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        completed.push("statement");
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "function fail() { var x = 1; } fail();",
      "test:event:var-function-boundary",
    );

    await expect(executeCompiledEventAsyncArtifact(artifact, evalContext)).rejects.toThrow(
      "'var' declarations are not allowed within functions",
    );
    expect(completed).toEqual([]);
  });
});
