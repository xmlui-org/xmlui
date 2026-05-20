/**
 * Shared AST helpers for analyzer rules that need to inspect expression text
 * carried on a `ComponentDef` (var values, event handlers, bound props).
 *
 * The XMLUI markup parser only pre-parses event handlers into
 * `{ __PARSED, statements, source }` form. Var values and bound prop values
 * remain raw strings; these helpers parse them on demand via the scripting
 * `Parser` and cache the result per call.
 *
 * All helpers are pure, synchronous, and never throw — parse failures yield
 * `undefined` so rules can skip the offending value.
 */

import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import { Parser } from "../../../parsers/scripting/Parser";
import {
  T_ARROW_EXPRESSION,
  T_ARROW_EXPRESSION_STATEMENT,
  T_BLOCK_STATEMENT,
  T_CONST_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FUNCTION_DECLARATION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_LET_STATEMENT,
  T_MEMBER_ACCESS_EXPRESSION,
  T_VAR_STATEMENT,
  type Expression,
  type FunctionInvocationExpression,
  type Identifier,
  type MemberAccessExpression,
  type Statement,
} from "../../script-runner/ScriptingSourceTree";

// ---------------------------------------------------------------------------
// Expression-string extraction
// ---------------------------------------------------------------------------

/**
 * `{expression}` binding test — matches the runtime's own binding detector.
 * The runtime treats a string as an expression when it has the form `{ ... }`
 * (possibly with surrounding whitespace).
 */
const BINDING_RE = /^\s*\{[\s\S]*\}\s*$/;

/**
 * Return the inner expression text from a `{...}` binding string, or
 * `undefined` if the string is not a binding.
 */
export function unwrapBinding(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!BINDING_RE.test(value)) return undefined;
  const trimmed = value.trim();
  return trimmed.slice(1, -1);
}

/**
 * A pre-parsed event-handler value as produced by the markup transform:
 * `{ __PARSED: true, statements, source }`.
 */
export interface ParsedHandlerValue {
  __PARSED: true;
  statements: Statement[];
  source: string;
}

export function isParsedHandler(value: unknown): value is ParsedHandlerValue {
  return (
    value !== null &&
    typeof value === "object" &&
    (value as ParsedHandlerValue).__PARSED === true &&
    Array.isArray((value as ParsedHandlerValue).statements)
  );
}

// ---------------------------------------------------------------------------
// On-demand parsing
// ---------------------------------------------------------------------------

/**
 * Parse a raw expression string into an `Expression` AST node.
 * Returns `undefined` on parse failure or empty input.
 */
export function parseExpression(source: string): Expression | undefined {
  if (!source || !source.trim()) return undefined;
  try {
    const parser = new Parser(source);
    const expr = parser.parseExpr(true);
    if (!expr) return undefined;
    if (parser.errors && parser.errors.length > 0) return undefined;
    return expr;
  } catch {
    return undefined;
  }
}

/**
 * Parse a raw statement-list string (event handler bodies).
 * Returns `undefined` on parse failure.
 */
export function parseStatements(source: string): Statement[] | undefined {
  if (!source || !source.trim()) return undefined;
  try {
    const parser = new Parser(source);
    const stmts = parser.parseStatements();
    if (!stmts) return undefined;
    if (parser.errors && parser.errors.length > 0) return undefined;
    return stmts;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Expression AST walker
// ---------------------------------------------------------------------------

/**
 * Visit every expression and statement node in a sub-tree depth-first.
 * The visitor may return `false` to skip the current node's children.
 */
export function walkAstNodes(
  node: Expression | Statement | undefined | null,
  visitor: (n: any) => boolean | void,
): void {
  if (!node) return;
  const descend = visitor(node);
  if (descend === false) return;

  // Statement-shaped nodes carry their bodies under specific field names; we
  // walk known shapes generically by iterating own properties.
  for (const key of Object.keys(node as any)) {
    if (key === "startToken" || key === "endToken" || key === "type" || key === "nodeId") continue;
    const child = (node as any)[key];
    if (child == null) continue;
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === "object" && "type" in item) {
          walkAstNodes(item as any, visitor);
        }
      }
    } else if (typeof child === "object" && "type" in child) {
      walkAstNodes(child as any, visitor);
    }
  }
}

export function walkStatements(
  stmts: ReadonlyArray<Statement> | undefined | null,
  visitor: (n: any) => boolean | void,
): void {
  if (!stmts) return;
  for (const s of stmts) walkAstNodes(s as any, visitor);
}

// ---------------------------------------------------------------------------
// Identifier collection
// ---------------------------------------------------------------------------

