/**
 * Reactive dependency graph — Plan #03 Step 0.
 *
 * Pure data container. Nodes represent reactive scalars (vars, code-behind
 * functions, DataSource/APICall loaders); edges represent "the FROM node's
 * value depends on the TO node's value". The graph is built by
 * `collectComponentDefGraph`, scanned by `findCycles`, and rendered by
 * `formatCycle`.
 */

export type ReactiveNodeKind = "var" | "loader" | "function" | "prop";

export interface ReactiveNode {
  /** Stable `${componentUid}.${name}` (or just `name` when uid is missing). */
  id: string;
  kind: ReactiveNodeKind;
  /** Optional source URI for diagnostics (LSP / Vite). */
  uri?: string;
  /** Optional source range (1-based line/col). */
  range?: { line: number; col: number };
  /** Outgoing edges — populated by `edge()`. Stored as a `Set` to deduplicate. */
  deps: Set<string>;
}

export interface ReactiveGraph {
  /** All registered nodes, keyed by `node.id`. */
  nodes: Map<string, ReactiveNode>;
  /** Register a node. If a node with the same id already exists it is preserved. */
  add(node: Omit<ReactiveNode, "deps"> & { deps?: Iterable<string> }): ReactiveNode;
  /** Add a directed edge `from -> to`. Edges to unknown nodes are ignored. */
  edge(from: string, to: string): void;
}

export function createReactiveGraph(): ReactiveGraph {
  const nodes = new Map<string, ReactiveNode>();
  return {
    nodes,
    add(node) {
      const existing = nodes.get(node.id);
      if (existing) return existing;
      const created: ReactiveNode = {
        id: node.id,
        kind: node.kind,
        uri: node.uri,
        range: node.range,
        deps: new Set(node.deps ?? []),
      };
      nodes.set(node.id, created);
      return created;
    },
    edge(from, to) {
      if (from === to) {
        const self = nodes.get(from);
        if (self) self.deps.add(to);
        return;
      }
      const src = nodes.get(from);
      const dst = nodes.get(to);
      if (!src || !dst) return;
      src.deps.add(to);
    },
  };
}
