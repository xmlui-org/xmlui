/**
 * Rule: `valueType: "id-ref"`.
 *
 * Accepts any non-empty identifier string. When a `ctx.scopeIds` set is
 * supplied the verifier additionally checks that the value resolves to a
 * sibling component's `id` in the same container scope; without context
 * the rule degrades to a structural identifier check.
 */

import type { CoercionRule } from "./types";

const ID_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export const idRefRule: CoercionRule = {
  valueType: "id-ref",

  verify(raw, ctx) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== "string") {
      return {
        message: `Expected an id reference, got ${typeof raw}.`,
        expected: "id-ref",
      };
    }
    const value = raw.trim();
    if (value === "") {
      return {
        message: "Expected an id reference, got an empty string.",
        expected: "id-ref",
      };
    }
    if (!ID_RE.test(value)) {
      return {
        message: `Expected a valid identifier, got ${JSON.stringify(value)}.`,
        expected: "id-ref",
      };
    }
    if (ctx?.scopeIds && !ctx.scopeIds.has(value)) {
      return {
        message: `Unknown id reference ${JSON.stringify(value)}: no sibling with that id in scope.`,
        expected: "id-ref",
      };
    }
    return null;
  },

  coerce(raw) {
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};
