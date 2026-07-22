import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  compileEventAsyncStatements,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";
import { createCoWStateProxy } from "../../../src/components-core/container/cow-state-proxy";
import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import {
  T_ARROW_EXPRESSION_STATEMENT,
  type ArrowExpression,
  type ArrowExpressionStatement,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { collectCodeBehindFromSourceWithImports } from "../../../src/parsers/scripting/code-behind-collect";
import { Parser } from "../../../src/parsers/scripting/Parser";

async function runCompiled(source: string, localContext: Record<string, any> = {}) {
  const evalContext = createEvalContext({
    localContext,
    options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
  });
  const artifact = compileEventAsyncStatementSource(source, `test:event:arrow:${source}`);
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

describe("compiled event-async arrow and callback calls", () => {
  it("executes ArrowExpressionStatement sources with event arguments", async () => {
    const expr = new Parser("(item) => item.toUpperCase()").parseExpr() as ArrowExpression;
    const statement: ArrowExpressionStatement = {
      type: T_ARROW_EXPRESSION_STATEMENT,
      nodeId: expr.nodeId,
      expr,
    };
    const evalContext = createEvalContext({
      localContext: {},
      eventArgs: ["alpha"],
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    });
    const artifact = compileEventAsyncStatements([statement], {
      sourceId: "test:event:arrow-expression-statement",
    });

    const returnValue = await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(returnValue).toBe("ALPHA");
  });

  it("calls local arrow declarations", async () => {
    await expectCompiledParity("const add = (a, b) => a + b; result = add(2, 3);", {
      result: 0,
    });
  });

  it("lets local arrow declarations capture compiled locals", async () => {
    await expectCompiledParity(
      "let base = 10; const addBase = (value) => value + base; result = addBase(5);",
      {
        result: 0,
      },
    );
  });

  it("executes direct inline arrow invocations with compiled local captures", async () => {
    await expectCompiledParity(
      "let base = 4; result = ((value) => value * base)(3);",
      {
        result: 0,
      },
    );
  });

  it("supports destructured local arrow parameters", async () => {
    await expectCompiledParity(
      "const pick = ({ a, q: [b, , c] }) => a + b + c; result = pick({ a: 3, q: [6, -1, 8] });",
      {
        result: 0,
      },
    );
  });

  it("supports array destructured local arrow parameters", async () => {
    await expectCompiledParity(
      "const pick = ([a, { b, c }]) => a + b + c; result = pick([3, { b: 6, c: 8 }]);",
      {
        result: 0,
      },
    );
  });

  it("supports rest parameters in local arrows", async () => {
    await expectCompiledParity(
      "const sum = (head, ...tail) => head + tail[0] + tail[1]; result = sum(1, 2, 3);",
      {
        result: 0,
      },
    );
  });

  it("calls code-behind style lazy arrows from localContext", async () => {
    const codeBehind = await collectCodeBehindFromSourceWithImports(
      "/Main.xmlui.xs",
      "function add(a, b) { return a + b; }",
      async () => "",
    );

    await expectCompiledParity("result = add(2, 3);", {
      add: codeBehind.functions.add,
      result: 0,
    });
  });

  it("calls imported code-behind functions and aliases", async () => {
    const modules: Record<string, string> = {
      "/math.xs": "export function inc(value) { return value + 1; }",
    };
    const codeBehind = await collectCodeBehindFromSourceWithImports(
      "/Main.xmlui.xs",
      "import { inc as addOne } from '/math.xs'; function use(value) { return addOne(value); }",
      async (path) => modules[path] ?? "",
    );

    await expectCompiledParity("result = use(4); aliasResult = addOne(9);", {
      addOne: codeBehind.functions.addOne,
      use: codeBehind.functions.use,
      result: 0,
      aliasResult: 0,
    });
  });

  it("passes inline arrows to async array map callbacks", async () => {
    await expectCompiledParity("result = items.map((item) => item * 2);", {
      items: [1, 2, 3],
      result: [],
    });
  });

  it("initializes a main thread for deferred host callbacks", async () => {
    let callback: ((event: { payload: string }) => Promise<void>) | undefined;
    const cancelToken = {
      aborted: false,
      throwIfAborted() {
        if (this.aborted) {
          throw new Error("cancelled");
        }
      },
    };
    const state = {
      $cancel: cancelToken,
      value: "none",
      subscribe: (handler: (event: { payload: string }) => Promise<void>) => {
        callback = handler;
      },
    };
    let changes: any[] = [];
    const createLocalContext = () =>
      createCoWStateProxy({ ...state }, (changeInfo) => {
        changes.push(changeInfo);
      });
    const evalContext = {
      localContext: createLocalContext(),
      onStatementCompleted: () => {
        for (const change of changes) {
          state[change.pathArray[0] as keyof typeof state] = change.newValue;
        }
        changes = [];
        evalContext.localContext = createLocalContext();
      },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    } as any;
    const artifact = compileEventAsyncStatementSource(
      "subscribe((event) => { value = event.payload; });",
      "test:event:deferred-host-callback",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);
    cancelToken.aborted = true;
    await callback?.({ payload: "hammer" });

    expect(state.value).toBe("hammer");
  });

  it("passes implicit context to component API member calls", async () => {
    const calls: any[] = [];
    const localContext = {
      api: {
        _SUPPORT_IMPLICIT_CONTEXT: true,
        execute: async (executionContext: any, body: any) => {
          calls.push({ executionContext, body });
        },
      },
    };
    const evalContext = {
      localContext,
      implicitContextGetter: (hostObject: any) => ({
        hostObject,
        appContext: { marker: "ctx" },
      }),
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    } as any;
    const artifact = compileEventAsyncStatementSource(
      "api.execute({ name: 'John' });",
      "test:event:implicit-context-member-call",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(calls).toEqual([
      {
        executionContext: {
          hostObject: localContext.api,
          appContext: { marker: "ctx" },
        },
        body: { name: "John" },
      },
    ]);
  });

  it("passes implicit context to bare component API function references", async () => {
    const calls: any[] = [];
    const localContext = {
      api: {
        _SUPPORT_IMPLICIT_CONTEXT: true,
        execute: async (executionContext: any, body: any, options: any) => {
          calls.push({ executionContext, body, options });
        },
      },
    };
    const evalContext = {
      localContext,
      eventArgs: [{ name: "John" }, { passAsDefaultBody: true }],
      implicitContextGetter: (hostObject: any) => ({
        hostObject,
        appContext: { marker: "ctx" },
      }),
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    } as any;
    const artifact = compileEventAsyncStatementSource(
      "api.execute",
      "test:event:implicit-context-function-reference",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(calls).toEqual([
      {
        executionContext: {
          hostObject: localContext.api,
          appContext: { marker: "ctx" },
        },
        body: { name: "John" },
        options: { passAsDefaultBody: true },
      },
    ]);
  });

  it("awaits async work from inline arrow callbacks", async () => {
    await expectCompiledParity("result = items.filter((item) => isEven(item));", {
      items: [1, 2, 3, 4],
      isEven: async (value: number) => value % 2 === 0,
      result: [],
    });
  });

  it("lets inline callbacks update outer compiled locals", async () => {
    await expectCompiledParity(
      "let sum = 0; items.forEach((item) => { sum += item; }); result = sum;",
      {
        items: [1, 2, 3],
        result: 0,
      },
    );
  });

  it("supports async array predicate result helpers", async () => {
    await expectCompiledParity(
      "first = items.find((item) => item > 2); index = items.findIndex((item) => item > 2); hasAny = items.some((item) => item > 3); allPositive = items.every((item) => item > 0);",
      {
        items: [1, 2, 3, 4],
        first: 0,
        index: -1,
        hasAny: false,
        allPositive: false,
      },
    );
  });

  it("supports flatMap with inline callbacks", async () => {
    await expectCompiledParity("result = items.flatMap((item) => [item, item * 10]);", {
      items: [1, 2],
      result: [],
    });
  });
});
