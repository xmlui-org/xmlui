/**
 * Rule: `valueType: "hash"`.
 *
 * Accepts plain object records, matching TypeScript's `Record<string, any>`.
 * Arrays, functions, dates, and scalar values are rejected.
 */

import type { CoercionRule } from "./types";

export const hashRule: CoercionRule = {
  valueType: "hash",

  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (isPlainRecord(raw)) return null;
    return {
      message: `Expected a hash object, got ${describe(raw)}.`,
      expected: "Record<string, any>",
    };
  },

  coerce(raw) {
    return raw;
  },
};

function isPlainRecord(raw: unknown): raw is Record<string, any> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return false;
  const prototype = Object.getPrototypeOf(raw);
  return prototype === Object.prototype || prototype === null;
}

function describe(raw: unknown): string {
  if (raw === null) return "null";
  if (Array.isArray(raw)) return "array";
  return typeof raw;
}
