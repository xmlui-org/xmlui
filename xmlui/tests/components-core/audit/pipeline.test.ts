/**
 * Plan #15 audit pipeline — integration tests for the
 * policy + redactor + sampler + sinks orchestration in
 * `xmlui/src/components-core/audit/pipeline.ts`.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setAuditPolicy,
  setStrictAudit,
  registerAuditSink,
  registerAuditHeuristic,
  processAuditEntry,
  _resetAuditPipeline,
} from "../../../src/components-core/audit/pipeline";
import type { AuditSink } from "../../../src/components-core/audit/sink";
import type { SinkConfig } from "../../../src/components-core/audit/policy";
import type { XsLogEntry } from "../../../src/components-core/inspector/inspectorUtils";

// `pipeline.emitDiag` writes to `window._xsLogs`. The test environment
// provides a `window` object; clear the buffer before each test.
function clearAuditLogs() {
  if (typeof window !== "undefined") (window as any)._xsLogs = [];
}

function auditLogs(): Array<Record<string, unknown>> {
  if (typeof window === "undefined") return [];
  const buf = (window as any)._xsLogs;
  return Array.isArray(buf) ? buf.filter((e: any) => e.kind === "audit") : [];
}

function makeEntry(extra: Record<string, unknown> = {}): XsLogEntry {
  return {
    kind: "ds",
    ts: Date.now(),
    traceId: "t1",
    spanId: "s1",
    ...extra,
  } as unknown as XsLogEntry;
}

describe("audit/pipeline", () => {
  beforeEach(() => {
    _resetAuditPipeline();
    clearAuditLogs();
  });

  // -------------------------------------------------------------------------
  // Policy-conflict diagnostic
  // -------------------------------------------------------------------------

  it("emits audit-policy-conflict when the same selector has different modes", () => {
    setAuditPolicy({
      redact: [
        { selector: "headers.Authorization", mode: "mask" },
        { selector: "headers.Authorization", mode: "drop" },
      ],
      sample: {},
      retention: { bufferSize: 100, onOverflow: "drop-oldest" },
    });
    const conflicts = auditLogs().filter((e) => e.code === "audit-policy-conflict");
    expect(conflicts.length).toBe(1);
    expect((conflicts[0] as any).selector).toBe("headers.Authorization");
  });

  // -------------------------------------------------------------------------
  // Content-PII heuristic → audit-redaction-missing
  // -------------------------------------------------------------------------

  it("emits audit-redaction-missing for un-redacted PII outside any rule", () => {
    setAuditPolicy({
      redact: [],
      sample: {},
      retention: { bufferSize: 100, onOverflow: "drop-oldest" },
    });
    clearAuditLogs(); // clear setAuditPolicy diagnostics

    processAuditEntry(makeEntry({ payload: { email: "alice@example.com" } }));
    const diags = auditLogs().filter((e) => e.code === "audit-redaction-missing");
    expect(diags.length).toBeGreaterThanOrEqual(1);
    expect((diags[0] as any).path).toContain("email");
  });

  // -------------------------------------------------------------------------
  // Strict mode is ON by default
  // -------------------------------------------------------------------------

  it("drops the entry and emits audit-pii-leaked under strict audit (default)", () => {
    setAuditPolicy({
      redact: [],
      sample: {},
      retention: { bufferSize: 100, onOverflow: "drop-oldest" },
    });
    // No explicit setStrictAudit() call — strict is the default.
    clearAuditLogs();

    const seen: XsLogEntry[] = [];
    registerAuditSink("test-sink", () => ({
      push: (e) => seen.push(e as XsLogEntry),
      flush: async () => {},
    }));
    setAuditPolicy({
      redact: [],
      sample: {},
      retention: { bufferSize: 100, onOverflow: "drop-oldest" },
      sink: { kind: "custom", endpoint: "test-sink" } as SinkConfig,
    });
    clearAuditLogs();

    processAuditEntry(makeEntry({ payload: { email: "bob@example.com" } }));
    expect(seen.length).toBe(0); // entry dropped
    const leaks = auditLogs().filter((e) => e.code === "audit-pii-leaked");
    expect(leaks.length).toBe(1);
  });

  it("allows entry through in warn-only mode (strictAuditLogging: false)", () => {
    setStrictAudit(false); // explicit opt-out
    const seen: XsLogEntry[] = [];
    registerAuditSink("warn-sink", () => ({
      push: (e) => seen.push(e as XsLogEntry),
      flush: async () => {},
    }));
    setAuditPolicy({
      redact: [],
      sample: {},
      retention: { bufferSize: 100, onOverflow: "drop-oldest" },
      sink: { kind: "custom", endpoint: "warn-sink" } as SinkConfig,
    });
    clearAuditLogs();

    processAuditEntry(makeEntry({ payload: { email: "carol@example.com" } }));
    expect(seen.length).toBe(1); // entry forwarded (not dropped)
    const warns = auditLogs().filter((e) => e.code === "audit-redaction-missing");
    expect(warns.length).toBeGreaterThanOrEqual(1);
    const leaks = auditLogs().filter((e) => e.code === "audit-pii-leaked");
    expect(leaks.length).toBe(0); // no leak marker in non-strict mode
  });

  // -------------------------------------------------------------------------
  // Custom sink registration is invoked from policy
  // -------------------------------------------------------------------------

  it("invokes a registered custom sink when declared in policy", () => {
    const seen: XsLogEntry[] = [];
    registerAuditSink("collect", () => ({
      push: (e) => seen.push(e as XsLogEntry),
      flush: async () => {},
    }));
    setAuditPolicy({
      redact: [],
      sample: {},
      retention: { bufferSize: 100, onOverflow: "drop-oldest" },
      sink: { kind: "custom", endpoint: "collect" } as SinkConfig,
    });

    processAuditEntry(makeEntry({ payload: { hello: "world" } }));
    expect(seen.length).toBe(1);
    expect((seen[0] as any).payload).toEqual({ hello: "world" });
  });

  // -------------------------------------------------------------------------
  // Unknown custom sink → audit-sink-failure diagnostic
  // -------------------------------------------------------------------------

  it("emits audit-sink-failure when the policy names an unregistered custom sink", () => {
    setAuditPolicy({
      redact: [],
      sample: {},
      retention: { bufferSize: 100, onOverflow: "drop-oldest" },
      sink: { kind: "custom", endpoint: "no-such-sink" } as SinkConfig,
    });
    const diags = auditLogs().filter((e) => e.code === "audit-sink-failure");
    expect(diags.length).toBe(1);
    expect((diags[0] as any).message).toContain("no-such-sink");
  });

  // -------------------------------------------------------------------------
  // Custom PII heuristic fires audit-redaction-missing
  // -------------------------------------------------------------------------

  it("custom heuristic detects un-redacted values not covered by built-ins", () => {
    registerAuditHeuristic("internal-id", /^INT-[0-9]{6}$/);
    setAuditPolicy({
      redact: [],
      sample: {},
      retention: { bufferSize: 100, onOverflow: "drop-oldest" },
    });
    clearAuditLogs();

    processAuditEntry(makeEntry({ payload: { code: "INT-123456" } }));
    const diags = auditLogs().filter((e) => e.code === "audit-redaction-missing");
    expect(diags.length).toBe(1);
    expect((diags[0] as any).category).toBe("internal-id");
  });

  // -------------------------------------------------------------------------
  // Sink errors are swallowed and reported as audit-sink-failure
  // -------------------------------------------------------------------------

  it("emits audit-sink-failure when a sink throws", () => {
    registerAuditSink("throwy", () => ({
      push: () => {
        throw new Error("boom");
      },
      flush: async () => {},
    }));
    setAuditPolicy({
      redact: [],
      sample: {},
      retention: { bufferSize: 100, onOverflow: "drop-oldest" },
      sink: { kind: "custom", endpoint: "throwy" } as SinkConfig,
    });
    clearAuditLogs();

    processAuditEntry(makeEntry());
    const diags = auditLogs().filter((e) => e.code === "audit-sink-failure");
    expect(diags.length).toBeGreaterThanOrEqual(1);
    expect(String((diags[0] as any).message)).toContain("boom");
  });

  // -------------------------------------------------------------------------
  // Reentrancy guard: audit-kind entries don't re-enter processAuditEntry
  // -------------------------------------------------------------------------

  it("does not re-process entries with kind=\"audit\" (no recursion)", () => {
    const seen: XsLogEntry[] = [];
    registerAuditSink("collect2", () => ({
      push: (e) => seen.push(e as XsLogEntry),
      flush: async () => {},
    }));
    setAuditPolicy({
      redact: [],
      sample: {},
      retention: { bufferSize: 100, onOverflow: "drop-oldest" },
      sink: { kind: "custom", endpoint: "collect2" } as SinkConfig,
    });

    processAuditEntry({
      kind: "audit",
      ts: Date.now(),
      code: "audit-policy-conflict",
      severity: "warn",
      message: "synthetic",
    } as unknown as XsLogEntry);

    expect(seen.length).toBe(1);
    expect((seen[0] as any).kind).toBe("audit");
  });
});
