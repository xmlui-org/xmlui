import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Optimizer-relevant subset extracted from a component source file.
 * After extraction, these fields mirror what createMetadata spreads into ComponentMetadata.
 */
export type OptimizerMeta = {
  isImplicitContainerByDefault?: boolean;
  childInjectedVars?: readonly string[];
  unstableChildInjectedVars?: readonly string[];
  events?: Record<string, { injectedVars?: readonly string[] }>;
};

/**
 * Extract a static string array literal from source text starting at `startIdx`.
 * Finds the matching `]` and parses string literals (single or double quoted).
 * Returns null if the bracket is not found or content is dynamic (non-string items).
 */
function extractStringArray(source: string, startIdx: number): string[] | null {
  const open = source.indexOf("[", startIdx);
  if (open === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "[") depth++;
    else if (source[i] === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;
  const body = source.slice(open + 1, end);
  // Parse string literals — only $-prefixed variables are valid here
  const matches = [...body.matchAll(/["'](\$[^"']+)["']/g)];
  return matches.map((m) => m[1]);
}

/**
 * Extract optimizer-relevant metadata fields from a component source file string.
 * Reads from the `optimization: { ... }` block inside a `createMetadata` call.
 * Only extracts STATIC values — dynamic callbacks or spread expressions are ignored.
 *
 * Returns an OptimizerMeta (empty if no optimizer block found).
 */
export function extractOptimizerMetadataFromSource(source: string): OptimizerMeta {
  const result: OptimizerMeta = {};

  // isImplicitContainerByDefault: true (inside optimization block)
  if (/isImplicitContainerByDefault\s*:\s*true/.test(source)) {
    result.isImplicitContainerByDefault = true;
  }

  // childInjectedVars: [ ... ] (inside optimization block)
  const childMatch = /childInjectedVars\s*:/.exec(source);
  if (childMatch) {
    const arr = extractStringArray(source, childMatch.index);
    if (arr && arr.length > 0) result.childInjectedVars = arr;
  }

  // unstableChildInjectedVars: [ ... ] (inside optimization block)
  const unstableMatch = /unstableChildInjectedVars\s*:/.exec(source);
  if (unstableMatch) {
    const arr = extractStringArray(source, unstableMatch.index);
    if (arr && arr.length > 0) result.unstableChildInjectedVars = arr;
  }

  // Per-event injectedVars: find each `injectedVars:` occurrence, extract the array,
  // back-track to find the event name. injectedVars must be the first field in the event
  // entry so that there are no literal braces between `eventName: {` and `injectedVars:`.
  const eventVarsRe = /injectedVars\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = eventVarsRe.exec(source)) !== null) {
    const arr = extractStringArray(source, m.index);
    if (!arr || arr.length === 0) continue;

    // Back-track from m.index to find the event name: last `<word>: {` pattern before injectedVars
    const before = source.slice(0, m.index);
    // Match the last occurrence of `word: {` where there's no closing `}` between it and our position
    const eventNameMatch = /(\w+)\s*:\s*\{[^{}]*$/.exec(before);
    if (!eventNameMatch) continue;
    const eventName = eventNameMatch[1];
    if (!result.events) result.events = {};
    result.events[eventName] = { injectedVars: arr };
  }

  return result;
}

/**
 * Extract the registered component type name from a source file.
 * Components register via `wrapComponent("TypeName", ...)` or `wrapCompound("TypeName", ...)`,
 * or declare `const COMP = "TypeName"` / `const COMP_NAME = "TypeName"`.
 */
export function extractComponentName(source: string): string | null {
  // Try: wrapComponent("Name", ...) or wrapCompound("Name", ...)
  const wrapMatch = /wrap(?:Component|Compound)\s*\(\s*["']([A-Z][A-Za-z0-9]*)["']/.exec(source);
  if (wrapMatch) return wrapMatch[1];
  // Try: const COMP = "Name" or const COMP_NAME = "Name" (PascalCase value)
  const constMatch = /const\s+COMP(?:_NAME)?\s*=\s*["']([A-Z][A-Za-z0-9]*)["']/.exec(source);
  if (constMatch) return constMatch[1];
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
      meta.childInjectedVars ||
      meta.unstableChildInjectedVars ||
      (meta.events && Object.keys(meta.events).length > 0);
    if (hasData) result[name] = meta;
  }
  return result;
}
