/**
 * Build a `ReactiveGraph` from a `ComponentDef` tree — Plan #03 Steps 1.1–1.3.
 *
 * Walks the tree once via `walkComponentDefTree`, registering one node per
 * `var` declaration, per code-behind `function`, and per `loader`
 * (DataSource / APICall). Edges are derived from `collectVariableDependencies`
 * applied to the parsed expression for each entry.
 *
 * Identifier roots that resolve to nodes registered in the same component
 * become edges; all other identifiers (built-ins, `appContext`, `$props`,
 * `$item`, etc.) are treated as leaf inputs and ignored.
 *
 * Phase-1 limitations (intentional):
 *   - Edges are local to the component that owns the var/loader. A var that
 *     reads a name shadowed by an ancestor's `uses` flow is not yet linked
 *     across container boundaries — Step 1.4 / W6 territory.
 *   - Conditional edges (inside `when`/`displayWhen`) are not yet tagged.
 */
import { depsOfValue, collectVariableDependencies } from "../script-runner/visitors";
import { walkComponentDefTree } from "../ud-metadata";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { createReactiveGraph, type ReactiveGraph, type ReactiveNodeKind } from "./graph";

/** Loader prop names whose value is a binding-shaped expression. */
const LOADER_BINDING_PROPS = [
  "url",
  "body",
  "queryParams",
  "headers",
  "mockData",
  "transformResult",
  "when",
  "method",
];

/**
 * Build a reactive dependency graph from a fully-resolved `ComponentDef`
 * tree. The tree may be any subtree — typically the rooted app's
 * `ContainerWrapperDef`.
 */
export function collectComponentDefGraph(root: ComponentDef): ReactiveGraph {
  const graph = createReactiveGraph();
  if (!root) return graph;

  // Pass 1 — register every node so id-resolution in pass 2 sees them.
  walkComponentDefTree(root, (node) => {
    const ownerUid = node.uid ?? node.type ?? "anon";

    if (node.vars && typeof node.vars === "object") {
      for (const name of Object.keys(node.vars)) {
        graph.add({ id: makeId(ownerUid, name), kind: "var" });
      }
    }

    if (node.functions && typeof node.functions === "object") {
      for (const name of Object.keys(node.functions)) {
        graph.add({ id: makeId(ownerUid, name), kind: "function" });
      }
    }

    if (Array.isArray(node.loaders)) {
      for (const loader of node.loaders) {
        if (loader && typeof loader === "object" && loader.uid) {
          graph.add({ id: makeId(ownerUid, loader.uid), kind: "loader" });
        }
      }
    }
  });

  // Pass 2 — populate edges by scanning each entry's expression(s).
  walkComponentDefTree(root, (node) => {
    const ownerUid = node.uid ?? node.type ?? "anon";
    const localNames = collectLocalNames(node);

    if (node.vars && typeof node.vars === "object") {
      for (const [name, value] of Object.entries(node.vars)) {
        const fromId = makeId(ownerUid, name);
        addEdgesFromValue(graph, fromId, value, localNames, ownerUid);
      }
    }

    if (node.functions && typeof node.functions === "object") {
      for (const [name, value] of Object.entries(node.functions)) {
        const fromId = makeId(ownerUid, name);
        addEdgesFromValue(graph, fromId, value, localNames, ownerUid);
      }
    }

    if (Array.isArray(node.loaders)) {
      for (const loader of node.loaders) {
        if (!loader || !loader.uid) continue;
        const fromId = makeId(ownerUid, loader.uid);
        // Each binding-shaped prop on the loader contributes outgoing edges.
        if (loader.props && typeof loader.props === "object") {
          for (const propName of LOADER_BINDING_PROPS) {
            const value = (loader.props as Record<string, unknown>)[propName];
            if (value === undefined) continue;
            addEdgesFromValue(graph, fromId, value, localNames, ownerUid);
          }
        }
        if (loader.when !== undefined) {
          addEdgesFromValue(graph, fromId, loader.when, localNames, ownerUid);
        }
      }
    }
  });

  return graph;
}

/**
 * Names that resolve to graph nodes inside `node`'s own component scope —
 * own `vars`, `functions`, and loader uids. Used to filter
 * `collectVariableDependencies` output so we don't add edges to every
 * built-in identifier.
 */
function collectLocalNames(node: ComponentDef): Map<string, ReactiveNodeKind> {
  const names = new Map<string, ReactiveNodeKind>();
  if (node.vars && typeof node.vars === "object") {
    for (const n of Object.keys(node.vars)) names.set(n, "var");
  }
  if (node.functions && typeof node.functions === "object") {
    for (const n of Object.keys(node.functions)) names.set(n, "function");
  }
  if (Array.isArray(node.loaders)) {
    for (const loader of node.loaders) {
      if (loader && typeof loader === "object" && loader.uid) {
        names.set(loader.uid, "loader");
      }
    }
  }
  return names;
}

/**
 * Parse `value` (parsed-tree, raw string with `{...}` interpolations, or
 * function source) and add an edge from `fromId` to every dependency that
 * resolves inside `localNames`.
 */
function addEdgesFromValue(
  graph: ReactiveGraph,
  fromId: string,
  value: unknown,
  localNames: Map<string, ReactiveNodeKind>,
  ownerUid: string,
): void {
  const deps = depsOfValue(value);
  for (const dep of deps) {
    if (!localNames.has(dep)) continue;
    graph.edge(fromId, makeId(ownerUid, dep));
  }
}

function makeId(ownerUid: string, name: string): string {
  return `${ownerUid}.${name}`;
}