/** Result of a single identifier reference. */
export interface IdentifierRef {
  name: string;
  /**
   * `true` when the identifier is the **left-most** segment of a chain such as
   * `foo.bar.baz` or `foo()`. Used to distinguish a binding (root) from a
   * member name. Plain identifiers are also `root`.
   */
  isRoot: boolean;
  /** When the identifier roots a `obj.member(...)` chain, this is the member name. */
  invokedMember?: string;
  /** When the identifier roots a chain, the deepest member name in the chain. */
  trailingMember?: string;
}

/**
 * Collect all identifier references from an expression sub-tree.
 *
 * Distinguishes between:
 *   - the **root** identifier of a member-access / invocation chain
 *     (`myButton` in `myButton.flash()`) — `isRoot: true`
 *   - identifiers that appear in nested expression positions
 *     (`x` inside `obj[x]`) — `isRoot: true`
 *
 * Member names (`.flash`) are not treated as identifiers because the parser
 * stores them as the `member: string` field on `MemberAccessExpression`.
 */
export function collectIdentifierRefs(
  node: Expression | Statement | undefined | null,
): IdentifierRef[] {
  const out: IdentifierRef[] = [];
  if (!node) return out;

  walkAstNodes(node, (n) => {
    // Only catch identifiers at the "root" of a chain — when our parent is
    // either nothing (top of walk) or anything other than the `obj` slot of a
    // MemberAccessExpression / FunctionInvocationExpression we still emit.
    // The cleanest filter: every Identifier node is a real binding reference.
    if (n.type === T_IDENTIFIER) {
      out.push({ name: (n as Identifier).name, isRoot: true });
      return false; // identifiers have no children worth walking
    }
    return undefined;
  });

  return out;
}

/**
 * Find every chain rooted at an identifier: `<ident>.member[.member...]
 * [(args)]`. Returns one entry per chain with the root identifier name,
 * the deepest member name, and whether the chain is invoked.
 */
export interface RootedChain {
  rootName: string;
  /** Member names in order from root to leaf. Empty when the root identifier is used bare. */
  memberPath: string[];
  /** `true` when the chain is invoked (`foo.bar()` or `foo()`). */
  invoked: boolean;
}

export function collectRootedChains(
  node: Expression | Statement | undefined | null,
): RootedChain[] {
  const chains: RootedChain[] = [];
  if (!node) return chains;

  // Track nodes we've already accounted for as part of a chain so we don't
  // double-count nested chains.
  const consumed = new WeakSet<object>();

  walkAstNodes(node, (n) => {
    if (consumed.has(n)) return false;

    // Case 1: foo (bare identifier, never visited via parent because we
    // short-circuit below) — handled in the identifier-collection pass.

    // Case 2: foo.bar.baz or foo.bar() — start from the outermost
    // FunctionInvocation or the outermost MemberAccess that is not itself
    // the `obj` of another MemberAccess / FunctionInvocation.
    if (n.type === T_MEMBER_ACCESS_EXPRESSION || n.type === T_FUNCTION_INVOCATION_EXPRESSION) {
      // Walk down the chain and collect.
      const memberPath: string[] = [];
      let invoked = false;
      let cur: any = n;

      // Unwrap the outermost invocation
      if (cur.type === T_FUNCTION_INVOCATION_EXPRESSION) {
        invoked = true;
        cur = (cur as FunctionInvocationExpression).obj;
      }

      while (cur && cur.type === T_MEMBER_ACCESS_EXPRESSION) {
        memberPath.unshift((cur as MemberAccessExpression).member);
        consumed.add(cur);
        cur = (cur as MemberAccessExpression).obj;
      }

      if (cur && cur.type === T_IDENTIFIER) {
        consumed.add(cur);
        chains.push({
          rootName: (cur as Identifier).name,
          memberPath,
          invoked,
        });
        consumed.add(n);
        return false; // we've fully consumed this chain; no need to descend further
      }
      // Not rooted at an identifier — keep walking to find inner chains.
      return undefined;
    }
    return undefined;
  });

  return chains;
}

// ---------------------------------------------------------------------------
// Var / param declaration collection
// ---------------------------------------------------------------------------

/** Identifiers declared by a `let` / `const` / `var` / `function` statement. */
export function collectDeclaredNames(
  stmts: ReadonlyArray<Statement> | undefined | null,
): string[] {
  const names: string[] = [];
  if (!stmts) return names;

  for (const s of stmts) {
    if (!s || typeof s !== "object") continue;
    if (s.type === T_LET_STATEMENT || s.type === T_CONST_STATEMENT) {
      for (const d of (s as any).decls ?? []) {
        if (d?.id) names.push(d.id);
      }
    } else if (s.type === T_VAR_STATEMENT) {
      for (const d of (s as any).decls ?? []) {
        if (d?.id?.name) names.push(d.id.name);
      }
    } else if (s.type === T_FUNCTION_DECLARATION) {
      const id = (s as any).id;
      if (id?.name) names.push(id.name);
    }
  }
  return names;
}

