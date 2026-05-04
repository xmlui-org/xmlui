/**
 * Audit policy types (Step 0 stubs).
 *
 * `AuditPolicy` is the top-level configuration object for the audit
 * pipeline.  It is constructed from the `<App audit …>` markup attribute
 * and / or `xmlui.config.json`; Phase 2 (PII redaction) and Phase 3
 * (sampling / retention) add the runtime implementations.
 */

// ---------------------------------------------------------------------------
// Redaction
// ---------------------------------------------------------------------------

export interface RedactionRule {
  /**
   * Path expression identifying the field(s) to redact.
   * Syntax is defined in Phase 2; Step 0 treats this as an opaque string.
   * Example: `"$.request.headers.Authorization"`.
   */
  selector: string;
  /** What to do with the matched value. */
  mode: "mask" | "drop" | "hash";
  /**
   * Replacement string when `mode === "mask"`.
   * Defaults to `"[REDACTED]"` when omitted.
   */
  replacement?: string;
}

// ---------------------------------------------------------------------------
// Sampling
// ---------------------------------------------------------------------------

export interface HeadSamplingRule {
  /** Fraction of traces to keep (0..1).  `1` means keep all. */
  rate: number;
}

export interface TailSamplingRule {
  /**
   * Keep a trace retroactively if any entry in it has an error whose
   * code is in this list.
   */
  keepIfErrorIn: ReadonlyArray<string>;
}

export interface SamplingRule {
  head?: HeadSamplingRule;
  tail?: TailSamplingRule;
}

// ---------------------------------------------------------------------------
// Retention
// ---------------------------------------------------------------------------

export interface RetentionRule {
  /** Maximum number of entries in the in-memory buffer. */
  bufferSize: number;
  /** What to do when the buffer is full. */
  onOverflow: "drop-oldest" | "drop-newest" | "block";
}

// ---------------------------------------------------------------------------
// Sink
// ---------------------------------------------------------------------------

export interface SinkConfig {
  kind: "otlp" | "console" | "custom";
  /** Required when `kind === "otlp"`. */
  endpoint?: string;
  /** Extra request headers sent with OTLP batches. */
  headers?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// AuditPolicy (top-level)
// ---------------------------------------------------------------------------

export interface AuditPolicy {
  redact: ReadonlyArray<RedactionRule>;
  sample: SamplingRule;
  retention: RetentionRule;
  sink?: SinkConfig;
}

/** Return a no-op policy that keeps every entry, applies no redaction, and has no sink. */
export function defaultAuditPolicy(): AuditPolicy {
  return {
    redact: [],
    sample: {},
    retention: {
      bufferSize: 200,
      onOverflow: "drop-oldest",
    },
  };
}
