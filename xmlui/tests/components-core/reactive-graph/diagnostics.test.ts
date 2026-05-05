import { describe, it, expect } from "vitest";
import { createReactiveGraph } from "../../../src/components-core/reactive-graph/graph";
import { findCycles } from "../../../src/components-core/reactive-graph/findCycles";
import {
  formatCycle,
  cycleHash,
  describeNode,
  ReactiveCycleError,
} from "../../../src/components-core/reactive-graph/diagnostics";

function buildSelfLoop() {
  const g = createReactiveGraph();
  g.add({ id: "Form#a.x", kind: "var", uri: "Main.xmlui", range: { line: 4, col: 7 } });
  g.edge("Form#a.x", "Form#a.x");
  return findCycles(g)[0];
}

function buildVarLoaderCycle() {
  const g = createReactiveGraph();
  g.add({ id: "Page.users", kind: "loader", uri: "Main.xmlui", range: { line: 8, col: 5 } });
  g.add({ id: "Page.currentId", kind: "var", uri: "Main.xmlui", range: { line: 14, col: 7 } });
  g.edge("Page.users", "Page.currentId");
  g.edge("Page.currentId", "Page.users");
  return findCycles(g)[0];
}

describe("formatCycle", () => {
  it("renders a self-loop with one node", () => {
    const text = formatCycle(buildSelfLoop());
    expect(text).toContain("Reactive cycle detected (1 node)");
    expect(text).toContain("var Form#a.x");
    expect(text).toContain("Main.xmlui:4:7");
    // Cycle is closed: first node appears twice.
    expect(text.match(/Form#a\.x/g)?.length).toBe(2);
  });

  it("renders a multi-node cycle with arrows and a closing line", () => {
    const text = formatCycle(buildVarLoaderCycle());
    expect(text).toContain("Reactive cycle detected (2 nodes)");
    expect(text).toContain("\u2192");
    // Both endpoints appear, and the first one is closed in.
    const lines = text.split("\n");
    expect(lines[lines.length - 1]).toContain(lines[1].split(" ").slice(-1)[0].slice(1, -1));
  });

  it("annotates conditional cycles", () => {
    const hit = buildSelfLoop();
    const conditional = { ...hit, severity: "info" as const };
    expect(formatCycle(conditional)).toContain("(conditional)");
  });
});

describe("cycleHash", () => {
  it("is stable across equivalent cycle orderings", () => {
    const a = { cycle: ["a", "b", "c"], nodes: [], severity: "warn" as const };
    const b = { cycle: ["c", "a", "b"], nodes: [], severity: "warn" as const };
    expect(cycleHash(a as any)).toBe(cycleHash(b as any));
  });

  it("differs between distinct cycles", () => {
    const a = { cycle: ["a", "b"], nodes: [], severity: "warn" as const };
    const b = { cycle: ["a", "c"], nodes: [], severity: "warn" as const };
    expect(cycleHash(a as any)).not.toBe(cycleHash(b as any));
  });
});

describe("describeNode", () => {
  it("includes uri and range when present", () => {
    const text = describeNode({
      id: "Page.x",
      kind: "loader",
      uri: "Main.xmlui",
      range: { line: 1, col: 2 },
      deps: new Set(),
    });
    expect(text).toBe("DataSource Page.x (Main.xmlui:1:2)");
  });

  it("omits the location bracket when neither uri nor range is set", () => {
    const text = describeNode({ id: "Page.x", kind: "var", deps: new Set() });
    expect(text).toBe("var Page.x");
  });
});

describe("ReactiveCycleError", () => {
  it("uses formatCycle as its message", () => {
    const hit = buildSelfLoop();
    const err = new ReactiveCycleError(hit);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ReactiveCycleError");
    expect(err.message).toBe(formatCycle(hit));
    expect(err.hit).toBe(hit);
  });
});
