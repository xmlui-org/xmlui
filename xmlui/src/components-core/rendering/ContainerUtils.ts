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
