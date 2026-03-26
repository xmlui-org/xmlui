import type {
  ComponentDef,
  CompoundComponentDef,
  ComponentMetadata,
  ComponentPropertyMetadata,
} from "../abstractions/ComponentDefs";
import type { ParsedPropertyValue, ParsedEventValue } from "../abstractions/scripting/Compilation";
import type { Expression } from "./script-runner/ScriptingSourceTree";
import { parseParameterString } from "./script-runner/ParameterParser";
import { parseLayoutProperty } from "./theming/parse-layout-props";
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

// --- Type guards

function isParsedPropertyValue(value: unknown): value is ParsedPropertyValue {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).__PARSED === true &&
    "segments" in value
  );
}

function isParsedEventValue(value: unknown): value is ParsedEventValue {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).__PARSED === true &&
    "statements" in value
  );
}

function isComponentDef(value: unknown): value is ComponentDef {
  return typeof value === "object" && value !== null && typeof (value as any).type === "string";
}

/**
 * Recursively visits every ComponentDef node in a tree, invoking the visitor
 * for each node (including the root).
 *
 * Traversal covers:
 * - `children` array
 * - `loaders` array
 * - `slots` (each slot's ComponentDef[] array)
 * - `props` values that are ComponentDef objects (template props)
 * - `events` values that are ComponentDef objects (inline template handlers)
 */
export function walkComponentDefTree(
  def: ComponentDef,
  visitor: (node: ComponentDef) => void,
): void {
  visitor(def);

  if (Array.isArray(def.children)) {
    for (const child of def.children) {
      if (isComponentDef(child)) {
        walkComponentDefTree(child, visitor);
      }
    }
  }

  if (Array.isArray(def.loaders)) {
    for (const loader of def.loaders) {
      if (isComponentDef(loader)) {
        walkComponentDefTree(loader, visitor);
      }
    }
  }

  if (def.slots) {
    for (const slotChildren of Object.values(def.slots)) {
      if (Array.isArray(slotChildren)) {
        for (const child of slotChildren) {
          if (isComponentDef(child)) {
            walkComponentDefTree(child, visitor);
          }
        }
      }
    }
  }

  if (def.props) {
    for (const value of Object.values(def.props)) {
      if (isComponentDef(value)) {
        walkComponentDefTree(value, visitor);
      }
    }
  }

  if (def.events) {
    for (const value of Object.values(def.events)) {
      if (isComponentDef(value)) {
        walkComponentDefTree(value, visitor);
      }
    }
  }
}

/**
 * Walks a ComponentDef tree and collects all `$props.<member>` references
 * found in props, events, and vars of every node.
 *
 * Returns a deduplicated list of property names.
 */
export function collectPropsFromComponentDef(def: ComponentDef): string[] {
  const found = new Set<string>();

  walkComponentDefTree(def, (node) => {
    extractPropsFromRecord(node.props, found);
    extractPropsFromRecord(node.vars, found);
    extractPropsFromEventRecord(node.events, found);
    // `when` is a special directive stored directly on the ComponentDef, not in props
    extractPropsFromRawString(node.when, found);
  });

  return [...found];
}

function extractPropsFromRecord(
  record: Record<string, any> | undefined,
  out: Set<string>,
): void {
  if (!record) return;
  for (const value of Object.values(record)) {
    if (typeof value === "string") {
      // Prop values are stored as raw strings from the XML parser (e.g., "{$props.label}")
      // Parse them on-the-fly to extract expression segments.
      try {
        const segments = parseParameterString(value);
        for (const segment of segments) {
          if (segment.type === "expression") {
            for (const prop of extractPropsFromExpression(segment.value)) {
              out.add(prop);
            }
          }
        }
      } catch {
        // Ignore parse errors in static analysis
      }
    } else if (isParsedPropertyValue(value) && value.segments) {
      // Pre-parsed form (used by extension/package components)
      for (const segment of value.segments) {
        if (segment.expr) {
          for (const prop of extractPropsFromExpression(segment.expr)) {
            out.add(prop);
          }
        }
      }
    }
  }
}

function extractPropsFromEventRecord(
  record: Record<string, any> | undefined,
  out: Set<string>,
): void {
  if (!record) return;
  for (const value of Object.values(record)) {
    if (isParsedEventValue(value) && value.statements) {
      for (const stmt of value.statements) {
        // Walk statement-level expressions using the statement visitor
        extractPropsFromStatement(stmt, out);
      }
    }
  }
}

