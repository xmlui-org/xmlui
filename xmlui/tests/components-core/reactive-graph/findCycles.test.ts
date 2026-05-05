import { describe, it, expect } from "vitest";
import { createReactiveGraph } from "../../../src/components-core/reactive-graph/graph";
import { findCycles } from "../../../src/components-core/reactive-graph/findCycles";

describe("findCycles (Tarjan SCC)", () => {
  it("returns [] for an empty graph", () => {
    const g = createReactiveGraph();
    expect(findCycles(g)).toEqual([]);
  });

  it("returns [] for an acyclic DAG", () => {
    const g = createReactiveGraph();
    g.add({ id: "a", kind: "var" });
    g.add({ id: "b", kind: "var" });
    g.add({ id: "c", kind: "var" });
    g.edge("a", "b");
    g.edge("b", "c");
    expect(findCycles(g)).toEqual([]);
  });

  it("detects a single self-loop", () => {
    const g = createReactiveGraph();
    g.add({ id: "a", kind: "var" });
    g.edge("a", "a");
    const hits = findCycles(g);
    expect(hits).toHaveLength(1);
    expect(hits[0].cycle).toEqual(["a"]);
    expect(hits[0].severity).toBe("warn");
  });

  it("detects a two-node mutual cycle", () => {
    const g = createReactiveGraph();
    g.add({ id: "a", kind: "var" });
    g.add({ id: "b", kind: "var" });
    g.edge("a", "b");
    g.edge("b", "a");
    const hits = findCycles(g);
    expect(hits).toHaveLength(1);
    expect(hits[0].cycle).toEqual(["a", "b"]);
  });

  it("starts the cycle at the lexicographically smallest id", () => {
    const g = createReactiveGraph();
    g.add({ id: "z", kind: "var" });
    g.add({ id: "a", kind: "var" });
    g.add({ id: "m", kind: "var" });
    g.edge("z", "a");
    g.edge("a", "m");
    g.edge("m", "z");
    const hits = findCycles(g);
    expect(hits).toHaveLength(1);
    expect(hits[0].cycle[0]).toBe("a");
  });

  it("reports a 4-node SCC as exactly one hit", () => {
    const g = createReactiveGraph();
    for (const id of ["a", "b", "c", "d"]) g.add({ id, kind: "var" });
    g.edge("a", "b");
    g.edge("b", "c");
    g.edge("c", "d");
    g.edge("d", "a");
    g.edge("b", "d"); // chord — still one SCC
    const hits = findCycles(g);
    expect(hits).toHaveLength(1);
    expect(hits[0].cycle.sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("reports two disjoint cycles as two hits in deterministic order", () => {
    const g = createReactiveGraph();
    for (const id of ["a", "b", "x", "y"]) g.add({ id, kind: "var" });
    g.edge("a", "b");
    g.edge("b", "a");
    g.edge("x", "y");
    g.edge("y", "x");
    const hits = findCycles(g);
    expect(hits).toHaveLength(2);
    expect(hits[0].cycle[0]).toBe("a");
    expect(hits[1].cycle[0]).toBe("x");
  });

  it("ignores acyclic regions when reporting cycles", () => {
    const g = createReactiveGraph();
    for (const id of ["seed", "a", "b", "leaf"]) g.add({ id, kind: "var" });
    g.edge("seed", "a");   // entry into cycle
    g.edge("a", "b");
    g.edge("b", "a");      // cycle
    g.edge("b", "leaf");   // exit
    const hits = findCycles(g);
    expect(hits).toHaveLength(1);
    expect(hits[0].cycle.sort()).toEqual(["a", "b"]);
  });
});
