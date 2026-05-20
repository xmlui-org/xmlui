/**
 * Pure utility functions for Container component.
 * These functions have zero dependencies on React, component state, or external context.
 */

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ArrowExpression } from "../script-runner/ScriptingSourceTree";
import { T_ARROW_EXPRESSION } from "../script-runner/ScriptingSourceTree";
import type { ParsedEventValue } from "../../abstractions/scripting/Compilation";

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
  const usesSet = new Set(uses);
  for (const key of uses) {
    if (key in parentState) {
      picked[key] = parentState[key];
    }

  }
  // Also pick Symbol-keyed entries whose description matches a name in `uses`.
  // Component APIs registered via `registerComponentApi` are stored under
  // `Symbol(uid)` AND under the string `uid` (see `mergeComponentApis`). The
  // string copy is what templates read (`{mySelect.value}`); the Symbol copy
  // is what the wrapped component renderer reads from `rendererContext.state`.
  // Narrowing must keep both copies so the wrapped component still sees its
  // own state slice when its container is scoped.
  for (const sym of Object.getOwnPropertySymbols(parentState)) {
    if (sym.description && usesSet.has(sym.description)) {
      picked[sym] = (parentState as any)[sym];
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