function extractPropsFromRawString(
  value: string | boolean | undefined,
  out: Set<string>,
): void {
  if (typeof value !== "string") return;
  try {
    const segments = parseParameterString(value);
    for (const segment of segments) {
      if (segment.type === "expression") {
        for (const prop of extractPropsFromExpression(segment.value)) {
          out.add(prop);
        }
      }
    }
  } catch {
    // Ignore parse errors in static analysis
  }
}

function extractPropsFromStatement(stmt: any, out: Set<string>): void {
  if (!stmt || typeof stmt !== "object") return;
  // Delegate to expression-level walking for common statement types
  switch (stmt.type) {
    case "ExpressionStatement":
    case "ArrowExpressionStatement":
      if (stmt.expr) extractPropsFromExprIntoSet(stmt.expr, out);
      break;
    case "ReturnStatement":
    case "ThrowStatement":
      if (stmt.expr) extractPropsFromExprIntoSet(stmt.expr, out);
      break;
    case "IfStatement":
      if (stmt.cond) extractPropsFromExprIntoSet(stmt.cond, out);
      if (stmt.thenB) extractPropsFromStatement(stmt.thenB, out);
      if (stmt.elseB) extractPropsFromStatement(stmt.elseB, out);
      break;
    case "BlockStatement":
      if (Array.isArray(stmt.stmts)) {
        for (const s of stmt.stmts) extractPropsFromStatement(s, out);
      }
      break;
    case "LetStatement":
    case "ConstStatement":
    case "VarStatement":
      if (Array.isArray(stmt.decls)) {
        for (const decl of stmt.decls) {
          if (decl.expr) extractPropsFromExprIntoSet(decl.expr, out);
        }
      }
      break;
    default:
      // For any other statement, try common sub-expression fields
      for (const key of ["expr", "cond", "left", "right", "obj", "body"]) {
        if (stmt[key] && typeof stmt[key] === "object") {
          if ("type" in stmt[key]) {
            extractPropsFromExprIntoSet(stmt[key], out);
          }
        }
      }
      break;
  }
}

function extractPropsFromExprIntoSet(expr: Expression, out: Set<string>): void {
  for (const prop of extractPropsFromExpression(expr)) {
    out.add(prop);
  }
}

/**
 * Walks a ComponentDef tree and collects all theme variable references found in
 * layout property string values (e.g., `padding="$space-2"` → `"space-2"`).
 *
 * Only plain string values are analyzed — props that use expression syntax
 * (`{...}`) are skipped because they are dynamic and not statically analyzable.
 *
 * Returns a `Record<string, string>` with theme variable names as keys and `""`
 * as values (matching the convention of `parseScssVar` output).
 */
export function collectThemeVarsFromComponentDef(
  def: ComponentDef,
): Record<string, string> {
  const result: Record<string, string> = {};

  walkComponentDefTree(def, (node) => {
    if (!node.props) return;
    for (const [key, value] of Object.entries(node.props)) {
      // Only process recognized layout properties
      const parsed = parseLayoutProperty(key);
      if (typeof parsed === "string") continue; // parse error → not a layout prop

      // Only plain string values — skip expressions (they contain "{")
      if (typeof value !== "string" || value.includes("{")) continue;

      // Extract $<themeVar> references from the value
      for (const themeVar of extractThemeVarsFromValue(value)) {
        result[themeVar] = "";
      }
    }
  });

  return result;
}

/**
 * Generates a `ComponentMetadata` object for a user-defined component by
 * statically analysing its CompoundComponentDef.
 *
 * Extracted metadata:
 * - `status: "stable"`
 * - `description`: includes the component name
 * - `props`: all `$props.<member>` references found in the component tree
 * - `themeVars`: all `$<themeVar>` references in layout property values
 */
export function generateUdComponentMetadata(
  compoundDef: CompoundComponentDef,
): ComponentMetadata {
  const innerDef = compoundDef.component as ComponentDef;
  const propNames = collectPropsFromComponentDef(innerDef);
  const themeVars = collectThemeVarsFromComponentDef(innerDef);

  const props = Object.fromEntries(
    propNames.map((name) => [
      name,
      { description: "" } satisfies ComponentPropertyMetadata,
    ]),
  ) as Record<string, ComponentPropertyMetadata>;

  return {
    status: "stable",
    description: `User-defined component: ${compoundDef.name}`,
    props,
    themeVars,
  };
}
