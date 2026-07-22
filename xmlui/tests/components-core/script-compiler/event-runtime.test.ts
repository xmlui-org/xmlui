import { describe, expect, it } from "vitest";

import { createCancellationToken } from "../../../src/components-core/concurrency";
import { ThrowStatementError } from "../../../src/components-core/EngineError";
import { eventAsyncRuntime } from "../../../src/components-core/script-compiler";
import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { evalBindingAsync } from "../../../src/components-core/script-runner/eval-tree-async";
import { HandlerCancelledError } from "../../../src/components-core/concurrency/token";
import { parseExpression } from "../scripts-runner/test-helpers";

describe("event-async runtime helpers", () => {
  it("recursively completes promises returned from calls", async () => {
    const value = await eventAsyncRuntime.call(
      () => Promise.resolve({ item: Promise.resolve([Promise.resolve(1)]) }),
      undefined,
      [],
      createEvalContext({ options: { defaultToOptionalMemberAccess: true } }),
    );

    expect(value).toEqual({ item: [1] });
  });

  it("uses async array proxies for callback-based array methods", async () => {
    const items = [1, 2, 3];
    const value = await eventAsyncRuntime.call(
      items.map,
      items,
      [async (item: number) => item * 2],
      createEvalContext({ options: { defaultToOptionalMemberAccess: true } }),
    );

    expect(value).toEqual([2, 4, 6]);
  });

  it("rejects banned functions", async () => {
    await expect(
      eventAsyncRuntime.call(
        setTimeout,
        globalThis,
        [() => undefined, 0],
        createEvalContext({ options: { defaultToOptionalMemberAccess: true } }),
      ),
    ).rejects.toThrow("Function setTimeout is not allowed to call");
  });

  it("throws HandlerCancelledError when the handler cancel token is aborted", async () => {
    const { token, abort } = createCancellationToken();
    abort("user");

    await expect(
      eventAsyncRuntime.checkCancel(createEvalContext({ localContext: { $cancel: token } })),
    ).rejects.toThrow(HandlerCancelledError);
  });

  it("wraps throw statement values in ThrowStatementError", () => {
    const errorObject = { type: "Error" };

    expect(() => eventAsyncRuntime.throwStatement(errorObject)).toThrow(ThrowStatementError);
    try {
      eventAsyncRuntime.throwStatement(errorObject);
    } catch (err) {
      expect((err as ThrowStatementError).errorObject).toBe(errorObject);
    }
  });

  it("unwraps ThrowStatementError values for catch bindings", () => {
    const errorObject = { type: "Error" };
    const wrappedError = new ThrowStatementError(errorObject);
    const nativeError = new Error("native");

    expect(eventAsyncRuntime.catchValue(wrappedError)).toBe(errorObject);
    expect(eventAsyncRuntime.catchValue(nativeError)).toBe(nativeError);
  });

  it("runs statement completion hooks and yields after a statement", async () => {
    const order: string[] = [];
    const timeout = new Promise<void>((resolve) => {
      setTimeout(() => {
        order.push("timer");
        resolve();
      }, 0);
    });

    await eventAsyncRuntime.afterStatement(
      createEvalContext({
        onStatementCompleted: () => {
          order.push("completed");
        },
      }),
    );
    await timeout;

    expect(order).toEqual(["completed", "timer"]);
  });

  it("invokes lazy XMLUI arrow objects asynchronously", async () => {
    const evalContext = createEvalContext({
      localContext: { value: 2 },
      options: { defaultToOptionalMemberAccess: true },
    });
    const expr = parseExpression("() => Promise.resolve(value + 1)");
    const arrow = await evalBindingAsync(expr, evalContext, evalContext.mainThread);

    const value = await eventAsyncRuntime.call(
      arrow,
      undefined,
      [],
      evalContext,
      evalContext.mainThread,
    );

    expect(value).toBe(3);
  });
});
