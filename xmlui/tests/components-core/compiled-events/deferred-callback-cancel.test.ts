import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";

/**
 * A handler often hands a callback to something that invokes it later — `debounce`,
 * a timer, a subscription. The dispatcher aborts the run's `$cancel` token in its
 * `finally`, on normal completion as well as supersession, so by the time such a
 * callback runs its originating token is always aborted. It must still run: the
 * interpreted path never consulted `$cancel` for these, and a compiled one that
 * throws `HandlerCancelledError` silently drops the app's work.
 */
function createEvalContext(localContext: Record<string, any>) {
  return {
    localContext,
    eventArgs: [],
    options: { compileScripts: true, defaultToOptionalMemberAccess: true },
  } as any;
}

function abortedCancelToken() {
  return {
    aborted: true,
    throwIfAborted() {
      const error = new Error("Handler cancelled (user)");
      error.name = "HandlerCancelledError";
      throw error;
    },
  };
}

const DEBOUNCE_HANDLER = `e => {
  changed++;
  schedule((term) => {
    results = term ? [term] : [];
    invoked++;
  }, e);
}`;

describe("callbacks invoked after their handler finished", () => {
  it("runs a deferred callback even though the handler's $cancel was aborted", async () => {
    let deferred: (() => Promise<void>) | undefined;
    const localContext: Record<string, any> = {
      changed: 0,
      invoked: 0,
      results: [],
      schedule: (fn: (value: string) => any, value: string) => {
        deferred = async () => {
          await fn(value);
        };
      },
    };
    const evalContext = createEvalContext(localContext);
    const artifact = compileEventAsyncStatementSource(
      DEBOUNCE_HANDLER,
      "deferred#debounce-handler",
    );

    evalContext.eventArgs = ["Laptop"];
    await executeCompiledEventAsyncArtifact(artifact, evalContext);
    expect(localContext.changed).toBe(1);

    // --- What the dispatcher does once the handler settles.
    localContext.$cancel = abortedCancelToken();

    await expect(deferred?.()).resolves.toBeUndefined();
    expect(localContext.results).toEqual(["Laptop"]);
    expect(localContext.invoked).toBe(1);
  });

  it("still cancels while the handler itself is running", async () => {
    const localContext: Record<string, any> = {
      steps: 0,
      trip: () => {
        localContext.$cancel = abortedCancelToken();
      },
    };
    const evalContext = createEvalContext(localContext);
    const artifact = compileEventAsyncStatementSource(
      "steps++; trip(); steps++;",
      "deferred#cancel-mid-run",
    );

    await expect(executeCompiledEventAsyncArtifact(artifact, evalContext)).rejects.toThrow(
      /cancelled/i,
    );
    expect(localContext.steps).toBe(1);
  });
});
