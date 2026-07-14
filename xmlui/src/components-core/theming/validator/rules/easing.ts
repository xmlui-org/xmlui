/**
 * Rule: `valueType: "easing"`.
 *
 * Accepts the CSS named easings, plus `cubic-bezier(...)` and
 * `steps(...)` function calls, plus theme references.
 */

import type { CoercionRule } from "../../../type-contracts/rules/types";

const NAMED: ReadonlySet<string> = new Set([
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "step-start",
  "step-end",
]);
const FN_RE = /^(?:cubic-bezier|steps)\s*\(.+\)$/i;
const VAR_RE = /^var\(\s*--[A-Za-z0-9_-]+(?:\s*,.*)?\)$/;
const TOKEN_RE = /^\$[A-Za-z0-9_-]+$/;

export const easingRule: CoercionRule = {
  valueType: "easing" as any,
  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== "string") {
      return { message: `Expected a CSS easing, got ${typeof raw}.`, expected: "easing" };
    }
    const v = raw.trim();
    if (v === "") return null;
    const lower = v.toLowerCase();
    if (NAMED.has(lower)) return null;
    if (FN_RE.test(v)) return null;
    if (VAR_RE.test(v)) return null;
    if (TOKEN_RE.test(v)) return null;
    return {
      message: `Expected a CSS easing function, got ${JSON.stringify(v)}.`,
      expected: "easing",
    };
  },
  coerce(raw) {
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};
