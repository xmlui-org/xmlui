/**
 * Rule: `valueType: "icon"`.
 *
 * Accepts any non-empty string. When a `ctx.icons` set is supplied the
 * verifier additionally checks that the name is registered in the active
 * `IconRegistry`; without context the rule degrades to a structural
 * non-empty-string check (so the LSP and Vite plugin can still emit
 * helpful diagnostics outside a running app).
 */

import type { CoercionRule } from "./types";

export const iconRule: CoercionRule = {
  valueType: "icon",

  verify(raw, ctx) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== "string") {
      return {
        message: `Expected an icon name, got ${typeof raw}.`,
        expected: "icon",
      };
    }
    const value = raw.trim();
    if (value === "") {
      return { message: "Expected an icon name, got an empty string.", expected: "icon" };
    }
    if (ctx?.icons && !ctx.icons.has(value)) {
      return {
        message: `Unknown icon ${JSON.stringify(value)}: not registered in IconRegistry.`,
        expected: "icon",
      };
    }
    return null;
  },

  coerce(raw) {
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};
