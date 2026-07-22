import { describe, expect, it } from "vitest";

import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { evalBindingExpression } from "../../../src/components-core/script-runner/eval-tree-sync";
import {
  applySyncAssignment,
  applySyncPrePost,
  deleteSyncTarget,
  markReceiverDirty,
} from "../../../src/components-core/script-runner/sync-runtime";

type UpdateRecord = {
  phase: "will" | "did";
  index: string | number;
  kind: string;
};

function runCompiled(source: string, localContext: any): UpdateRecord[] {
  const updates: UpdateRecord[] = [];
  evalBindingExpression(
    source,
    createEvalContext({
      localContext,
      options: { defaultToOptionalMemberAccess: true, compileBindings: true },
      onWillUpdate: (_scope, index, kind) => {
        updates.push({ phase: "will", index, kind });
      },
      onDidUpdate: (_scope, index, kind) => {
        updates.push({ phase: "did", index, kind });
      },
    }),
  );
  return updates;
}

describe("compiled sync write tracking", () => {
  it.each([
    ["root assignment", "(() => { count = 1; })()", { count: 0 }, "count", "assignment"],
    ["compound assignment", "(() => { count += 2; })()", { count: 1 }, "count", "assignment"],
    ["prefix update", "(() => { ++count; })()", { count: 1 }, "count", "pre-post"],
    ["postfix update", "(() => { count++; })()", { count: 1 }, "count", "pre-post"],
    [
      "nested member assignment",
      "(() => { user.name = 'Grace'; })()",
      { user: { name: "Ada" } },
      "user",
      "assignment",
    ],
    [
      "computed member assignment",
      "(() => { user[key] = 'Grace'; })()",
      { user: { name: "Ada" }, key: "name" },
      "user",
      "assignment",
    ],
    [
      "delete member",
      "(() => { delete user.name; })()",
      { user: { name: "Ada" } },
      "user",
      "assignment",
    ],
    [
      "receiver mutation",
      "(() => { items.push(3); })()",
      { items: [1, 2] },
      "items",
      "function-call",
    ],
  ])("reports dirty root for %s", (_name, source, localContext, rootName, kind) => {
    expect(runCompiled(source, localContext)).toEqual([
      { phase: "will", index: rootName, kind },
      { phase: "did", index: rootName, kind },
    ]);
  });

  it("does not report dirty roots for local block updates", () => {
    expect(runCompiled("(() => { let count = 0; count++; })()", { count: 10 })).toEqual([]);
  });

  it("reports multiple dirty roots in one compiled evaluation", () => {
    expect(
      runCompiled("(() => { count++; user.name = 'Grace'; items.push(1); })()", {
        count: 0,
        user: { name: "Ada" },
        items: [],
      }),
    ).toEqual([
      { phase: "will", index: "count", kind: "pre-post" },
      { phase: "did", index: "count", kind: "pre-post" },
      { phase: "will", index: "user", kind: "assignment" },
      { phase: "did", index: "user", kind: "assignment" },
      { phase: "will", index: "items", kind: "function-call" },
      { phase: "did", index: "items", kind: "function-call" },
    ]);
  });

  it("keeps helper-level path/action details for supported write forms", () => {
    const user = { name: "Ada", tags: ["dev"] };
    const root = { user };
    const assignment = applySyncAssignment(
      { valueScope: user, valueIndex: "name", rootName: "user", pathArray: ["user", "name"] },
      "=",
      "Grace",
      createEvalContext({}),
    );
    const prePost = applySyncPrePost(
      {
        valueScope: root.user.tags,
        valueIndex: "length",
        rootName: "user",
        pathArray: ["user", "tags", "length"],
      },
      "--",
      true,
      createEvalContext({}),
    );
    const deletion = deleteSyncTarget(
      { valueScope: user, valueIndex: "name", rootName: "user", pathArray: ["user", "name"] },
      createEvalContext({}),
    );
    const mutation = markReceiverDirty(
      { valueScope: root, valueIndex: "user", rootName: "user", pathArray: ["user"] },
      user,
    );

    expect(assignment).toMatchObject({
      rootName: "user",
      pathArray: ["user", "name"],
      action: "set",
      kind: "assignment",
      newValue: "Grace",
    });
    expect(prePost.change).toMatchObject({
      rootName: "user",
      pathArray: ["user", "tags", "length"],
      action: "set",
      kind: "pre-post",
      newValue: 0,
    });
    expect(deletion).toMatchObject({
      rootName: "user",
      pathArray: ["user", "name"],
      action: "delete",
      kind: "assignment",
      newValue: true,
    });
    expect(mutation).toMatchObject({
      rootName: "user",
      pathArray: ["user"],
      action: "mutate",
      kind: "function-call",
      newValue: user,
    });
  });
});
