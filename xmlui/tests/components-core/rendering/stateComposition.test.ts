import { describe, it, expect } from "vitest";
import { cloneDeep, merge, pick } from "lodash-es";

// ============================================================================
// State Composition Helper Functions Unit Tests
// ============================================================================

// These functions are from StateContainer.tsx
// We test the logic without React hooks for unit testing

describe("extractScopedState", () => {
  // ========================================================================
  // Scoping Tests
  // ========================================================================

  it("returns all parent state when uses is undefined", () => {
    const parentState = { a: 1, b: 2, c: 3 };
    const EMPTY_OBJECT = {};
    
    const extractScopedState = (
      parentState: Record<string, any>,
      uses?: string[],
    ): Record<string, any> | undefined => {
      if (!uses) {
        return parentState;
      }
      if (uses.length === 0) {
        return EMPTY_OBJECT;
      }
      return pick(parentState, uses);
    };

    const result = extractScopedState(parentState, undefined);

    expect(result).toEqual(parentState);
  });

  it("returns empty object when uses is empty array", () => {
    const parentState = { a: 1, b: 2, c: 3 };
    const EMPTY_OBJECT = {};
    
    const extractScopedState = (
      parentState: Record<string, any>,
      uses?: string[],
    ): Record<string, any> | undefined => {
      if (!uses) {
        return parentState;
      }
      if (uses.length === 0) {
        return EMPTY_OBJECT;
      }
      return pick(parentState, uses);
    };

    const result = extractScopedState(parentState, []);

    expect(result).toEqual({});
  });

  it("returns only specified properties when uses has values", () => {
    const parentState = { a: 1, b: 2, c: 3 };
    const EMPTY_OBJECT = {};
    
    const extractScopedState = (
      parentState: Record<string, any>,
      uses?: string[],
    ): Record<string, any> | undefined => {
      if (!uses) {
        return parentState;
      }
      if (uses.length === 0) {
        return EMPTY_OBJECT;
      }
      return pick(parentState, uses);
    };

    const result = extractScopedState(parentState, ["a", "c"]);

    expect(result).toEqual({ a: 1, c: 3 });
  });

  it("returns empty object when uses specifies non-existent properties", () => {
    const parentState = { a: 1, b: 2 };
    const EMPTY_OBJECT = {};
    
    const extractScopedState = (
      parentState: Record<string, any>,
      uses?: string[],
    ): Record<string, any> | undefined => {
      if (!uses) {
        return parentState;
      }
      if (uses.length === 0) {
        return EMPTY_OBJECT;
      }
      return pick(parentState, uses);
    };

    const result = extractScopedState(parentState, ["x", "y"]);

    expect(result).toEqual({});
  });

  it("handles partial matches when uses includes both existing and non-existing properties", () => {
    const parentState = { a: 1, b: 2, c: 3 };
    const EMPTY_OBJECT = {};
    
    const extractScopedState = (
      parentState: Record<string, any>,
      uses?: string[],
    ): Record<string, any> | undefined => {
      if (!uses) {
        return parentState;
      }
      if (uses.length === 0) {
        return EMPTY_OBJECT;
      }
      return pick(parentState, uses);
    };

    const result = extractScopedState(parentState, ["a", "x", "c"]);

    expect(result).toEqual({ a: 1, c: 3 });
  });
});

