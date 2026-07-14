/**
 * Rule: `valueType: "shadow"`.
 *
 * Permissive checker: accepts comma-separated shadow entries; each
 * entry is required to contain at least one length-like token. Theme
 * references and `none` are accepted verbatim.
 */

import type { CoercionRule } from "../../../type-contracts/rules/types";

const LENGTH_TOKEN_RE =
  /-?(?:\d+\.?\d*|\.\d+)(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|fr|svh|svw|lvh|lvw|dvh|dvw)?/i;
const VAR_RE = /^var\(\s*--[A-Za-z0-9_-]+(?:\s*,.*)?\)$/;
const TOKEN_RE = /^\$[A-Za-z0-9_-]+$/;

export const shadowRule: CoercionRule = {
  valueType: "shadow" as any,
  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== "string") {
      return { message: `Expected a CSS box-shadow string, got ${typeof raw}.`, expected: "shadow" };
    }
    const v = raw.trim();
    if (v === "" || v.toLowerCase() === "none") return null;
    if (VAR_RE.test(v)) return null;
    if (TOKEN_RE.test(v)) return null;
    // Split on top-level commas (functional notations like `rgb(…,…,…)` are
    // preserved by tracking paren depth).
    const entries = splitTopLevel(v, ",");
    for (const entry of entries) {
      const trimmed = entry.trim();
      if (!trimmed) {
        return { message: "Empty shadow entry.", expected: "shadow" };
      }
      if (!LENGTH_TOKEN_RE.test(trimmed)) {
        return {
          message: `Shadow entry ${JSON.stringify(trimmed)} is missing a length token.`,
          expected: "shadow",
        };
      }
    }
    return null;
  },
  coerce(raw) {
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};

function splitTopLevel(input: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === sep && depth === 0) {
      out.push(input.slice(start, i));
      start = i + 1;
    }
  }
  out.push(input.slice(start));
  return out;
}
