/**
 * Rule: `valueType: "integer"`.
 *
 * Accepts a JS `number` with no fractional part, or a numeric string that
 * parses to an integer.
 */

import type { CoercionRule } from "./types";

export const integerRule: CoercionRule = {
  valueType: "integer",

  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === "number" && Number.isFinite(raw) && Number.isInteger(raw)) {
      return null;
    }
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed === "") {
        return { message: "Expected an integer, got an empty string.", expected: "integer" };
      }
      if (/^-?\d+$/.test(trimmed)) return null;
    }
    return {
      message: `Expected an integer, got ${describe(raw)}.`,
      expected: "integer",
    };
  },

  coerce(raw) {
    if (raw === undefined || raw === null) return raw;
    if (typeof raw === "number") return Math.trunc(raw);
    if (typeof raw === "string") {
      const n = Number(raw.trim());
      if (Number.isFinite(n)) return Math.trunc(n);
    }
    return raw;
  },
};

function describe(raw: unknown): string {
  if (raw === null) return "null";
  if (typeof raw === "string") return JSON.stringify(raw);
  return String(raw);
}
