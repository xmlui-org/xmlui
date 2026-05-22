/**
 * W7-1 / plan #06 Phase 2 — real HandlerCoordinator runtime tests.
 *
 * Verifies the four policies (`parallel`, `single-flight`, `queue`,
 * `drop-while-running`) and the `abortRunning()` surface using only the
 * coordinator API (no React, no dispatcher). The dispatcher-side wiring
 * is covered separately once integrated into `event-handlers.ts`.
 */

import { describe, it, expect, vi } from "vitest";
import { createRealHandlerCoordinator } from "../../../src/components-core/concurrency/coordinator";
import type {
  HandlerCoordinator,
  HandlerInvocation,
} from "../../../src/components-core/concurrency/policy";

function inv(
  policy: HandlerInvocation["policy"],
  componentUid = "u1",
  eventName = "click",
): HandlerInvocation {
  return { componentUid, eventName, policy };
}

async function enter(c: HandlerCoordinator, i: HandlerInvocation) {
  return await c.enter(i);
}

describe("real HandlerCoordinator — parallel policy", () => {
  it("returns fresh tokens, never tracks state, exit is a no-op", async () => {
    const c = createRealHandlerCoordinator();
    const i = inv("parallel");
    const a = await enter(c, i);
    const b = await enter(c, i);
    expect(a.proceed).toBe(true);
    expect(b.proceed).toBe(true);
    expect(a.token).not.toBe(b.token);
    expect(a.token.aborted).toBe(false);
    expect(b.token.aborted).toBe(false);
    // exit doesn't cause errors even though we never registered:
    expect(() => c.exit(i)).not.toThrow();
  });
});

describe("real HandlerCoordinator — single-flight policy", () => {
  it("aborts the running invocation with reason 'supersede' and proceeds", async () => {
    const onSuperseded = vi.fn();
    const c = createRealHandlerCoordinator({ onSuperseded });
    const i = inv("single-flight");
    const first = await enter(c, i);
    expect(first.token.aborted).toBe(false);
    const second = await enter(c, i);
    expect(first.token.aborted).toBe(true);
    expect(first.token.reason).toBe("supersede");
    expect(second.proceed).toBe(true);
    expect(second.token.aborted).toBe(false);
    expect(onSuperseded).toHaveBeenCalledTimes(1);
  });

  it("after exit, fresh entry is not a supersession", async () => {
    const onSuperseded = vi.fn();
    const c = createRealHandlerCoordinator({ onSuperseded });
    const i = inv("single-flight");
    const a = await enter(c, i);
    c.exit(i);
    const b = await enter(c, i);
    expect(a.token.aborted).toBe(false);
    expect(b.proceed).toBe(true);
    expect(onSuperseded).not.toHaveBeenCalled();
  });
});

describe("real HandlerCoordinator — drop-while-running policy", () => {
  it("refuses a second entry while one is running and emits onDropped", async () => {
    const onDropped = vi.fn();
    const c = createRealHandlerCoordinator({ onDropped });
    const i = inv("drop-while-running");
    const a = await enter(c, i);
    const b = await enter(c, i);
    expect(a.proceed).toBe(true);
    expect(b.proceed).toBe(false);
    expect(b.token.aborted).toBe(true);
    expect(onDropped).toHaveBeenCalledTimes(1);
  });

  it("permits a fresh entry after exit", async () => {
    const c = createRealHandlerCoordinator();
    const i = inv("drop-while-running");
    const a = await enter(c, i);
    c.exit(i);
    const b = await enter(c, i);
    expect(a.proceed).toBe(true);
    expect(b.proceed).toBe(true);
  });
});

describe("real HandlerCoordinator — queue policy", () => {
  it("serialises invocations in FIFO order", async () => {
    const c = createRealHandlerCoordinator();
    const i = inv("queue");
    const order: number[] = [];
    const a = await enter(c, i);
    order.push(1);
    const pendingB = enter(c, i).then((r) => {
      order.push(2);
      return r;
    });
    const pendingC = enter(c, i).then((r) => {
      order.push(3);
      return r;
    });
    // Neither b nor c may resolve before we exit a.
    await Promise.resolve();
    await Promise.resolve();
    expect(order).toEqual([1]);
    c.exit(i);
    const b = await pendingB;
    expect(b.proceed).toBe(true);
    c.exit(i);
    const cRes = await pendingC;
    expect(cRes.proceed).toBe(true);
    expect(order).toEqual([1, 2, 3]);
    expect(a.proceed).toBe(true);
  });
});

describe("real HandlerCoordinator — abortRunning", () => {
  it("aborts every running handler with the requested reason", async () => {
    const c = createRealHandlerCoordinator();
    const i1 = inv("single-flight", "u1", "click");
    const i2 = inv("single-flight", "u2", "submit");
    const a = await enter(c, i1);
    const b = await enter(c, i2);
    c.abortRunning(undefined, undefined, "unmount");
    expect(a.token.aborted).toBe(true);
    expect(a.token.reason).toBe("unmount");
    expect(b.token.aborted).toBe(true);
    expect(b.token.reason).toBe("unmount");
  });

  it("scopes by componentUid + eventName when provided", async () => {
    const c = createRealHandlerCoordinator();
    const i1 = inv("single-flight", "u1", "click");
    const i2 = inv("single-flight", "u2", "click");
    const a = await enter(c, i1);
    const b = await enter(c, i2);
    c.abortRunning("u1", "click", "user");
    expect(a.token.aborted).toBe(true);
    expect(b.token.aborted).toBe(false);
  });

  it("cancels pending queue waiters with proceed:false", async () => {
    const c = createRealHandlerCoordinator();
    const i = inv("queue");
    await enter(c, i); // hold the slot
    const pending = enter(c, i);
    c.abortRunning("u1", "click", "unmount");
    const r = await pending;
    expect(r.proceed).toBe(false);
    expect(r.token.aborted).toBe(true);
    expect(r.token.reason).toBe("unmount");
  });
});
