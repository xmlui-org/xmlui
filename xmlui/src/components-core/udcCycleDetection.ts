import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";

/**
 * Walk a UDC body and return the set of component-type names that are
 * **unconditionally** referenced from it. A reference is considered
 * unconditional when it does not appear:
 *  - on a node with a `when` prop (regardless of its value), or any of its
 *    ancestors,
 *  - inside a template/slot prop (a prop value whose shape is itself a
 *    component definition tree, supplied by the call site of the UDC).
 *
 * The returned set is the input to the static UDC reference-graph used for
 * cycle detection.
 */
export function collectUnconditionalRefs(body: ComponentDef | undefined): Set<string> {
  const refs = new Set<string>();
  if (!body) return refs;
  visit(body, refs);
  return refs;
}

function visit(node: ComponentDef, refs: Set<string>): void {
  if (!node || typeof node !== "object") return;
  // A `when` on this node makes its rendering conditional — skip the entire
  // subtree from the static graph.
  if (node.when !== undefined && node.when !== null && node.when !== "") {
    return;
  }
  if (typeof node.type === "string" && node.type) {
    refs.add(node.type);
  }
  if (node.children) {
    for (const child of node.children) {
      visit(child, refs);
    }
  }
  if (node.slots) {
    for (const slotChildren of Object.values(node.slots)) {
      if (Array.isArray(slotChildren)) {
        for (const child of slotChildren) visit(child, refs);
      }
    }
  }
  // Template props (prop values that look like a component definition tree)
  // come from the call site, not from the UDC author, so they are
  // intentionally excluded from the static reference graph.
}

/**
 * Find every cycle (including self-loops) in a per-namespace UDC reference
 * graph. Returned chains are formatted as readable strings, e.g.
 *   "MyButton → MyText → MyButton".
 *
 * Only edges whose target is itself a registered UDC in the same graph are
 * considered. References to non-UDC components (built-ins, extensions in
 * other namespaces) are ignored — they cannot participate in a UDC cycle by
 * definition.
 */
export function findUdcCycles(graph: Map<string, Set<string>>): string[][] {
  const cycles: string[][] = [];
  const seenCycleKeys = new Set<string>();

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const name of graph.keys()) color.set(name, WHITE);

  const stack: string[] = [];

  function dfs(name: string): void {
    color.set(name, GRAY);
    stack.push(name);
    const refs = graph.get(name);
    if (refs) {
      for (const ref of refs) {
        if (!graph.has(ref)) continue; // not a UDC, can't form a UDC cycle
        const c = color.get(ref);
        if (c === GRAY) {
          // Found a back-edge → cycle from `ref` down to current top.
          const start = stack.indexOf(ref);
          if (start !== -1) {
            const cycle = stack.slice(start).concat(ref);
            const key = canonicalCycleKey(cycle);
            if (!seenCycleKeys.has(key)) {
              seenCycleKeys.add(key);
              cycles.push(cycle);
            }
          }
        } else if (c === WHITE) {
          dfs(ref);
        }
      }
    }
    stack.pop();
    color.set(name, BLACK);
  }

  for (const name of graph.keys()) {
    if (color.get(name) === WHITE) dfs(name);
  }
  return cycles;
}

// Rotate a cycle so the lexicographically smallest node is first; this lets us
// dedupe the same cycle discovered from different starting nodes.
function canonicalCycleKey(cycle: string[]): string {
  // cycle has the form [A, B, ..., A]; drop the trailing repeat for rotation.
  const core = cycle.slice(0, -1);
  let minIdx = 0;
  for (let i = 1; i < core.length; i++) {
    if (core[i] < core[minIdx]) minIdx = i;
  }
  const rotated = core.slice(minIdx).concat(core.slice(0, minIdx));
  return rotated.join("→");
}

/**
 * Convenience: collect refs for a `CompoundComponentDef`'s body.
 */
export function getUdcStaticRefs(def: CompoundComponentDef): Set<string> {
  return collectUnconditionalRefs(def?.component);
}
