import { describe, it, expect } from "vitest";
import { AppError } from "../../../src/components-core/errors/app-error";
import type { ErrorCategory } from "../../../src/components-core/errors/app-error";

describe("AppError", () => {
  // ---------------------------------------------------------------------------
  // Construction
  // ---------------------------------------------------------------------------

  it("stores all init fields correctly", () => {
    const err = new AppError({
      code: "ERR_PAYMENT_FAILED",
      category: "server",
      message: "Payment gateway returned 503",
      retryable: true,
      correlationId: "abc-123",
      data: { orderId: 42 },
    });

    expect(err.code).toBe("ERR_PAYMENT_FAILED");
    expect(err.category).toBe("server");
    expect(err.message).toBe("Payment gateway returned 503");
    expect(err.retryable).toBe(true);
    expect(err.correlationId).toBe("abc-123");
    expect(err.data).toEqual({ orderId: 42 });
  });

  it("name is 'AppError'", () => {
    const err = new AppError({ code: "x", category: "internal", message: "m" });
    expect(err.name).toBe("AppError");
  });

  it("is an instance of Error", () => {
    const err = new AppError({ code: "x", category: "internal", message: "m" });
    expect(err).toBeInstanceOf(Error);
  });

  it("data defaults to frozen empty object when omitted", () => {
    const err = new AppError({ code: "x", category: "internal", message: "m" });
    expect(err.data).toEqual({});
    expect(Object.isFrozen(err.data)).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Default retryable values by category
  // ---------------------------------------------------------------------------

  const retryableCategories: ErrorCategory[] = ["network", "rate-limit", "server"];
  const nonRetryableCategories: ErrorCategory[] = [
    "validation",
    "authorization",
    "not-found",
    "conflict",
    "internal",
    "user-cancelled",
  ];

  for (const cat of retryableCategories) {
    it(`category "${cat}" defaults retryable to true`, () => {
      const err = new AppError({ code: "x", category: cat, message: "m" });
      expect(err.retryable).toBe(true);
    });
  }

  for (const cat of nonRetryableCategories) {
    it(`category "${cat}" defaults retryable to false`, () => {
      const err = new AppError({ code: "x", category: cat, message: "m" });
      expect(err.retryable).toBe(false);
    });
  }

  it("explicit retryable overrides the category default", () => {
    const err = new AppError({ code: "x", category: "internal", message: "m", retryable: true });
    expect(err.retryable).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // toJSON
  // ---------------------------------------------------------------------------

  it("toJSON round-trips through JSON.parse", () => {
    const err = new AppError({
      code: "ERR_TEST",
      category: "validation",
      message: "bad input",
      correlationId: "corr-1",
      data: { field: "email" },
    });
    const json = err.toJSON();
    expect(json.code).toBe("ERR_TEST");
    expect(json.category).toBe("validation");
    expect(json.message).toBe("bad input");
    expect(json.correlationId).toBe("corr-1");
    expect(json.data).toEqual({ field: "email" });
  });

  it("toJSON omits correlationId when undefined", () => {
    const err = new AppError({ code: "x", category: "internal", message: "m" });
    expect(Object.keys(err.toJSON())).not.toContain("correlationId");
  });

  it("toJSON omits data when empty", () => {
    const err = new AppError({ code: "x", category: "internal", message: "m" });
    expect(Object.keys(err.toJSON())).not.toContain("data");
  });

  it("toJSON includes nested AppError cause", () => {
    const cause = new AppError({ code: "ROOT", category: "network", message: "timeout" });
    const err = new AppError({ code: "WRAPPED", category: "server", message: "see cause", cause });
    const json = err.toJSON();
    expect((json.cause as any).code).toBe("ROOT");
  });

  it("toJSON includes plain Error cause", () => {
    const cause = new TypeError("bad value");
    const err = new AppError({ code: "x", category: "internal", message: "m", cause });
    const json = err.toJSON();
    expect((json.cause as any).name).toBe("TypeError");
  });

  // ---------------------------------------------------------------------------
  // AppError.from
  // ---------------------------------------------------------------------------

  it("from(AppError) is identity (no double-wrapping)", () => {
    const original = new AppError({ code: "ORIG", category: "server", message: "original" });
    const wrapped = AppError.from(original);
    expect(wrapped).toBe(original);
  });

  it("from(Error) wraps with code 'unknown' and category 'internal'", () => {
    const plain = new TypeError("type error");
    const err = AppError.from(plain);
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("unknown");
    expect(err.category).toBe("internal");
    expect(err.message).toBe("type error");
    expect(err.cause).toBe(plain);
  });

  it("from(string) wraps with code 'unknown' and category 'internal'", () => {
    const err = AppError.from("something went wrong");
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("unknown");
    expect(err.category).toBe("internal");
    expect(err.message).toBe("something went wrong");
  });

  it("from(unknown non-string) stringifies to message", () => {
    const err = AppError.from(42);
    expect(err.message).toBe("42");
  });
});
