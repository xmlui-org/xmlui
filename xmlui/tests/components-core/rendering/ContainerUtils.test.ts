import { describe, it, expect } from "vitest";
import {
  isParsedEventValue,
  isArrowExpression,
  extractScopedState,
  CodeBehindParseError,
  ParseVarError,
} from "../../../src/components-core/rendering/ContainerUtils";
import { T_ARROW_EXPRESSION } from "../../../src/components-core/script-runner/ScriptingSourceTree";
import type { ParsedEventValue } from "../../../src/abstractions/scripting/Compilation";
import type { ArrowExpression } from "../../../src/components-core/script-runner/ScriptingSourceTree";

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
