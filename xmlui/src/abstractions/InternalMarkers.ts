/**
 * Internal marker symbols used to identify special object types in XMLUI.
 * These are implementation details and should not be used in user code.
 *
 * This file serves as the single source of truth for all internal markers,
 * making it easy to find and maintain marker usage throughout the codebase.
 */

/**
 * Marker property for parsed code declarations (from code-behind or script tags).
 * Objects with this property have been processed by the script parser and contain
 * structured syntax tree information.
 *
 * @example
 * ```typescript
 * // Created during code-behind collection
 * const declaration = {
 *   [PARSED_MARK_PROP]: true,
 *   tree: { type: 'ArrowExpression', ... }
 * };
 *
 * // Check if a value is parsed
 * if (isParsedCodeDeclaration(value)) {
 *   // Process the syntax tree
 * }
 * ```
 */
export const PARSED_MARK_PROP = "__PARSED__";

/**
 * Marker property for arrow expression objects.
 * Used to identify executable arrow expressions in the expression tree.
 * These represent user-defined functions that can be called.
 *
 * @example
 * ```typescript
 * // Arrow functions created during script execution
 * const arrowFn = {
 *   _ARROW_EXPR_: true,
 *   args: ['x', 'y'],
 *   statement: { ... },
 *   closureContext: [...]
 * };
 *
 * // Check if a value is an arrow function
 * if (isArrowExpressionObject(value)) {
 *   // Can be called as a function
 * }
 * ```
 */
export const ARROW_EXPR_MARK = "_ARROW_EXPR_";

/**
 * Marker property for parsed event values.
 * Used to identify pre-parsed event handler syntax trees.
 *
 * @internal
 * @deprecated - Consider consolidating event parsing with PARSED_MARK_PROP
 *
 * @example
 * ```typescript
 * const parsedEvent = {
 *   [PARSED_EVENT_MARK]: true,
 *   __PARSED: true,
 *   // ... parsed event structure
 * };
 * ```
 */
export const PARSED_EVENT_MARK = Symbol.for("__XMLUI_PARSED_EVENT__");

/**
 * Type guard for parsed code declarations.
 *
 * Checks if an object was processed by the script parser and contains
 * structured code representation (AST/syntax tree).
 *
 * @param value - The value to check
 * @returns `true` if the value is a parsed code declaration
 *
 * @example
 * ```typescript
 * const value = parseCodeBehind("const x = 5;");
 * if (isParsedCodeDeclaration(value)) {
 *   processAst(value.tree);
 * }
 * ```
 */
export function isParsedCodeDeclaration(value: unknown): value is any {
  return (
    typeof value === "object" &&
    value !== null &&
    PARSED_MARK_PROP in value &&
    (value as any)[PARSED_MARK_PROP] === true
  );
}

/**
 * Type guard for arrow expression objects.
 *
 * Checks if a value is an executable arrow function expression.
 * These can be called with appropriate context and arguments.
 *
 * @param value - The value to check
 * @returns `true` if the value is an arrow expression object
 *
 * @example
 * ```typescript
 * const fn = evaluateArrowExpression(node);
 * if (isArrowExpressionObject(fn)) {
 *   const result = executeFunction(fn, args);
 * }
 * ```
 */
export function isArrowExpressionObject(value: unknown): value is any {
  return (
    typeof value === "object" &&
    value !== null &&
    ARROW_EXPR_MARK in value &&
    (value as any)[ARROW_EXPR_MARK] === true
  );
}

/**
 * Type guard for parsed event values.
 *
 * Checks if a value represents a pre-parsed event handler.
 *
 * @param value - The value to check
 * @returns `true` if the value is a parsed event value
 *
 * @internal
 *
 * @example
 * ```typescript
 * if (isParsedEventValue(eventHandler)) {
 *   executeEventHandler(eventHandler);
 * }
 * ```
 */
export function isParsedEventValue(value: unknown): value is any {
  return (
    typeof value === "object" &&
    value !== null &&
    PARSED_EVENT_MARK in value &&
    (value as any).__PARSED === true
  );
}

/**
 * Marks an object as an arrow expression.
 *
 * Helper function to create properly marked arrow expression objects.
 *
 * @param obj - The base object to mark
 * @returns The marked object with arrow expression marker
 *
 * @internal
 *
 * @example
 * ```typescript
 * const arrowFn = markAsArrowExpression({
 *   args: ['x'],
 *   statement: { ... }
 * });
 * ```
 */
export function markAsArrowExpression<T extends object>(obj: T): T & { [ARROW_EXPR_MARK]: true } {
  (obj as any)[ARROW_EXPR_MARK] = true;
  return obj as T & { [ARROW_EXPR_MARK]: true };
}

/**
 * Marks an object as a parsed code declaration.
 *
 * Helper function to create properly marked parsed code declaration objects.
 *
 * @param obj - The base object to mark
 * @returns The marked object with parsed marker
 *
 * @internal
 *
 * @example
 * ```typescript
 * const codeDecl = markAsParsedCodeDeclaration({
 *   tree: syntaxTree
 * });
 * ```
 */
export function markAsParsedCodeDeclaration<T extends object>(obj: T): T & { [PARSED_MARK_PROP]: true } {
  (obj as any)[PARSED_MARK_PROP] = true;
  return obj as T & { [PARSED_MARK_PROP]: true };
}
