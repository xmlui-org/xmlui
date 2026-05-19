/**
 * Rule: `valueType: "lineHeight"`.
 *
 * Accepts a unitless number, a CSS length, `normal`, or theme refs.
 */

import type { CoercionRule } from "../../../type-contracts/rules/types";

const NUMERIC_RE = /^-?(?:\d+\.?\d*|\.\d+)$/;
const LENGTH_RE =
  /^-?(?:\d+\.?\d*|\.\d+)(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|fr|svh|svw|lvh|lvw|dvh|dvw)$/i;
const VAR_RE = /^var\(\s*--[A-Za-z0-9_-]+(?:\s*,.*)?\)$/;
const TOKEN_RE = /^\$[A-Za-z0-9_-]+$/;

export const lineHeightRule: CoercionRule = {
  valueType: "lineHeight" as any,
  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === "number" && Number.isFinite(raw)) return null;
    if (typeof raw !== "string") {
      return { message: `Expected a CSS line-height, got ${typeof raw}.`, expected: "lineHeight" };
    }
    const v = raw.trim();
    if (v === "" || v.toLowerCase() === "normal") return null;
    if (NUMERIC_RE.test(v)) return null;
    if (LENGTH_RE.test(v)) return null;
    if (VAR_RE.test(v)) return null;
    if (TOKEN_RE.test(v)) return null;
    return {
      message: `Expected a CSS line-height, got ${JSON.stringify(v)}.`,
      expected: "lineHeight",
    };
  },
  coerce(raw) {
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};
