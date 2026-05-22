/**
 * Unit tests for `decideSubmit` (Plan #9 Phase 4 / Step 4.1).
 *
 * The function is pure — no side effects — so tests are trivial and fast.
 */

import { describe, it, expect } from "vitest";
import {
  decideSubmit,
  DEFAULT_SUBMIT_POLICY,
  submitPolicyToHandlerPolicy,
  type SubmitGuardState,
  type SubmitPolicy,
} from "../../../src/components-core/forms/submit-guard";

// ---------------------------------------------------------------------------
// decideSubmit
// ---------------------------------------------------------------------------

describe("decideSubmit — no submit in flight", () => {
  const idle: SubmitGuardState = { inFlight: false, queued: 0 };

  it.each(["single-flight", "queue", "drop-while-running"] as SubmitPolicy[])(
    "always proceeds when idle (%s)",
    (policy) => {
      expect(decideSubmit(idle, policy).proceed).toBe(true);
    },
  );
});

describe("decideSubmit — submit in flight", () => {
  const busy: SubmitGuardState = { inFlight: true, queued: 0 };

  it("single-flight drops with reason drop-while-busy", () => {
    const decision = decideSubmit(busy, "single-flight");
    expect(decision.proceed).toBe(false);
    expect(decision.reason).toBe("drop-while-busy");
  });

  it("drop-while-running drops with reason drop-while-running", () => {
    const decision = decideSubmit(busy, "drop-while-running");
    expect(decision.proceed).toBe(false);
    expect(decision.reason).toBe("drop-while-running");
  });

  it("queue always proceeds even when in flight", () => {
    const decision = decideSubmit(busy, "queue");
    expect(decision.proceed).toBe(true);
    expect(decision.reason).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_SUBMIT_POLICY
// ---------------------------------------------------------------------------

describe("DEFAULT_SUBMIT_POLICY", () => {
  it("is single-flight", () => {
    expect(DEFAULT_SUBMIT_POLICY).toBe("single-flight");
  });
});

// ---------------------------------------------------------------------------
// submitPolicyToHandlerPolicy (identity mapping today)
// ---------------------------------------------------------------------------

describe("submitPolicyToHandlerPolicy", () => {
  it.each(["single-flight", "queue", "drop-while-running"] as SubmitPolicy[])(
    "maps %s to itself",
    (policy) => {
      expect(submitPolicyToHandlerPolicy(policy)).toBe(policy);
    },
  );
});
