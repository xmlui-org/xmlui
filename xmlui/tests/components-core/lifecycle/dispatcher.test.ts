import { describe, it, expect, beforeEach } from "vitest";
import {
  createLifecycleDispatcher,
  reportLifecycleViolation,
  reportLifecycleEvent,
} from "../../../src/components-core/lifecycle";
import {
  LifecycleViolationError,
  formatViolation,
} from "../../../src/components-core/lifecycle/diagnostics";

declare const globalThis: any;

beforeEach(() => {
  if (typeof globalThis !== "undefined") {
    globalThis.window = globalThis.window ?? {};
    globalThis.window._xsLogs = [];
    globalThis.window._xsVerbose = true;
  }
});

describe("LifecycleViolationError", () => {
  it("formats async-onUnmount violation", () => {
    const err = new LifecycleViolationError("uid-1", "unmount", "async-onUnmount");
    expect(err.message).toContain("uid-1");
    expect(err.message).toContain("async");
    expect(err.name).toBe("LifecycleViolationError");
  });

  it("formats throw violation", () => {
    expect(formatViolation("u", "mount", "throw")).toContain("threw");
  });

  it("formats timeout violation", () => {
    expect(formatViolation("u", "beforeDispose", "timeout")).toContain("budget");
  });

  it("preserves cause when given", () => {
    const cause = new Error("boom");
    const err = new LifecycleViolationError("u", "mount", "throw", cause);
    expect((err as Error & { cause?: unknown }).cause).toBe(cause);
  });
});

describe("createLifecycleDispatcher", () => {
  it("empty dispatcher fires no handlers", async () => {
    const d = createLifecycleDispatcher();
    await expect(
      d.fire({ phase: "mount", componentUid: "x" }),
    ).resolves.toBeUndefined();
  });

  it("register + fire invokes the handler", async () => {
    const d = createLifecycleDispatcher();
    let calls = 0;
    d.register("uid-a", "mount", () => {
      calls++;
    });
    await d.fire({ phase: "mount", componentUid: "uid-a" });
    expect(calls).toBe(1);
  });

  it("dispose purges all handlers for the uid", async () => {
    const d = createLifecycleDispatcher();
    let calls = 0;
    d.register("uid-a", "mount", () => {
      calls++;
    });
    d.register("uid-a", "unmount", () => {
      calls++;
    });
    d.dispose("uid-a");
    await d.fire({ phase: "mount", componentUid: "uid-a" });
    await d.fire({ phase: "unmount", componentUid: "uid-a" });
    expect(calls).toBe(0);
  });

  it("async unmount handler reports a violation but resolves", async () => {
    const d = createLifecycleDispatcher();
    d.register("uid-a", "unmount", async () => {
      // would write after teardown
    });
    await d.fire({ phase: "unmount", componentUid: "uid-a" });
    const last = (globalThis.window._xsLogs as any[]).at(-1);
    expect(last?.kind).toBe("lifecycle");
    expect(last?.reason).toBe("async-onUnmount");
  });

  it("throwing handler reports a violation and continues", async () => {
    const d = createLifecycleDispatcher();
    let after = 0;
    d.register("uid-a", "mount", () => {
      throw new Error("nope");
    });
    d.register("uid-a", "mount", () => {
      after++;
    });
    await d.fire({ phase: "mount", componentUid: "uid-a" });
    expect(after).toBe(1);
    const last = (globalThis.window._xsLogs as any[]).at(-1);
    expect(last?.kind).toBe("lifecycle");
  });

  it("awaits async mount handler", async () => {
    const d = createLifecycleDispatcher();
    let resolved = false;
    d.register("uid-a", "mount", async () => {
      await new Promise((r) => setTimeout(r, 0));
      resolved = true;
    });
    await d.fire({ phase: "mount", componentUid: "uid-a" });
    expect(resolved).toBe(true);
  });
});

describe("trace helpers", () => {
  it("reportLifecycleEvent pushes an info entry", () => {
    reportLifecycleEvent({ componentUid: "x", phase: "mount", durationMs: 1.5 });
    const last = (globalThis.window._xsLogs as any[]).at(-1);
    expect(last.kind).toBe("lifecycle");
    expect(last.severity).toBe("info");
    expect(last.phase).toBe("mount");
    expect(last.componentUid).toBe("x");
    expect(last.durationMs).toBe(1.5);
  });

  it("reportLifecycleViolation defaults to warn severity", () => {
    reportLifecycleViolation({
      componentUid: "x",
      phase: "mount",
      reason: "throw",
      error: new Error("boom"),
    });
    const last = (globalThis.window._xsLogs as any[]).at(-1);
    expect(last.severity).toBe("warn");
    expect(last.error?.message).toBe("boom");
  });

  it("reportLifecycleViolation strict mode emits error severity", () => {
    reportLifecycleViolation(
      {
        componentUid: "x",
        phase: "unmount",
        reason: "async-onUnmount",
      },
      { strict: true },
    );
    const last = (globalThis.window._xsLogs as any[]).at(-1);
    expect(last.severity).toBe("error");
  });

  it("returned violation is an instance of LifecycleViolationError", () => {
    const v = reportLifecycleViolation({
      componentUid: "x",
      phase: "mount",
      reason: "throw",
    });
    expect(v).toBeInstanceOf(LifecycleViolationError);
  });
});
