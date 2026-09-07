import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The AST node-type universe, read from the source of truth rather than restated here.
 *
 * Coverage counted in cases is not coverage: the corpus that missed regular expressions,
 * `await` and destructured parameters had hundreds of cases. Measuring against the
 * declared node types is what makes a gap visible instead of merely absent.
 */
export function readNodeTypeUniverse(): Map<number, string> {
  const source = readFileSync(
    join(__dirname, "..", "..", "..", "..", "src", "parsers", "scripting", "ScriptingNodeTypes.ts"),
    "utf-8",
  );
  const universe = new Map<number, string>();
  for (const [, name, value] of source.matchAll(/export const (T_[A-Z0-9_]+)\s*=\s*(\d+)/g)) {
    universe.set(Number(value), name);
  }
  if (universe.size === 0) {
    throw new Error("Could not read the node-type universe; the declaration shape changed.");
  }
  return universe;
}

/** Every node type present in a parsed tree. Derived, so the corpus cannot drift. */
export function collectNodeTypes(node: unknown, into = new Set<number>()): Set<number> {
  if (!node || typeof node !== "object") {
    return into;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => collectNodeTypes(item, into));
    return into;
  }
  const record = node as Record<string, unknown>;
  if (typeof record.type === "number") {
    into.add(record.type);
  }
  for (const [key, value] of Object.entries(record)) {
    // --- Tokens carry their own unrelated `type` numbering (lexer token kinds), and
    // --- `source` is the original text. Counting either would inflate coverage.
    if (key === "startToken" || key === "endToken" || key === "source") {
      continue;
    }
    collectNodeTypes(value, into);
  }
  return into;
}

/**
 * The kind of value a literal carries.
 *
 * Node-type coverage cannot see this distinction, and that blindness is exactly how the
 * regular-expression miscompile survived: a pattern is a `T_LITERAL`, indistinguishable
 * from a string literal to a walk over node types. Removing the regex case from the corpus
 * loses no node-type coverage at all. So the corpus measures two axes, and this is the
 * second.
 */
export function literalKind(value: unknown): string {
  if (value === null) return "null";
  if (value instanceof RegExp) return "regexp";
  return typeof value;
}

/** Every literal value kind present in a parsed tree. */
export function collectLiteralKinds(node: unknown, into = new Set<string>()): Set<string> {
  if (!node || typeof node !== "object") {
    return into;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => collectLiteralKinds(item, into));
    return into;
  }
  const record = node as Record<string, unknown>;
  // --- T_LITERAL is 32; read it from the universe rather than hard-coding the number.
  if (record.type === LITERAL_TYPE && "value" in record) {
    into.add(literalKind(record.value));
  }
  for (const [key, value] of Object.entries(record)) {
    if (key === "startToken" || key === "endToken" || key === "source") {
      continue;
    }
    collectLiteralKinds(value, into);
  }
  return into;
}

const LITERAL_TYPE = (() => {
  for (const [type, name] of readNodeTypeUniverse()) {
    if (name === "T_LITERAL") return type;
  }
  throw new Error("T_LITERAL is no longer declared");
})();
