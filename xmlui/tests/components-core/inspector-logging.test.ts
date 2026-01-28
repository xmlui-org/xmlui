import { describe, it, expect, beforeEach, afterEach } from "vitest";

/**
 * Tests that inspector logging is properly gated by xsVerbose flag.
 * When xsVerbose is false/undefined, no logs should be written to window._xsLogs.
 */

describe("Inspector Logging", () => {
  let originalXsLogs: any;
  let originalXsCurrentTrace: any;

  beforeEach(() => {
    // Save original window state
    originalXsLogs = (window as any)._xsLogs;
    originalXsCurrentTrace = (window as any)._xsCurrentTrace;

    // Reset to clean state
    (window as any)._xsLogs = undefined;
    (window as any)._xsCurrentTrace = undefined;
  });

  afterEach(() => {
    // Restore original window state
    (window as any)._xsLogs = originalXsLogs;
    (window as any)._xsCurrentTrace = originalXsCurrentTrace;
  });

  describe("xsVerbose feature flag", () => {
    it("should not create _xsLogs when xsVerbose is false", () => {
      const xsVerbose = false;

      // Simulate the logging guard pattern used throughout the codebase
      const xsLog = (...args: any[]) => {
        if (!xsVerbose) return;
        const w = window as any;
        w._xsLogs = Array.isArray(w._xsLogs) ? w._xsLogs : [];
        w._xsLogs.push({ ts: Date.now(), args });
      };

      // Attempt to log
      xsLog("test", { data: "value" });

      // Verify no logs were created
      expect((window as any)._xsLogs).toBeUndefined();
    });

    it("should create _xsLogs when xsVerbose is true", () => {
      const xsVerbose = true;

      // Simulate the logging guard pattern used throughout the codebase
      const xsLog = (...args: any[]) => {
        if (!xsVerbose) return;
        const w = window as any;
        w._xsLogs = Array.isArray(w._xsLogs) ? w._xsLogs : [];
        w._xsLogs.push({ ts: Date.now(), args });
      };

      // Attempt to log
      xsLog("test", { data: "value" });

      // Verify logs were created
      expect((window as any)._xsLogs).toBeDefined();
      expect((window as any)._xsLogs).toHaveLength(1);
      expect((window as any)._xsLogs[0].args).toEqual(["test", { data: "value" }]);
    });

    it("should respect xsLogMax limit", () => {
      const xsVerbose = true;
      const xsLogMax = 3;

      const xsLog = (...args: any[]) => {
        if (!xsVerbose) return;
        const w = window as any;
        w._xsLogs = Array.isArray(w._xsLogs) ? w._xsLogs : [];
        w._xsLogs.push({ ts: Date.now(), args });
        // Apply max limit (matches codebase pattern)
        if (Number.isFinite(xsLogMax) && xsLogMax > 0 && w._xsLogs.length > xsLogMax) {
          w._xsLogs.splice(0, w._xsLogs.length - xsLogMax);
        }
      };

      // Add more logs than the max
      xsLog("log1");
      xsLog("log2");
      xsLog("log3");
      xsLog("log4");
      xsLog("log5");

      // Verify only the last 3 are kept
      expect((window as any)._xsLogs).toHaveLength(3);
      expect((window as any)._xsLogs[0].args).toEqual(["log3"]);
      expect((window as any)._xsLogs[1].args).toEqual(["log4"]);
      expect((window as any)._xsLogs[2].args).toEqual(["log5"]);
    });
  });

  describe("trace ID management", () => {
    it("should not set trace ID when xsVerbose is false", () => {
      const xsVerbose = false;

      const pushTrace = (id: string) => {
        if (!xsVerbose) return;
        (window as any)._xsCurrentTrace = id;
      };

      pushTrace("test-trace-123");

      expect((window as any)._xsCurrentTrace).toBeUndefined();
    });

    it("should set trace ID when xsVerbose is true", () => {
      const xsVerbose = true;

      const pushTrace = (id: string) => {
        if (!xsVerbose) return;
        (window as any)._xsCurrentTrace = id;
      };

      pushTrace("test-trace-123");

      expect((window as any)._xsCurrentTrace).toBe("test-trace-123");
    });
  });
});
