/**
 * Pure utility functions for Container component.
 * These functions have zero dependencies on React, component state, or external context.
 */

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ArrowExpression } from "../script-runner/ScriptingSourceTree";
import { T_ARROW_EXPRESSION } from "../script-runner/ScriptingSourceTree";
import type { ParsedEventValue } from "../../abstractions/scripting/Compilation";
import { UNSTABLE_GLOBAL_VARS } from "../state/unstableGlobalVars";
import { collectVariableDependencies } from "../script-runner/visitors";

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a ParsedEventValue.
 * ParsedEventValues are pre-parsed event handler statements with metadata.
 *
 * @param value - The value to check
 * @returns True if the value is a ParsedEventValue
 */
export function isParsedEventValue(
  value: string | ParsedEventValue | ArrowExpression,
): value is ParsedEventValue {
  return value != null && (value as ParsedEventValue).__PARSED === true;
}

/**
 * Type guard to check if a value is an ArrowExpression.
 * ArrowExpressions represent arrow function syntax in the XMLUI scripting tree.
 *
 * @param value - The value to check
 * @returns True if the value is an ArrowExpression
 */
export function isArrowExpression(
  value: string | ParsedEventValue | ArrowExpression,
): value is ArrowExpression {
  return value != null && (value as ArrowExpression).type === T_ARROW_EXPRESSION;
}

// ============================================================================
// CONTAINER DETECTION
// ============================================================================

/**
 * Options for {@link isContainerLike}.
 */
export type IsContainerLikeOptions = {
  /**
   * When `true`, treat empty `vars` / `loaders` / `functions` objects as
   * "not a container". Use this for static analysis (computedUses) where the
   * StandaloneApp merge produces truthy empty `vars: {}` and `functions: {}`
   * on every compound component — treating those as containers would falsely
   * narrow the dependency set.
   *
   * When `false` (default — runtime semantics), any truthy `vars` / `loaders` /
   * `functions` flags the node as a container so the runtime wrapper logic
   * remains backwards compatible.
   */
  strict?: boolean;

  /**
   * When `true`, ignore `node.computedUses` when deciding container-ness.
   * Use this from the computedUses analyzer itself (which is in the process
   * of writing `computedUses`); the runtime should leave it `false` so that
   * already-computed scoping promotes a node to container.
   */
  ignoreComputedUses?: boolean;
};

/**
 * Single source of truth for "does this component definition need a state
 * container at runtime / form a state-scope boundary for static analysis".
 *
 * Two callers historically maintained their own predicates:
 *   • `ContainerWrapper.tsx` (runtime wrapping decision)
 *   • `computedUses.ts` (static narrowing analysis)
 *
 * The static-analysis version had to be stricter to avoid being fooled by
 * the StandaloneApp merge which assigns truthy empty `vars: {}` to every
 * compound component. To unify them we expose this single helper with a
 * `strict` flag.
 */
export function isContainerLike(
  node: Pick<
    ComponentDef,
    | "type"
    | "loaders"
    | "vars"
    | "uses"
    | "computedUses"
    | "contextVars"
    | "functions"
    | "scriptCollected"
  >,
  options: IsContainerLikeOptions = {},
): boolean {
  if (node.type === "Container") {
    return true;
  }

  const { strict = false, ignoreComputedUses = false } = options;

  const hasVars = strict
    ? !!(node.vars && Object.keys(node.vars).length > 0)
    : !!node.vars;
  const hasLoaders = strict
    ? !!(node.loaders && node.loaders.length > 0)
    : !!node.loaders;
  const hasFunctions = strict
    ? !!(node.functions && Object.keys(node.functions).length > 0)
    : !!node.functions;
  const hasUses = strict ? node.uses !== undefined : !!node.uses;
  const hasComputedUses = !ignoreComputedUses && !!node.computedUses;

  return !!(
    hasVars ||
    hasLoaders ||
    hasFunctions ||
    hasUses ||
    hasComputedUses ||
    node.contextVars ||
    node.scriptCollected
  );
}

