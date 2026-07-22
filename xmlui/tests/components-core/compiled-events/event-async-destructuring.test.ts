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
  const artifact = compileEventAsyncStatementSource(source, `test:event:destructure:${source}`);
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

describe("compiled event-async destructuring declarations", () => {
  it("executes array destructuring declarations", async () => {
    await expectCompiledParity("let [first, second] = items; result = first + second;", {
      items: [2, 3],
      result: 0,
    });
  });

  it("executes object destructuring declarations with aliases", async () => {
    await expectCompiledParity("const { x, y: alias } = point; result = x * alias;", {
      point: { x: 4, y: 5 },
      result: 0,
    });
  });

  it("executes nested array and object destructuring declarations", async () => {
    await expectCompiledParity("let { a: [first, { b }] } = source; result = first + b;", {
      source: { a: [7, { b: 8 }] },
      result: 0,
    });
  });

  it("treats destructured names as locals", async () => {
    const localContext = { x: 100, point: { x: 3 }, result: 0 };

    await expectCompiledParity("let { x } = point; result = x;", localContext);

    expect(localContext.x).toBe(100);
  });

  it("completes async declaration initializers before destructuring", async () => {
    await expectCompiledParity("let { value } = getValue(); result = value;", {
      getValue: async () => ({ value: 42 }),
      result: 0,
    });
  });

  it("keeps object destructuring optional for missing nested values", async () => {
    await expectCompiledParity(
      "let { missing: { value } } = source; result = value == undefined;",
      {
        source: {},
        result: false,
      },
    );
  });

  it("keeps array destructuring optional for nullish sources", async () => {
    await expectCompiledParity(
      "let [first, [second]] = source; result = first == undefined && second == undefined;",
      {
        source: null,
        result: false,
      },
    );
  });
});
