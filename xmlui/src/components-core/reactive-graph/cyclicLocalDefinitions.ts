import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { collectComponentDefGraph } from "./collectComponentDefGraph";
import { findCycles } from "./findCycles";

/**
 * Returns local var/function declaration names that participate in a detected
 * reactive cycle on the supplied component/container node.
 */
export function getCyclicLocalDefinitionNames(node: ComponentDef): Set<string> {
  const names = new Set<string>();
  const localDefinitionNames = new Set([
    ...Object.keys(node.vars ?? {}),
    ...Object.keys(node.functions ?? {}),
    ...Object.keys(node.scriptCollected?.vars ?? {}),
    ...Object.keys(node.scriptCollected?.functions ?? {}),
  ]);
  if (localDefinitionNames.size === 0) return names;

  const graphRoot = {
    ...node,
    vars: {
      ...node.vars,
      ...node.scriptCollected?.vars,
    },
    functions: {
      ...node.functions,
      ...node.scriptCollected?.functions,
    },
  } as ComponentDef;

  let hits: ReturnType<typeof findCycles>;
  try {
    hits = findCycles(collectComponentDefGraph(graphRoot));
  } catch {
    return names;
  }

  const ownerUid = node.uid ?? node.type ?? "anon";
  const ownerPrefix = `${ownerUid}.`;
  for (const hit of hits) {
    for (const graphNode of hit.nodes) {
      if (graphNode.kind !== "var" && graphNode.kind !== "function") continue;
      if (!graphNode.id.startsWith(ownerPrefix)) continue;
      const localName = localNameFromReactiveNodeId(graphNode.id);
      if (localDefinitionNames.has(localName)) {
        names.add(localName);
      }
    }
  }
  return names;
}

export function filterCyclicLocalDefinitions<T extends Record<string, unknown>>(
  definitions: T,
  cyclicNames: Set<string>,
): T {
  if (cyclicNames.size === 0) return definitions;
  return Object.fromEntries(
    Object.entries(definitions).filter(([key]) => !cyclicNames.has(key)),
  ) as T;
}

function localNameFromReactiveNodeId(id: string): string {
  const lastDot = id.lastIndexOf(".");
  return lastDot < 0 ? id : id.slice(lastDot + 1);
}
