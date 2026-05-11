import { collectVariableDependencies } from "../script-runner/visitors";
import { parseParameterString } from "../script-runner/ParameterParser";
import { isParsedValue } from "../state/variable-resolution";
import type { ComponentDef } from "../../abstractions/ComponentDefs";

export const IMPLICIT_CONTAINER_COMPONENT_NAMES = new Set(["Select", "List", "Table", "DataGrid"]);

// Walk a plain-object AST tree collecting string-typed Identifier node names.
// Used as a fallback for event handler ASTs that use string type discriminators.
function gatherIdentifiers(node: unknown, acc: Set<string> = new Set()): Set<string> {
  if (node === null || node === undefined || typeof node !== "object") return acc;
  if (Array.isArray(node)) {
    for (const item of node) gatherIdentifiers(item, acc);
    return acc;
  }
  const obj = node as Record<string, unknown>;
  if (obj.type === "Identifier" && typeof obj.name === "string") {
    acc.add(obj.name);
  } else {
    for (const val of Object.values(obj)) gatherIdentifiers(val, acc);
  }
  return acc;
}

function rootIdentifier(dep: string): string {
  const dot = dep.indexOf(".");
  const bracket = dep.indexOf("[");
  if (dot === -1 && bracket === -1) return dep;
  if (dot === -1) return dep.slice(0, bracket);
  if (bracket === -1) return dep.slice(0, dot);
  return dep.slice(0, Math.min(dot, bracket));
}

function depsOfValue(value: unknown): string[] {
  try {
    if (value === null || value === undefined) return [];
    if (isParsedValue(value)) {
      return (collectVariableDependencies((value as any).tree) ?? []).map(rootIdentifier);
    }
    if (typeof value === "object") {
      const obj = value as any;
      // Real parsed AST: statements array with numeric-type nodes
      if (obj.statements && Array.isArray(obj.statements)) {
        try {
          const deps = collectVariableDependencies(obj.statements) ?? [];
          if (deps.length > 0) return deps.map(rootIdentifier);
        } catch {
          // fall through to generic walk
        }
        return Array.from(gatherIdentifiers(obj.statements)).map(rootIdentifier);
      }
      return [];
    }
    if (typeof value === "string") {
      const params = parseParameterString(value);
      const acc = new Set<string>();
      for (const part of params) {
        if (part.type !== "expression") continue;
        for (const id of collectVariableDependencies(part.value as any) ?? []) {
          acc.add(rootIdentifier(id));
        }
      }
      return Array.from(acc);
    }
    return [];
  } catch {
    return [];
  }
}

function depsOfRecord(record: Record<string, unknown> | undefined): Set<string> {
  const result = new Set<string>();
  if (!record) return result;
  for (const value of Object.values(record)) {
    for (const dep of depsOfValue(value)) {
      result.add(dep);
    }
  }
  return result;
}

export function computeUsesForSubtree(node: ComponentDef): Set<string> {
  const localDeclared = new Set<string>();
  if (node.vars) for (const k of Object.keys(node.vars)) localDeclared.add(k);
  if (node.functions) for (const k of Object.keys(node.functions)) localDeclared.add(k);
  if ((node as any).scriptCollected) {
    const sc = (node as any).scriptCollected;
    if (typeof sc === "object" && sc !== null) {
      for (const k of Object.keys(sc)) localDeclared.add(k);
    }
  }
  if (node.uid) localDeclared.add(node.uid);

  const usedHere = new Set<string>();
  const addDeps = (set: Set<string>) => { for (const d of set) usedHere.add(d); };

  addDeps(depsOfRecord(node.props as Record<string, unknown> | undefined));
  addDeps(depsOfRecord(node.vars));
  addDeps(depsOfRecord(node.events as Record<string, unknown> | undefined));
  addDeps(depsOfRecord(node.api as Record<string, unknown> | undefined));

  if (node.when !== undefined && node.when !== null && typeof node.when !== "boolean") {
    for (const d of depsOfValue(node.when)) usedHere.add(d);
  }
  if (node.responsiveWhen) {
    for (const v of Object.values(node.responsiveWhen)) {
      if (v !== undefined && v !== null && typeof v !== "boolean") {
        for (const d of depsOfValue(v)) usedHere.add(d);
      }
    }
  }

  const childFree = new Set<string>();
  const addChildFree = (set: Set<string>) => { for (const d of set) childFree.add(d); };

  if (node.children) {
    for (const child of node.children) addChildFree(computeUsesForSubtree(child));
  }
  if (node.loaders) {
    for (const loader of node.loaders) addChildFree(computeUsesForSubtree(loader));
  }
  if (node.slots) {
    for (const slotChildren of Object.values(node.slots)) {
      for (const child of slotChildren) addChildFree(computeUsesForSubtree(child));
    }
  }

  const totalFree = new Set<string>();
  for (const d of usedHere) if (!localDeclared.has(d)) totalFree.add(d);
  for (const d of childFree) if (!localDeclared.has(d)) totalFree.add(d);

  const isRegularContainer = !!(
    node.vars ||
    (node.loaders && node.loaders.length > 0) ||
    node.functions ||
    node.uses !== undefined ||
    node.contextVars ||
    (node as any).scriptCollected
  );
  const isImplicitDefault = IMPLICIT_CONTAINER_COMPONENT_NAMES.has(node.type) && totalFree.size > 0;
  const isContainer = isRegularContainer || isImplicitDefault;

  if (isContainer && node.uses === undefined) {
    node.computedUses = Array.from(totalFree);
    return new Set(node.computedUses);
  }

  return totalFree;
}

export function computeUsesForTree(root: ComponentDef): void {
  computeUsesForSubtree(root);
}
