import { describe, it, expect } from "vitest";
import { collectFnVarDeps } from "../../../src/components-core/rendering/collectFnVarDeps";

// ============================================================================
// collectFnVarDeps Unit Tests
// ============================================================================

describe("collectFnVarDeps", () => {
  // ========================================================================
  // Simple Dependencies Tests
  // ========================================================================

  it("handles simple dependencies", () => {
    const fnDeps = {
      fn1: ["var1", "var2"],
    };

    const result = collectFnVarDeps(fnDeps);

    expect(result).toEqual({
      fn1: ["var1", "var2"],
    });
  });

  it("returns empty object for empty input", () => {
    const result = collectFnVarDeps({});

    expect(result).toEqual({});
  });

  // ========================================================================
  // Nested Function Dependencies Tests
  // ========================================================================

  it("flattens nested function dependencies", () => {
    const fnDeps = {
      fn1: ["fn2", "var1"],
      fn2: ["var2", "var3"],
    };

    const result = collectFnVarDeps(fnDeps);

    expect(result.fn1).toContain("var1");
    expect(result.fn1).toContain("var2");
    expect(result.fn1).toContain("var3");
    expect(result.fn2).toEqual(["var2", "var3"]);
  });

  it("handles deep nesting", () => {
    const fnDeps = {
      fn1: ["fn2"],
      fn2: ["fn3"],
      fn3: ["fn4"],
      fn4: ["var1"],
    };

    const result = collectFnVarDeps(fnDeps);

    expect(result.fn1).toContain("var1");
    expect(result.fn2).toContain("var1");
    expect(result.fn3).toContain("var1");
    expect(result.fn4).toEqual(["var1"]);
  });

  // ========================================================================
  // Circular Dependencies Tests
  // ========================================================================

  it("handles circular dependencies without infinite loop", () => {
    const fnDeps = {
      fn1: ["fn2", "var1"],
      fn2: ["fn1", "var2"],
    };

    const result = collectFnVarDeps(fnDeps);

    expect(result).toBeDefined();
    expect(result.fn1).toContain("var1");
    expect(result.fn1).toContain("var2");
    expect(result.fn2).toContain("var2");
    expect(result.fn2).toContain("var1");
  });

  it("handles self-referencing functions", () => {
    const fnDeps = {
      fn1: ["fn1", "var1"],
    };

    const result = collectFnVarDeps(fnDeps);

    expect(result.fn1).toEqual(["var1"]);
  });

  // ========================================================================
  // Complex Dependencies Tests
  // ========================================================================

  it("deduplicates dependencies", () => {
    const fnDeps = {
      fn1: ["var1", "var1", "var2", "var2"],
    };

    const result = collectFnVarDeps(fnDeps);

    expect(result.fn1.length).toBe(2);
    expect(result.fn1).toContain("var1");
    expect(result.fn1).toContain("var2");
  });

  it("preserves order of dependencies when possible", () => {
    const fnDeps = {
      fn1: ["fn2", "var1"],
      fn2: ["var2", "var3"],
    };

    const result = collectFnVarDeps(fnDeps);

    // var2 and var3 should come first (from fn2), then var1
    const fn1Deps = result.fn1;
    expect(fn1Deps.indexOf("var2")).toBeLessThan(fn1Deps.indexOf("var1"));
    expect(fn1Deps.indexOf("var3")).toBeLessThan(fn1Deps.indexOf("var1"));
  });

  it("handles complex multi-level dependencies", () => {
    const fnDeps = {
      fn1: ["fn2", "fn3", "var1"],
      fn2: ["var2", "var3"],
      fn3: ["var4", "fn4"],
      fn4: ["var5"],
    };

    const result = collectFnVarDeps(fnDeps);

    expect(result.fn1).toContain("var1");
    expect(result.fn1).toContain("var2");
    expect(result.fn1).toContain("var3");
    expect(result.fn1).toContain("var4");
    expect(result.fn1).toContain("var5");
  });

  // ========================================================================
  // Edge Cases Tests
  // ========================================================================

  it("handles functions with no dependencies", () => {
    const fnDeps = {
      fn1: [],
      fn2: ["var1"],
    };

    const result = collectFnVarDeps(fnDeps);

    expect(result.fn1).toEqual([]);
    expect(result.fn2).toEqual(["var1"]);
  });

  it("handles only variable dependencies", () => {
    const fnDeps = {
      fn1: ["var1", "var2", "var3"],
    };

    const result = collectFnVarDeps(fnDeps);

    expect(result.fn1).toEqual(["var1", "var2", "var3"]);
  });
});
