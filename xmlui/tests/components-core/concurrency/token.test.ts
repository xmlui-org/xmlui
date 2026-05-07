/**
 * W3-6 / plan #06 Phase 1 — public token + coordinator surface tests.
 *
 * These tests exercise only the API surface that ships in W3-6 (the
 * risk-probe). The dispatcher-side runtime that actually triggers
 * cancellation (supersede / queue / drop / timeout) lands in W7-1;
 * tests for that behaviour live alongside that step.
 */

import { describe, it, expect, vi } from "vitest";
import {
  createCancellationToken,
  HandlerCancelledError,
  createHandlerCoordinator,
  type CancellationReason,
  type HandlerPolicy,
} from "../../../src/components-core/concurrency";

describe("createCancellationToken", () => {
  it("starts not aborted with no reason", () => {
    const { token } = createCancellationToken();
    expect(token.aborted).toBe(false);
    expect(token.reason).toBeUndefined();
    expect(token.signal).toBeInstanceOf(AbortSignal);
    expect(token.signal.aborted).toBe(false);
  });

  it("throwIfAborted is a no-op while live", () => {
    const { token } = createCancellationToken();
    expect(() => token.throwIfAborted()).not.toThrow();
  });

  it("abort('user') flips aborted, reason, and signal in lockstep", () => {
    const { token, abort } = createCancellationToken();
    abort("user");
    expect(token.aborted).toBe(true);
    expect(token.reason).toBe("user");
    expect(token.signal.aborted).toBe(true);
  });

  it("throwIfAborted throws HandlerCancelledError carrying the reason", () => {
    const { token, abort } = createCancellationToken();
    abort("timeout");
    try {
      token.throwIfAborted();
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(HandlerCancelledError);
      expect((e as HandlerCancelledError).reason).toBe("timeout");
      expect((e as HandlerCancelledError).name).toBe("HandlerCancelledError");
    }
  });

  it("supports all four cancellation reasons", () => {
    const reasons: CancellationReason[] = ["user", "supersede", "timeout", "unmount"];
    for (const r of reasons) {
      const { token, abort } = createCancellationToken();
      abort(r);
      expect(token.reason).toBe(r);
    }
  });

  it("abort is idempotent — second call is a no-op", () => {
    const { token, abort } = createCancellationToken();
    abort("user");
    abort("timeout");
    expect(token.reason).toBe("user");
  });

  it("onAbort callbacks fire on abort", () => {
    const { token, abort } = createCancellationToken();
    const cb = vi.fn();
    token.onAbort(cb);
    expect(cb).not.toHaveBeenCalled();
    abort("supersede");
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("multiple onAbort callbacks all fire", () => {
    const { token, abort } = createCancellationToken();
    const a = vi.fn();
    const b = vi.fn();
    token.onAbort(a);
    token.onAbort(b);
    abort("user");
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("a throwing onAbort callback does not block siblings", () => {
    const { token, abort } = createCancellationToken();
    const a = vi.fn(() => {
      throw new Error("boom");
    });
    const b = vi.fn();
    token.onAbort(a);
    token.onAbort(b);
    abort("user");
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("onAbort registered after abort still fires (microtask)", async () => {
    const { token, abort } = createCancellationToken();
    abort("user");
    const cb = vi.fn();
    token.onAbort(cb);
    expect(cb).not.toHaveBeenCalled(); // deferred
    await Promise.resolve();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("signal can be passed to fetch-shaped APIs", () => {
    const { token, abort } = createCancellationToken();
    // emulate `fetch(url, { signal: token.signal })`
    const init: { signal: AbortSignal } = { signal: token.signal };
    expect(init.signal.aborted).toBe(false);
    abort("user");
    expect(init.signal.aborted).toBe(true);
  });
});

describe("createHandlerCoordinator (W3-6 stub)", () => {
  it("enter always returns proceed:true with a fresh token", () => {
    const c = createHandlerCoordinator();
    const inv = { componentUid: "u1", eventName: "click", policy: "parallel" as HandlerPolicy };
    const r1 = c.enter(inv);
    const r2 = c.enter(inv);
    expect(r1.proceed).toBe(true);
    expect(r2.proceed).toBe(true);
    expect(r1.token).not.toBe(r2.token);
    expect(r1.token.aborted).toBe(false);
  });

  it("enter respects the policy field shape for all four values", () => {
    const c = createHandlerCoordinator();
    const policies: HandlerPolicy[] = [
      "parallel",
      "single-flight",
      "queue",
      "drop-while-running",
    ];
    for (const policy of policies) {
      const r = c.enter({ componentUid: "u", eventName: "e", policy });
      expect(r.proceed).toBe(true);
      expect(r.token.aborted).toBe(false);
    }
  });

  it("exit and abortRunning are no-op stubs (W7-1 lands the runtime)", () => {
    const c = createHandlerCoordinator();
    expect(() => c.exit({ componentUid: "u", eventName: "e", policy: "parallel" })).not.toThrow();
    expect(() => c.abortRunning()).not.toThrow();
    expect(() => c.abortRunning("u")).not.toThrow();
    expect(() => c.abortRunning("u", "e", "user")).not.toThrow();
  });
});