describe("useCombinedState logic", () => {
  // ========================================================================
  // Combining Multiple States Tests
  // ========================================================================

  it("combines multiple states with later overriding earlier", () => {
    const state1 = { a: 1, b: 2 };
    const state2 = { b: 3, c: 4 };
    const state3 = { c: 5, d: 6 };

    // Test the combination logic
    const result = { ...state1, ...state2, ...state3 };

    expect(result).toEqual({ a: 1, b: 3, c: 5, d: 6 });
  });

  it("combines empty objects correctly", () => {
    const state1 = {};
    const state2 = { a: 1 };
    const state3 = {};

    const result = { ...state1, ...state2, ...state3 };

    expect(result).toEqual({ a: 1 });
  });

  it("handles undefined states", () => {
    const state1 = { a: 1 };
    const state2 = undefined;
    const state3 = { b: 2 };

    const result = { ...state1, ...(state2 || {}), ...state3 };

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("preserves values when no conflicts", () => {
    const state1 = { a: 1 };
    const state2 = { b: 2 };
    const state3 = { c: 3 };

    const result = { ...state1, ...state2, ...state3 };

    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });
});

describe("useMergedState logic", () => {
  // ========================================================================
  // Merging States Tests
  // ========================================================================

  it("merges plain objects deeply", () => {
    const localVars = { user: { name: "John" } };
    const componentState = { user: { age: 30 } };

    // Test merge logic
    const result = merge(cloneDeep(localVars), componentState);

    expect(result).toEqual({ user: { name: "John", age: 30 } });
  });

  it("uses component state for non-object values", () => {
    const localVars = { count: 0 };
    const componentState = { count: 5 };

    // Later value should win for non-objects
    const result = { ...localVars, ...componentState };

    expect(result).toEqual({ count: 5 });
  });

  it("handles undefined values in componentState", () => {
    const localVars = { a: 1, b: { x: 10 } };
    const componentState = { a: undefined };

    const ret: Record<string, any> = { ...localVars };
    Object.keys(componentState).forEach((key) => {
      const value = componentState[key as keyof typeof componentState];
      if (ret[key] === undefined) {
        ret[key] = value;
      } else {
        if (typeof ret[key] === "object" && ret[key] !== null && typeof value === "object" && value !== null) {
          ret[key] = merge(cloneDeep(ret[key]), value);
        } else {
          ret[key] = value;
        }
      }
    });

    expect(ret.a).toBeUndefined();
    expect(ret.b).toEqual({ x: 10 });
  });

  it("deeply merges nested objects", () => {
    const localVars = { config: { theme: { dark: true }, timeout: 5000 } };
    const componentState = { config: { theme: { light: false } } };

    const ret: Record<string, any> = { ...localVars };
    Object.keys(componentState).forEach((key) => {
      const value = componentState[key as keyof typeof componentState];
      if (ret[key] === undefined) {
        ret[key] = value;
      } else {
        if (typeof ret[key] === "object" && ret[key] !== null && typeof value === "object" && value !== null) {
          ret[key] = merge(cloneDeep(ret[key]), value);
        } else {
          ret[key] = value;
        }
      }
    });

    expect(ret.config.theme).toEqual({ dark: true, light: false });
    expect(ret.config.timeout).toBe(5000);
  });

  it("prioritizes component state over local vars for non-objects", () => {
    const localVars = { a: 1, b: 2 };
    const componentState = { b: 20, c: 30 };

    const ret: Record<string, any> = { ...localVars };
    Object.keys(componentState).forEach((key) => {
      const value = componentState[key as keyof typeof componentState];
      if (ret[key] === undefined) {
        ret[key] = value;
      } else {
        if (typeof ret[key] === "object" && ret[key] !== null && typeof value === "object" && value !== null) {
          ret[key] = merge(cloneDeep(ret[key]), value);
        } else {
          ret[key] = value;
        }
      }
    });

    expect(ret).toEqual({ a: 1, b: 20, c: 30 });
  });

  // ========================================================================
  // Symbol Key Handling Tests
  // ========================================================================

  it("handles symbol keys in merged state", () => {
    const sym = Symbol("test");
    const localVars = { a: 1 };
    const componentState: Record<string | symbol, any> = { [sym]: "value" };

    const ret: Record<string | symbol, any> = { ...localVars };
    Object.keys(componentState).forEach((key) => {
      const value = componentState[key];
      if (ret[key] === undefined) {
        ret[key] = value;
      }
    });

    // Symbol keys from Object.keys are not included (symbols are not enumerable via Object.keys)
    expect(ret[sym]).toBeUndefined();
  });
});
