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
import { collectVariableDependencies } from "../script-runner/visitors";
import { parseParameterString } from "../script-runner/ParameterParser";
import { isParsedValue } from "../state/variable-resolution";
import type { CodeDeclaration } from "../script-runner/ScriptingSourceTree";
import type { ComponentDef } from "../../abstractions/ComponentDefs";

export const IMPLICIT_CONTAINER_COMPONENT_NAMES = new Set(["Select", "List", "Table", "DataGrid"]);

/**
 * Walk a plain-object AST tree collecting Identifier node names.
 *
 * This fallback is needed for event handler ASTs that arrive with string-typed
 * `type` discriminators (e.g. `"Identifier"`, `"ExpressionStatement"`) rather
 * than the numeric constants the real scripting parser emits. This format
 * appears when event handler objects are constructed directly (e.g. in tests
 * or via JSON-serialised ASTs) instead of being produced by the scripting
 * parser. `collectVariableDependencies` only handles the numeric-discriminator
 * format, so we fall back to a structural walk for the string-discriminator
 * case.
 */
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
      // isParsedValue narrows to CodeDeclaration, which has a typed .tree field.
      return (collectVariableDependencies((value as CodeDeclaration).tree) ?? []).map(rootIdentifier);
    }
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      // Raw event handler AST: has a `statements` array with numeric-type nodes.
      // Try the fast path first; fall back to structural walk for string-discriminator ASTs.
      if (obj.statements && Array.isArray(obj.statements)) {
        // Detect string-discriminator ASTs (e.g. from tests or JSON-serialised event handlers).
        // collectVariableDependencies only handles numeric-discriminator ASTs; for string-
        // discriminator ASTs it silently returns [] without throwing, so we must check the
        // format explicitly before deciding which path to take.
        const hasStringDiscriminators =
          obj.statements.length > 0 &&
          typeof (obj.statements[0] as any)?.type === "string";
        if (hasStringDiscriminators) {
          return Array.from(gatherIdentifiers(obj.statements)).map(rootIdentifier);
        }
        try {
          return (collectVariableDependencies(obj.statements) ?? []).map(rootIdentifier);
        } catch {
          // collectVariableDependencies failed — fall back to generic identifier walk.
          return Array.from(gatherIdentifiers(obj.statements)).map(rootIdentifier);
        }
      }
      return [];
    }
    if (typeof value === "string") {
      const params = parseParameterString(value);
      const acc = new Set<string>();
      for (const part of params) {
        if (part.type !== "expression") continue;
        // part.value is Expression — the type parseParameterString returns for expression sections.
        for (const id of collectVariableDependencies(part.value) ?? []) {
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
