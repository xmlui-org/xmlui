import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse, type ParseResult } from "@babel/parser";
import type { File } from "@babel/types";

/**
 * AST-based optimizer-metadata extractor.
 *
 * Reads `.tsx` component sources at Vite plugin startup, finds the
 * `createMetadata({...})` literal, and pulls out the optimizer-relevant
 * subset (`optimization.*` + per-event `injectedVars`). Used only by the
 * `optimizerSourceDirs` extension-build path; the runtime path uses
 * `ComponentMetadata` directly via `createMetadata`.
 *
 * Replaces the previous regex extractor (commit 097fec782). The regex
 * version had two implicit author-facing constraints that produced silent
 * stripping of injected variables when violated:
 *
 *   1. `injectedVars` had to be the first field in each `events.{name}`
 *      object so a back-tracking regex could find the enclosing event name.
 * Both classes of hazard are gone now: the AST walker resolves keys
 * positionally inside the actual object expression, and comments are not
 * part of the AST.
 */

/**
 * Optimizer-relevant subset extracted from a component source file.
 * After extraction, these fields mirror what createMetadata spreads into ComponentMetadata.
 */
export type OptimizerMeta = {
  isImplicitContainerByDefault?: boolean;
  unstableChildInjectedVars?: readonly string[];
  contextVars?: Record<string, Record<never, never>>;
  events?: Record<string, { injectedVars?: readonly string[] }>;
};

type AnyNode = Record<string, any>;

function parseSource(source: string): ParseResult<File> | null {
  try {
    return parse(source, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      errorRecovery: true,
    });
  } catch {
    return null;
  }
}

function getPropertyKeyName(prop: AnyNode): string | null {
  if (prop.type !== "ObjectProperty" || prop.computed) return null;
  if (prop.key.type === "Identifier") return prop.key.name;
  if (prop.key.type === "StringLiteral") return prop.key.value;
  return null;
}

function findProperty(obj: AnyNode | null | undefined, name: string): AnyNode | null {
  if (!obj || obj.type !== "ObjectExpression") return null;
  for (const prop of obj.properties) {
    if (getPropertyKeyName(prop) === name) return prop.value;
  }
  return null;
}

function asStaticStringArray(node: AnyNode | null | undefined): string[] | null {
  if (!node || node.type !== "ArrayExpression") return null;
  const out: string[] = [];
  for (const el of node.elements) {
    if (!el || el.type !== "StringLiteral") return null;
    out.push(el.value);
  }
  return out;
}

function isBooleanTrue(node: AnyNode | null | undefined): boolean {
  return !!node && node.type === "BooleanLiteral" && node.value === true;
}

function declarationsOf(stmt: AnyNode): AnyNode[] {
  if (!stmt) return [];
  if (stmt.type === "VariableDeclaration") return stmt.declarations ?? [];
  if (
    stmt.type === "ExportNamedDeclaration" &&
    stmt.declaration?.type === "VariableDeclaration"
  ) {
    return stmt.declaration.declarations ?? [];
  }
  return [];
}

/**
 * Locate the first `createMetadata({...})` call expression in the file and
 * return its first-argument ObjectExpression node. Returns null if not found
 * or if the argument is dynamic (spread / variable / function call).
 */
function findCreateMetadataObject(ast: ParseResult<File>): AnyNode | null {
  for (const stmt of ast.program.body) {
    for (const decl of declarationsOf(stmt as AnyNode)) {
      const init = decl.init;
      if (
        init?.type === "CallExpression" &&
        init.callee?.type === "Identifier" &&
        init.callee.name === "createMetadata"
      ) {
        const arg = init.arguments?.[0];
        if (arg?.type === "ObjectExpression") return arg;
      }
    }
  }
  return null;
}

