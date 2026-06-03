/**
 * Unit tests for the CSRF / idempotency surface introduced by
 * Plan #09 Step 5.1.
 *
 * The helpers under test are pure — they describe what headers the
 * built-in submit handler emits and when the `csrf-token-missing`
 * diagnostic should fire. The Form component wires them into the
 * generated default-handler template; these tests pin the contract
 * the wiring relies on.
 */

import { describe, it, expect } from "vitest";
import {
  buildSubmitHeaders,
  shouldEmitCsrfMissing,
  DEFAULT_CSRF_HEADER_NAME,
  DEFAULT_IDEMPOTENCY_HEADER_NAME,
} from "../../../src/components-core/forms/csrf";

// ---------------------------------------------------------------------------
// buildSubmitHeaders
// ---------------------------------------------------------------------------

describe("buildSubmitHeaders", () => {
  it("returns undefined when no headers would be populated", () => {
    expect(buildSubmitHeaders({})).toBeUndefined();
    expect(buildSubmitHeaders({ csrfToken: "" })).toBeUndefined();
    expect(buildSubmitHeaders({ idempotencyKey: "" })).toBeUndefined();
  });

  it("emits only the CSRF header when only a token is supplied", () => {
    expect(buildSubmitHeaders({ csrfToken: "tok-1" })).toEqual({
      [DEFAULT_CSRF_HEADER_NAME]: "tok-1",
    });
  });

  it("emits only the idempotency header when only a key is supplied", () => {
    expect(buildSubmitHeaders({ idempotencyKey: "abc" })).toEqual({
      [DEFAULT_IDEMPOTENCY_HEADER_NAME]: "abc",
    });
  });

  it("emits both headers when both values are present", () => {
    expect(
      buildSubmitHeaders({ csrfToken: "tok-1", idempotencyKey: "abc" }),
    ).toEqual({
      [DEFAULT_CSRF_HEADER_NAME]: "tok-1",
      [DEFAULT_IDEMPOTENCY_HEADER_NAME]: "abc",
    });
  });

  it("respects custom header names from appGlobals", () => {
    expect(
      buildSubmitHeaders({
        csrfToken: "tok",
        idempotencyKey: "key",
        csrfHeaderName: "X-XSRF-Token",
        idempotencyHeaderName: "X-Idem",
      }),
    ).toEqual({ "X-XSRF-Token": "tok", "X-Idem": "key" });
  });

  it("falls back to defaults when custom header names are empty strings", () => {
    expect(
      buildSubmitHeaders({
        csrfToken: "tok",
        csrfHeaderName: "",
      }),
    ).toEqual({ [DEFAULT_CSRF_HEADER_NAME]: "tok" });
  });
});

// ---------------------------------------------------------------------------
// shouldEmitCsrfMissing
// ---------------------------------------------------------------------------

describe("shouldEmitCsrfMissing", () => {
  it("never fires when requireCsrf is false", () => {
    expect(
      shouldEmitCsrfMissing({ requireCsrf: false, submitMethod: "post" }),
    ).toBe(false);
    expect(
      shouldEmitCsrfMissing({
        requireCsrf: false,
        submitMethod: "post",
        csrfToken: "",
      }),
    ).toBe(false);
  });

  it("never fires when a non-empty csrfToken is supplied", () => {
    expect(
      shouldEmitCsrfMissing({
        requireCsrf: true,
        csrfToken: "tok",
        submitMethod: "post",
      }),
    ).toBe(false);
  });

  it.each(["get", "GET", "head", "HEAD"])(
    "skips non-mutating method %s",
    (method) => {
      expect(
        shouldEmitCsrfMissing({ requireCsrf: true, submitMethod: method }),
      ).toBe(false);
    },
  );

  it.each(["post", "PUT", "Patch", "delete"])(
    "fires for mutating method %s when token missing and requireCsrf is true",
    (method) => {
      expect(
        shouldEmitCsrfMissing({ requireCsrf: true, submitMethod: method }),
      ).toBe(true);
    },
  );

  it("defaults missing submitMethod to post (mutating)", () => {
    expect(shouldEmitCsrfMissing({ requireCsrf: true })).toBe(true);
  });
});
