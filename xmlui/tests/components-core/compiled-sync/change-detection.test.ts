import { describe, expect, it } from "vitest";

import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { evalBindingExpression } from "../../../src/components-core/script-runner/eval-tree-sync";

function runAndCollectDirtyRoots(source: string, localContext: any): string[] {
  const roots: string[] = [];
  evalBindingExpression(
    source,
    createEvalContext({
      localContext,
      options: { defaultToOptionalMemberAccess: true, compileBindings: true },
      onDidUpdate: (_scope, index) => {
        roots.push(String(index));
      },
    }),
  );
  return roots;
}

describe("compiled sync change detection", () => {
  it("uses writes during evaluation as the dirty-root source", () => {
    expect(
      runAndCollectDirtyRoots("(() => { count++; user.name = 'Grace'; })()", {
        count: 0,
        user: { name: "Ada" },
      }),
    ).toEqual(["count", "user"]);
  });

  it("marks a receiver root dirty for mutating function calls", () => {
    const localContext = { items: [1, 2] };

    expect(runAndCollectDirtyRoots("(() => { items.push(3); })()", localContext)).toEqual([
      "items",
    ]);
    expect(localContext.items).toEqual([1, 2, 3]);
  });

  it("keeps expression reads out of the dirty-root set", () => {
    expect(
      runAndCollectDirtyRoots("(() => count + user.name + items.length)()", {
        count: 1,
        user: { name: "Ada" },
        items: [1, 2],
      }),
    ).toEqual([]);
  });
});
