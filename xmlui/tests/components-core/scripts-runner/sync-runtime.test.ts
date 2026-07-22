import { describe, expect, it } from "vitest";

import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import {
  applySyncAssignment,
  applySyncPrePost,
  assertSyncFunctionAllowed,
  callSyncFunction,
  deleteSyncTarget,
  markReceiverDirty,
} from "../../../src/components-core/script-runner/sync-runtime";

describe("sync runtime helpers", () => {
  it("rejects banned functions before invocation", () => {
    expect(() => assertSyncFunctionAllowed(globalThis.setTimeout)).toThrow(
      "Function setTimeout is not allowed to call. Use 'delay'",
    );
  });

  it("rejects promises returned from sync function calls", () => {
    const ctx = createEvalContext({});

    expect(() =>
      callSyncFunction({
        functionObj: () => Promise.resolve(1),
        thisArg: undefined,
        args: [],
        evalContext: ctx,
      }),
    ).toThrow("Promises (async function calls) are not allowed in binding expressions.");
  });

  it("uses optional invocation semantics when requested", () => {
    const ctx = createEvalContext({});

    expect(
      callSyncFunction({
        functionObj: undefined,
        thisArg: undefined,
        args: [],
        evalContext: ctx,
        optional: true,
      }),
    ).toBeUndefined();
  });

  it("applies root assignments and returns a change descriptor", () => {
    const ctx = createEvalContext({});
    const state = { count: 1 };

    const change = applySyncAssignment(
      { valueScope: state, valueIndex: "count", rootName: "count" },
      "+=",
      2,
      ctx,
    );

    expect(state.count).toBe(3);
    expect(change).toMatchObject({
      rootName: "count",
      pathArray: ["count"],
      newValue: 3,
      action: "set",
      kind: "assignment",
    });
  });

  it("applies nested assignments with the supplied path", () => {
    const ctx = createEvalContext({});
    const state = { user: { name: "Ada" } };

    const change = applySyncAssignment(
      {
        valueScope: state.user,
        valueIndex: "name",
        rootName: "user",
        pathArray: ["user", "name"],
      },
      "=",
      "Grace",
      ctx,
    );

    expect(state.user.name).toBe("Grace");
    expect(change).toMatchObject({
      rootName: "user",
      pathArray: ["user", "name"],
      newValue: "Grace",
    });
  });

  it("applies prefix and postfix operators and reports the updated value", () => {
    const ctx = createEvalContext({});
    const state = { count: 1 };

    const postfix = applySyncPrePost(
      { valueScope: state, valueIndex: "count", rootName: "count" },
      "++",
      false,
      ctx,
    );
    const prefix = applySyncPrePost(
      { valueScope: state, valueIndex: "count", rootName: "count" },
      "++",
      true,
      ctx,
    );

    expect(postfix.value).toBe(1);
    expect(postfix.change.newValue).toBe(2);
    expect(prefix.value).toBe(3);
    expect(prefix.change.newValue).toBe(3);
  });

  it("deletes target members and reports the path", () => {
    const ctx = createEvalContext({});
    const state: { user: { name?: string } } = { user: { name: "Ada" } };

    const change = deleteSyncTarget(
      {
        valueScope: state.user,
        valueIndex: "name",
        rootName: "user",
        pathArray: ["user", "name"],
      },
      ctx,
    );

    expect(state.user.name).toBeUndefined();
    expect(change).toMatchObject({
      rootName: "user",
      pathArray: ["user", "name"],
      action: "delete",
      kind: "assignment",
    });
  });

  it("marks mutating receivers dirty without performing a write itself", () => {
    const items = [1, 2];

    const change = markReceiverDirty(
      {
        valueScope: { items },
        valueIndex: "items",
        rootName: "items",
        pathArray: ["items"],
      },
      items,
    );

    expect(change).toMatchObject({
      rootName: "items",
      pathArray: ["items"],
      newValue: items,
      action: "mutate",
      kind: "function-call",
    });
  });
});
