import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { createEvalContext, parseStatements } from "./test-helpers";
import type { EventHandlerContext, BindingTreeEvaluationContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { hashString } from "../../../src/components-core/utils/misc";

describe("Event Handler Correlation Infrastructure", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console.log to capture correlation logs
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("EventHandlerContext", () => {
    it("should process statements without eventHandlerContext", async () => {
      // --- Arrange
      const source = "x = 42;";
      const evalContext = createEvalContext({
        localContext: { x: 0 },
      });
      const statements = parseStatements(source);

      // --- Act
      const diag = await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(evalContext.localContext.x).toBe(42);
      expect(diag.processedStatements).toBe(1);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should log correlation information when eventHandlerContext is provided", async () => {
      // --- Arrange
      const source = "result = value * 2;";
      const componentUid = Symbol("TestComponent");
      const eventHandlerContext: EventHandlerContext = {
        executionId: Symbol("test-execution"),
        componentUid,
        eventName: "click",
        componentType: "Button",
        handlerSource: source,
        handlerHash: hashString(source),
        startTime: Date.now(),
        sequenceNumber: 1,
      };

      const evalContext = createEvalContext({
        localContext: { value: 10, result: 0 },
        eventHandlerContext,
      });
      const statements = parseStatements(source);

      // --- Act
      const diag = await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(evalContext.localContext.result).toBe(20);
      expect(diag.processedStatements).toBe(1);
      
      // Verify correlation log was called
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Event Handler Correlation]")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Component: Button")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Event: click")
      );
    });

    it("should generate stable hash for identical handler sources", () => {
      // --- Arrange
      const source1 = "(val) => { this.value = val; }";
      const source2 = "(val) => { this.value = val; }";
      const source3 = "(val) => { this.value = val + 1; }";

      // --- Act
      const hash1 = hashString(source1);
      const hash2 = hashString(source2);
      const hash3 = hashString(source3);

      // --- Assert
      expect(hash1).toBe(hash2); // Same source should have same hash
      expect(hash1).not.toBe(hash3); // Different source should have different hash
      expect(hash1).toMatch(/^[a-z0-9]+$/); // Should be alphanumeric
    });

    it("should track sequence numbers correctly", async () => {
      // --- Arrange
      const source = "counter++;";
      const componentUid = Symbol("Counter");
      
      const createContextWithSequence = (seq: number): BindingTreeEvaluationContext => {
        const eventHandlerContext: EventHandlerContext = {
          executionId: Symbol(`execution-${seq}`),
          componentUid,
          eventName: "increment",
          componentType: "Counter",
          handlerSource: source,
          handlerHash: hashString(source),
          startTime: Date.now(),
          sequenceNumber: seq,
        };

        return createEvalContext({
          localContext: { counter: 0 },
          eventHandlerContext,
        });
      };

      const statements = parseStatements(source);

      // --- Act & Assert
      // First execution
      const evalContext1 = createContextWithSequence(1);
      await processStatementQueueAsync(statements, evalContext1);
      
      expect(evalContext1.eventHandlerContext?.sequenceNumber).toBe(1);

      // Second execution
      const evalContext2 = createContextWithSequence(2);
      await processStatementQueueAsync(statements, evalContext2);
      
      expect(evalContext2.eventHandlerContext?.sequenceNumber).toBe(2);

      // Verify both logged
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it("should handle different event types for same component", async () => {
      // --- Arrange
      const componentUid = Symbol("TextBox");
      const clickSource = "handleClick();";
      const changeSource = "handleChange(value);";

      const clickContext: EventHandlerContext = {
        executionId: Symbol("click-execution"),
        componentUid,
        eventName: "click",
        componentType: "TextBox",
        handlerSource: clickSource,
        handlerHash: hashString(clickSource),
        startTime: Date.now(),
        sequenceNumber: 1,
      };

      const changeContext: EventHandlerContext = {
        executionId: Symbol("change-execution"),
        componentUid,
        eventName: "didChange",
        componentType: "TextBox",
        handlerSource: changeSource,
        handlerHash: hashString(changeSource),
        startTime: Date.now(),
        sequenceNumber: 1,
      };

      // --- Act
      const clickEvalContext = createEvalContext({
        localContext: { handleClick: vi.fn() },
        eventHandlerContext: clickContext,
      });

      const changeEvalContext = createEvalContext({
        localContext: { handleChange: vi.fn(), value: "test" },
        eventHandlerContext: changeContext,
      });

      const clickStatements = parseStatements(clickSource);
      const changeStatements = parseStatements(changeSource);

      await processStatementQueueAsync(clickStatements, clickEvalContext);
      await processStatementQueueAsync(changeStatements, changeEvalContext);

      // --- Assert
      expect(clickContext.eventName).toBe("click");
      expect(changeContext.eventName).toBe("didChange");
      expect(clickContext.handlerHash).not.toBe(changeContext.handlerHash);
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it("should correlate multiple executions of same handler", async () => {
      // --- Arrange
      const source = "text += char;";
      const componentUid = Symbol("TextInput");
      const handlerHash = hashString(source);

      const createTypingExecution = (char: string, sequence: number) => {
        const eventHandlerContext: EventHandlerContext = {
          executionId: Symbol(`typing-${sequence}`),
          componentUid,
          eventName: "didChange",
          componentType: "TextBox",
          handlerSource: source,
          handlerHash,
          startTime: Date.now(),
          sequenceNumber: sequence,
        };

        return createEvalContext({
          localContext: { text: "", char },
          eventHandlerContext,
        });
      };

      const statements = parseStatements(source);

      // --- Act
      // Simulate typing "abc"
      const contexts = [
        createTypingExecution("a", 1),
        createTypingExecution("b", 2),
        createTypingExecution("c", 3),
      ];

      for (const context of contexts) {
        await processStatementQueueAsync(statements, context);
      }

      // --- Assert
      // All executions should have same component and handler hash
      contexts.forEach((context, index) => {
        expect(context.eventHandlerContext?.componentUid).toBe(componentUid);
        expect(context.eventHandlerContext?.handlerHash).toBe(handlerHash);
        expect(context.eventHandlerContext?.sequenceNumber).toBe(index + 1);
        expect(context.eventHandlerContext?.eventName).toBe("didChange");
      });

      // Should have logged 3 times
      expect(consoleSpy).toHaveBeenCalledTimes(3);
    });

    it("should handle arrow expression handlers", async () => {
      // --- Arrange
      const source = "(value) => this.state = value";
      const componentUid = Symbol("Component");
      
      const eventHandlerContext: EventHandlerContext = {
        executionId: Symbol("arrow-execution"),
        componentUid,
        eventName: "onChange",
        componentType: "Input",
        handlerSource: source,
        handlerHash: hashString(source),
        startTime: Date.now(),
        sequenceNumber: 1,
      };

      const evalContext = createEvalContext({
        localContext: { 
          state: null,
          eventArgs: ["test value"]
        },
        eventHandlerContext,
      });

      const statements = parseStatements(source);

      // --- Act
      await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Event: onChange")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Component: Input")
      );
    });

    it("should provide unique execution IDs for same handler", async () => {
      // --- Arrange
      const source = "count++;";
      const componentUid = Symbol("Counter");
      const handlerHash = hashString(source);

      const execution1: EventHandlerContext = {
        executionId: Symbol("exec-1"),
        componentUid,
        eventName: "increment",
        componentType: "Counter",
        handlerSource: source,
        handlerHash,
        startTime: Date.now(),
        sequenceNumber: 1,
      };

      const execution2: EventHandlerContext = {
        executionId: Symbol("exec-2"),
        componentUid,
        eventName: "increment",
        componentType: "Counter",
        handlerSource: source,
        handlerHash,
        startTime: Date.now() + 100,
        sequenceNumber: 2,
      };

      // --- Act & Assert
      expect(execution1.executionId).not.toBe(execution2.executionId);
      expect(execution1.handlerHash).toBe(execution2.handlerHash);
      expect(execution1.componentUid).toBe(execution2.componentUid);
      expect(execution1.sequenceNumber).not.toBe(execution2.sequenceNumber);
    });
  });

  describe("Hash Function", () => {
    it("should handle empty strings", () => {
      const hash = hashString("");
      expect(hash).toBe("0");
    });

    it("should produce consistent hashes", () => {
      const input = "test input string";
      const hash1 = hashString(input);
      const hash2 = hashString(input);
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different inputs", () => {
      const hash1 = hashString("input1");
      const hash2 = hashString("input2");
      expect(hash1).not.toBe(hash2);
    });

    it("should handle special characters", () => {
      const input = "() => { this.value = 'special chars: !@#$%^&*()'; }";
      const hash = hashString(input);
      expect(hash).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe("Integration with processStatementQueueAsync", () => {
    it("should not affect statement execution performance", async () => {
      // --- Arrange
      const source = `
        let total = 0;
        for (let i = 0; i < 100; i++) {
          total += i;
        }
      `;

      const eventHandlerContext: EventHandlerContext = {
        executionId: Symbol("perf-test"),
        componentUid: Symbol("PerfComponent"),
        eventName: "calculate",
        componentType: "Calculator",
        handlerSource: source,
        handlerHash: hashString(source),
        startTime: Date.now(),
        sequenceNumber: 1,
      };

      const evalContext = createEvalContext({
        localContext: {},
        eventHandlerContext,
      });

      const statements = parseStatements(source);
      const startTime = Date.now();

      // --- Act
      const diag = await processStatementQueueAsync(statements, evalContext);
      const endTime = Date.now();

      // --- Assert
      expect(diag.processedStatements).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete quickly
      
      // Check if the calculation worked by accessing the variable from the thread blocks
      const threadVars = evalContext.mainThread?.blocks?.[0]?.vars;
      expect(threadVars?.total).toBe(4950); // Verify calculation worked
    });

    it("should handle complex nested statements", async () => {
      // --- Arrange
      const source = `
        function processData(data) {
          let result = [];
          for (let item of data) {
            if (item > 0) {
              result.push(item * 2);
            }
          }
          return result;
        }
        
        output = processData([1, -2, 3, -4, 5]);
      `;

      const eventHandlerContext: EventHandlerContext = {
        executionId: Symbol("complex-test"),
        componentUid: Symbol("DataProcessor"),
        eventName: "process",
        componentType: "DataGrid",
        handlerSource: source,
        handlerHash: hashString(source),
        startTime: Date.now(),
        sequenceNumber: 1,
      };

      const evalContext = createEvalContext({
        localContext: { output: null },
        eventHandlerContext,
      });

      const statements = parseStatements(source);

      // --- Act
      const diag = await processStatementQueueAsync(statements, evalContext);

      // --- Assert
      expect(diag.processedStatements).toBeGreaterThan(1);
      expect(evalContext.localContext.output).toEqual([2, 6, 10]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Event Handler Correlation]")
      );
    });
  });
});