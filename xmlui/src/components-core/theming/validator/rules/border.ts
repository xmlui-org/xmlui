/**
 * Rule: `valueType: "border"`.
 *
 * Accepts the `<line-style>` keyword on its own (e.g. `none`,
 * `solid`), or the shorthand `<length> <line-style> [<color>]`,
 * or theme references.
 */

import type { CoercionRule } from "../../../type-contracts/rules/types";

const LINE_STYLES: ReadonlySet<string> = new Set([
  "none",
  "hidden",
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset",
]);
const LENGTH_TOKEN_RE =
  /^-?(?:\d+\.?\d*|\.\d+)(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|fr|svh|svw|lvh|lvw|dvh|dvw)?$/i;
const VAR_RE = /^var\(\s*--[A-Za-z0-9_-]+(?:\s*,.*)?\)$/;
const TOKEN_RE = /^\$[A-Za-z0-9_-]+$/;

export const borderRule: CoercionRule = {
  valueType: "border" as any,
  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== "string") {
      return { message: `Expected a CSS border shorthand, got ${typeof raw}.`, expected: "border" };
    }
    const v = raw.trim();
    if (v === "") return null;
    if (VAR_RE.test(v)) return null;
    if (TOKEN_RE.test(v)) return null;
    const parts = v.split(/\s+/);
    let sawLineStyle = false;
    for (const part of parts) {
      const lower = part.toLowerCase();
      if (LINE_STYLES.has(lower)) {
        sawLineStyle = true;
        continue;
      }
      if (LENGTH_TOKEN_RE.test(part)) continue;
      // Anything else assumed to be the color token; we do not deep-validate it
      // here because per-rule color verification is delegated.
    }
    if (!sawLineStyle && parts.length > 1) {
      return {
        message: `Border shorthand ${JSON.stringify(v)} must include a line style.`,
        expected: "border",
      };
    }
    return null;
  },
  coerce(raw) {
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};
