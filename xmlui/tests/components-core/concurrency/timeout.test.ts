/**
 * W7-1 / plan #06 Phase 3 — runWithTimeout helper tests.
 */

import { describe, it, expect, vi } from "vitest";
import { runWithTimeout } from "../../../src/components-core/concurrency/timeout";
import { HandlerCancelledError } from "../../../src/components-core/concurrency/token";

describe("runWithTimeout", () => {
  it("returns the handler value when it resolves before the timeout", async () => {
    const abort = vi.fn();
    const onTimeout = vi.fn();
    const value = await runWithTimeout(Promise.resolve(42), {
      timeoutMs: 50,
      abort,
      onTimeout,
    });
    expect(value).toBe(42);
    expect(abort).not.toHaveBeenCalled();
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("aborts with reason 'timeout' and rejects when the handler hangs", async () => {
    const abort = vi.fn();
    const onTimeout = vi.fn();
    const hung = new Promise<void>(() => {});
    await expect(
      runWithTimeout(hung, { timeoutMs: 5, abort, onTimeout }),
    ).rejects.toBeInstanceOf(HandlerCancelledError);
    expect(abort).toHaveBeenCalledWith("timeout");
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("treats timeoutMs <= 0 as 'no timeout' (handler is returned as-is)", async () => {
    const abort = vi.fn();
    const value = await runWithTimeout(Promise.resolve("ok"), {
      timeoutMs: 0,
      abort,
    });
    expect(value).toBe("ok");
    expect(abort).not.toHaveBeenCalled();
  });

  it("propagates handler rejection without firing the timeout abort", async () => {
    const abort = vi.fn();
    const err = new Error("boom");
    await expect(
      runWithTimeout(Promise.reject(err), { timeoutMs: 50, abort }),
    ).rejects.toBe(err);
    expect(abort).not.toHaveBeenCalled();
  });
});
