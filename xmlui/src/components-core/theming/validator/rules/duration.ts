/**
 * Rule: `valueType: "duration"`.
 *
 * Accepts `<number>(ms|s)`, theme refs (`var(--…)` / `$xxx`), and
 * the `0` literal (CSS spec — unitless zero is a valid duration).
 */

import type { CoercionRule } from "../../../type-contracts/rules/types";

const DUR_RE = /^-?(?:\d+\.?\d*|\.\d+)(?:ms|s)$/i;
const VAR_RE = /^var\(\s*--[A-Za-z0-9_-]+(?:\s*,.*)?\)$/;
const TOKEN_RE = /^\$[A-Za-z0-9_-]+$/;

export const durationRule: CoercionRule = {
  valueType: "duration" as any,
  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === "number") {
      if (!Number.isFinite(raw)) {
        return { message: "Expected a finite duration.", expected: "duration" };
      }
      return null;
    }
    if (typeof raw !== "string") {
      return { message: `Expected a CSS duration, got ${typeof raw}.`, expected: "duration" };
    }
    const v = raw.trim();
    if (v === "" || v === "0") return null;
    if (DUR_RE.test(v)) return null;
    if (VAR_RE.test(v)) return null;
    if (TOKEN_RE.test(v)) return null;
    return {
      message: `Expected a CSS duration (e.g. "200ms", "0.3s"), got ${JSON.stringify(v)}.`,
      expected: "duration",
    };
  },
  coerce(raw) {
    if (typeof raw === "number") return `${raw}ms`;
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};
