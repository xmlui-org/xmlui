/**
 * Rule: `valueType: "url"`.
 *
 * Accepts any string parseable by `new URL(value, base)`. Relative URLs
 * are accepted via a synthetic base. Empty / whitespace-only strings fail.
 */

import type { CoercionRule } from "./types";

const SYNTHETIC_BASE = "http://_xmlui.invalid/";

export const urlRule: CoercionRule = {
  valueType: "url",

  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== "string") {
      return {
        message: `Expected a URL string, got ${typeof raw}.`,
        expected: "url",
      };
    }
    const value = raw.trim();
    if (value === "") {
      return { message: "Expected a URL, got an empty string.", expected: "url" };
    }
    try {
      // eslint-disable-next-line no-new
      new URL(value, SYNTHETIC_BASE);
      return null;
    } catch {
      return {
        message: `Expected a URL, got ${JSON.stringify(value)}.`,
        expected: "url",
      };
    }
  },

  coerce(raw) {
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};
