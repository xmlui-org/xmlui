/**
 * Rule: `valueType: "color"`.
 *
 * Accepts:
 *   - CSS named colors (`red`, `transparent`, `currentColor`, …)
 *   - `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` hex literals
 *   - `rgb()` / `rgba()` / `hsl()` / `hsla()` functional notations
 *   - CSS custom properties (`var(--…)`) and theme-token references
 *     (`$xxx` syntax used elsewhere in the framework).
 */

import type { CoercionRule } from "./types";

const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FUNC_RE = /^(?:rgb|rgba|hsl|hsla)\s*\(.+\)$/i;
const VAR_RE = /^var\(\s*--[A-Za-z0-9_-]+(?:\s*,.*)?\)$/;
const TOKEN_RE = /^\$[A-Za-z0-9_-]+$/;

// A pragmatic subset of named colors. The verifier only needs to accept
// well-known names; anything else falls through to the failure branch.
// Keeping the table small avoids a 150-entry literal at parse time.
const NAMED_COLORS: ReadonlySet<string> = new Set([
  "transparent",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
  "revert",
  "black",
  "white",
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "gray",
  "grey",
  "silver",
  "gold",
  "navy",
  "teal",
  "cyan",
  "magenta",
  "lime",
  "olive",
  "maroon",
  "aqua",
  "fuchsia",
]);

export const colorRule: CoercionRule = {
  valueType: "color",

  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== "string") {
      return {
        message: `Expected a CSS color string, got ${typeof raw}.`,
        expected: "color",
      };
    }
    const value = raw.trim();
    if (value === "") {
      return { message: "Expected a CSS color, got an empty string.", expected: "color" };
    }
    if (HEX_RE.test(value)) return null;
    if (FUNC_RE.test(value)) return null;
    if (VAR_RE.test(value)) return null;
    if (TOKEN_RE.test(value)) return null;
    if (NAMED_COLORS.has(value.toLowerCase())) return null;
    return {
      message: `Expected a CSS color, got ${JSON.stringify(value)}.`,
      expected: "color",
    };
  },

  coerce(raw) {
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};
