import { describe, it, expect } from "vitest";
import { collectComponentDefGraph } from "../../../src/components-core/reactive-graph/collectComponentDefGraph";
import { findCycles } from "../../../src/components-core/reactive-graph/findCycles";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";

function makeApp(def: Partial<ComponentDef>): ComponentDef {
  return { type: "App", uid: "App", ...def } as ComponentDef;
}

describe("collectComponentDefGraph", () => {
  it("creates one node per declared var", () => {
    const def = makeApp({ vars: { a: "1", b: "2" } });
    const g = collectComponentDefGraph(def);
    expect(g.nodes.size).toBe(2);
    expect(g.nodes.has("App.a")).toBe(true);
    expect(g.nodes.has("App.b")).toBe(true);
  });

  it("links a var to another var it references via {expr}", () => {
    const def = makeApp({ vars: { a: "1", b: "{a + 1}" } });
    const g = collectComponentDefGraph(def);
    expect(Array.from(g.nodes.get("App.b")!.deps)).toEqual(["App.a"]);
    expect(g.nodes.get("App.a")!.deps.size).toBe(0);
    expect(findCycles(g)).toEqual([]);
  });

  it("detects a two-var mutual cycle (a ↔ b)", () => {
    const def = makeApp({ vars: { a: "{b}", b: "{a}" } });
    const g = collectComponentDefGraph(def);
    const hits = findCycles(g);
    expect(hits).toHaveLength(1);
    expect(hits[0].cycle.sort()).toEqual(["App.a", "App.b"]);
    expect(hits[0].nodes.every((n) => n.kind === "var")).toBe(true);
  });

  it("does not register identifiers that resolve to globals (no node, no edge)", () => {
    const def = makeApp({ vars: { greeting: "{appContext.toast('hi')}" } });
    const g = collectComponentDefGraph(def);
    // Only `greeting` is a node; `appContext` is not.
    expect(g.nodes.size).toBe(1);
    expect(g.nodes.get("App.greeting")!.deps.size).toBe(0);
  });

  it("creates a node per code-behind function and links function-mediated cycles", () => {
    // function fn() reads var v; var w reads fn() — w → fn → v, no cycle.
    const def = makeApp({
      vars: { v: "1", w: "{fn()}" },
      functions: { fn: "{v + 1}" },
    });
    const g = collectComponentDefGraph(def);
    expect(g.nodes.get("App.fn")?.kind).toBe("function");
    expect(g.nodes.get("App.w")!.deps.has("App.fn")).toBe(true);
    expect(g.nodes.get("App.fn")!.deps.has("App.v")).toBe(true);
    expect(findCycles(g)).toEqual([]);
  });

  it("detects a function-mediated cycle (var ↔ function)", () => {
    const def = makeApp({
      vars: { x: "{fn()}" },
      functions: { fn: "{x + 1}" },
    });
    const g = collectComponentDefGraph(def);
    const hits = findCycles(g);
    expect(hits).toHaveLength(1);
    expect(hits[0].cycle.sort()).toEqual(["App.fn", "App.x"]);
  });

  it("detects a var ↔ DataSource cycle", () => {
    // <DataSource id="users" url="/users/{currentId}" />
    // var currentId = "{users.value}"
    const def = makeApp({
      vars: { currentId: "{users}" },
      loaders: [
        {
          type: "DataSource",
          uid: "users",
          props: { url: "/users/{currentId}" },
        } as ComponentDef,
      ],
    });
    const g = collectComponentDefGraph(def);
    expect(g.nodes.get("App.users")?.kind).toBe("loader");
    const hits = findCycles(g);
    expect(hits).toHaveLength(1);
    const ids = hits[0].cycle.slice().sort();
    expect(ids).toEqual(["App.currentId", "App.users"]);
  });

  it("does not flag an acyclic var/loader chain", () => {
    const def = makeApp({
      vars: { ready: "true" },
      loaders: [
        {
          type: "DataSource",
          uid: "x",
          when: "{ready}",
          props: { url: "/x" },
        } as ComponentDef,
      ],
    });
    const g = collectComponentDefGraph(def);
    expect(findCycles(g)).toEqual([]);
  });

  it("walks into nested children and isolates per-component scope", () => {
    const child: ComponentDef = {
      type: "Page",
      uid: "Page",
      vars: { a: "{b}", b: "{a}" },
    } as ComponentDef;
    const def = makeApp({ children: [child] });
    const g = collectComponentDefGraph(def);
    const hits = findCycles(g);
    expect(hits).toHaveLength(1);
    expect(hits[0].cycle.sort()).toEqual(["Page.a", "Page.b"]);
  });

  it("survives malformed expressions without throwing", () => {
    const def = makeApp({ vars: { a: "{!! malformed" } });
    expect(() => collectComponentDefGraph(def)).not.toThrow();
  });
});
