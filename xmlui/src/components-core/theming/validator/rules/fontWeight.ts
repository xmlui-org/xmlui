/**
 * Rule: `valueType: "fontWeight"`.
 *
 * Accepts `100..900` in steps of 100, plus
 * `normal | bold | lighter | bolder`, plus theme references.
 */

import type { CoercionRule } from "../../../type-contracts/rules/types";

const NAMED: ReadonlySet<string> = new Set(["normal", "bold", "lighter", "bolder"]);
const VAR_RE = /^var\(\s*--[A-Za-z0-9_-]+(?:\s*,.*)?\)$/;
const TOKEN_RE = /^\$[A-Za-z0-9_-]+$/;
const THEME_VAR_REF_RE =
  /^[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*-[A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*(?:--[A-Za-z0-9_-]+)*$/;

export const fontWeightRule: CoercionRule = {
  valueType: "fontWeight" as any,
  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === "number") {
      if (raw >= 100 && raw <= 900 && raw % 100 === 0) return null;
      return {
        message: `Font weight ${raw} must be a multiple of 100 in [100, 900].`,
        expected: "fontWeight",
      };
    }
    if (typeof raw !== "string") {
      return { message: `Expected a CSS font-weight, got ${typeof raw}.`, expected: "fontWeight" };
    }
    const v = raw.trim();
    if (v === "") return null;
    if (NAMED.has(v.toLowerCase())) return null;
    if (VAR_RE.test(v)) return null;
    if (TOKEN_RE.test(v)) return null;
    if (THEME_VAR_REF_RE.test(v)) return null;
    const n = Number(v);
    if (Number.isFinite(n) && n >= 100 && n <= 900 && n % 100 === 0) return null;
    return {
      message: `Expected a CSS font-weight (100..900 step 100, or named), got ${JSON.stringify(v)}.`,
      expected: "fontWeight",
    };
  },
  coerce(raw) {
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};
