/**
 * Computes the minimal set of parent-scope state names that each implicit
 * container actually reads, storing the result in `node.computedUses`.
 *
 * Side effects: mutates `node.computedUses` in-place for every node that
 * acts as a container (has vars/loaders/functions/etc.) and does not already
 * carry an explicit `uses` list.
 *
 * When called: once at transform/boot time, after the full `ComponentDef`
 * tree has been built and before the reactive graph is wired up.
 */
import { depsOfValue } from "../script-runner/visitors";
import type { ComponentDef } from "../../abstractions/ComponentDefs";

export const IMPLICIT_CONTAINER_COMPONENT_NAMES = new Set(["Select", "List", "Table", "DataGrid"]);

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
  if (node.scriptCollected) {
    // Code-behind declarations are scoped to this node — treat them as local.
    const sc = node.scriptCollected;
    for (const k of Object.keys(sc)) localDeclared.add(k);
  }
  if (node.uid) localDeclared.add(node.uid);
  if (node.loaders) {
    for (const loader of node.loaders) {
      if (loader.uid) localDeclared.add(loader.uid);
    }
  }

  const usedHere = new Set<string>();

  for (const d of depsOfRecord(node.props as Record<string, unknown> | undefined)) usedHere.add(d);
  for (const d of depsOfRecord(node.vars)) usedHere.add(d);
  for (const d of depsOfRecord(node.events as Record<string, unknown> | undefined)) usedHere.add(d);
  for (const d of depsOfRecord(node.api as Record<string, unknown> | undefined)) usedHere.add(d);
  for (const d of depsOfRecord(node.functions as Record<string, unknown> | undefined)) usedHere.add(d);

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

  // Collect deps from the entire subtree below this node.
  // Loaders are recursed as full ComponentDef subtrees because they can carry
  // their own children (e.g. a DataSource with nested transforms), and any
  // identifiers they reference must bubble up through the container hierarchy.
  const childDeps = new Set<string>();

  if (node.children) {
    for (const child of node.children) {
      for (const d of computeUsesForSubtree(child)) childDeps.add(d);
    }
  }
  if (node.loaders) {
    for (const loader of node.loaders) {
      for (const d of computeUsesForSubtree(loader)) childDeps.add(d);
    }
  }
  if (node.slots) {
    for (const slotChildren of Object.values(node.slots)) {
      for (const child of slotChildren) {
        for (const d of computeUsesForSubtree(child)) childDeps.add(d);
      }
    }
  }

  // Strip names that are declared at this level — they don't need to be
  // requested from a parent container.
  const totalFree = new Set<string>();
  for (const d of usedHere) if (!localDeclared.has(d)) totalFree.add(d);
  for (const d of childDeps) if (!localDeclared.has(d)) totalFree.add(d);

  const isRegularContainer = !!(
    node.vars ||
    (node.loaders && node.loaders.length > 0) ||
    node.functions ||
    node.uses !== undefined ||
    node.contextVars ||
    node.scriptCollected
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
