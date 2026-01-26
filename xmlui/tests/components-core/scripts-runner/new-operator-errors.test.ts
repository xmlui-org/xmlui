import { describe, expect, it } from "vitest";
import { evalBinding } from "../../../src/components-core/script-runner/eval-tree-sync";
import { processStatementQueue } from "../../../src/components-core/script-runner/process-statement-sync";
import { createEvalContext, parseExpression, parseStatements } from "./test-helpers";

describe("New Operator Error Handling", () => {
  describe("New expression errors in expressions", () => {
    it("should throw error for new with no arguments", () => {
      // --- Arrange
      const source = "new Date";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new with empty parentheses", () => {
      // --- Arrange
      const source = "new Date()";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new with arguments", () => {
      // --- Arrange
      const source = "new Date(2024, 0, 1)";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new with member access", () => {
      // --- Arrange
      const source = "new obj.Constructor()";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({ localContext: { obj: {} } });

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new with complex expression", () => {
      // --- Arrange
      const source = "new Point(x + 1, y * 2)";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({ localContext: { Point: class {}, x: 10, y: 20 } });

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for nested new expressions", () => {
      // --- Arrange
      const source = "new Outer(new Inner())";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });
  });

  describe("New expression errors in statements", () => {
    it("should throw error for new in variable declaration", () => {
      // --- Arrange
      const source = "const date = new Date()";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new in return statement", () => {
      // --- Arrange
      const source = "return new Error('test')";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new in assignment", () => {
      // --- Arrange
      const source = "let obj; obj = new Object()";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new in function call argument", () => {
      // --- Arrange
      const source = "console.log(new Date())";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new in array literal", () => {
      // --- Arrange
      const source = "const arr = [new Date(), new Date()]";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new in object literal", () => {
      // --- Arrange
      const source = "const obj = { date: new Date() }";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });
  });

  describe("New expression errors in binary and conditional expressions", () => {
    it("should throw error for new in binary expression", () => {
      // --- Arrange
      const source = "new Date() > new Date()";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new in conditional expression", () => {
      // --- Arrange
      const source = "flag ? new Date() : new Date()";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({ localContext: { flag: true } });

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new with property access on result", () => {
      // --- Arrange
      const source = "new Date().getTime()";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });
  });

  describe("New expression errors in loops and control flow", () => {
    it("should throw error for new in for loop initializer", () => {
      // --- Arrange
      const source = "for (let i = new Number(0); i < 10; i++) {}";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new in while loop condition", () => {
      // --- Arrange
      const source = "while (new Boolean(true)) { break; }";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new in if statement condition", () => {
      // --- Arrange
      const source = "if (new Boolean(true)) {}";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });

    it("should throw error for new in switch statement", () => {
      // --- Arrange
      const source = "switch (new String('test')) { case 'test': break; }";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the new operator."
      );
    });
  });
});
