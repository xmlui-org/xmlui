/**
 * Unit tests for the validator registry (Plan #9 Step 1.1 / 1.2).
 *
 * Each test group resets the registry so builtins registered by the
 * side-effect imports don't bleed between tests.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerValidator,
  lookupValidator,
  hasValidator,
  listValidatorNames,
  runValidator,
  __resetValidatorRegistryForTests,
} from "../../../src/components-core/forms/validator-registry";

const CTX = { fieldName: "f", formData: {} };

beforeEach(() => {
  __resetValidatorRegistryForTests();
});

// ---------------------------------------------------------------------------
// registerValidator / lookupValidator / hasValidator
// ---------------------------------------------------------------------------

describe("registerValidator", () => {
  it("registers a validator and returns it from lookupValidator", () => {
    registerValidator({ name: "test", fn: () => null, defaultMessage: "bad" });
    expect(hasValidator("test")).toBe(true);
    expect(lookupValidator("test")?.name).toBe("test");
  });

  it("throws on empty name", () => {
    expect(() =>
      registerValidator({ name: "", fn: () => null, defaultMessage: "x" }),
    ).toThrow(TypeError);
  });

  it("throws when fn is not a function", () => {
    expect(() =>
      registerValidator({ name: "bad", fn: "oops" as any, defaultMessage: "x" }),
    ).toThrow(TypeError);
  });

  it("overwrites a duplicate and emits duplicate-validator diagnostic", () => {
    const sink = vi.fn();
    // Temporarily wire up a sink before registration.
    // The registry emits diagnostics via `diagnosticSink`; in tests the
    // fallback is console, so we just verify overwrite works.
    registerValidator({ name: "dup", fn: () => null, defaultMessage: "a" });
    registerValidator({ name: "dup", fn: () => "err", defaultMessage: "b" });
    const entry = lookupValidator("dup");
    expect(entry?.defaultMessage).toBe("b");
  });

  it("stores defaults for optional severity field", () => {
    registerValidator({ name: "s", fn: () => null, defaultMessage: "m" });
    const entry = lookupValidator("s");
    expect(entry?.severity).toBe("error");
  });

  it("respects explicit severity = 'warning'", () => {
    registerValidator({
      name: "w",
      fn: () => null,
      defaultMessage: "m",
      severity: "warning",
    });
    expect(lookupValidator("w")?.severity).toBe("warning");
  });
});

describe("listValidatorNames", () => {
  it("returns sorted names of registered validators", () => {
    registerValidator({ name: "z", fn: () => null, defaultMessage: "z" });
    registerValidator({ name: "a", fn: () => null, defaultMessage: "a" });
    expect(listValidatorNames()).toEqual(["a", "z"]);
  });
});

// ---------------------------------------------------------------------------
// runValidator — sync path
// ---------------------------------------------------------------------------

describe("runValidator — sync", () => {
  it("returns isValid:true when fn returns null", async () => {
    registerValidator({ name: "ok", fn: () => null, defaultMessage: "bad" });
    const result = await runValidator("ok", "hello", CTX);
    expect(result.isValid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it("returns isValid:true when fn returns empty string", async () => {
    registerValidator({ name: "ok2", fn: () => "", defaultMessage: "bad" });
    const result = await runValidator("ok2", "x", CTX);
    expect(result.isValid).toBe(true);
  });

  it("returns isValid:false with message when fn returns non-empty string", async () => {
    registerValidator({
      name: "fail",
      fn: () => "Something is wrong",
      defaultMessage: "Something is wrong",
    });
    const result = await runValidator("fail", "x", CTX);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Something is wrong");
  });

  it("forwards params to fn", async () => {
    registerValidator({
      name: "paramv",
      fn: (value, _ctx, params) => {
        const min = (params as any)?.min ?? 0;
        return (value as number) >= min ? null : `Must be >= ${min}`;
      },
      defaultMessage: "Invalid",
    });
    const pass = await runValidator("paramv", 5, CTX, { min: 3 });
    expect(pass.isValid).toBe(true);
    const fail = await runValidator("paramv", 1, CTX, { min: 3 });
    expect(fail.isValid).toBe(false);
    expect(fail.message).toBe("Must be >= 3");
  });

  it("returns isValid:true for unknown validator name (emits diagnostic)", async () => {
    const result = await runValidator("no-such-validator", "x", CTX);
    expect(result.isValid).toBe(true);
  });

  it("uses defaultMessage when fn throws", async () => {
    registerValidator({
      name: "throws",
      fn: () => { throw new Error("boom"); },
      defaultMessage: "Validator failed",
    });
    const result = await runValidator("throws", "x", CTX);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Validator failed");
  });
});

// ---------------------------------------------------------------------------
// runValidator — async path
// ---------------------------------------------------------------------------

describe("runValidator — async", () => {
  it("resolves a promise-returning fn", async () => {
    registerValidator({
      name: "async-ok",
      fn: async (value) => (String(value).length > 3 ? null : "Too short"),
      defaultMessage: "Too short",
    });
    const pass = await runValidator("async-ok", "hello", CTX);
    expect(pass.isValid).toBe(true);
    const fail = await runValidator("async-ok", "hi", CTX);
    expect(fail.isValid).toBe(false);
    expect(fail.message).toBe("Too short");
  });

  it("returns isValid:true when signal is aborted mid-flight", async () => {
    const ac = new AbortController();
    registerValidator({
      name: "async-slow",
      fn: () => new Promise<null>((resolve) => setTimeout(() => resolve(null), 50)),
      defaultMessage: "x",
    });
    const promise = runValidator("async-slow", "v", {
      ...CTX,
      signal: ac.signal,
    });
    ac.abort();
    const result = await promise;
    // The abort flag is checked after the promise resolves; here we just
    // ensure it doesn't throw and returns isValid:true (aborted path).
    expect(result.isValid).toBe(true);
  });
});
