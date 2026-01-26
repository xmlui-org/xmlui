import { describe, expect, it } from "vitest";
import { evalBinding } from "../../../src/components-core/script-runner/eval-tree-sync";
import { processStatementQueue } from "../../../src/components-core/script-runner/process-statement-sync";
import { createEvalContext, parseExpression, parseStatements } from "./test-helpers";

describe("Async/Await Error Handling", () => {
  describe("Async function declaration errors", () => {
    it("should throw error for async function declaration", () => {
      // --- Arrange
      const source = "async function myFunc() { return 42; }";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support async function declarations."
      );
    });

    it("should throw error for async function with parameters", () => {
      // --- Arrange
      const source = "async function fetchData(url) { return url; }";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support async function declarations."
      );
    });

    it("should throw error for nested async function", () => {
      // --- Arrange
      const source = "function outer() { async function inner() { return 1; } } outer();";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support async function declarations."
      );
    });

    it("should allow regular function declarations", () => {
      // --- Arrange
      const source = "function myFunc() { return 42; }";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).not.toThrow();
    });
  });

  describe("Await expression errors", () => {
    it("should throw error for await in expression", () => {
      // --- Arrange
      const source = "await promise";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the await operator."
      );
    });

    it("should throw error for await with function call", () => {
      // --- Arrange
      const source = "await fetch(url)";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the await operator."
      );
    });

    it("should throw error for await in return statement", () => {
      // --- Arrange
      const source = "return await promise";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the await operator."
      );
    });

    it("should throw error for await in variable declaration", () => {
      // --- Arrange
      const source = "const result = await fetchData()";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support the await operator."
      );
    });

    it("should throw error for chained await", () => {
      // --- Arrange
      const source = "await await promise";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the await operator."
      );
    });

    it("should throw error for await in binary expression", () => {
      // --- Arrange
      const source = "(await a) + (await b)";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => evalBinding(expr, evalContext)).toThrow(
        "XMLUI does not support the await operator."
      );
    });
  });

  describe("Combined async/await errors", () => {
    it("should throw error for async function with await in body", () => {
      // --- Arrange
      const source = "async function fetchUser(id) { const data = await fetch(id); return data; }";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support async function declarations."
      );
    });

    it("should throw error for async arrow function", () => {
      // --- Arrange
      const source = "const f = async () => { return 42; }";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support async arrow functions."
      );
    });

    it("should throw error for async function expression", () => {
      // --- Arrange
      const source = "const f = async function(x) { return x * 2; }";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support async arrow functions."
      );
    });

    it("should throw error for async IIFE", () => {
      // --- Arrange
      const source = "(async () => {})()";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support async arrow functions."
      );
    });

    it("should throw error for async IIFE with body", () => {
      // --- Arrange
      const source = "(async () => { return 42; })()";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act & Assert
      expect(() => processStatementQueue(statements, evalContext)).toThrow(
        "XMLUI does not support async arrow functions."
      );
    });
  });

  describe("Edge cases - async/await as identifiers", () => {
    it("should allow 'async' as variable name", () => {
      // --- Arrange
      const source = "const async = 42";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(evalContext.mainThread.blocks[0].vars.async).toBe(42);
    });

    it("should allow 'await' as variable name", () => {
      // --- Arrange
      const source = "const await = 100";
      const statements = parseStatements(source);
      const evalContext = createEvalContext({});

      // --- Act
      processStatementQueue(statements, evalContext);

      // --- Assert
      expect(evalContext.mainThread.blocks[0].vars.await).toBe(100);
    });

    it("should allow 'async' as property name", () => {
      // --- Arrange
      const source = "obj.async";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});
      evalContext.mainThread.blocks[0].vars.obj = { async: "test" };

      // --- Act
      const result = evalBinding(expr, evalContext);

      // --- Assert
      expect(result).toBe("test");
    });

    it("should allow 'await' as property name", () => {
      // --- Arrange
      const source = "obj.await";
      const expr = parseExpression(source);
      const evalContext = createEvalContext({});
      evalContext.mainThread.blocks[0].vars.obj = { await: "value" };

      // --- Act
      const result = evalBinding(expr, evalContext);

      // --- Assert
      expect(result).toBe("value");
    });
  });
});
