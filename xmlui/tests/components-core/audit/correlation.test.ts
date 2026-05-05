import { describe, it, expect, beforeEach } from "vitest";
import {
  currentContext,
  withSpan,
  injectTraceparent,
  BOOT_TRACE_ID,
  type TraceContext,
} from "../../../src/components-core/audit/correlation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return an ISO-hex string regex for a given byte length. */
const hexRe = (bytes: number) => new RegExp(`^[0-9a-f]{${bytes * 2}}$`);

// ---------------------------------------------------------------------------
// BOOT_TRACE_ID
// ---------------------------------------------------------------------------

describe("BOOT_TRACE_ID", () => {
  it("is a 32-char hex string", () => {
    expect(BOOT_TRACE_ID).toMatch(hexRe(16));
  });

  it("is stable across imports (same module instance)", () => {
    // Re-importing the same module returns the cached instance in Node/Vitest.
    // We can only verify it's a non-empty string here.
    expect(typeof BOOT_TRACE_ID).toBe("string");
    expect(BOOT_TRACE_ID.length).toBe(32);
  });
});

// ---------------------------------------------------------------------------
// currentContext
// ---------------------------------------------------------------------------

describe("currentContext", () => {
  it("returns null when no span is active", () => {
    // Ensure we're not inside any withSpan from a previous test.
    expect(currentContext()).toBeNull();
  });

  it("returns the active context inside withSpan", () => {
    withSpan("test", (ctx) => {
      const live = currentContext();
      expect(live).not.toBeNull();
      expect(live!.traceId).toBe(ctx.traceId);
      expect(live!.spanId).toBe(ctx.spanId);
    });
  });

  it("returns null again after withSpan completes", () => {
    withSpan("outer", (_ctx) => {});
    expect(currentContext()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// withSpan
// ---------------------------------------------------------------------------

describe("withSpan", () => {
  it("creates a context with valid traceId and spanId", () => {
    withSpan("s1", (ctx) => {
      expect(ctx.traceId).toMatch(hexRe(16));
      expect(ctx.spanId).toMatch(hexRe(8));
    });
  });

  it("root span has no parentSpanId", () => {
    withSpan("root", (ctx) => {
      expect(ctx.parentSpanId).toBeUndefined();
    });
  });

  it("child span inherits traceId and sets parentSpanId", () => {
    withSpan("parent", (parentCtx) => {
      withSpan("child", (childCtx) => {
        expect(childCtx.traceId).toBe(parentCtx.traceId);
        expect(childCtx.parentSpanId).toBe(parentCtx.spanId);
        expect(childCtx.spanId).not.toBe(parentCtx.spanId);
      });
    });
  });

  it("sibling spans share traceId but have unique spanIds", () => {
    let firstSpanId: string | undefined;
    let secondSpanId: string | undefined;
    let sharedTraceId: string | undefined;
    withSpan("outer", (outerCtx) => {
      withSpan("a", (a) => {
        firstSpanId = a.spanId;
        sharedTraceId = a.traceId;
      });
      withSpan("b", (b) => {
        secondSpanId = b.spanId;
        expect(b.traceId).toBe(sharedTraceId);
      });
      expect(outerCtx.traceId).toBe(sharedTraceId);
    });
    expect(firstSpanId).not.toBe(secondSpanId);
  });

  it("pops the span even if fn throws", () => {
    expect(() => {
      withSpan("throwing", () => {
        throw new Error("boom");
      });
    }).toThrow("boom");
    expect(currentContext()).toBeNull();
  });

  it("returns the value returned by fn", () => {
    const result = withSpan("calc", () => 42);
    expect(result).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// injectTraceparent
// ---------------------------------------------------------------------------

describe("injectTraceparent", () => {
  it("does not set header when no span is active", () => {
    const headers = new Headers();
    injectTraceparent(headers);
    expect(headers.get("traceparent")).toBeNull();
  });

  it("sets W3C traceparent header when span is active", () => {
    withSpan("inject-test", (ctx) => {
      const headers = new Headers();
      injectTraceparent(headers);
      const tp = headers.get("traceparent");
      expect(tp).not.toBeNull();
      // Format: 00-{32 hex traceId}-{16 hex spanId}-01
      expect(tp).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
      expect(tp).toContain(ctx.traceId);
      expect(tp).toContain(ctx.spanId);
    });
  });

  it("does not overwrite existing headers", () => {
    withSpan("idempotent", (_ctx) => {
      const headers = new Headers({ "content-type": "application/json" });
      injectTraceparent(headers);
      expect(headers.get("content-type")).toBe("application/json");
    });
  });
});
