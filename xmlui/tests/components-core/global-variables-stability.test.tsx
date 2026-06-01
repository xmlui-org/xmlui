import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import React, { useRef, useMemo } from "react";
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

// ---------------------------------------------------------------------------
// Test 7.5: Global-function reference stability
//
// `narrowGlobalVars` unconditionally copies ALL function keys from globalVars
// into the change-detection snapshot (issue 2.2 in the code review). If any
// function reference changes between renders — even one the subtree never
// calls reactively — useShallowCompareMemoize detects the difference and
// triggers a container re-render.
//
// These tests assert that useGlobalVariables preserves function identity across
// data-only state changes, so that issue 2.2 is harmless in practice.
// ---------------------------------------------------------------------------
describe("useGlobalVariables — function reference stability (test 7.5)", () => {
  it("function reference is preserved across an unrelated componentState change", () => {
    const myFn = () => "hello";
    const nodeFunctions = { myFn };

    const { result, rerender } = renderHook(
      ({ componentState }) =>
        useGlobalVariables(undefined, { count: "{0}" }, nodeFunctions, componentState),
      {
        wrapper: createWrapper(),
        initialProps: { componentState: {} },
      },
    );

    const firstFnRef = result.current.myFn;
    expect(firstFnRef).toBe(myFn);

    // Simulate a loader adding an unrelated key to componentState.
    rerender({ componentState: { loaderResult: [1, 2, 3] } });

    // Function identity must be preserved — a changed ref would cause
    // useShallowCompareMemoize inside ComponentWrapper to see a delta
    // in the narrow snapshot and trigger a spurious container re-render.
    expect(result.current.myFn).toBe(firstFnRef);
  });

  it("function reference is preserved when a data global updates at runtime", () => {
    const myFn = () => "stable";
    const nodeFunctions = { myFn };

    const { result, rerender } = renderHook(
      ({ componentState }) =>
        useGlobalVariables(undefined, { count: "{0}" }, nodeFunctions, componentState),
      {
        wrapper: createWrapper(),
        initialProps: { componentState: {} },
      },
    );

    const firstFnRef = result.current.myFn;

    // Simulate count++ — a real runtime update to a global variable.
    rerender({ componentState: { count: 5 } });

    expect(result.current.count).toBe(5);
    // Even when a data global changes, the function ref must stay the same.
    expect(result.current.myFn).toBe(firstFnRef);
  });
});

// ---------------------------------------------------------------------------
// Test 7.6 — ComponentWrapper two-step memo guard
//
// The two-step memo in ComponentWrapper.tsx reads:
//
//   const globalVarsCurrentRef = useRef(globalVars);
//   globalVarsCurrentRef.current = globalVars;
//   const globalVarsWithStableRef = useMemo(
//     () => globalVarsCurrentRef.current,
//     [narrowedGlobalVarsForComparison ?? globalVars],
//   );
//
// The invariants these tests lock down:
//   1. globalVarsWithStableRef returns the full globalVars (not the narrow snapshot).
//   2. Its reference is stable when the snapshot (deps key) does not change.
//   3. When the snapshot DOES change it returns the LATEST globalVars — not the
//      stale closure value captured at the previous render.
//
// If the ref pattern is removed and the original closure form restored WITHOUT
// the eslint-disable comment, a "missing exhaustive-deps" ESLint auto-fix would
// add globalVars to the dep array, making the memo update on every change (test 2
// would fail). If the ref is dropped but ESLint stays disabled, test 3 would fail
// because the stale closure returns the pre-render globalVars.
// ---------------------------------------------------------------------------
describe("ComponentWrapper two-step memo (test 7.6)", () => {
  // Mirrors the exact hook pattern from ComponentWrapper.tsx.
  function useTwoStepMemo(
    globalVars: Record<string, any>,
    snapshot: Record<string, any> | undefined,
  ) {
    const globalVarsCurrentRef = useRef(globalVars);
    globalVarsCurrentRef.current = globalVars;
    return useMemo(
      () => globalVarsCurrentRef.current,
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mirrors ComponentWrapper intentional pattern
      [snapshot ?? globalVars],
    );
  }

  it("returns the full globalVars object, not the narrow snapshot", () => {
    const globalVars = { foo: "a", bar: "b" };
    const snapshot = { foo: "a" }; // narrow: only 'foo'
    const { result } = renderHook(() => useTwoStepMemo(globalVars, snapshot));
    // Must return the full object — containers need all vars for event handlers.
    expect(result.current).toBe(globalVars);
    expect(result.current).toHaveProperty("bar");
  });

  it("reference is stable when only an untracked global changes (no snapshot change)", () => {
    const snap = { foo: "a" }; // stable reference across rerenders
    const gv1 = { foo: "a", bar: "b" };
    const { result, rerender } = renderHook(
      ({ gv }: { gv: Record<string, any> }) => useTwoStepMemo(gv, snap),
      { initialProps: { gv: gv1 } },
    );
    const refBefore = result.current;

    // 'bar' changes, but snapshot ('foo') is the same reference → memo must not recompute.
    const gv2 = { foo: "a", bar: "CHANGED" };
    rerender({ gv: gv2 });

    expect(result.current).toBe(refBefore); // stable identity → no spurious re-render
  });

  it("returns the LATEST globalVars (not stale) when the snapshot changes", () => {
    const gv1 = { foo: "original", bar: "b" };
    const snap1 = { foo: "original" };
    const { result, rerender } = renderHook(
      ({ gv, snap }: { gv: Record<string, any>; snap: Record<string, any> }) =>
        useTwoStepMemo(gv, snap),
      { initialProps: { gv: gv1, snap: snap1 } },
    );
    expect(result.current).toBe(gv1);

    const gv2 = { foo: "CHANGED", bar: "b" };
    const snap2 = { foo: "CHANGED" }; // new reference — memo dep changes
    rerender({ gv: gv2, snap: snap2 });

    // Must return gv2 (latest), not the stale gv1 captured before the rerender.
    expect(result.current).toBe(gv2);
    expect(result.current.foo).toBe("CHANGED");
  });
});
