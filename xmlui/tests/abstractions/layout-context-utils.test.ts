import { describe, it, expect } from "vitest";
import {
  createChildLayoutContext,
  getLayoutDepth,
  findAncestorLayout,
  isInsideLayout,
  getLayoutPath,
  stripDirectChildProps,
} from "../../src/abstractions/layout-context-utils";
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

describe("getLayoutDepth", () => {
  it("returns -1 for undefined (no layout boundary established)", () => {
    expect(getLayoutDepth(undefined)).toBe(-1);
  });

  it("returns the depth of a root context", () => {
    const ctx = createChildLayoutContext(undefined, { type: "Stack" });
    expect(getLayoutDepth(ctx)).toBe(0);
  });

  it("returns the depth of a nested context", () => {
    const root = createChildLayoutContext(undefined, { type: "Stack" });
    const mid = createChildLayoutContext(root, { type: "Table" });
    const leaf = createChildLayoutContext(mid, { type: "TableCell" });
    expect(getLayoutDepth(leaf)).toBe(2);
  });
});

describe("findAncestorLayout", () => {
  it("returns undefined when context is undefined", () => {
    expect(findAncestorLayout(undefined, () => true)).toBeUndefined();
  });

  it("finds the context itself when predicate matches", () => {
    const ctx = createChildLayoutContext(undefined, { type: "Table" });
    expect(findAncestorLayout(ctx, (c) => c.type === "Table")).toBe(ctx);
  });

  it("finds an ancestor further up the chain", () => {
    const root = createChildLayoutContext(undefined, { type: "Stack" });
    const mid = createChildLayoutContext(root, { type: "Table" });
    const leaf = createChildLayoutContext(mid, { type: "TableCell" });
    expect(findAncestorLayout(leaf, (c) => c.type === "Stack")).toBe(root);
  });

  it("returns undefined when no ancestor matches", () => {
    const root = createChildLayoutContext(undefined, { type: "Stack" });
    const child = createChildLayoutContext(root, { type: "Table" });
    expect(findAncestorLayout(child, (c) => c.type === "Card")).toBeUndefined();
  });
});

describe("isInsideLayout", () => {
  it("returns false for undefined context", () => {
    expect(isInsideLayout(undefined, "Stack")).toBe(false);
  });

  it("returns true when the context itself matches", () => {
    const ctx = createChildLayoutContext(undefined, { type: "Stack" });
    expect(isInsideLayout(ctx, "Stack")).toBe(true);
  });

  it("returns true when an ancestor matches", () => {
    const root = createChildLayoutContext(undefined, { type: "Stack" });
    const mid = createChildLayoutContext(root, { type: "Table" });
    const leaf = createChildLayoutContext(mid, { type: "TableCell" });
    expect(isInsideLayout(leaf, "Stack")).toBe(true);
  });

  it("returns true when any of multiple supplied types matches", () => {
    const root = createChildLayoutContext(undefined, { type: "Stack" });
    const child = createChildLayoutContext(root, { type: "Table" });
    expect(isInsideLayout(child, "Card", "Stack")).toBe(true);
  });

  it("returns false when no ancestor matches any supplied type", () => {
    const root = createChildLayoutContext(undefined, { type: "Stack" });
    const child = createChildLayoutContext(root, { type: "Table" });
    expect(isInsideLayout(child, "Card", "Form")).toBe(false);
  });
});

describe("getLayoutPath", () => {
  it("returns empty array for undefined context", () => {
    expect(getLayoutPath(undefined)).toEqual([]);
  });

  it("returns a single-element array for a root context", () => {
    const ctx = createChildLayoutContext(undefined, { type: "Stack" });
    expect(getLayoutPath(ctx)).toEqual(["Stack"]);
  });

  it("returns the path from root to leaf in order", () => {
    const root = createChildLayoutContext(undefined, { type: "Stack" });
    const mid = createChildLayoutContext(root, { type: "Table" });
    const leaf = createChildLayoutContext(mid, { type: "TableCell" });
    expect(getLayoutPath(leaf)).toEqual(["Stack", "Table", "TableCell"]);
  });

  it("records undefined type as empty string", () => {
    const root = createChildLayoutContext(undefined, {});
    const child = createChildLayoutContext(root, { type: "Stack" });
    expect(getLayoutPath(child)).toEqual(["", "Stack"]);
  });
});

describe("stripDirectChildProps", () => {
  it("returns undefined for undefined context", () => {
    expect(stripDirectChildProps(undefined)).toBeUndefined();
  });

  it("removes ignoreLayoutProps from the context", () => {
    const ctx = createChildLayoutContext(undefined, {
      type: "FlowLayout",
      orientation: "horizontal",
      ignoreLayoutProps: ["width", "minWidth", "maxWidth"],
    });
    const stripped = stripDirectChildProps(ctx)!;
    expect(stripped.ignoreLayoutProps).toBeUndefined();
    expect(stripped.type).toBe("FlowLayout");
    expect(stripped.orientation).toBe("horizontal");
  });

  it("removes wrapChild from the context", () => {
    const wrapChild = () => null;
    const ctx = createChildLayoutContext(undefined, {
      type: "Stack",
      wrapChild,
    });
    const stripped = stripDirectChildProps(ctx)!;
    expect(stripped.wrapChild).toBeUndefined();
    expect(stripped.type).toBe("Stack");
  });

  it("preserves structural properties", () => {
    const parent = createChildLayoutContext(undefined, { type: "Stack" });
    const ctx = createChildLayoutContext(parent, {
      type: "FlowLayout",
      orientation: "horizontal",
      itemWidth: "33%",
      ignoreLayoutProps: ["width"],
      wrapChild: () => null,
    });
    const stripped = stripDirectChildProps(ctx)!;
    expect(stripped.type).toBe("FlowLayout");
    expect(stripped.orientation).toBe("horizontal");
    expect(stripped.itemWidth).toBe("33%");
    expect(stripped.depth).toBe(1);
    expect(stripped.parent).toBe(parent);
  });
});
