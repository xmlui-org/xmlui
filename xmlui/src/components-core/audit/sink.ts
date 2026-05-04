/**
 * Audit sinks (Step 0 stubs).
 *
 * An `AuditSink` receives redacted, sampled log entries and forwards them
 * to an external system.  Step 0 provides the interface and two no-op
 * factory stubs; Phase 4 adds the OTLP and console implementations.
 */

import type { XsLogEntry } from "../inspector/inspectorUtils";
import type { SinkConfig } from "./policy";

// ---------------------------------------------------------------------------
// AuditSink interface
// ---------------------------------------------------------------------------

export interface AuditSink {
  /** Accept a single entry. Must not throw. */
  push(entry: XsLogEntry): void;
  /** Flush any buffered entries. Resolves when the flush completes. */
  flush(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Factory stubs (Step 0 — Phase 4 provides real implementations)
// ---------------------------------------------------------------------------

/**
 * Create an OTLP/HTTP sink.
 *
 * **Step 0 stub**: returns a no-op sink.  Phase 4 implements the real
 * JSON-over-HTTP OTLP exporter.
 */
export function createOtlpSink(_cfg: SinkConfig): AuditSink {
  return {
    push: (_entry) => {},
    flush: () => Promise.resolve(),
  };
}

/**
 * Create a console sink that writes each entry to `console.log`.
 *
 * **Step 0 stub**: returns a no-op sink.  Phase 4 adds the formatted output.
 */
export function createConsoleSink(): AuditSink {
  return {
    push: (_entry) => {},
    flush: () => Promise.resolve(),
  };
}
