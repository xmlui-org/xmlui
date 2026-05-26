import { describe, it, expect, vi } from "vitest";
import {
  executeWithPolicy,
  parseRetryAfter,
  createCircuitState,
  MAX_RETRY_AFTER_MS,
} from "../../../src/components-core/errors/policy";
import { AppError } from "../../../src/components-core/errors/app-error";

const ac = () => new AbortController();

describe("executeWithPolicy", () => {
  it("returns the resolved value on first attempt", async () => {
    const op = vi.fn().mockResolvedValue(42);
    const result = await executeWithPolicy(
      op,
      { attempts: 3, backoff: "fixed", delayMs: 0, jitter: false },
      ac().signal,
    );
    expect(result).toBe(42);
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("retries until success", async () => {
    let calls = 0;
    const op = vi.fn().mockImplementation(async () => {
      calls += 1;
      if (calls < 3) {
        throw new AppError({ code: "net", category: "network", message: "flaky" });
      }
      return "ok";
    });
    const result = await executeWithPolicy(
      op,
      { attempts: 5, backoff: "fixed", delayMs: 0, jitter: false },
      ac().signal,
    );
    expect(result).toBe("ok");
    expect(op).toHaveBeenCalledTimes(3);
  });

  it("throws retry-exhausted after final failure", async () => {
    const op = vi
      .fn()
      .mockRejectedValue(new AppError({ code: "srv", category: "server", message: "boom" }));
    await expect(
      executeWithPolicy(
        op,
        { attempts: 3, backoff: "fixed", delayMs: 0, jitter: false },
        ac().signal,
      ),
    ).rejects.toMatchObject({ code: "retry-exhausted" });
    expect(op).toHaveBeenCalledTimes(3);
  });

  it("does not retry errors outside onlyCategories", async () => {
    const op = vi.fn().mockRejectedValue(
      new AppError({ code: "x", category: "validation", message: "v" }),
    );
    await expect(
      executeWithPolicy(
        op,
        {
          attempts: 5,
          backoff: "fixed",
          delayMs: 0,
          jitter: false,
          onlyCategories: ["network"],
        },
        ac().signal,
      ),
    ).rejects.toMatchObject({ category: "validation" });
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("opens circuit after failureThreshold and fails fast", async () => {
    const op = vi
      .fn()
      .mockRejectedValue(new AppError({ code: "srv", category: "server", message: "svc-down" }));
    const state = createCircuitState();
    const spec = {
      attempts: 1,
      backoff: "fixed" as const,
      delayMs: 0,
      jitter: false,
      circuitBreaker: { failureThreshold: 2, resetMs: 10_000 },
    };
    // Two failures to open.
    await expect(executeWithPolicy(op, spec, ac().signal, { circuitState: state })).rejects.toBeDefined();
    await expect(executeWithPolicy(op, spec, ac().signal, { circuitState: state })).rejects.toBeDefined();
    expect(state.state).toBe("open");
    // Next call rejects immediately with circuit-open and does NOT invoke op.
    op.mockClear();
    await expect(
      executeWithPolicy(op, spec, ac().signal, { circuitState: state }),
    ).rejects.toMatchObject({ code: "circuit-open" });
    expect(op).not.toHaveBeenCalled();
  });

  it("honours retryAfterMs from AppError.data", async () => {
    let calls = 0;
    const op = vi.fn().mockImplementation(async () => {
      calls += 1;
      if (calls === 1) {
        throw new AppError({
          code: "http-429",
          category: "rate-limit",
          message: "slow down",
          data: { retryAfterMs: 5 },
        });
      }
      return "ok";
    });
    const t0 = Date.now();
    const result = await executeWithPolicy(
      op,
      { attempts: 3, backoff: "fixed", delayMs: 1000, jitter: false, honourRetryAfter: true },
      ac().signal,
    );
    const elapsed = Date.now() - t0;
    expect(result).toBe("ok");
    // Should have waited ~5ms, not 1000ms.
    expect(elapsed).toBeLessThan(500);
  });

  it("aborts mid-backoff when signal fires", async () => {
    const op = vi
      .fn()
      .mockRejectedValue(new AppError({ code: "net", category: "network", message: "fail" }));
    const ctrl = new AbortController();
    const promise = executeWithPolicy(
      op,
      { attempts: 5, backoff: "fixed", delayMs: 10_000, jitter: false },
      ctrl.signal,
    );
    setTimeout(() => ctrl.abort(), 10);
    await expect(promise).rejects.toMatchObject({ category: "user-cancelled" });
  });
});

describe("parseRetryAfter", () => {
  it("parses delta-seconds form to milliseconds", () => {
    expect(parseRetryAfter("5")).toBe(5000);
  });

  it("clamps to MAX_RETRY_AFTER_MS", () => {
    expect(parseRetryAfter("999")).toBe(MAX_RETRY_AFTER_MS);
  });

  it("parses HTTP date form", () => {
    const future = new Date(Date.now() + 3000).toUTCString();
    const result = parseRetryAfter(future);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(MAX_RETRY_AFTER_MS);
  });

  it("returns undefined for null/empty/garbage", () => {
    expect(parseRetryAfter(null)).toBeUndefined();
    expect(parseRetryAfter("")).toBeUndefined();
    expect(parseRetryAfter("not-a-date")).toBeUndefined();
  });

  it("returns 0 for past HTTP dates", () => {
    const past = new Date(Date.now() - 60_000).toUTCString();
    expect(parseRetryAfter(past)).toBe(0);
  });
});
