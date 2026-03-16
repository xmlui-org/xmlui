import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { useGlobalVariables } from "../../src/components-core/state/global-variables";
import { AppContext } from "../../src/components-core/AppContext";

/**
 * Regression tests for global variable stability.
 *
 * Verifies that unrelated componentState changes (e.g., loader results)
 * do NOT cause global variables to be re-evaluated, which previously
 * caused infinite re-render loops when DataSource used global vars as mockData.
 */

// Minimal AppContext mock sufficient for extractParam evaluation
const mockAppContext = {
  appGlobals: {},
  evaluate: (expr: string, state: any) => expr,
} as any;

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <AppContext.Provider value={mockAppContext}>{children}</AppContext.Provider>
  );
}

describe("useGlobalVariables stability", () => {
  it("returns stable reference when unrelated componentState keys change", () => {
    const nodeGlobalVars = {
      count: "{42}",
    };

    // Initial render with empty componentState
    const { result, rerender } = renderHook(
      ({ componentState }) =>
        useGlobalVariables(undefined, nodeGlobalVars, undefined, componentState),
      {
        wrapper: createWrapper(),
        initialProps: { componentState: {} },
      },
    );

    const firstResult = result.current;
    expect(firstResult.count).toBe(42);

    // Simulate a loader adding "users" to componentState (unrelated to globals)
    rerender({
      componentState: { users: { value: [{ id: 1 }], inProgress: false } },
    });

    const secondResult = result.current;
    // The reference should be the SAME because no global variables changed
    expect(secondResult).toBe(firstResult);
    expect(secondResult.count).toBe(42);
  });

  it("updates when a global variable is runtime-modified", () => {
    const nodeGlobalVars = {
      count: "{0}",
    };

    const { result, rerender } = renderHook(
      ({ componentState }) =>
        useGlobalVariables(undefined, nodeGlobalVars, undefined, componentState),
      {
        wrapper: createWrapper(),
        initialProps: { componentState: {} },
      },
    );

    expect(result.current.count).toBe(0);

    // Simulate count being updated at runtime (e.g., count++)
    rerender({ componentState: { count: 5 } });

    expect(result.current.count).toBe(5);
  });

  it("dependent global re-evaluates when dependency updates at runtime", () => {
    const nodeGlobalVars = {
      count: "{0}",
      doubled: "{count * 2}",
      __tree_doubled: {
        type: "BinaryExpression",
        left: { type: "Identifier", name: "count" },
        operator: "*",
        right: { type: "Literal", value: 2 },
      },
    };

    const { result, rerender } = renderHook(
      ({ componentState }) =>
        useGlobalVariables(undefined, nodeGlobalVars, undefined, componentState),
      {
        wrapper: createWrapper(),
        initialProps: { componentState: {} },
      },
    );

    expect(result.current.count).toBe(0);
    expect(result.current.doubled).toBe(0);

    // Update count at runtime
    rerender({ componentState: { count: 3 } });

    expect(result.current.count).toBe(3);
    expect(result.current.doubled).toBe(6);
  });
});
