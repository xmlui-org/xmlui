import { describe, it, expect } from "vitest";
import { computeUsesForTree, IMPLICIT_CONTAINER_COMPONENT_NAMES } from
  "../../src/components-core/prepare/computedUses";
import type { ComponentDef } from "../../src/abstractions/ComponentDefs";

function node(
  type: string,
  overrides: Partial<ComponentDef> = {},
): ComponentDef {
  return { type, ...overrides } as ComponentDef;
}

describe("IMPLICIT_CONTAINER_COMPONENT_NAMES", () => {
  it("contains Select, List, Table, DataGrid", () => {
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("Select")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("List")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("Table")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("DataGrid")).toBe(true);
  });
});

describe("computeUsesForTree — basic cases", () => {
  it("node without expressions: computedUses not set", () => {
    const root = node("Stack", {
      children: [node("Button", { props: { label: "Click" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("implicit container with children reading external var", () => {
    const root = node("Stack", {
      vars: { a: "{0}" },
      children: [node("Text", { props: { text: "{b}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toEqual(["b"]);
  });

  it("local var does not bubble to computedUses", () => {
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [node("Text", { props: { text: "{x}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toEqual([]);
  });

  it("member-access: only root identifier", () => {
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [node("Text", { props: { text: "{user.profile.name}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("user");
    expect(root.computedUses).not.toContain("user.profile");
    expect(root.computedUses).not.toContain("user.profile.name");
  });

  it("deep nesting: each level gets the right set", () => {
    const inner = node("Stack", {
      vars: { b: "{0}" },
      children: [node("Text", { props: { text: "{a + c}" } })],
    });
    const outer = node("Stack", {
      vars: { a: "{0}" },
      children: [inner],
    });
    computeUsesForTree(outer);
    expect(inner.computedUses).toContain("a");
    expect(inner.computedUses).toContain("c");
    expect(inner.computedUses).not.toContain("b");
    expect(outer.computedUses).not.toContain("a");
    expect(outer.computedUses).toContain("c");
  });
});

describe("computeUsesForTree — isImplicitContainerByDefault", () => {
  it("Select with children that have dependencies becomes container", () => {
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{rarelyChanges}" },
          children: [node("Option", { props: { value: "{$item}" } })],
        }),
      ],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("rarelyChanges");
  });

  it("Select without external dependencies: computedUses not set", () => {
    const select = node("Select", {
      children: [node("Option", { props: { value: "static" } })],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toBeUndefined();
  });

  it("explicit uses is not overwritten by computedUses", () => {
    const root = node("Stack", {
      uses: ["count"],
      children: [node("Text", { props: { text: "{name}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
    expect(root.uses).toEqual(["count"]);
  });
});

describe("computeUsesForTree — loaders", () => {
  it("loader uid is treated as locally declared (not bubbled up)", () => {
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      loaders: [node("DataSource", { uid: "myData" })],
      children: [node("Text", { props: { text: "{myData.items}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).not.toContain("myData");
    expect(root.computedUses).toEqual([]);
  });
});

describe("computeUsesForTree — events", () => {
  it("identifiers in parsed event handlers are included", () => {
    const buttonWithEvent = node("Button", {
      events: {
        onClick: {
          __PARSED: true,
          statements: [
            {
              type: "ExpressionStatement",
              expr: { type: "Identifier", name: "externalVar" },
            },
          ],
        },
      },
    });
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [buttonWithEvent],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("externalVar");
  });
});
