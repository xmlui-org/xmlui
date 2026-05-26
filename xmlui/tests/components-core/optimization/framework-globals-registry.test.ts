/**
 * Spread integrity: guards against an accidental removal of a utility spread
 * (`...dateFunctions`, `...mathFunctions`, etc.) from `appContextFactory.ts`.
 *
 * Static globals (Actions, toast, navigate, …) are covered end-to-end by
 * computedUses.test.ts regressions. Only the spread-derived keys need a
 * dedicated check because nothing else catches "forgot to include the spread".
 */
import { describe, it, expect } from "vitest";
import { XMLUI_GLOBAL_NAMES } from "../../../src/components-core/state/FrameworkGlobals";

describe("XMLUI_GLOBAL_NAMES spread integrity", () => {
  it.each([
    ["formatDate",       "dateFunctions"],
    ["avg",              "mathFunctions"],
    ["readLocalStorage", "localStorageFunctions"],
    ["capitalize",       "miscellaneousUtils"],
  ])("contains '%s' (from %s)", (key) => {
    expect(XMLUI_GLOBAL_NAMES.has(key)).toBe(true);
  });
});
