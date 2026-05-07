/**
 * Rule: `valueType: "length"`.
 *
 * Accepts:
 *   - A bare JS `number` (treated as pixels).
 *   - A string of the form `<number><unit>` with a known CSS unit.
 *   - A bare numeric string (treated as pixels).
 *   - CSS custom properties (`var(--…)`) and theme-token references (`$xxx`).
 *   - Special values `auto`, `inherit`, `initial`, `unset`, `revert`.
 */

import type { CoercionRule } from "./types";

const UNIT_RE =
  /^-?(?:\d+\.?\d*|\.\d+)(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|fr|svh|svw|lvh|lvw|dvh|dvw)$/;
const NUMERIC_RE = /^-?(?:\d+\.?\d*|\.\d+)$/;
const VAR_RE = /^var\(\s*--[A-Za-z0-9_-]+(?:\s*,.*)?\)$/;
const TOKEN_RE = /^\$[A-Za-z0-9_-]+$/;
const SPECIAL: ReadonlySet<string> = new Set([
  "auto",
  "inherit",
  "initial",
  "unset",
  "revert",
  "fit-content",
  "max-content",
  "min-content",
  "0",
]);

export const lengthRule: CoercionRule = {
  valueType: "length",

  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === "number" && Number.isFinite(raw)) return null;
    if (typeof raw !== "string") {
      return {
        message: `Expected a CSS length, got ${typeof raw}.`,
        expected: "length",
      };
    }
    const value = raw.trim();
    if (value === "") {
      return { message: "Expected a CSS length, got an empty string.", expected: "length" };
    }
    if (NUMERIC_RE.test(value)) return null;
    if (UNIT_RE.test(value)) return null;
    if (VAR_RE.test(value)) return null;
    if (TOKEN_RE.test(value)) return null;
    if (SPECIAL.has(value.toLowerCase())) return null;
    return {
      message: `Expected a CSS length, got ${JSON.stringify(value)}.`,
      expected: "length",
    };
  },

  coerce(raw) {
    if (typeof raw === "number") return `${raw}px`;
    if (typeof raw === "string") {
      const value = raw.trim();
      if (NUMERIC_RE.test(value)) return `${value}px`;
      return value;
    }
    return raw;
  },
};
