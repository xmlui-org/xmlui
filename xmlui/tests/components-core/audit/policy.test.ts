import { describe, it, expect } from "vitest";
import { defaultAuditPolicy } from "../../../src/components-core/audit/policy";
import { redact } from "../../../src/components-core/audit/redactor";
import { sample } from "../../../src/components-core/audit/sampler";
import type { XsLogEntry } from "../../../src/components-core/inspector/inspectorUtils";

// ---------------------------------------------------------------------------
// Policy
// ---------------------------------------------------------------------------

describe("audit/policy — defaultAuditPolicy", () => {
  it("returns a policy with an empty redact array", () => {
    const policy = defaultAuditPolicy();
    expect(policy.redact).toEqual([]);
  });

  it("returns a policy with a defined retention rule", () => {
    const policy = defaultAuditPolicy();
    expect(typeof policy.retention.bufferSize).toBe("number");
    expect(policy.retention.bufferSize).toBeGreaterThan(0);
    expect(["drop-oldest", "drop-newest", "block"]).toContain(policy.retention.onOverflow);
  });

  it("returns a policy with an empty sampling spec by default", () => {
    const policy = defaultAuditPolicy();
    // Neither head nor tail sampling is set in the default policy.
    expect(policy.sample.head).toBeUndefined();
    expect(policy.sample.tail).toBeUndefined();
  });

  it("returns a policy without a configured sink", () => {
    const policy = defaultAuditPolicy();
    expect(policy.sink).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Redactor (Step 0 stub — pass-through)
// ---------------------------------------------------------------------------

describe("audit/redactor — Step 0 stub", () => {
  it("returns the same entry object (no redaction applied yet)", () => {
    const entry: XsLogEntry = { ts: Date.now(), kind: "app:fetch", url: "https://api.example.com" };
    const policy = defaultAuditPolicy();
    const result = redact(entry, policy);
    expect(result).toBe(entry);
  });
});

// ---------------------------------------------------------------------------
// Sampler (Step 0 stub — always keep)
// ---------------------------------------------------------------------------

describe("audit/sampler — Step 0 stub", () => {
  it("always returns true (keep every entry)", () => {
    const entry: XsLogEntry = { ts: Date.now(), kind: "state:change" };
    const policy = defaultAuditPolicy();
    expect(sample(entry, policy)).toBe(true);
  });
});
