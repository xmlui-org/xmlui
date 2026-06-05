/**
 * Reactive cycle LSP diagnostic provider — Plan #03 Step 3.3 (W6-7).
 *
 * Given a parsed XMLUI document, build the reactive dependency graph
 * (`collectComponentDefGraph`), run Tarjan SCC cycle detection
 * (`findCycles`), and convert each hit into LSP diagnostics.
 *
 * Severity mapping (matches the runtime probe):
 *   - `CycleHit.severity === "warn"` → `DiagnosticSeverity.Warning`
 *   - `CycleHit.severity === "info"` → `DiagnosticSeverity.Information`
 *     (pure-conditional cycles inside `when` / `displayWhen`)
 *
 * Reactive-graph nodes carry parser-derived source positions when available.
 * Each cycle member receives its own diagnostic so editors underline every
 * declaration that participates in the loop. `relatedInformation` points at
 * each cycle member so editors can navigate the full loop from any marker.
 *
 * The analyzer must never crash the LSP server; any error from the graph
 * builder or cycle finder is swallowed and yields zero diagnostics.
 */
import {
  DiagnosticSeverity,
  type Diagnostic,
  type DiagnosticRelatedInformation,
  type Range,
} from "vscode-languageserver";
import {
  collectComponentDefGraph,
  findCycles,
  formatCycle,
  cycleHash,
  describeNode,
} from "../../components-core/reactive-graph";
import type { ReactiveNode } from "../../components-core/reactive-graph";
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
  options: { uri?: string } = {},
): Diagnostic[] {
  if (!component) return [];

  try {
    const root = unwrapCompound(component);
    if (!root) return [];

    const graph = collectComponentDefGraph(root);
    const hits = findCycles(graph);
    if (!hits.length) return [];

    return hits.flatMap((hit) => {
      const severity =
        hit.severity === "info"
          ? DiagnosticSeverity.Information
          : DiagnosticSeverity.Warning;
      const relatedInformation = relatedInformationFor(hit.nodes, options.uri);
      const cycleId = cycleHash(hit);
      return hit.nodes.map((node) => {
        return {
          severity,
          range: rangeForNode(node) ?? zeroRange(),
          message: formatCycle(hit),
          code: "reactive-cycle",
          source: "xmlui-reactive-graph",
          ...(relatedInformation.length > 0 ? { relatedInformation } : {}),
          // Use the cycle hash as an opaque data payload so editors can
          // dedupe across re-parses if they choose.
          data: { cycleId, nodeId: node.id },
        } satisfies Diagnostic;
      });
    });
  } catch {
    // Analyzer must never crash the LSP server.
    return [];
  }
}

function relatedInformationFor(
  nodes: ReactiveNode[],
  fallbackUri?: string,
): DiagnosticRelatedInformation[] {
  return nodes
    .map((node) => {
      const range = rangeForNode(node);
      const uri = node.uri ?? fallbackUri;
      if (!range || !uri) return null;
      return {
        location: { uri, range },
        message: describeNode(node),
      } satisfies DiagnosticRelatedInformation;
    })
    .filter((item): item is DiagnosticRelatedInformation => item !== null);
}

function rangeForNode(node: ReactiveNode | undefined): Range | null {
  if (!node?.range) return null;
  const line = Math.max(0, node.range.line - 1);
  const character = Math.max(0, node.range.col - 1);
  const length = Math.max(1, node.range.length ?? 1);
  return {
    start: { line, character },
    end: { line, character: character + length },
  };
}

function zeroRange(): Range {
  return {
    start: { line: 0, character: 0 },
    end: { line: 0, character: 0 },
  };
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
