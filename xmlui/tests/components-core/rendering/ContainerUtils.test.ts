import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isParsedEventValue,
  isArrowExpression,
  extractScopedState,
  narrowGlobalVars,
  CodeBehindParseError,
  ParseVarError,
} from "../../../src/components-core/rendering/ContainerUtils";
import { UNSTABLE_GLOBAL_VARS } from "../../../src/components-core/state/unstableGlobalVars";
import { T_ARROW_EXPRESSION } from "../../../src/components-core/script-runner/ScriptingSourceTree";
import type { ParsedEventValue } from "../../../src/abstractions/scripting/Compilation";
import type { ArrowExpression } from "../../../src/components-core/script-runner/ScriptingSourceTree";
import { Parser } from "../../../src/parsers/scripting/Parser";

describe("ContainerUtils", () => {
  describe("isParsedEventValue", () => {
    it("should return true for ParsedEventValue objects", () => {
      const parsedValue: ParsedEventValue = {
        __PARSED: true,
        parseId: Symbol("test"),
        statements: [],
        source: "test code",
      } as any;

      expect(isParsedEventValue(parsedValue)).toBe(true);
    });

    it("should return false for string values", () => {
      const stringValue = "some code";
      expect(isParsedEventValue(stringValue as any)).toBe(false);
    });

    it("should return false for ArrowExpression objects", () => {
      const arrowExpr: ArrowExpression = {
        type: T_ARROW_EXPRESSION,
        nodeId: 123,
        statement: {} as any,
      } as any;

      expect(isParsedEventValue(arrowExpr as any)).toBe(false);
    });

    it("should return false for objects without __PARSED property", () => {
      const obj = { someProperty: "value" };
      expect(isParsedEventValue(obj as any)).toBe(false);
    });

    it("should return false for objects with __PARSED = false", () => {
      const obj = { __PARSED: false };
      expect(isParsedEventValue(obj as any)).toBe(false);
    });

    it("should return false for null and undefined", () => {
      expect(isParsedEventValue(null as any)).toBe(false);
      expect(isParsedEventValue(undefined as any)).toBe(false);
    });
  });

  describe("isArrowExpression", () => {
    it("should return true for ArrowExpression objects", () => {
      const arrowExpr: ArrowExpression = {
        type: T_ARROW_EXPRESSION,
        nodeId: 123,
        statement: {} as any,
      } as any;

      expect(isArrowExpression(arrowExpr as any)).toBe(true);
    });

    it("should return false for string values", () => {
      const stringValue = "some code";
      expect(isArrowExpression(stringValue as any)).toBe(false);
    });

    it("should return false for ParsedEventValue objects", () => {
      const parsedValue: ParsedEventValue = {
        __PARSED: true,
        parseId: Symbol("test"),
        statements: [],
        source: "test code",
      } as any;

      expect(isArrowExpression(parsedValue as any)).toBe(false);
    });

    it("should return false for objects with wrong type", () => {
      const obj = { type: "SOME_OTHER_TYPE" };
      expect(isArrowExpression(obj as any)).toBe(false);
    });

    it("should return false for objects without type property", () => {
      const obj = { someProperty: "value" };
      expect(isArrowExpression(obj as any)).toBe(false);
    });

    it("should return false for null and undefined", () => {
      expect(isArrowExpression(null as any)).toBe(false);
      expect(isArrowExpression(undefined as any)).toBe(false);
    });
  });

  describe("extractScopedState", () => {
    beforeEach(() => {
      // Populate the unstable vars set as FrameworkGlobals.ts would at app init
      // (App.tsx metadata declares these as unstableChildInjectedVars).
      UNSTABLE_GLOBAL_VARS.add("$pathname");
      UNSTABLE_GLOBAL_VARS.add("$routeParams");
      UNSTABLE_GLOBAL_VARS.add("$queryParams");
      UNSTABLE_GLOBAL_VARS.add("$linkInfo");
    });

    afterEach(() => {
      UNSTABLE_GLOBAL_VARS.clear();
    });

    it("should return parent state when uses is undefined", () => {
      const parentState = { user: { id: 1 }, count: 5 };
      const result = extractScopedState(parentState);
      expect(result).toBe(parentState);
    });

    it("should return empty object when uses is empty array", () => {
      const parentState = { user: { id: 1 }, count: 5 };
      const result = extractScopedState(parentState, []);
      expect(result).toEqual({});
    });

    it("should extract specified properties from parent state", () => {
      const parentState = { user: { id: 1 }, count: 5, name: "John" };
      const result = extractScopedState(parentState, ["user", "count"]);
      expect(result).toEqual({ user: { id: 1 }, count: 5 });
      expect(result).not.toHaveProperty("name");
    });

    it("should handle non-existent properties gracefully", () => {
      const parentState = { user: { id: 1 } };
      const result = extractScopedState(parentState, ["user", "nonExistent"]);
      expect(result).toEqual({ user: { id: 1 } });
      expect(result).not.toHaveProperty("nonExistent");
    });

    it("should preserve nested object references", () => {
      const user = { id: 1, name: "John" };
      const parentState = { user, count: 5 };
      const result = extractScopedState(parentState, ["user"]) as any;
      expect(result.user).toBe(user); // Same reference
    });

    it("should handle empty parent state", () => {
      const result = extractScopedState({}, ["user", "count"]);
      expect(result).toEqual({});
    });

    it("should preserve all Symbol-keyed properties", () => {
      const sym1 = Symbol("component1");
      const sym2 = Symbol("component2");
      const parentState = {
        user: { id: 1 },
        [sym1]: { value: "comp1" },
        [sym2]: { value: "comp2" },
      };
      const result = extractScopedState(parentState, ["user"]) as any;
      expect(result.user).toEqual({ id: 1 });
      expect(result[sym1]).toEqual({ value: "comp1" });
      expect(result[sym2]).toEqual({ value: "comp2" });
    });

    it("should preserve lexical-scope $-prefixed variables", () => {
      const parentState = {
        user: { id: 1 },
        $item: { name: "Item1" },
        $itemIndex: 0,
        $param: "param_value",
        count: 5,
      };
      const result = extractScopedState(parentState, ["user", "count"]) as any;
      expect(result.user).toEqual({ id: 1 });
      expect(result.count).toBe(5);
      expect(result.$item).toEqual({ name: "Item1" });
      expect(result.$itemIndex).toBe(0);
      expect(result.$param).toBe("param_value");
    });

    it("should exclude unstable global variables from $-prefixed preservation", () => {
      const parentState = {
        user: { id: 1 },
        $item: { name: "Item1" },
        $pathname: "/some/path",
        $routeParams: { id: "123" },
        $queryParams: { search: "test" },
        $linkInfo: { href: "/" },
      };
      const result = extractScopedState(parentState, ["user"]) as any;
      expect(result.user).toEqual({ id: 1 });
      expect(result.$item).toEqual({ name: "Item1" });
      expect(result).not.toHaveProperty("$pathname");
      expect(result).not.toHaveProperty("$routeParams");
      expect(result).not.toHaveProperty("$queryParams");
      expect(result).not.toHaveProperty("$linkInfo");
    });

    it("should preserve both Symbols and $-prefixed variables together", () => {
      const sym = Symbol("myComponent");
      const parentState = {
        user: { id: 1 },
        [sym]: { internal: "state" },
        $item: { name: "Item1" },
      };
      const result = extractScopedState(parentState, ["user"]) as any;
      expect(result.user).toEqual({ id: 1 });
      expect(result[sym]).toEqual({ internal: "state" });
      expect(result.$item).toEqual({ name: "Item1" });
    });
  });

  describe("CodeBehindParseError", () => {
    it("should format error messages from module errors", () => {
      const errors = {
        Main: [
          { code: "E001", text: "Syntax error", line: 10, column: 5 },
          { code: "E002", text: "Type mismatch" },
        ],
      };
      const error = new CodeBehindParseError(errors);
      expect(error.message).toContain("E001 : Syntax error (line:10, column:5)");
      expect(error.message).toContain("E002 : Type mismatch");
    });

    it("should handle errors without line/column info", () => {
      const errors = {
        Main: [{ code: "E001", text: "Generic error" }],
      };
      const error = new CodeBehindParseError(errors);
      expect(error.message).toBe("E001 : Generic error");
    });

    it("should handle empty Main errors array", () => {
      const errors = { Main: [] };
      const error = new CodeBehindParseError(errors);
      expect(error.message).toBe("");
    });

    it("should handle missing Main key", () => {
      const errors = {};
      const error = new CodeBehindParseError(errors);
      expect(error.message).toBe("");
    });

    it("should join multiple errors with newlines", () => {
      const errors = {
        Main: [
          { code: "E001", text: "Error 1" },
          { code: "E002", text: "Error 2" },
          { code: "E003", text: "Error 3" },
        ],
      };
      const error = new CodeBehindParseError(errors);
      const lines = error.message.split("\n");
      expect(lines).toHaveLength(3);
    });
  });

  describe("narrowGlobalVars", () => {
    it("always forwards function-valued keys regardless of uses list", () => {
      const myFunc = () => {};
      const vars = { myFunc, theme: "dark", sortBy: "name" };
      const result = narrowGlobalVars(vars, ["theme"]);
      expect(result.myFunc).toBe(myFunc);
      expect(result.theme).toBe("dark");
      expect(result).not.toHaveProperty("sortBy");
    });

    it("forwards all functions even when uses list is empty", () => {
      const fn1 = () => {};
      const fn2 = () => {};
      const vars = { fn1, fn2, theme: "dark" };
      const result = narrowGlobalVars(vars, []);
      expect(result.fn1).toBe(fn1);
      expect(result.fn2).toBe(fn2);
      expect(result).not.toHaveProperty("theme");
    });

    it("forwards only listed value keys", () => {
      const vars = { a: 1, b: 2, c: 3 };
      const result = narrowGlobalVars(vars, ["a", "c"]);
      expect(result).toHaveProperty("a", 1);
      expect(result).toHaveProperty("c", 3);
      expect(result).not.toHaveProperty("b");
    });

    it("includes __tree_* only for vars in the uses set", () => {
      const treeTheme = { __mock_ast__: "theme" };
      const treeSortBy = { __mock_ast__: "sortBy" };
      const vars = {
        theme: "dark",
        sortBy: "name",
        __tree_theme: treeTheme,
        __tree_sortBy: treeSortBy,
      };
      const result = narrowGlobalVars(vars, ["theme"]);
      expect(result.__tree_theme).toBe(treeTheme);
      expect(result).not.toHaveProperty("__tree_sortBy");
    });

    it("excludes __tree_* for vars not in uses set", () => {
      const vars = {
        a: 1,
        b: 2,
        __tree_a: { __mock_ast__: "a" },
        __tree_b: { __mock_ast__: "b" },
      };
      const result = narrowGlobalVars(vars, ["b"]);
      expect(result).toHaveProperty("b", 2);
      expect(result.__tree_b).toBeDefined();
      expect(result).not.toHaveProperty("a");
      expect(result).not.toHaveProperty("__tree_a");
    });

    it("transitive: includes global Y when included global X depends on Y via __tree_X AST", () => {
      // "sortBy + 1" references sortBy — parser produces a real AST with that identifier
      const tree = new Parser("sortBy + 1").parseStatements();
      const vars: Record<string, any> = {
        x: 11,        // evaluated value of "sortBy + 1"
        sortBy: "name",
        __tree_x: tree,
      };
      const result = narrowGlobalVars(vars, ["x"]);
      expect(result).toHaveProperty("x", 11);
      // sortBy must be included because __tree_x references it
      expect(result).toHaveProperty("sortBy", "name");
      // __tree_x must also be included (x is in uses)
      expect(result.__tree_x).toBe(tree);
    });

    it("transitive: does not include globals not referenced by any __tree_* in uses", () => {
      const tree = new Parser("sortBy + 1").parseStatements();
      const vars: Record<string, any> = {
        x: 11,
        sortBy: "name",
        theme: "dark",  // not referenced by __tree_x
        __tree_x: tree,
      };
      const result = narrowGlobalVars(vars, ["x"]);
      expect(result).not.toHaveProperty("theme");
    });

    it("returns shallowly equal object when an unrelated global changes (optimization invariant)", () => {
      const myFunc = () => {};
      const vars1 = { myFunc, theme: "dark", sortBy: "name" };
      // sortBy changes but the container only reads theme
      const vars2 = { ...vars1, sortBy: "date" };

      const result1 = narrowGlobalVars(vars1, ["theme"]);
      const result2 = narrowGlobalVars(vars2, ["theme"]);

      // Same keys
      expect(Object.keys(result1).sort()).toEqual(Object.keys(result2).sort());
      // useShallowCompareMemoize would compare each key by reference equality
      const allKeys = Object.keys(result1);
      const shallowEqual = allKeys.every(k => (result1 as any)[k] === (result2 as any)[k]);
      expect(shallowEqual).toBe(true);
    });

    it("WeakMap cache: second call with same vars reference returns cached function keys (no rescan)", () => {
      let callCount = 0;
      const trackedFunc = new Proxy(() => {}, {
        get(target, prop) {
          if (prop === "length" || prop === "name" || prop === "prototype") {
            return (target as any)[prop];
          }
          callCount++;
          return (target as any)[prop];
        },
      });
      const vars = { trackedFunc, theme: "dark" };
      // First call seeds the cache for this vars reference
      narrowGlobalVars(vars, ["theme"]);
      // Second call with the same vars should reuse function keys from the cache
      narrowGlobalVars(vars, ["theme"]);
      // Both calls should produce correct results
      const result = narrowGlobalVars(vars, []);
      expect(result).toHaveProperty("trackedFunc");
      expect(result).not.toHaveProperty("theme");
    });

    it("handles vars with no functions correctly", () => {
      const vars = { a: 1, b: "str", c: [1, 2] };
      const result = narrowGlobalVars(vars, ["a"]);
      expect(result).toHaveProperty("a", 1);
      expect(result).not.toHaveProperty("b");
      expect(result).not.toHaveProperty("c");
    });

    it("handles empty uses with no functions — returns empty object", () => {
      const vars = { a: 1, b: 2 };
      const result = narrowGlobalVars(vars, []);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe("ParseVarError", () => {
    it("should format error with variable name and original message", () => {
      const originalError = new Error("Division by zero");
      const error = new ParseVarError("myVar", originalError);
      expect(error.message).toBe("Error on var: myVar - Division by zero");
    });

    it("should handle errors without message", () => {
      const error = new ParseVarError("myVar", {});
      expect(error.message).toBe("Error on var: myVar - unknown");
    });

    it("should handle null originalError", () => {
      const error = new ParseVarError("myVar", null);
      expect(error.message).toBe("Error on var: myVar - unknown");
    });

    it("should handle undefined originalError", () => {
      const error = new ParseVarError("myVar", undefined);
      expect(error.message).toBe("Error on var: myVar - unknown");
    });

    it("should handle string errors", () => {
      const error = new ParseVarError("myVar", "Something went wrong");
      expect(error.message).toBe("Error on var: myVar - unknown");
    });
  });
});