// ---------------------------------------------------------------------------
// Component-tree expression extractor
// ---------------------------------------------------------------------------

/**
 * One expression value found on a `ComponentDef`, with enough context for a
 * rule to issue a precise diagnostic.
 */
export interface ComponentExpression {
  /** The component node this expression belongs to. */
  owner: ComponentDef;
  /** Where the expression came from: a prop, event, var, or api method body. */
  kind: "prop" | "event" | "var" | "api";
  /** The prop/event/var/api name. */
  name: string;
  /** Raw source of the expression (without `{...}` wrapper if any). */
  source: string;
  /**
   * Parsed AST. For event/api handlers this is the statement list; for vars
   * and bound props this is a single `Expression`. Either may be `undefined`
   * if the source failed to parse.
   */
  expr?: Expression;
  statements?: Statement[];
}

/**
 * Yield every expression-valued attribute on `node` (its props, events, vars,
 * api methods). Does not descend into children — callers compose with
 * `walkComponentDef` for that.
 */
export function* iterComponentExpressions(node: ComponentDef): Iterable<ComponentExpression> {
  // --- Props (only `{...}` binding values qualify as expressions)
  if (node.props && typeof node.props === "object") {
    for (const [name, value] of Object.entries(node.props)) {
      const inner = unwrapBinding(value);
      if (inner === undefined) continue;
      const expr = parseExpression(inner);
      yield { owner: node, kind: "prop", name, source: inner, expr };
    }
  }

  // --- Events (markup parser pre-parses these as ParsedHandlerValue)
  if (node.events && typeof node.events === "object") {
    for (const [name, value] of Object.entries(node.events)) {
      if (isParsedHandler(value)) {
        yield {
          owner: node,
          kind: "event",
          name,
          source: value.source,
          statements: value.statements,
        };
      } else if (typeof value === "string") {
        const inner = unwrapBinding(value) ?? value;
        const stmts = parseStatements(inner);
        yield { owner: node, kind: "event", name, source: inner, statements: stmts };
      }
    }
  }

  // --- Vars (raw string values, may or may not be wrapped in `{...}`)
  if (node.vars && typeof node.vars === "object") {
    for (const [name, value] of Object.entries(node.vars)) {
      if (typeof value !== "string") continue;
      const inner = unwrapBinding(value) ?? value;
      const expr = parseExpression(inner);
      yield { owner: node, kind: "var", name, source: inner, expr };
    }
  }

  // --- API methods (same pre-parsed shape as events)
  if (node.api && typeof node.api === "object") {
    for (const [name, value] of Object.entries(node.api)) {
      if (isParsedHandler(value)) {
        yield {
          owner: node,
          kind: "api",
          name,
          source: value.source,
          statements: value.statements,
        };
      } else if (typeof value === "string") {
        const stmts = parseStatements(value);
        yield { owner: node, kind: "api", name, source: value, statements: stmts };
      }
    }
  }
}

// ---------------------------------------------------------------------------
// uid → componentType map
// ---------------------------------------------------------------------------

/**
 * Build a flat `uid → componentType` map for an entire `ComponentDef` tree.
 *
 * uids in XMLUI are globally unique within a single `<App>` scope, so a flat
 * map is sufficient for cross-binding rules that look up "is `foo` a known
 * component id?".
 */
export function collectUidMap(root: ComponentDef): Map<string, string> {
  const out = new Map<string, string>();

  function visit(node: ComponentDef): void {
    if (node.uid && typeof node.uid === "string") {
      out.set(node.uid, node.type);
    }
    if (node.children) {
      for (const c of node.children) visit(c as ComponentDef);
    }
    if (node.slots) {
      for (const slotChildren of Object.values(node.slots)) {
        for (const c of slotChildren) visit(c as ComponentDef);
      }
    }
    if (node.loaders) {
      for (const l of node.loaders) visit(l as ComponentDef);
    }
  }

  visit(root);
  return out;
}

// Re-export node-type constants commonly needed by rule implementations.
export {
  T_ARROW_EXPRESSION,
  T_ARROW_EXPRESSION_STATEMENT,
  T_BLOCK_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_MEMBER_ACCESS_EXPRESSION,
  T_VAR_STATEMENT,
  T_LET_STATEMENT,
  T_CONST_STATEMENT,
};
