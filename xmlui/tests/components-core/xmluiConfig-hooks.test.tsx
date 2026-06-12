import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";

import {
  AppContext,
  useAppGlobals,
  useXmluiConfig,
  mergeXmluiConfig,
} from "../../src/components-core/AppContext";

function wrapperFor(value: any) {
  return ({ children }: { children: React.ReactNode }) => (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

describe("useAppGlobals / useXmluiConfig hooks", () => {
  it("useAppGlobals returns the raw appGlobals object", () => {
    const appGlobals = { apiUrl: "https://api.example", useHashBasedRouting: true };
    const xmluiConfig = mergeXmluiConfig(appGlobals, undefined);
    const { result } = renderHook(() => useAppGlobals(), {
      wrapper: wrapperFor({ appGlobals, xmluiConfig }),
    });
    expect(result.current).toBe(appGlobals);
    expect(result.current.apiUrl).toBe("https://api.example");
  });

  it("useXmluiConfig returns the merged frozen view", () => {
    const appGlobals = { useHashBasedRouting: true, xsVerbose: false };
    const xmluiConfigOverlay = { xsVerbose: true };
    const xmluiConfig = mergeXmluiConfig(appGlobals, xmluiConfigOverlay);
    const { result } = renderHook(() => useXmluiConfig(), {
      wrapper: wrapperFor({ appGlobals, xmluiConfig }),
    });
    expect(result.current.useHashBasedRouting).toBe(true);
    expect(result.current.xsVerbose).toBe(true);
    expect(Object.isFrozen(result.current)).toBe(true);
  });

  it("useXmluiConfig falls back to appGlobals values when xmluiConfig is empty", () => {
    const appGlobals = { disableInlineStyle: true, applyLayoutProperties: false };
    const xmluiConfig = mergeXmluiConfig(appGlobals, undefined);
    const { result } = renderHook(() => useXmluiConfig(), {
      wrapper: wrapperFor({ appGlobals, xmluiConfig }),
    });
    expect(result.current.disableInlineStyle).toBe(true);
    expect(result.current.applyLayoutProperties).toBe(false);
  });

  it("useXmluiConfig returns an empty frozen object when context is missing", () => {
    const { result } = renderHook(() => useXmluiConfig(), {
      wrapper: wrapperFor(undefined),
    });
    expect(result.current).toEqual({});
    expect(Object.isFrozen(result.current)).toBe(true);
  });

  it("useAppGlobals returns an empty frozen object when context is missing", () => {
    const { result } = renderHook(() => useAppGlobals(), {
      wrapper: wrapperFor(undefined),
    });
    expect(result.current).toEqual({});
    expect(Object.isFrozen(result.current)).toBe(true);
  });
});
