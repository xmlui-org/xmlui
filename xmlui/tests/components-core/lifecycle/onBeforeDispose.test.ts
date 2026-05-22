/**
 * Unit tests for `fireBeforeDispose` — Plan #04 Step 3.1.
 *
 * Tests the timeout-racing logic of `onBeforeDispose`:
 *  - Sync handlers resolve immediately with no violation.
 *  - Async handlers that settle within the budget resolve cleanly.
 *  - Async handlers that exceed the budget receive a `reason:"timeout"` violation.
 *  - Throwing handlers (sync or async) receive a `reason:"throw"` violation.
 *
 * Fake timers are used so tests run deterministically without actual I/O delays.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fireBeforeDispose } from "../../../src/components-core/lifecycle";

declare const globalThis: any;

beforeEach(() => {
  if (typeof globalThis !== "undefined") {
    globalThis.window = globalThis.window ?? {};
    globalThis.window._xsLogs = [];
    globalThis.window._xsVerbose = true;
  }
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function lastLog(): Record<string, any> | undefined {
  return (globalThis.window._xsLogs as any[]).at(-1);
}

function allLogs(): Record<string, any>[] {
  return globalThis.window._xsLogs as any[];
}

// ---------------------------------------------------------------------------
// Synchronous handlers
// ---------------------------------------------------------------------------

describe("fireBeforeDispose — sync handler", () => {
  it("calls the handler and emits a lifecycle info trace", () => {
    let called = false;
    fireBeforeDispose(
      () => {
        called = true;
      },
      { componentUid: "uid-1", timeoutMs: 250 },
    );
    expect(called).toBe(true);
    const log = lastLog();
    expect(log?.kind).toBe("lifecycle");
    expect(log?.severity).toBe("info");
    expect(log?.phase).toBe("beforeDispose");
    expect(log?.componentUid).toBe("uid-1");
  });

  it("sync throw emits a reason:throw violation (warn by default)", () => {
    fireBeforeDispose(
      () => {
        throw new Error("sync-boom");
      },
      { componentUid: "uid-2", timeoutMs: 250 },
    );
    const log = lastLog();
    expect(log?.kind).toBe("lifecycle");
    expect(log?.severity).toBe("warn");
    expect(log?.reason).toBe("throw");
    expect(log?.error?.message).toBe("sync-boom");
  });

  it("sync throw with strict:true emits error severity", () => {
    fireBeforeDispose(
      () => {
        throw new Error("strict-boom");
      },
      { componentUid: "uid-3", timeoutMs: 250, strict: true },
    );
    const log = lastLog();
    expect(log?.severity).toBe("error");
    expect(log?.reason).toBe("throw");
  });
});

// ---------------------------------------------------------------------------
// Async handlers — settle within budget
// ---------------------------------------------------------------------------

describe("fireBeforeDispose — async handler within budget", () => {
  it("emits success trace when handler resolves before timeout", async () => {
    const p = new Promise<void>((resolve) => setTimeout(resolve, 100));
    fireBeforeDispose(() => p, { componentUid: "uid-4", timeoutMs: 250 });

    // Handler is still pending — no trace yet.
    expect(allLogs().filter((l) => l.phase === "beforeDispose")).toHaveLength(0);

    // Advance 100 ms so the handler resolves, then 0 ms to flush microtasks.
    await vi.advanceTimersByTimeAsync(100);

    const log = lastLog();
    expect(log?.kind).toBe("lifecycle");
    expect(log?.severity).toBe("info");
    expect(log?.phase).toBe("beforeDispose");
  });

  it("timeout is cleared when handler resolves early — no violation", async () => {
    const p = new Promise<void>((resolve) => setTimeout(resolve, 50));
    fireBeforeDispose(() => p, { componentUid: "uid-5", timeoutMs: 500 });

    await vi.advanceTimersByTimeAsync(50);

    // Advance past the timeout boundary — no violation should appear.
    await vi.advanceTimersByTimeAsync(600);

    const violations = allLogs().filter((l) => l.reason !== undefined);
    expect(violations).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Async handlers — exceed budget (timeout)
// ---------------------------------------------------------------------------

describe("fireBeforeDispose — async handler exceeds budget", () => {
  it("emits reason:timeout violation when handler exceeds timeoutMs", async () => {
    // Handler resolves after 500 ms, budget is 250 ms.
    let resolved = false;
    const p = new Promise<void>((resolve) =>
      setTimeout(() => {
        resolved = true;
        resolve();
      }, 500),
    );
    fireBeforeDispose(() => p, { componentUid: "uid-6", timeoutMs: 250 });

    // Advance to just past the timeout.
    await vi.advanceTimersByTimeAsync(250);

    const log = lastLog();
    expect(log?.kind).toBe("lifecycle");
    expect(log?.severity).toBe("warn");
    expect(log?.reason).toBe("timeout");
    expect(log?.componentUid).toBe("uid-6");

    // Handler is still running — resolved flag still false.
    expect(resolved).toBe(false);

    // Advance until the handler resolves — no additional violation should appear.
    await vi.advanceTimersByTimeAsync(300);
    const violations = allLogs().filter((l) => l.reason !== undefined);
    // Only the single timeout violation.
    expect(violations).toHaveLength(1);
  });

  it("timeout violation with strict:true emits error severity", async () => {
    const p = new Promise<void>((resolve) => setTimeout(resolve, 500));
    fireBeforeDispose(() => p, { componentUid: "uid-7", timeoutMs: 100, strict: true });

    await vi.advanceTimersByTimeAsync(100);

    const log = lastLog();
    expect(log?.severity).toBe("error");
    expect(log?.reason).toBe("timeout");
  });
});

// ---------------------------------------------------------------------------
// Async handlers — rejection (throw)
// ---------------------------------------------------------------------------

describe("fireBeforeDispose — async handler rejection", () => {
  it("emits reason:throw violation when async handler rejects", async () => {
    const p = Promise.reject(new Error("async-boom"));
    fireBeforeDispose(() => p, { componentUid: "uid-8", timeoutMs: 250 });

    // Flush microtasks for the rejection to propagate.
    await vi.runAllTimersAsync();

    const log = lastLog();
    expect(log?.kind).toBe("lifecycle");
    expect(log?.reason).toBe("throw");
    expect(log?.error?.message).toBe("async-boom");
  });
});

// ---------------------------------------------------------------------------
// Optional metadata fields
// ---------------------------------------------------------------------------

describe("fireBeforeDispose — trace metadata", () => {
  it("includes componentType and componentLabel in traces", () => {
    fireBeforeDispose(() => {}, {
      componentUid: "uid-9",
      timeoutMs: 250,
      componentType: "Page",
      componentLabel: "my-page",
    });
    const log = lastLog();
    expect(log?.componentType).toBe("Page");
    expect(log?.componentLabel).toBe("my-page");
  });
});
