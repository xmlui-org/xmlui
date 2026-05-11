/**
 * Audit-grade observability — public barrel.
 *
 * Import from this module at all call sites so the internal structure can
 * evolve without breaking consumers.
 */

export type { AuditDiagCode, AuditDiagnostic } from "./diagnostics";

export type {
  AuditPolicy,
  RedactionRule,
  HeadSamplingRule,
  TailSamplingRule,
  SamplingRule,
  RetentionRule,
  SinkConfig,
} from "./policy";
export { defaultAuditPolicy } from "./policy";

export { redact, buildBaselineRules } from "./redactor";
export { sample, sampleEntry, drainTailBuffer } from "./sampler";

export type { TraceContext } from "./correlation";
export { currentContext, withSpan, injectTraceparent } from "./correlation";

export type { AuditSink } from "./sink";
export { createOtlpSink, createConsoleSink } from "./sink";

export type { PiiCategory, PiiMatch } from "./heuristics";
export { detectPii } from "./heuristics";

export { matchesSelector } from "./redactor";

export { BOOT_TRACE_ID } from "./correlation";
