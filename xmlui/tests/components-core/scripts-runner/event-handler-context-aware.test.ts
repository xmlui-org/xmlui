import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";

import { debounce } from "../../../src/components-core/utils/misc";
import { isEventHandlerContextAwareFunction } from "../../../src/components-core/script-runner/event-handler-context-aware-functions";
import type { EventHandlerContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { evalBindingAsync } from "../../../src/components-core/script-runner/eval-tree-async";
import { createEvalContext } from "./test-helpers";
import { Parser } from "../../../src/parsers/scripting/Parser";

// Helper function to evaluate source code expressions
async function evalAsync(source: string, evalContext: any): Promise<any> {
  const wParser = new Parser(source);
  const tree = wParser.parseExpr();
  if (tree === null) {
    return undefined;
  }
  if (!wParser.isEof) {
    throw new Error("Expression is not terminated properly");
  }
  return await evalBindingAsync(tree, evalContext, undefined);
}

describe("EventHandlerContextAware Functions", () => {
  let originalSetTimeout: typeof setTimeout;
  let originalClearTimeout: typeof clearTimeout;
  let timeoutIds: number[];
  let clearTimeoutCalls: number[];
  let currentTime: number;

  beforeEach(() => {
    timeoutIds = [];
    clearTimeoutCalls = [];
    currentTime = 0;

    // Clear the debounce registry before each test
    (debounce as any).__clearRegistry?.();

    // Mock setTimeout and clearTimeout
    originalSetTimeout = globalThis.setTimeout;
    originalClearTimeout = globalThis.clearTimeout;

    globalThis.setTimeout = vi.fn((callback: () => void, delay: number) => {
      const id = timeoutIds.length;
      timeoutIds.push(id);
      // Store the callback for manual execution
      (globalThis.setTimeout as any).__callbacks = (globalThis.setTimeout as any).__callbacks || {};
      (globalThis.setTimeout as any).__callbacks[id] = callback;
      return id;
    }) as any;

    globalThis.clearTimeout = vi.fn((id: number) => {
      clearTimeoutCalls.push(id);
      if ((globalThis.setTimeout as any).__callbacks) {
        delete (globalThis.setTimeout as any).__callbacks[id];
      }
    }) as any;
  });

  afterEach(() => {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  });

  describe("Function Registry", () => {
    it("should identify debounce as EventHandlerContextAware", () => {
      const result = isEventHandlerContextAwareFunction(debounce);
      expect(result).toBeDefined();
      expect(result?.func).toBe(debounce);
      expect(result?.injectContext).toBe(true);
      expect(result?.help).toBe("Enhanced with event handler context for stable debouncing");
    });

    it("should not identify regular functions as EventHandlerContextAware", () => {
      const regularFunction = () => {};
      const result = isEventHandlerContextAwareFunction(regularFunction);
      expect(result).toBeUndefined();
    });

    it("should handle undefined function gracefully", () => {
      const result = isEventHandlerContextAwareFunction(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("Debounce Function Signatures", () => {
    it("should support legacy signature: debounce(delayMs, func, ...args)", () => {
      const mockFn = vi.fn();
      
      // Call debounce with legacy signature
      debounce(100, mockFn, "arg1", "arg2");
      
      expect(globalThis.setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
      expect(mockFn).not.toHaveBeenCalled();
      
      // Execute the timeout manually
      const callbacks = (globalThis.setTimeout as any).__callbacks;
      const lastTimeoutId = timeoutIds[timeoutIds.length - 1];
      callbacks[lastTimeoutId]();
      
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should support EventHandlerContext signature: debounce(context, delayMs, func, ...args)", () => {
      const mockFn = vi.fn();
      const context: EventHandlerContext = {
        executionId: Symbol("test-execution"),
        componentUid: Symbol("test-component"),
        eventName: "click",
        componentType: "Button",
        handlerSource: "() => console.log('clicked')",
        handlerHash: "hash123",
        startTime: Date.now(),
        sequenceNumber: 1
      };
      
      // Call debounce with context signature
      debounce(context, 100, mockFn, "arg1", "arg2");
      
      expect(globalThis.setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
      expect(mockFn).not.toHaveBeenCalled();
      
      // Execute the timeout manually
      const callbacks = (globalThis.setTimeout as any).__callbacks;
      const lastTimeoutId = timeoutIds[timeoutIds.length - 1];
      callbacks[lastTimeoutId]();
      
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });

  describe("Debounce Key Generation", () => {
    it("should use function.toString() for legacy calls", () => {
      // Create two functions with different implementations to ensure different toString() results
      const mockFn1 = vi.fn().mockImplementation(function func1() { return "first"; });
      const mockFn2 = vi.fn().mockImplementation(function func2() { return "second"; });
      
      // Explicitly set different toString() methods to ensure they're different
      mockFn1.toString = () => "function func1() { return 'first'; }";
      mockFn2.toString = () => "function func2() { return 'second'; }";
      
      // Clear registry to start fresh
      (debounce as any).__clearRegistry();
      
      // Call first debounce
      debounce(100, mockFn1, "arg1");
      expect(timeoutIds.length).toBe(1);
      
      // Call second debounce with different function
      debounce(100, mockFn2, "arg2");
      expect(timeoutIds.length).toBe(2);
      expect(clearTimeoutCalls.length).toBe(0); // Different functions, no clearing
      
      // Verify the functions have different string representations
      expect(mockFn1.toString()).not.toBe(mockFn2.toString());
    });

    it("should use stable context key for EventHandlerContext calls", () => {
      const mockFn = vi.fn();
      const context: EventHandlerContext = {
        executionId: Symbol("test-execution-1"),
        componentUid: Symbol("test-component"),
        eventName: "click",
        componentType: "Button",
        handlerSource: "() => console.log('clicked')",
        handlerHash: "hash123",
        startTime: Date.now(),
        sequenceNumber: 1
      };
      
      // First call
      debounce(context, 100, mockFn, "arg1");
      expect(timeoutIds.length).toBe(1);
      const firstTimeoutId = timeoutIds[0];
      
      // Second call with same context (different execution ID, same handler)
      const context2: EventHandlerContext = {
        ...context,
        executionId: Symbol("test-execution-2"),
        sequenceNumber: 2
      };
      
      debounce(context2, 100, mockFn, "arg2");
      expect(timeoutIds.length).toBe(2);
      expect(clearTimeoutCalls).toEqual([firstTimeoutId]); // First timeout should be cleared
    });

    it("should use different keys for different event handlers", () => {
      const mockFn = vi.fn();
      const context1: EventHandlerContext = {
        executionId: Symbol("test-execution-1"),
        componentUid: Symbol("test-component"),
        eventName: "click",
        componentType: "Button",
        handlerSource: "() => console.log('clicked')",
        handlerHash: "hash123",
        startTime: Date.now(),
        sequenceNumber: 1
      };
      
      const context2: EventHandlerContext = {
        executionId: Symbol("test-execution-2"),
        componentUid: Symbol("test-component"),
        eventName: "click",
        componentType: "Button",
        handlerSource: "() => console.log('different')",
        handlerHash: "hash456", // Different hash
        startTime: Date.now(),
        sequenceNumber: 1
      };
      
      // First call
      debounce(context1, 100, mockFn, "arg1");
      expect(timeoutIds.length).toBe(1);
      
      // Second call with different handler hash
      debounce(context2, 100, mockFn, "arg2");
      expect(timeoutIds.length).toBe(2);
      expect(clearTimeoutCalls.length).toBe(0); // Different handlers, no clearing
    });
  });

  describe("EventHandlerContext Integration", () => {
    it("should inject context when available in evalContext", async () => {
      const mockFn = vi.fn();
      
      // Create eval context with eventHandlerContext
      const eventHandlerContext: EventHandlerContext = {
        executionId: Symbol("test-execution"),
        componentUid: Symbol("test-component"),
        eventName: "click",
        componentType: "Button",
        handlerSource: "debounce(100, mockFn)",
        handlerHash: "hash789",
        startTime: Date.now(),
        sequenceNumber: 1
      };
      
      const evalContext = createEvalContext({
        localContext: { 
          debounce,
          mockFn
        },
        eventHandlerContext
      });
      
      // Execute debounce through the evaluation system
      await evalAsync("debounce(100, mockFn, 'test-arg')", evalContext);
      
      expect(globalThis.setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
      
      // Execute the timeout manually
      const callbacks = (globalThis.setTimeout as any).__callbacks;
      const lastTimeoutId = timeoutIds[timeoutIds.length - 1];
      callbacks[lastTimeoutId]();
      
      expect(mockFn).toHaveBeenCalledWith('test-arg');
    });

    it("should handle multiple rapid debounce calls with same context", async () => {
      const mockFn = vi.fn();
      
      const eventHandlerContext: EventHandlerContext = {
        executionId: Symbol("test-execution"),
        componentUid: Symbol("test-component"),
        eventName: "didChange",
        componentType: "TextBox",
        handlerSource: "debounce(100, mockFn)",
        handlerHash: "hash999",
        startTime: Date.now(),
        sequenceNumber: 1
      };
      
      const evalContext = createEvalContext({
        localContext: { 
          debounce,
          mockFn
        },
        eventHandlerContext
      });
      
      // First call
      await evalAsync("debounce(100, mockFn, 'first')", evalContext);
      expect(timeoutIds.length).toBe(1);
      const firstTimeoutId = timeoutIds[0];
      
      // Update context for second call (same handler, different execution)
      evalContext.eventHandlerContext = {
        ...eventHandlerContext,
        executionId: Symbol("test-execution-2"),
        sequenceNumber: 2
      };
      
      // Second call - should cancel first
      await evalAsync("debounce(100, mockFn, 'second')", evalContext);
      expect(timeoutIds.length).toBe(2);
      expect(clearTimeoutCalls).toEqual([firstTimeoutId]);
      
      // Execute the second timeout
      const callbacks = (globalThis.setTimeout as any).__callbacks;
      const secondTimeoutId = timeoutIds[1];
      callbacks[secondTimeoutId]();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });

    it("should fallback to legacy behavior when no eventHandlerContext", async () => {
      const mockFn = vi.fn();
      
      const evalContext = createEvalContext({
        localContext: { 
          debounce,
          mockFn
        }
        // No eventHandlerContext
      });
      
      // Execute debounce through the evaluation system
      await evalAsync("debounce(100, mockFn, 'fallback-arg')", evalContext);
      
      expect(globalThis.setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
      
      // Execute the timeout manually
      const callbacks = (globalThis.setTimeout as any).__callbacks;
      const lastTimeoutId = timeoutIds[timeoutIds.length - 1];
      callbacks[lastTimeoutId]();
      
      expect(mockFn).toHaveBeenCalledWith('fallback-arg');
    });
  });

  describe("Argument Transformation", () => {
    it("should not require transformArgs function for basic context injection", () => {
      const info = isEventHandlerContextAwareFunction(debounce);
      expect(info).toBeDefined();
      expect(info?.func).toBe(debounce);
      expect(info?.injectContext).toBe(true);
      // transformArgs is optional and we've simplified to not use it
      expect(info?.transformArgs).toBeUndefined();
    });
  });
});