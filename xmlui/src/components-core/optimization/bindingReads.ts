/**
 * Read sets: the member paths a container's bindings read (#3941).
 *
 * The rule proposed on #3941 is that a component re-renders only when
 * something one of its bindings read has changed. This module answers the
 * first half: for a container's definition, which state paths (`ds.value`,
 * `expanded`, `slider.value`) do its bindings read? The `render:pass` trace
 * checks each cause of a pass against it (inspector/render-logging.ts).
 *
 * The read set is static, collected from the definition: props, vars, `when`,
 * `responsiveWhen`, loader props, markup passed as props (templates) and
 * code-behind, anywhere under the container. Event handlers are left out:
 * they read state when they run, not when the container renders. A
 * code-behind function counts in full, because a binding may call it.
 *
 * It over-approximates: a binding behind a `when` that is false still counts,
 * and computed access (`a[b].c`) counts as reading all of `a`. So a cause it
 * calls unread is truly unread by any binding, and the share of passes it
 * reports as unnecessary is a lower bound. When the definition can't be
 * analysed, the result is `"all"`: everything counts as read.
 *
 * The result depends only on the definition, so it is cached per node.
 */
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { PARSED_MARK_PROP } from "../../abstractions/InternalMarkers";
import { collectVariableDependencies, gatherIdentifiers } from "../script-runner/visitors";
import { parseParameterString } from "../script-runner/ParameterParser";
import { isParsedValue } from "../state/variable-resolution";

export type BindingReadPaths = ReadonlySet<string> | "all";

const cache = new WeakMap<object, BindingReadPaths>();

/** The member paths read by bindings anywhere in `node`'s definition, or `"all"` */
export function bindingReadPathsOf(node: ComponentDef): BindingReadPaths {
  let reads = cache.get(node);
  if (reads === undefined) {
    try {
      reads = computeReadPaths(node);
    } catch {
      reads = "all";
    }
    cache.set(node, reads);
  }
  return reads;
}

/**
 * Whether a binding reading `readPaths` sees a change to `changedPath`: a read
 * path equal to it, under it (`ds.value.length` for `ds.value`) or above it
 * (`ds` for `ds.value`).
 */
export function isPathRead(readPaths: BindingReadPaths, changedPath: string): boolean {
  if (readPaths === "all") return true;
  for (const read of readPaths) {
    if (overlaps(read, changedPath)) return true;
  }
  return false;
}

/** The read paths under a uid or key, e.g. `["ds.value"]` for `ds` */
export function readPathsUnder(readPaths: BindingReadPaths, root: string): string[] {
  if (readPaths === "all") return [];
  return Array.from(readPaths).filter((read) => read === root || isUnder(read, root));
}

function overlaps(a: string, b: string): boolean {
  return a === b || isUnder(a, b) || isUnder(b, a);
}

function isUnder(path: string, root: string): boolean {
  return path.startsWith(root + ".") || path.startsWith(root + "[");
}

function isComponentDef(value: unknown): value is ComponentDef {
  return typeof value === "object" && value !== null && typeof (value as any).type === "string";
}

/** A failure to analyse a value means the read set is unknown: count everything */
class Unanalysable extends Error {}

/**
 * The read paths of one value, as `depsOfValueWithReads` (script-runner/visitors.ts)
 * finds them, but with member paths kept rather than cut to root names.
 */
function readPathsOfValue(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (isParsedValue(value)) return collectVariableDependencies(value.tree) ?? [];
  if (typeof value === "string") {
    const paths: string[] = [];
    for (const part of parseParameterString(value)) {
      if (part.type === "expression") paths.push(...(collectVariableDependencies(part.value) ?? []));
    }
    return paths;
  }
  if (typeof value === "object") {
    const statements = (value as any).statements;
    if (Array.isArray(statements)) {
      // --- String-discriminator ASTs aren't handled by the structured visitor;
      // --- fall back to a flat gather of names, as depsOfValueWithReads does
      if (statements.length > 0 && typeof statements[0]?.type === "string") {
        return Array.from(gatherIdentifiers(statements));
      }
      return collectVariableDependencies(statements) ?? [];
    }
  }
  return [];
}

function computeReadPaths(root: ComponentDef): BindingReadPaths {
  const paths = new Set<string>();
  const seen = new Set<object>();
  let readsAll = false;

  const add = (found: string[]) => found.forEach((path) => paths.add(path));

  const addValue = (value: unknown) => {
    if (value === null || value === undefined) return;
    if (typeof value === "boolean" || typeof value === "number") return;
    // --- Templates and other markup passed as props are part of this definition
    if (isComponentDef(value)) {
      visit(value);
      return;
    }
    if (Array.isArray(value) && value.some(isComponentDef)) {
      value.forEach(addValue);
      return;
    }
    try {
      add(readPathsOfValue(value));
    } catch {
      throw new Unanalysable();
    }
  };

  const addRecord = (record: Record<string, unknown> | undefined) => {
    if (record) Object.values(record).forEach(addValue);
  };

  // --- Code-behind functions are ArrowExpressions; wrap them as parsed values
  // --- the same way computedUses does (collectScriptFunctionDeps)
  const addFunctions = (functions: Record<string, unknown> | undefined) => {
    if (!functions) return;
    Object.values(functions).forEach((fn) => {
      if (!fn || typeof fn !== "object") return;
      addValue((fn as any)[PARSED_MARK_PROP] ? fn : { [PARSED_MARK_PROP]: true, tree: fn });
    });
  };

  function visit(node: ComponentDef) {
    if (seen.has(node)) return;
    seen.add(node);
    const def = node as any;
    addRecord(def.props);
    addRecord(def.vars);
    addRecord(def.api);
    addValue(def.when);
    addRecord(def.responsiveWhen);
    addFunctions(def.functions);
    addFunctions(def.scriptCollected?.functions);
    addRecord(def.scriptCollected?.vars);
    if (def.scriptCollected?.hasInvalidStatements || def.scriptCollected?.hasUnresolvableImports) {
      readsAll = true;
    }
    (def.loaders as ComponentDef[] | undefined)?.forEach(visit);
    (def.children as ComponentDef[] | undefined)?.forEach(visit);
  }

  try {
    visit(root);
  } catch (e) {
    if (e instanceof Unanalysable) return "all";
    throw e;
  }
  return readsAll ? "all" : paths;
}
