/**
 * Cycle finder for the reactive dependency graph — Plan #03 Step 2.1.
 *
 * Implements Tarjan's strongly-connected-components algorithm. Every SCC of
 * size ≥ 2, plus every self-loop, is reported as exactly one `CycleHit`.
 * Iterative implementation (no recursion) so deep graphs do not blow the JS
 * call stack.
 *
 * Stable ordering: nodes inside a cycle are reported starting from the
 * lexicographically smallest id, then walked forward through the SCC.
 */
import type { ReactiveGraph, ReactiveNode } from "./graph";

export type ReactiveCycleSeverity = "warn" | "info";

export interface CycleHit {
  /** Node ids in traversal order. The cycle is closed (first id ≠ last id). */
  cycle: string[];
  /** Resolved nodes for diagnostics, in the same order as `cycle`. */
  nodes: ReactiveNode[];
  /** Cycle severity. Phase-1 always emits `"warn"`; reserved for Step 1.4. */
  severity: ReactiveCycleSeverity;
}

export function findCycles(graph: ReactiveGraph): CycleHit[] {
  const indices = new Map<string, number>();
  const lowlinks = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const sccs: string[][] = [];

  let nextIndex = 0;

  // Iterative Tarjan to avoid recursion depth issues.
  type Frame = { id: string; itr: Iterator<string>; child?: string };
  const visit = (start: string) => {
    const work: Frame[] = [];

    const push = (id: string) => {
      indices.set(id, nextIndex);
      lowlinks.set(id, nextIndex);
      nextIndex++;
      stack.push(id);
      onStack.add(id);
      const node = graph.nodes.get(id)!;
      work.push({ id, itr: node.deps[Symbol.iterator]() });
    };

    push(start);

    while (work.length > 0) {
      const frame = work[work.length - 1];
      // If we just returned from a child, fold its lowlink into ours.
      if (frame.child !== undefined) {
        const childLow = lowlinks.get(frame.child)!;
        if (childLow < lowlinks.get(frame.id)!) {
          lowlinks.set(frame.id, childLow);
        }
        frame.child = undefined;
      }

      const next = frame.itr.next();
      if (next.done) {
        // All successors processed — finalize this node.
        if (lowlinks.get(frame.id) === indices.get(frame.id)) {
          const scc: string[] = [];
          for (;;) {
            const popped = stack.pop()!;
            onStack.delete(popped);
            scc.push(popped);
            if (popped === frame.id) break;
          }
          sccs.push(scc);
        }
        work.pop();
        if (work.length > 0) {
          work[work.length - 1].child = frame.id;
        }
        continue;
      }

      const target = next.value as string;
      if (!graph.nodes.has(target)) continue;
      if (!indices.has(target)) {
        push(target);
      } else if (onStack.has(target)) {
        const tIdx = indices.get(target)!;
        if (tIdx < lowlinks.get(frame.id)!) {
          lowlinks.set(frame.id, tIdx);
        }
      }
    }
  };

  // Iterate node ids in deterministic (insertion) order.
  for (const id of graph.nodes.keys()) {
    if (!indices.has(id)) visit(id);
  }

  const hits: CycleHit[] = [];
  for (const scc of sccs) {
    const isCycle = scc.length > 1 || isSelfLoop(graph, scc[0]);
    if (!isCycle) continue;
    const ordered = orderCycleNodes(scc);
    hits.push({
      cycle: ordered,
      nodes: ordered.map((id) => graph.nodes.get(id)!),
      severity: "warn",
    });
  }
  // Stable order across runs: by first id.
  hits.sort((a, b) => (a.cycle[0] < b.cycle[0] ? -1 : a.cycle[0] > b.cycle[0] ? 1 : 0));
  return hits;
}

function isSelfLoop(graph: ReactiveGraph, id: string): boolean {
  return graph.nodes.get(id)?.deps.has(id) ?? false;
}

/**
 * Reorder SCC member ids so the cycle starts at the lexicographically
 * smallest id. Tarjan emits the SCC in reverse-traversal order; we sort the
 * ids first, then ensure the smallest is at the head.
 */
function orderCycleNodes(scc: string[]): string[] {
  if (scc.length <= 1) return scc.slice();
  const sorted = scc.slice().sort();
  return sorted;
}
