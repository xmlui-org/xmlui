import type { Expression } from "./script-runner/ScriptingSourceTree";
import {
  T_MEMBER_ACCESS_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_IDENTIFIER,
  T_BINARY_EXPRESSION,
  T_UNARY_EXPRESSION,
  T_SEQUENCE_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_TEMPLATE_LITERAL_EXPRESSION,
  T_LITERAL,
  T_ARRAY_LITERAL,
  T_OBJECT_LITERAL,
  T_SPREAD_EXPRESSION,
  T_ASSIGNMENT_EXPRESSION,
  T_ARROW_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_POSTFIX_OP_EXPRESSION,
  T_AWAIT_EXPRESSION,
  T_NEW_EXPRESSION,
  T_REACTIVE_VAR_DECLARATION,
  T_NO_ARG_EXPRESSION,
  T_VAR_DECLARATION,
} from "./script-runner/ScriptingSourceTree";

// --- Theme variable reference pattern (same as ThemeProvider.tsx's resolveThemeVarToCssVars)
const THEME_VAR_REGEX = /\$([a-zA-Z][a-zA-Z0-9_-]*)/g;

/**
 * Walks an Expression AST and collects all `$props.<member>` references.
 * Returns a deduplicated list of property member names.
 */
export function extractPropsFromExpression(expr: Expression): string[] {
  const props = new Set<string>();
  walkExpression(expr, props);
  return [...props];
}

function walkExpression(expr: Expression, props: Set<string>): void {
  switch (expr.type) {
    case T_MEMBER_ACCESS_EXPRESSION:
      if (
        expr.obj.type === T_IDENTIFIER &&
        expr.obj.name === "$props"
      ) {
        props.add(expr.member);
      } else {
        walkExpression(expr.obj, props);
      }
      break;

    case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
      walkExpression(expr.obj, props);
      walkExpression(expr.member, props);
      break;

    case T_BINARY_EXPRESSION:
      walkExpression(expr.left, props);
      walkExpression(expr.right, props);
      break;

    case T_UNARY_EXPRESSION:
      walkExpression(expr.expr, props);
      break;

    case T_SEQUENCE_EXPRESSION:
      for (const e of expr.exprs) walkExpression(e, props);
      break;

    case T_CONDITIONAL_EXPRESSION:
      walkExpression(expr.cond, props);
      walkExpression(expr.thenE, props);
      walkExpression(expr.elseE, props);
      break;

    case T_FUNCTION_INVOCATION_EXPRESSION:
      walkExpression(expr.obj, props);
      if (expr.arguments) {
        for (const arg of expr.arguments) walkExpression(arg, props);
      }
      break;

    case T_TEMPLATE_LITERAL_EXPRESSION:
      for (const seg of expr.segments) {
        if ("type" in seg && seg.type !== T_LITERAL) {
          walkExpression(seg as Expression, props);
        }
      }
      break;

    case T_ARRAY_LITERAL:
      for (const item of expr.items) walkExpression(item, props);
      break;

    case T_OBJECT_LITERAL:
      for (const prop of expr.props) {
        if (Array.isArray(prop)) {
          walkExpression(prop[0], props);
          walkExpression(prop[1], props);
        } else {
          walkExpression(prop, props);
        }
      }
      break;

    case T_SPREAD_EXPRESSION:
      walkExpression(expr.expr, props);
      break;

    case T_ASSIGNMENT_EXPRESSION:
      walkExpression(expr.leftValue, props);
      walkExpression(expr.expr, props);
      break;

    case T_ARROW_EXPRESSION:
      // Don't walk args (they shadow variables), but walk the body
      // The body is a Statement, not an Expression — skip for now
      // (arrow bodies in attribute expressions are rare edge cases)
      break;

    case T_PREFIX_OP_EXPRESSION:
    case T_POSTFIX_OP_EXPRESSION:
      walkExpression(expr.expr, props);
      break;

    case T_AWAIT_EXPRESSION:
      walkExpression(expr.expr, props);
      break;

    case T_NEW_EXPRESSION:
      walkExpression(expr.callee, props);
      if (expr.arguments) {
        for (const arg of expr.arguments) walkExpression(arg, props);
      }
      break;

    case T_REACTIVE_VAR_DECLARATION:
      walkExpression(expr.expr, props);
      break;

    case T_VAR_DECLARATION:
      if (expr.expr) walkExpression(expr.expr, props);
      break;

    case T_IDENTIFIER:
    case T_LITERAL:
    case T_NO_ARG_EXPRESSION:
      // Leaf nodes — nothing to walk
      break;
  }
}

/**
 * Extracts theme variable references from a string value.
 * Theme variables follow the pattern `$<name>` where name matches `[a-zA-Z][a-zA-Z0-9_-]*`.
 * Returns a deduplicated list of theme variable names (without the `$` prefix).
 */
export function extractThemeVarsFromValue(value: string | undefined | null): string[] {
  if (!value || typeof value !== "string") return [];

  const vars = new Set<string>();
  let match: RegExpExecArray | null;
  // Reset lastIndex since the regex is global
  THEME_VAR_REGEX.lastIndex = 0;
  while ((match = THEME_VAR_REGEX.exec(value)) !== null) {
    vars.add(match[1]);
  }
  return [...vars];
}
