/**
 * Reactive cycle LSP diagnostic provider — Plan #03 Step 3.3 (W6-7).
 *
 * Given a parsed XMLUI document, build the reactive dependency graph
 * (`collectComponentDefGraph`), run Tarjan SCC cycle detection
 * (`findCycles`), and convert each hit into one LSP `Diagnostic`.
 *
 * Severity mapping (matches the runtime probe):
 *   - `CycleHit.severity === "warn"` → `DiagnosticSeverity.Warning`
 *   - `CycleHit.severity === "info"` → `DiagnosticSeverity.Information`
 *     (pure-conditional cycles inside `when` / `displayWhen`)
 *
 * The reactive-graph nodes do not currently carry per-node source ranges
 * (the `ComponentDef` walk in `collectComponentDefGraph` does not thread
 * positions yet). As a pragmatic first pass we emit one document-scoped
 * diagnostic at the start of the file with the cycle text in the message.
 * `relatedInformation` pointing at each node's range can be added once
 * `collectComponentDefGraph` is taught to propagate ranges.
 *
 * The analyzer must never crash the LSP server; any error from the graph
 * builder or cycle finder is swallowed and yields zero diagnostics.
 */
import {
  DiagnosticSeverity,
  type Diagnostic,
} from "vscode-languageserver";
import {
  collectComponentDefGraph,
  findCycles,
  formatCycle,
  cycleHash,
} from "../../components-core/reactive-graph";
import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";

/**
 * Compute reactive-cycle diagnostics for a single parsed document.
 *
 * `component` is the value returned by `xmlUiMarkupToComponent(...).component`
 * (or any equivalent `ComponentDef`/`CompoundComponentDef` root). When `null`
 * or analysis fails, returns `[]`.
 */
export function getReactiveCycleDiagnostics(
  component: ComponentDef | CompoundComponentDef | null | undefined,
): Diagnostic[] {
  if (!component) return [];

  try {
    const root = unwrapCompound(component);
    if (!root) return [];

    const graph = collectComponentDefGraph(root);
    const hits = findCycles(graph);
    if (!hits.length) return [];

    return hits.map((hit) => {
      const severity =
        hit.severity === "info"
          ? DiagnosticSeverity.Information
          : DiagnosticSeverity.Warning;
      return {
        severity,
        // Whole-document placeholder until per-node ranges are threaded.
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
        message: formatCycle(hit),
        code: "reactive-cycle",
        source: "xmlui-reactive-graph",
        // Use the cycle hash as an opaque data payload so editors can
        // dedupe across re-parses if they choose.
        data: { cycleId: cycleHash(hit) },
      } satisfies Diagnostic;
    });
  } catch {
    // Analyzer must never crash the LSP server.
    return [];
  }
}

/**
 * Compound components are wrapped in `{ type: "Component", component: ... }`.
 * The graph builder walks any `ComponentDef`, so unwrap to the inner tree
 * when present.
 */
function unwrapCompound(
  def: ComponentDef | CompoundComponentDef,
): ComponentDef | null {
  if (!def) return null;
  if ((def as CompoundComponentDef).component) {
    return (def as CompoundComponentDef).component as ComponentDef;
  }
  return def as ComponentDef;
}
