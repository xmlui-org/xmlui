import { describe, expect, it } from "vitest";

import { compileBindingSyncExpressionSource } from "../../../src/components-core/script-compiler";

type BindingSpec = {
  id: string;
  expression: string;
};

function rootDependency(dep: string): string {
  const match = /^[$A-Z_a-z][$\w]*/.exec(dep);
  return match?.[0] ?? dep;
}

function invalidatedBindings(bindings: BindingSpec[], dirtyRoots: string[]): string[] {
  const dirty = new Set(dirtyRoots);
  return bindings
    .filter((binding) => {
      const artifact = compileBindingSyncExpressionSource(
        binding.expression,
        `test:invalidation:${binding.id}`,
      );
      return artifact.dependencies.some((dep) => dirty.has(rootDependency(dep)));
    })
    .map((binding) => binding.id);
}

describe("compiled sync dependency invalidation", () => {
  const bindings: BindingSpec[] = [
    { id: "countLabel", expression: "count + 1" },
    { id: "nameLabel", expression: "user.name" },
    { id: "firstItem", expression: "items[0]" },
    { id: "mappedItems", expression: "items.map(item => item.id).join(',')" },
    { id: "formatLabel", expression: "format(user, locale)" },
    { id: "staticLabel", expression: "'static'" },
  ];

  it.each([
    [["count"], ["countLabel"]],
    [["user"], ["nameLabel", "formatLabel"]],
    [["items"], ["firstItem", "mappedItems"]],
    [["locale"], ["formatLabel"]],
    [["missing"], []],
    [
      ["count", "items"],
      ["countLabel", "firstItem", "mappedItems"],
    ],
  ])("invalidates only dependency intersections for dirty roots %j", (dirtyRoots, expected) => {
    expect(invalidatedBindings(bindings, dirtyRoots)).toEqual(expected);
  });

  it("records the current computed-member dependency shape explicitly", () => {
    const artifact = compileBindingSyncExpressionSource("obj[key]", "test:computed-member");

    expect(artifact.dependencies).toEqual(["obj[key]"]);
    expect(invalidatedBindings([{ id: "computed", expression: "obj[key]" }], ["obj"])).toEqual([
      "computed",
    ]);
    expect(invalidatedBindings([{ id: "computed", expression: "obj[key]" }], ["key"])).toEqual([]);
  });
});