/**
 * Extract optimizer-relevant metadata fields from a component source file.
 * Reads from the `optimization: { ... }` block and per-event `injectedVars`
 * inside the `events: { ... }` block of the first `createMetadata({...})`
 * call. Only static values are extracted — dynamic computed values, spreads,
 * or non-literal expressions are silently skipped.
 *
 * Returns an OptimizerMeta (empty if no metadata block found).
 */
export function extractOptimizerMetadataFromSource(source: string): OptimizerMeta {
  const result: OptimizerMeta = {};

  const ast = parseSource(source);
  if (!ast) return result;

  const meta = findCreateMetadataObject(ast);
  if (!meta) return result;

  const optimization = findProperty(meta, "optimization");
  if (optimization?.type === "ObjectExpression") {
    if (isBooleanTrue(findProperty(optimization, "isImplicitContainerByDefault"))) {
      result.isImplicitContainerByDefault = true;
    }
    const unstableVars = asStaticStringArray(
      findProperty(optimization, "unstableChildInjectedVars"),
    );
    if (unstableVars && unstableVars.length > 0) result.unstableChildInjectedVars = unstableVars;
  }

  // Extract contextVars keys only — values are empty objects by design.
  // The optimizer reads only Object.keys(contextVars); descriptions and
  // isInternal flags live in the runtime metadata and the generated snapshot,
  // not here.
  const contextVarsNode = findProperty(meta, "contextVars");
  if (contextVarsNode?.type === "ObjectExpression") {
    const ctx: Record<string, Record<never, never>> = {};
    for (const prop of contextVarsNode.properties) {
      const key = getPropertyKeyName(prop);
      if (key) ctx[key] = {};
    }
    result.contextVars = ctx;
  }

  const events = findProperty(meta, "events");
  if (events?.type === "ObjectExpression") {
    for (const prop of events.properties) {
      const eventName = getPropertyKeyName(prop);
      if (!eventName || prop.value?.type !== "ObjectExpression") continue;
      const injected = asStaticStringArray(findProperty(prop.value, "injectedVars"));
      if (!injected || injected.length === 0) continue;
      if (!result.events) result.events = {};
      result.events[eventName] = { injectedVars: injected };
    }
  }

  return result;
}

const COMPONENT_NAME_RE = /^[A-Z][A-Za-z0-9]*$/;

/**
 * Extract the registered component type name from a source file.
 * Recognised patterns (resolved via AST, so comments cannot mislead):
 *
 *   - `wrap<Suffix>("TypeName", ...)` — any function whose identifier starts
 *     with `wrap` (covers `wrapComponent`, `wrapCompound`, and any future
 *     wrappers extension packages introduce).
 *   - `const COMP = "TypeName"` / `const COMP_NAME = "TypeName"` — the
 *     legacy declaration form.
 */
export function extractComponentName(source: string): string | null {
  const ast = parseSource(source);
  if (!ast) return null;

  const wrapMatch = findWrapCallName(ast.program as AnyNode);
  if (wrapMatch) return wrapMatch;

  for (const stmt of ast.program.body) {
    for (const decl of declarationsOf(stmt as AnyNode)) {
      if (decl.id?.type !== "Identifier") continue;
      if (!/^COMP(_NAME)?$/.test(decl.id.name)) continue;
      if (decl.init?.type === "StringLiteral" && COMPONENT_NAME_RE.test(decl.init.value)) {
        return decl.init.value;
      }
    }
  }

  return null;
}

const AST_SKIP_FIELDS = new Set(["loc", "range", "start", "end", "leadingComments", "trailingComments", "innerComments"]);

function findWrapCallName(root: AnyNode): string | null {
  const stack: AnyNode[] = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (!node || typeof node !== "object") continue;

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "Identifier" &&
      /^wrap[A-Z][A-Za-z0-9]*$/.test(node.callee.name)
    ) {
      const arg = node.arguments?.[0];
      if (arg?.type === "StringLiteral" && COMPONENT_NAME_RE.test(arg.value)) {
        return arg.value;
      }
    }

    for (const key of Object.keys(node)) {
      if (AST_SKIP_FIELDS.has(key)) continue;
      const value = node[key];
      if (!value) continue;
      if (Array.isArray(value)) {
        for (const child of value) if (child && typeof child === "object") stack.push(child);
      } else if (typeof value === "object") {
        stack.push(value);
      }
    }
  }
  return null;
}

function listTsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      out.push(...listTsxFiles(p));
    } else if (
      entry.endsWith(".tsx") &&
      !entry.endsWith("React.tsx") &&
      !entry.endsWith(".spec.tsx") &&
      !entry.includes(".test.")
    ) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Walk every node in a Babel AST, calling `visit` on each.
 * Skips non-object and non-array values to avoid traversing scalar leaves.
 */
function walkAst(node: AnyNode, visit: (n: AnyNode) => void): void {
  if (!node || typeof node !== "object") return;
  visit(node);
  for (const val of Object.values(node)) {
    if (Array.isArray(val)) val.forEach((child) => walkAst(child, visit));
    else if (val && typeof val === "object" && typeof val.type === "string") walkAst(val, visit);
  }
}

/**
 * Extract all `$`-prefixed keys that are injected into child scope or event
 * payload anywhere in the source file. Two injection shapes are recognised:
 *
 *   (a) JSX `contextVars` attribute:
 *         <MemoizedItem contextVars={{ $item: ..., $index: ... }} />
 *
 *   (b) Event-handler `context` option:
 *         lookupAction("evt", uid, { context: { $data, $error } })
 *
 * Uses the Babel AST parser so comments are invisible to the scanner — a
 * commented-out `contextVars={{ $gone: x }}` is never reported.
 *
 * Only static, non-computed `$`-prefixed keys are collected. Dynamic keys
 * (`[varName]: val`) cannot be statically determined and are skipped.
 */
export function extractInjectedKeysFromSource(source: string): readonly string[] {
  const ast = parseSource(source);
  if (!ast) return [];

  const keys = new Set<string>();

  walkAst(ast as AnyNode, (node) => {
    // (a) JSXAttribute: contextVars={{ $x: val, $y: val }}
    if (
      node.type === "JSXAttribute" &&
      node.name?.type === "JSXIdentifier" &&
      node.name.name === "contextVars" &&
      node.value?.type === "JSXExpressionContainer" &&
      node.value.expression?.type === "ObjectExpression"
    ) {
      for (const prop of node.value.expression.properties) {
        const k = getPropertyKeyName(prop);
        if (k?.startsWith("$")) keys.add(k);
      }
    }

    // (b) ObjectExpression with a `context: { $x, $y }` property
    if (node.type === "ObjectExpression") {
      for (const prop of node.properties) {
        if (
          prop.type === "ObjectProperty" &&
          getPropertyKeyName(prop) === "context" &&
          prop.value?.type === "ObjectExpression"
        ) {
          for (const inner of prop.value.properties) {
            const k = getPropertyKeyName(inner);
            if (k?.startsWith("$")) keys.add(k);
          }
        }
      }
    }
  });

  return [...keys];
}

/**
 * Build a Record<componentTypeName, OptimizerMeta> by scanning all *.tsx files in `dir`.
 * Used by the Vite plugin at build time to extract metadata directly from component source files.
 * Only components that have at least one optimizer field are included.
 */
export function extractOptimizerMetadataFromDir(dir: string): Record<string, OptimizerMeta> {
  const result: Record<string, OptimizerMeta> = {};
  for (const file of listTsxFiles(dir)) {
    const source = readFileSync(file, "utf-8");
    const name = extractComponentName(source);
    if (!name) continue;
    const meta = extractOptimizerMetadataFromSource(source);
    const hasData =
      meta.isImplicitContainerByDefault ||
      meta.unstableChildInjectedVars ||
      meta.contextVars ||
      (meta.events && Object.keys(meta.events).length > 0);
    if (hasData) result[name] = meta;
  }
  return result;
}
