import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  safeStringify,
  simpleStringify,
  prefixLines,
  formatDiff,
  formatChange,
  pushXsLog,
  createLogEntry,
  generateTraceId,
  pushTrace,
  popTrace,
  getCurrentTrace,
} from "../../src/components-core/inspector/inspectorUtils";

/**
 * Unit tests for inspectorUtils.ts utility functions.
 */

describe("inspectorUtils", () => {
  // ==========================================================================
  // SAFE STRINGIFY
  // ==========================================================================
  describe("safeStringify", () => {
    it("handles undefined", () => {
      expect(safeStringify(undefined)).toBe("undefined");
    });

    it("handles null", () => {
      expect(safeStringify(null)).toBe("null");
    });

    it("handles primitives", () => {
      expect(safeStringify(42)).toBe("42");
      expect(safeStringify("hello")).toBe('"hello"');
      expect(safeStringify(true)).toBe("true");
    });

    it("handles simple objects", () => {
      const result = safeStringify({ a: 1, b: "test" });
      expect(JSON.parse(result)).toEqual({ a: 1, b: "test" });
    });

    it("handles arrays", () => {
      const result = safeStringify([1, 2, 3]);
      expect(JSON.parse(result)).toEqual([1, 2, 3]);
    });

    it("handles functions by replacing with [Function]", () => {
      const obj = { fn: () => {} };
      const result = safeStringify(obj);
      expect(result).toContain("[Function]");
    });

    it("handles circular references", () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      const result = safeStringify(obj);
      expect(result).toContain("[Circular]");
    });

    it("handles nested circular references", () => {
      const obj: any = { a: { b: { c: 1 } } };
      obj.a.b.parent = obj.a;
      const result = safeStringify(obj);
      expect(result).toContain("[Circular]");
    });

    it("handles Window object", () => {
      const obj = { win: window };
      const result = safeStringify(obj);
      expect(result).toContain("[Window]");
    });

    it("handles Document object", () => {
      const obj = { doc: document };
      const result = safeStringify(obj);
      expect(result).toContain("[Document]");
    });

    it("handles DOM nodes", () => {
      const div = document.createElement("div");
      const obj = { element: div };
      const result = safeStringify(obj);
      expect(result).toContain("[DOM Node]");
    });
  });

  // ==========================================================================
  // SIMPLE STRINGIFY
  // ==========================================================================
  describe("simpleStringify", () => {
    it("handles undefined", () => {
      expect(simpleStringify(undefined)).toBe("undefined");
    });

    it("handles objects with formatting", () => {
      const result = simpleStringify({ a: 1 });
      expect(result).toContain("\n"); // Should have newlines from formatting
      expect(JSON.parse(result)).toEqual({ a: 1 });
    });

    it("returns String() for non-serializable values", () => {
      const circular: any = {};
      circular.self = circular;
      // simpleStringify doesn't handle circular refs, so it falls back to String()
      const result = simpleStringify(circular);
      expect(result).toBe("[object Object]");
    });
  });

  // ==========================================================================
  // PREFIX LINES
  // ==========================================================================
  describe("prefixLines", () => {
    it("prefixes single line", () => {
      expect(prefixLines("hello", "- ")).toBe("- hello");
    });

    it("prefixes multiple lines", () => {
      expect(prefixLines("line1\nline2\nline3", "+ ")).toBe("+ line1\n+ line2\n+ line3");
    });

    it("handles empty string", () => {
      expect(prefixLines("", "- ")).toBe("- ");
    });

    it("handles empty prefix", () => {
      expect(prefixLines("hello\nworld", "")).toBe("hello\nworld");
    });
  });

  // ==========================================================================
  // FORMAT DIFF
  // ==========================================================================
  describe("formatDiff", () => {
    it("creates correct structure", () => {
      const result = formatDiff("test.path", 1, 2);
      expect(result.path).toBe("test.path");
      expect(result.type).toBe("update");
      expect(result.before).toBe(1);
      expect(result.after).toBe(2);
      expect(result.beforeJson).toBe("1");
      expect(result.afterJson).toBe("2");
    });

    it("generates diffText", () => {
      const result = formatDiff("x", "old", "new");
      expect(result.diffText).toContain("path: x");
      expect(result.diffText).toContain('"old"');
      expect(result.diffText).toContain('"new"');
    });

    it("generates diffPretty with prefixes", () => {
      const result = formatDiff("myVar", { a: 1 }, { a: 2 });
      expect(result.diffPretty).toContain("path: myVar");
      expect(result.diffPretty).toContain("- ");
      expect(result.diffPretty).toContain("+ ");
    });

    it("handles undefined values", () => {
      const result = formatDiff("newVar", undefined, "value");
      expect(result.beforeJson).toBe("undefined");
      expect(result.afterJson).toBe('"value"');
    });
  });

  // ==========================================================================
  // FORMAT CHANGE
  // ==========================================================================
  describe("formatChange", () => {
    it("detects add type (undefined to value)", () => {
      const result = formatChange({
        path: "newVar",
        previousValue: undefined,
        newValue: 42,
      });
      expect(result.type).toBe("add");
    });

    it("detects remove type (action: unset)", () => {
      const result = formatChange({
        path: "oldVar",
        action: "unset",
        previousValue: "value",
        newValue: undefined,
      });
      expect(result.type).toBe("remove");
    });

    it("detects update type (value to different value)", () => {
      const result = formatChange({
        path: "myVar",
        previousValue: 1,
        newValue: 2,
      });
      expect(result.type).toBe("update");
    });

    it("generates correct structure", () => {
      const result = formatChange({
        path: "data.items",
        previousValue: [1, 2],
        newValue: [1, 2, 3],
      });
      expect(result.path).toBe("data.items");
      expect(result.before).toEqual([1, 2]);
      expect(result.after).toEqual([1, 2, 3]);
      expect(result.diffPretty).toContain("path: data.items");
    });
  });

  // ==========================================================================
  // PUSH XS LOG
  // ==========================================================================
  describe("pushXsLog", () => {
    let originalXsLogs: any;

    beforeEach(() => {
      originalXsLogs = (window as any)._xsLogs;
      (window as any)._xsLogs = undefined;
    });

    afterEach(() => {
      (window as any)._xsLogs = originalXsLogs;
    });

    it("creates _xsLogs array if not exists", () => {
      pushXsLog({ ts: 123, kind: "test" });
      expect((window as any)._xsLogs).toBeDefined();
      expect(Array.isArray((window as any)._xsLogs)).toBe(true);
    });

    it("appends to existing _xsLogs array", () => {
      (window as any)._xsLogs = [{ ts: 1, kind: "existing" }];
      pushXsLog({ ts: 2, kind: "new" });
      expect((window as any)._xsLogs).toHaveLength(2);
    });

    it("enforces max limit", () => {
      for (let i = 0; i < 10; i++) {
        pushXsLog({ ts: i, kind: "test" }, 5);
      }
      expect((window as any)._xsLogs).toHaveLength(5);
      expect((window as any)._xsLogs[0].ts).toBe(5);
      expect((window as any)._xsLogs[4].ts).toBe(9);
    });

    it("uses default max of 200", () => {
      // Just verify it doesn't throw with many entries
      for (let i = 0; i < 250; i++) {
        pushXsLog({ ts: i, kind: "test" });
      }
      expect((window as any)._xsLogs).toHaveLength(200);
    });
  });

  // ==========================================================================
  // CREATE LOG ENTRY
  // ==========================================================================
  describe("createLogEntry", () => {
    let originalXsCurrentTrace: any;

    beforeEach(() => {
      originalXsCurrentTrace = (window as any)._xsCurrentTrace;
    });

    afterEach(() => {
      (window as any)._xsCurrentTrace = originalXsCurrentTrace;
    });

    it("creates entry with kind", () => {
      const entry = createLogEntry("test:event");
      expect(entry.kind).toBe("test:event");
    });

    it("includes timestamp", () => {
      const before = Date.now();
      const entry = createLogEntry("test");
      const after = Date.now();
      expect(entry.ts).toBeGreaterThanOrEqual(before);
      expect(entry.ts).toBeLessThanOrEqual(after);
    });

    it("includes performance timestamp", () => {
      const entry = createLogEntry("test");
      expect(entry.perfTs).toBeDefined();
      expect(typeof entry.perfTs).toBe("number");
    });

    it("includes current trace ID", () => {
      (window as any)._xsCurrentTrace = "trace-123";
      const entry = createLogEntry("test");
      expect(entry.traceId).toBe("trace-123");
    });

    it("merges extras", () => {
      const entry = createLogEntry("test", {
        componentType: "Button",
        eventName: "onClick",
      });
      expect(entry.componentType).toBe("Button");
      expect(entry.eventName).toBe("onClick");
    });
  });

  // ==========================================================================
  // TRACE ID MANAGEMENT
  // ==========================================================================
  describe("generateTraceId", () => {
    it("generates unique IDs", () => {
      const id1 = generateTraceId();
      const id2 = generateTraceId();
      expect(id1).not.toBe(id2);
    });

    it("starts with t- prefix", () => {
      const id = generateTraceId();
      expect(id).toMatch(/^t-/);
    });

    it("contains timestamp component", () => {
      const id = generateTraceId();
      // Format: t-{timestamp in base36}-{random}
      const parts = id.split("-");
      expect(parts.length).toBe(3);
      // Timestamp part should be parseable as base36
      const timestamp = parseInt(parts[1], 36);
      expect(timestamp).toBeGreaterThan(0);
    });
  });

  describe("pushTrace / popTrace / getCurrentTrace", () => {
    let originalXsCurrentTrace: any;

    beforeEach(() => {
      originalXsCurrentTrace = (window as any)._xsCurrentTrace;
      (window as any)._xsCurrentTrace = undefined;
    });

    afterEach(() => {
      // Clear the internal stack by popping until empty BEFORE restoring original value
      // (otherwise getCurrentTrace() returns undefined immediately and the loop never runs)
      while (getCurrentTrace()) {
        popTrace();
      }
      (window as any)._xsCurrentTrace = originalXsCurrentTrace;
    });

    it("pushTrace sets current trace", () => {
      const id = pushTrace("test-trace-1");
      expect(id).toBe("test-trace-1");
      expect(getCurrentTrace()).toBe("test-trace-1");
      expect((window as any)._xsCurrentTrace).toBe("test-trace-1");
    });

    it("pushTrace generates ID if not provided", () => {
      const id = pushTrace();
      expect(id).toMatch(/^t-/);
      expect(getCurrentTrace()).toBe(id);
    });

    it("popTrace restores previous trace", () => {
      pushTrace("trace-1");
      pushTrace("trace-2");
      expect(getCurrentTrace()).toBe("trace-2");

      popTrace();
      expect(getCurrentTrace()).toBe("trace-1");

      popTrace();
      expect(getCurrentTrace()).toBeUndefined();
    });

    it("handles nested traces correctly", () => {
      pushTrace("outer");
      expect(getCurrentTrace()).toBe("outer");

      pushTrace("middle");
      expect(getCurrentTrace()).toBe("middle");

      pushTrace("inner");
      expect(getCurrentTrace()).toBe("inner");

      popTrace();
      expect(getCurrentTrace()).toBe("middle");

      popTrace();
      expect(getCurrentTrace()).toBe("outer");

      popTrace();
      expect(getCurrentTrace()).toBeUndefined();
    });

    it("getCurrentTrace returns undefined when stack is empty", () => {
      expect(getCurrentTrace()).toBeUndefined();
    });
  });
});
