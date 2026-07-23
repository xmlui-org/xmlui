import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  eventAsyncRuntime,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";
import { createCancellationToken, HandlerCancelledError } from "../../../src/components-core/concurrency";
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
    expect(compiled.evalContext.mainThread?.blocks?.[0].returnValue).toBe(
      interpreted.evalContext.mainThread?.blocks?.[0].returnValue,
    );
    expect(compiled.completed.length).toBe(0);
  });

  it("stores the value of expression statements in the active block return slot", async () => {
    const compiled = await runCompiled("value * 2;", { value: 21 });
    const interpreted = await runInterpreted("value * 2;", { value: 21 });

    expect(compiled.evalContext.mainThread?.blocks?.[0].returnValue).toBe(42);
    expect(compiled.evalContext.mainThread?.blocks?.[0].returnValue).toBe(
      interpreted.evalContext.mainThread?.blocks?.[0].returnValue,
    );
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
    expect(compiled.completed.length).toBe(0);
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

  it("calls bare event handler references with event arguments", async () => {
    const evalContext = createEvalContext({
      localContext: {
        selected: null,
        selectItem: async function (this: any, item: string) {
          this.selected = item.toUpperCase();
        },
      },
      eventArgs: ["alpha"],
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    });
    const artifact = compileEventAsyncStatementSource("selectItem", "test:event:bare");

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.selected).toBe("ALPHA");
  });

  it("does not force statement completion hooks between simple expression statements", async () => {
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
      "test:event:simple-no-yield",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.count).toBe(2);
    expect(order).toEqual([]);

    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(order).toEqual([]);
  });

  it("uses the shared runtime yield check for call expression statements", async () => {
    const originalNow = eventAsyncRuntime.now;
    const originalYield = eventAsyncRuntime.yield;
    let now = 0;
    let yieldCount = 0;

    eventAsyncRuntime.now = () => (now += 101);
    eventAsyncRuntime.yield = async () => {
      yieldCount++;
    };

    try {
      const evalContext = createEvalContext({
        localContext: { getValue: () => undefined },
        options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      });
      const artifact = compileEventAsyncStatementSource(
        "getValue(); getValue();",
        "test:event:call-yield-check",
      );

      await executeCompiledEventAsyncArtifact(artifact, evalContext);

      expect(yieldCount).toBe(2);
    } finally {
      eventAsyncRuntime.now = originalNow;
      eventAsyncRuntime.yield = originalYield;
    }
  });

  it("suppresses compiled event-loop yields in sync execution mode", async () => {
    const originalNow = eventAsyncRuntime.now;
    const originalYield = eventAsyncRuntime.yield;
    let now = 0;
    let yieldCount = 0;

    eventAsyncRuntime.now = () => now;
    eventAsyncRuntime.yield = async () => {
      yieldCount++;
    };

    try {
      const evalContext = createEvalContext({
        localContext: { getValue: () => undefined },
        options: {
          compileEventHandlers: true,
          defaultToOptionalMemberAccess: true,
          handlerExecutionMode: "sync",
        },
        onStatementCompleted: () => {
          now += 101;
        },
      });
      const artifact = compileEventAsyncStatementSource(
        "getValue(); getValue();",
        "test:event:sync-yield-suppressed",
      );

      await executeCompiledEventAsyncArtifact(artifact, evalContext);

      expect(yieldCount).toBe(0);
    } finally {
      eventAsyncRuntime.now = originalNow;
      eventAsyncRuntime.yield = originalYield;
    }
  });

  it("checks long native loops every 1000 iterations and yields only when due", async () => {
    const originalNow = eventAsyncRuntime.now;
    const originalYield = eventAsyncRuntime.yield;
    let now = 0;
    let yieldCount = 0;

    eventAsyncRuntime.now = () => (now += 101);
    eventAsyncRuntime.yield = async () => {
      yieldCount++;
    };

    try {
      const evalContext = createEvalContext({
        localContext: {},
        options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      });
      const artifact = compileEventAsyncStatementSource(
        "let sum = 0; for (let i = 0; i < 3000; i++) { sum += i; } return sum;",
        "test:event:native-loop-checkpoint",
      );

      const returnValue = await executeCompiledEventAsyncArtifact(artifact, evalContext);

      expect(returnValue).toBe(4498500);
      expect(yieldCount).toBe(3);
    } finally {
      eventAsyncRuntime.now = originalNow;
      eventAsyncRuntime.yield = originalYield;
    }
  });

  it("does not create statement boundaries for simple statements", async () => {
    const boundaries: Array<Record<string, any>> = [];
    const evalContext = createEvalContext({
      localContext: { a: 0, b: 0 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementStarted: (context) => {
        boundaries.push({ phase: "start", a: context.localContext.a, b: context.localContext.b });
      },
      onStatementCompleted: (context) => {
        boundaries.push({ phase: "complete", a: context.localContext.a, b: context.localContext.b });
      },
    });
    const artifact = compileEventAsyncStatementSource("a = 1; b = 2;", "test:event:boundaries");

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(boundaries).toEqual([]);
  });

  it("lets the next statement observe the refreshed localContext snapshot", async () => {
    const evalContext = createEvalContext({
      localContext: { count: 0, observed: 0 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: (context) => {
        context.localContext = { ...context.localContext, count: 41 };
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "count = count + 1; observed = count;",
      "test:event:refreshed-local-context",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext).toMatchObject({ count: 1, observed: 1 });
  });

  it("does not call statement completion hooks when there is no state change", async () => {
    const order: string[] = [];
    const evalContext = createEvalContext({
      localContext: { value: 1 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        const index = order.length;
        order.push(`completed:${index}`);
        setTimeout(() => order.push(`timer:${index}`), 0);
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "value + 0; value + 0; value + 0;",
      "test:event:no-change-yield",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(order).toEqual([]);

    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(order).toEqual([]);
  });

  it("stops execution when $cancel aborts between statements", async () => {
    const { token, abort } = createCancellationToken();
    const evalContext = createEvalContext({
      localContext: {
        $cancel: token,
        count: 0,
        getValue: () => {
          abort("user");
          return 1;
        },
      },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    });
    const artifact = compileEventAsyncStatementSource(
      "getValue(); count = count + 1;",
      "test:event:cancel-between-statements",
    );

    await expect(executeCompiledEventAsyncArtifact(artifact, evalContext)).rejects.toThrow(
      HandlerCancelledError,
    );
    expect(evalContext.localContext.count).toBe(0);
  });

  it("flushes pending state before compiled function calls", async () => {
    let pending = false;
    let flushCount = 0;
    const localContext = new Proxy(
      {
        count: 0,
        observedFlushCount: 0,
        observe(this: any) {
          this.observedFlushCount = flushCount;
        },
      },
      {
        set(target, prop, value) {
          pending = true;
          return Reflect.set(target, prop, value);
        },
      },
    );
    const evalContext = createEvalContext({
      localContext,
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      hasPendingStateChanges: () => pending,
      onStatementCompleted: () => {
        flushCount++;
        pending = false;
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "count = 1; observe();",
      "test:event:flush-before-call",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(localContext.observedFlushCount).toBe(1);
  });
});
