/**
 * Rule: `valueType: "fontFamily"`.
 *
 * Accepts comma-separated font family stacks. Each entry is a quoted
 * string or a bare identifier; CSS generic families and theme
 * references are accepted verbatim.
 */

import type { CoercionRule } from "../../../type-contracts/rules/types";

const BARE_IDENT_RE = /^[A-Za-z_][A-Za-z0-9_-]*(?:\s+[A-Za-z_][A-Za-z0-9_-]*)*$/;
const QUOTED_RE = /^(?:"[^"]*"|'[^']*')$/;
const VAR_RE = /^var\(\s*--[A-Za-z0-9_-]+(?:\s*,.*)?\)$/;
const TOKEN_RE = /^\$[A-Za-z0-9_-]+$/;

export const fontFamilyRule: CoercionRule = {
  valueType: "fontFamily" as any,
  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== "string") {
      return { message: `Expected a CSS font-family, got ${typeof raw}.`, expected: "fontFamily" };
    }
    const v = raw.trim();
    if (v === "") return null;
    if (VAR_RE.test(v)) return null;
    if (TOKEN_RE.test(v)) return null;
    const parts = splitTopLevel(v, ",");
    for (const part of parts) {
      const entry = part.trim();
      if (entry === "") {
        return { message: "Empty font-family entry.", expected: "fontFamily" };
      }
      if (QUOTED_RE.test(entry) || BARE_IDENT_RE.test(entry)) continue;
      return {
        message: `Font-family entry ${JSON.stringify(entry)} must be quoted or a bare identifier.`,
        expected: "fontFamily",
      };
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
