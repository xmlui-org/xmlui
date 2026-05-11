import { describe, it, expect } from "vitest";
import { computeUsesForTree } from "../../src/components-core/prepare/computedUses";
import { extractScopedState } from "../../src/components-core/rendering/ContainerUtils";
import type { ComponentDef } from "../../src/abstractions/ComponentDefs";

function node(type: string, overrides: Partial<ComponentDef> = {}): ComponentDef {
  return { type, ...overrides } as ComponentDef;
}

describe("extractScopedState with computedUses", () => {
  it("uses=undefined && computedUses=undefined → full parent state", () => {
    const parent = { a: 1, b: 2, c: 3 };
    const result = extractScopedState(parent, undefined);
    expect(result).toBe(parent); // same object reference
  });

  it("computedUses=['a'] → only 'a' from parent state", () => {
    const parent = { a: 1, b: 2, c: 3 };
    const result = extractScopedState(parent, ["a"]);
    expect(result).toEqual({ a: 1 });
    expect(result).not.toHaveProperty("b");
  });

  it("explicit uses takes priority (simulated via direct call)", () => {
    const parent = { a: 1, b: 2, c: 3 };
    // uses ?? computedUses — when uses=['b'], computedUses=['a'] is ignored
    const result = extractScopedState(parent, ["b"]);
    expect(result).toEqual({ b: 2 });
  });

  it("computedUses=[] → empty state (full isolation)", () => {
    const parent = { a: 1, b: 2 };
    const result = extractScopedState(parent, []);
    expect(result).toEqual({});
  });
});

describe("computeUsesForTree — mutation semantics", () => {
  it("name NOT in computedUses does not reach container", () => {
    const stack = node("Stack", {
      vars: { a: "{0}" },
      children: [node("Text", { props: { text: "{a}" } })],
    });
    computeUsesForTree(stack);
    expect(stack.computedUses).toEqual([]);
    const parentState = { a: 5, b: 99 };
    const scoped = extractScopedState(parentState, stack.computedUses);
    expect(scoped).toEqual({});
  });

  it("external name IN computedUses passes through to container", () => {
    const stack = node("Stack", {
      vars: { local: "{0}" },
      children: [node("Text", { props: { text: "{external}" } })],
    });
    computeUsesForTree(stack);
    expect(stack.computedUses).toContain("external");
    const parentState = { external: 42, irrelevant: 99 };
    const scoped = extractScopedState(parentState, stack.computedUses);
    expect(scoped).toEqual({ external: 42 });
  });
});
