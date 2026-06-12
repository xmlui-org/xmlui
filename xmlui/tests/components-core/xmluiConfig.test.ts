import { describe, expect, it } from "vitest";

import { mergeXmluiConfig } from "../../src/components-core/AppContext";

describe("mergeXmluiConfig", () => {
  it("returns a frozen empty object when both sources are undefined", () => {
    const merged = mergeXmluiConfig(undefined, undefined);
    expect(merged).toEqual({});
    expect(Object.isFrozen(merged)).toBe(true);
  });

  it("falls back to appGlobals when xmluiConfig is missing", () => {
    const merged = mergeXmluiConfig(
      { disableInlineStyle: true, useHashBasedRouting: true },
      undefined,
    );
    expect(merged.disableInlineStyle).toBe(true);
    expect(merged.useHashBasedRouting).toBe(true);
  });

  it("xmluiConfig values override matching appGlobals values", () => {
    const merged = mergeXmluiConfig(
      { useHashBasedRouting: true, xsVerbose: false },
      { useHashBasedRouting: false, xsVerbose: true },
    );
    expect(merged.useHashBasedRouting).toBe(false);
    expect(merged.xsVerbose).toBe(true);
  });

  it("undefined values in xmluiConfig fall through to appGlobals", () => {
    const merged = mergeXmluiConfig(
      { useHashBasedRouting: true },
      { useHashBasedRouting: undefined },
    );
    expect(merged.useHashBasedRouting).toBe(true);
  });

  it("merges keys that exist only in one source", () => {
    const merged = mergeXmluiConfig(
      { apiUrl: "https://api.example" },
      { strictTheming: false },
    );
    expect(merged.apiUrl).toBe("https://api.example");
    expect(merged.strictTheming).toBe(false);
  });

  it("does not mutate the input objects", () => {
    const appGlobals = { useHashBasedRouting: true };
    const xmluiConfig = { useHashBasedRouting: false };
    mergeXmluiConfig(appGlobals, xmluiConfig);
    expect(appGlobals.useHashBasedRouting).toBe(true);
    expect(xmluiConfig.useHashBasedRouting).toBe(false);
  });
});
