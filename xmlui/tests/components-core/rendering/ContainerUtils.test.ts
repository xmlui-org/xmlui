import { describe, it, expect } from "vitest";
import { isParsedEventValue, isArrowExpression } from "../../../src/components-core/rendering/ContainerUtils";
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
});
