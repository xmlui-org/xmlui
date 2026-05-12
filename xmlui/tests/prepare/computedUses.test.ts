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

describe("computeUsesForTree — child UIDs", () => {
  it("child uid is treated as locally declared (not bubbled up)", () => {
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        node("Select", { uid: "mySelect" }),
        node("Text", { props: { text: "{mySelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).not.toContain("mySelect");
    expect(root.computedUses).toEqual([]);
  });

  it("slot child uid is treated as locally declared (not bubbled up)", () => {
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      slots: { header: [node("Select", { uid: "mySelect" })] },
      children: [node("Text", { props: { text: "{mySelect.value}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).not.toContain("mySelect");
    expect(root.computedUses).toEqual([]);
  });

  it("grandchild uid through non-container intermediary is locally declared", () => {
    // VStack has no vars → NOT a container → mySelect escapes through it to Stack
    const vstack = node("VStack", {
      children: [node("Select", { uid: "mySelect" })],
    });
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        vstack,
        node("Text", { props: { text: "{mySelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).not.toContain("mySelect");
    expect(root.computedUses).toEqual([]);
  });

  it("grandchild uid captured by intermediate container does NOT become local in ancestor", () => {
    // innerStack has vars → IS a container → captures mySelect, does not let it escape
    const innerStack = node("Stack", {
      vars: { x: "{0}" },
      children: [node("Select", { uid: "mySelect" })],
    });
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        innerStack,
        node("Text", { props: { text: "{mySelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    // mySelect is captured by innerStack, so root must request it from parent
    expect(root.computedUses).toContain("mySelect");
  });

  it("grandchild uid captured by uses-container does NOT escape to ancestor", () => {
    // Fragment with explicit uses IS a StateContainer at runtime — captures child UIDs
    const innerFrag = node("Fragment", {
      uses: ["x"],
      children: [node("Select", { uid: "s1" })],
    });
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [innerFrag, node("Text", { props: { text: "{s1.value}" } })],
    });
    computeUsesForTree(root);
    // s1 is owned by innerFrag's StateContainer; root must ask its parent for it
    expect(root.computedUses).toContain("s1");
  });

  it("uid escapes through multiple non-container intermediaries (3+ levels)", () => {
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        node("VStack", {
          children: [
            node("HStack", {
              children: [node("Select", { uid: "deepSelect" })],
            }),
          ],
        }),
        node("Text", { props: { text: "{deepSelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).not.toContain("deepSelect");
    expect(root.computedUses).toEqual([]);
  });

  it("container own uid escapes to parent container (not listed in parent computedUses)", () => {
    const inner = node("Stack", {
      uid: "innerStack",
      vars: { x: "{0}" },
    });
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        inner,
        node("Text", { props: { text: "{innerStack.someApi}" } }),
      ],
    });
    computeUsesForTree(root);
    // innerStack registers its own API in root — root doesn't need it from parent
    expect(root.computedUses).not.toContain("innerStack");
    expect(root.computedUses).toEqual([]);
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
