import type { ParserDiagnostic } from "../../parser";
import { createXmluiIrId, createXmluiIrSourceRef, type XmluiIrIdParts } from "./ids";
import type {
  XmluiBindingIr,
  XmluiDefinitionIr,
  XmluiDependencySummary,
  XmluiIrId,
  XmluiModuleIr,
  XmluiNodeIr,
  XmluiScopeIr,
} from "./types";

export function emptyDependencySummary(): XmluiDependencySummary {
  return {
    reads: [],
    writes: [],
    invalidates: [],
  };
}

export function createIrId(parts: XmluiIrIdParts): XmluiIrId {
  return createXmluiIrId(parts);
}

export function createMinimalModuleIr({
  sourceId,
  kind,
  name,
  root,
  diagnostics = [],
}: {
  sourceId: string;
  kind: "app" | "component";
  name: string;
  root: XmluiNodeIr;
  diagnostics?: ParserDiagnostic[];
}): XmluiModuleIr {
  const definitionId = createIrId({ sourceId, kind: "definition", path: [kind], name });
  const scope = createMinimalScopeIr(sourceId, ["definition", name], root.id);
  const definition: XmluiDefinitionIr = {
    id: definitionId,
    kind,
    name,
    source: root.source,
    rootNodeId: root.id,
    root,
    scope,
    scopes: [scope],
    declarations: [],
    dependencies: emptyDependencySummary(),
  };

  return {
    version: 1,
    id: createIrId({ sourceId, kind: "module", path: [kind], name }),
    kind,
    sourceId,
    definition,
    referencedComponents: collectReferencedComponents(root),
    diagnostics,
    dependencies: emptyDependencySummary(),
  };
}

export function createMinimalScopeIr(
  sourceId: string,
  path: readonly (string | number)[],
  ownerNodeId?: XmluiIrId,
): XmluiScopeIr {
  return {
    id: createIrId({ sourceId, kind: "scope", path }),
    source: createXmluiIrSourceRef(sourceId, { sourceId, start: 0, end: 0 }),
    ...(ownerNodeId ? { ownerNodeId } : {}),
    allowImplicitGlobals: false,
    declarations: [],
  };
}

export function collectReferencedComponents(root: XmluiNodeIr): string[] {
  const names = new Set<string>();
  visit(root);
  return [...names].sort();

  function visit(node: XmluiNodeIr): void {
    if (node.kind === "component-reference") {
      names.add(node.name);
    }
    if ("children" in node) {
      node.children.forEach(visit);
    }
  }
}

export function attachBinding(node: XmluiNodeIr, binding: XmluiBindingIr): XmluiNodeIr {
  return {
    ...node,
    bindings: [...node.bindings, binding],
  } as XmluiNodeIr;
}