// ============================================================================
// STATE SCOPING
// ============================================================================

/**
 * Extracts scoped state based on the `uses` property.
 * When a container specifies `uses`, it creates a state boundary and only
 * includes the specified properties from parent state.
 *
 * @param parentState - The parent container's state
 * @param uses - Array of property names to include (undefined = all, empty = none)
 * @returns Filtered state object
 *
 * @example
 * // Include only 'user' from parent:
 * extractScopedState({ user: {...}, count: 5 }, ['user'])
 * // Returns: { user: {...} }
 *
 * // Create empty boundary:
 * extractScopedState(parentState, [])
 * // Returns: {}
 */
export function extractScopedState<T extends Record<string, any>>(
  parentState: T,
  uses?: string[],
): T | undefined {
  if (!uses) {
    return parentState;
  }
  if (uses.length === 0) {
    // Empty uses array creates a state boundary with no parent state
    return {} as T;
  }
  const picked: any = {};
  for (const key of uses) {
    if (key in parentState) {
      picked[key] = parentState[key];
    }
  }
  // Always preserve ALL Symbol-keyed entries.
  // Component APIs registered via `registerComponentApi` are stored under
  // `Symbol(uid)` AND the string `uid` (see `mergeComponentApis`). The string
  // copy is what templates read (`{mySelect.value}`); the Symbol copy is what
  // the wrapped component renderer reads via `rendererContext.state`
  // (ComponentAdapter.tsx: `state: state[uid] || EMPTY_OBJECT`).
  //
  // Each component instance owns its own slice (e.g. Checkbox's `value`) under
  // its Symbol. These are internal component-state slots, not external names
  // consumers subscribe to via `uses`. Filtering them by `sym.description`
  // strips the wrapped component's own slice whenever its uid is NOT in
  // `uses` (or its uid is empty/undefined) — `state.value` then resolves to
  // undefined and `updateState` updates are invisible. See Group P regression
  // in `Checkbox.spec.ts` "$checked/$setChecked has no meaning outside
  // component": Fragment.computedUses=["$checked"] stripped the Checkbox's
  // value Symbol, so Toggle's value stayed false even after the initial
  // updateState. Preserving all Symbols keeps reactive narrowing for string
  // names while leaving component-instance state intact.
  for (const sym of Object.getOwnPropertySymbols(parentState)) {
    picked[sym] = (parentState as any)[sym];
  }
  // Always preserve $-prefixed keys that came from a lexical-scope ancestor
  // (e.g. `$item` injected by Column row, `$param` set by ModalDialog.open).
  // These are framework-injected via ancestor MemoizedItem `contextVars`; they
  // live in parent state but are NOT subscribable consumer state. Filtering
  // them by `uses` breaks lexical scope through implicit containers.
  //
  // We explicitly check for common framework variables using 'in' to ensure
  // they are picked up even if not enumerable (e.g. from a Proxy prototype).
  const FRAMEWORK_VARS = ["$item", "$itemIndex", "$isFirst", "$isLast", "$context", "$props", "$cell", "$row", "$rowIndex", "$isSelected", "$value", "$setValue", "$data", "$completedItems", "$queuedItems"];
  for (const key of FRAMEWORK_VARS) {
    if (key in parentState && !(key in picked)) {
      picked[key] = (parentState as any)[key];
    }
  }

  // Also preserve any other $-prefixed keys that are enumerable
  for (const key of Object.keys(parentState)) {
    if (
      typeof key === "string" &&
      key.startsWith("$") &&
      !UNSTABLE_GLOBAL_VARS.has(key) &&
      !(key in picked)
    ) {
      picked[key] = (parentState as any)[key];
    }
  }
  return picked;
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Error thrown when code-behind or script parsing fails.
 * Formats module errors into a readable error message.
 */
export class CodeBehindParseError extends Error {
  constructor(
    errors: Record<string, Array<{ code?: string; text: string; line?: number; column?: number }>>,
  ) {
    const mainErrors = errors["Main"] || [];
    const messages = mainErrors.map((errorMessage) => {
      let ret = `${errorMessage.code} : ${errorMessage.text}`;
      const posInfo = [];
      if (errorMessage.line !== undefined) {
        posInfo.push(`line:${errorMessage.line}`);
      }
      if (errorMessage.column !== undefined) {
        posInfo.push(`column:${errorMessage.column}`);
      }
      if (posInfo.length) {
        ret = `${ret} (${posInfo.join(", ")})`;
      }
      return ret;
    });
    super(messages.join("\n"));
    Object.setPrototypeOf(this, CodeBehindParseError.prototype);
  }
}

/**
 * Error thrown when variable resolution fails.
 * Wraps the original error with context about which variable failed.
 */
export class ParseVarError extends Error {
  constructor(varName: string, originalError: any) {
    super(`Error on var: ${varName} - ${originalError?.message || "unknown"}`);
    Object.setPrototypeOf(this, ParseVarError.prototype);
  }
}

/**
 * Cache of function-typed key sets per globalVars object reference.
 * All containers rendered in the same pass receive the same `parentGlobalVars`
 * reference, so the first call populates the cache and subsequent calls hit it.
 * The WeakMap releases entries automatically when the vars object is GC'd.
 */
const _globalFunctionKeysCache = new WeakMap<Record<string, any>, Set<string>>();

function getGlobalFunctionKeys(vars: Record<string, any>): Set<string> {
  let keys = _globalFunctionKeysCache.get(vars);
  if (!keys) {
    keys = new Set<string>();
    for (const [key, value] of Object.entries(vars)) {
      if (!key.startsWith("__") && typeof value === "function") {
        keys.add(key);
      }
    }
    _globalFunctionKeysCache.set(vars, keys);
  }
  return keys;
}

/**
 * Narrows a `parentGlobalVars` record to only the keys actually read by a
 * component subtree (according to `computedGlobalUses`).
 *
 * - Globals.xs **functions** are always forwarded — they may be invoked from any
 *   expression in the subtree and cannot be narrowed away safely.
 * - `__tree_*` metadata keys (expression ASTs used for dep-tracking inside
 *   `useGlobalVariables`) are forwarded only when their corresponding variable
 *   name is in the uses set.
 * - All other keys are forwarded only when listed in `uses`.
 * - The uses set is expanded transitively: if global X depends on global Y
 *   (expressed via `__tree_X` AST), Y is also included so dep-tracking in
 *   `useGlobalVariables` can compute the correct depMap entry for X.
 */
export function narrowGlobalVars(
  vars: Record<string, any>,
  uses: readonly string[],
): Record<string, any> {
  const usesSet = new Set(uses);

  // Expand usesSet transitively: for each included global, if its __tree_* AST
  // references other globals, include those too. Without this, dep-tracking
  // inside useGlobalVariables would see undefined for transitive deps of X
  // when only X (not its dependency Y) is in the uses set.
  let changed = true;
  while (changed) {
    changed = false;
    for (const key of usesSet) {
      const tree = vars[`__tree_${key}`];
      if (tree && typeof tree === "object") {
        for (const dep of collectVariableDependencies(tree)) {
          if (!dep.startsWith("__") && !usesSet.has(dep) && dep in vars) {
            usesSet.add(dep);
            changed = true;
          }
        }
      }
    }
  }

  const functionKeys = getGlobalFunctionKeys(vars);
  const result: Record<string, any> = {};

  for (const key of functionKeys) {
    result[key] = vars[key];
  }
  for (const [key, value] of Object.entries(vars)) {
    if (functionKeys.has(key)) continue;
    if (key.startsWith("__tree_")) {
      // Include AST metadata only for vars that are in the (expanded) uses set.
      const varName = key.slice(7); // "__tree_".length === 7
      if (usesSet.has(varName)) {
        result[key] = value;
      }
    } else if (usesSet.has(key)) {
      result[key] = value;
    }
  }
  return result;
}
