import { describe, it, expect } from "vitest";
import { createChildLayoutContext } from "../../src/abstractions/layout-context-utils";
import type { LayoutContext } from "../../src/abstractions/RendererDefs";

describe("createChildLayoutContext", () => {
  it("starts at depth 0 when there is no parent", () => {
    const ctx = createChildLayoutContext(undefined, { type: "Stack" });
    expect(ctx.depth).toBe(0);
  });

  it("increments depth from parent", () => {
    const parent = createChildLayoutContext(undefined, { type: "Stack" });
    const child = createChildLayoutContext(parent, { type: "Stack", orientation: "horizontal" });
    expect(child.depth).toBe(1);
  });

  it("increments depth across multiple levels", () => {
    const root = createChildLayoutContext(undefined, { type: "Stack" });
    const mid = createChildLayoutContext(root, { type: "Table" });
    const leaf = createChildLayoutContext(mid, { type: "TableCell" });
    expect(leaf.depth).toBe(2);
  });

  it("links parent correctly", () => {
    const parent = createChildLayoutContext(undefined, { type: "Stack" });
    const child = createChildLayoutContext(parent, { type: "Table" });
    expect(child.parent).toBe(parent);
  });

  it("forms the full ancestry chain", () => {
    const root = createChildLayoutContext(undefined, { type: "Stack" });
    const mid = createChildLayoutContext(root, { type: "Table" });
    const leaf = createChildLayoutContext(mid, { type: "TableCell" });
    expect(leaf.parent?.type).toBe("Table");
    expect(leaf.parent?.parent?.type).toBe("Stack");
    expect(leaf.parent?.parent?.parent).toBeUndefined();
  });

  it("copies all supplied fields into the new context", () => {
    const ctx = createChildLayoutContext(undefined, {
      type: "Stack",
      orientation: "horizontal",
      itemWidth: "100px",
      ignoreLayoutProps: ["width"],
    });
    expect(ctx.type).toBe("Stack");
    expect(ctx.orientation).toBe("horizontal");
    expect(ctx.itemWidth).toBe("100px");
    expect(ctx.ignoreLayoutProps).toEqual(["width"]);
  });

  it("does not mutate the parent context", () => {
    const parent = createChildLayoutContext(undefined, { type: "Stack", orientation: "vertical" });
    createChildLayoutContext(parent, { type: "Table" });
    expect(parent.parent).toBeUndefined();
    expect(parent.depth).toBe(0);
  });

  it("accepts a pre-existing plain LayoutContext object as parent", () => {
    const plain: LayoutContext = { type: "Stack", orientation: "horizontal" };
    const child = createChildLayoutContext(plain, { type: "Table" });
    // plain has no depth, so depth defaults to (-1 + 1) = 0... but wait,
    // plain.depth is undefined so (undefined ?? -1) + 1 = 0.
    expect(child.depth).toBe(0);
    expect(child.parent).toBe(plain);
  });
});
