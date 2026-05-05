import { describe, it, expect } from "vitest";
import { createReactiveGraph } from "../../../src/components-core/reactive-graph/graph";

describe("ReactiveGraph", () => {
  it("starts empty", () => {
    const g = createReactiveGraph();
    expect(g.nodes.size).toBe(0);
  });

  it("registers nodes by id", () => {
    const g = createReactiveGraph();
    g.add({ id: "a.x", kind: "var" });
    g.add({ id: "a.y", kind: "loader" });
    expect(g.nodes.size).toBe(2);
    expect(g.nodes.get("a.x")?.kind).toBe("var");
    expect(g.nodes.get("a.y")?.kind).toBe("loader");
  });

  it("preserves the original node when add() is called twice with the same id", () => {
    const g = createReactiveGraph();
    const first = g.add({ id: "a.x", kind: "var" });
    const second = g.add({ id: "a.x", kind: "loader" }); // ignored
    expect(first).toBe(second);
    expect(g.nodes.get("a.x")?.kind).toBe("var");
  });

  it("adds edges between registered nodes", () => {
    const g = createReactiveGraph();
    g.add({ id: "a.x", kind: "var" });
    g.add({ id: "a.y", kind: "var" });
    g.edge("a.x", "a.y");
    expect(Array.from(g.nodes.get("a.x")!.deps)).toEqual(["a.y"]);
  });

  it("deduplicates repeated edges", () => {
    const g = createReactiveGraph();
    g.add({ id: "a.x", kind: "var" });
    g.add({ id: "a.y", kind: "var" });
    g.edge("a.x", "a.y");
    g.edge("a.x", "a.y");
    g.edge("a.x", "a.y");
    expect(g.nodes.get("a.x")!.deps.size).toBe(1);
  });

  it("ignores edges that reference unknown nodes", () => {
    const g = createReactiveGraph();
    g.add({ id: "a.x", kind: "var" });
    g.edge("a.x", "ghost");
    g.edge("ghost", "a.x");
    expect(g.nodes.get("a.x")!.deps.size).toBe(0);
  });

  it("supports self-loops on registered nodes", () => {
    const g = createReactiveGraph();
    g.add({ id: "a.x", kind: "var" });
    g.edge("a.x", "a.x");
    expect(g.nodes.get("a.x")!.deps.has("a.x")).toBe(true);
  });
});
