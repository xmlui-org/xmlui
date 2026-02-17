/**
 * Pure utility functions for Container component.
 * These functions have zero dependencies on React, component state, or external context.
 */

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
  // Use lodash pick to extract only specified properties
  const picked: any = {};
  for (const key of uses) {
    if (key in parentState) {
      picked[key] = parentState[key];
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
