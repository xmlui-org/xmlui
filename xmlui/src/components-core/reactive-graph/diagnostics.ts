/**
 * Reactive cycle diagnostics — Plan #03 Step 2.2.
 *
 * Pure formatting helpers + a typed `Error` subclass. Used by the runtime
 * trace emitter (Step 3.1), the LSP provider (W6), and the Vite plugin
 * (W6).
 */
import type { CycleHit } from "./findCycles";
import type { ReactiveNode } from "./graph";

export class ReactiveCycleError extends Error {
  constructor(public readonly hit: CycleHit) {
    super(formatCycle(hit));
    this.name = "ReactiveCycleError";
  }
}

/**
 * Render a `CycleHit` as a multi-line, human-readable diagnostic. Example:
 *
 *   Reactive cycle detected (2 nodes):
 *     var Form#users.currentId   (Main.xmlui:14:7)
 *       → DataSource Form#users.list   (Main.xmlui:8:5)
 *       → var Form#users.currentId
 */
export function formatCycle(hit: CycleHit): string {
  const header = `Reactive cycle detected (${hit.nodes.length} ${
    hit.nodes.length === 1 ? "node" : "nodes"
  })${hit.severity === "info" ? " (conditional)" : ""}:`;
  const rows: string[] = [header];
  for (let i = 0; i < hit.nodes.length; i++) {
    const node = hit.nodes[i];
    const prefix = i === 0 ? "  " : "    \u2192 ";
    rows.push(`${prefix}${describeNode(node)}`);
  }
  // Close the cycle by repeating the first node.
  if (hit.nodes.length > 0) {
    rows.push(`    \u2192 ${describeNode(hit.nodes[0])}`);
  }
  return rows.join("\n");
}

/**
 * Compact one-line representation of a single node — used for nested error
 * messages and the LSP `relatedInformation` payload.
 */
export function describeNode(node: ReactiveNode): string {
  const kindLabel = kindLabelFor(node.kind);
  const loc = node.uri || node.range
    ? ` (${[node.uri, node.range?.line, node.range?.col].filter((x) => x !== undefined).join(":")})`
    : "";
  return `${kindLabel} ${node.id}${loc}`;
}

/**
 * Stable hash of a cycle, used to deduplicate runtime warn entries within a
 * session. Two cycles with the same node set produce the same hash regardless
 * of starting point.
 */
export function cycleHash(hit: CycleHit): string {
  return hit.cycle.slice().sort().join("|");
}

function kindLabelFor(kind: ReactiveNode["kind"]): string {
  switch (kind) {
    case "var": return "var";
    case "loader": return "DataSource";
    case "function": return "function";
    case "prop": return "prop";
  }
}
