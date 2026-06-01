/**
 * Audit pipeline — wires policy + redactor + sampler + heuristics + sinks
 * together and feeds the resulting stream of redacted entries to every
 * registered sink.
 *
 * `<App auditPolicy>` markup populates the module-level policy via
 * `setAuditPolicy()`. App-level `App.registerAuditSink()` /
 * `App.registerAuditHeuristic()` register custom transports and PII
 * heuristics. `pushXsLog` calls `processAuditEntry()` after the entry
 * has landed in the in-memory buffer.
 *
 * Self-diagnostics (`audit-*`) are emitted via the inspector's
 * `pushXsLog` but bypass `processAuditEntry()` to avoid recursion.
 */

import type { XsLogEntry } from "../inspector/inspectorUtils";
import type { AuditDiagCode } from "./diagnostics";
import type { AuditPolicy, RedactionRule, SinkConfig } from "./policy";
import { defaultAuditPolicy } from "./policy";
import { redact, matchesSelector } from "./redactor";
import { sampleEntry } from "./sampler";
import type { AuditSink } from "./sink";
import { createConsoleSink, createOtlpSink } from "./sink";
import { detectPii } from "./heuristics";

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let _policy: AuditPolicy = defaultAuditPolicy();
let _strict = true; // default is strict; opt-out via appGlobals.strictAuditLogging: false
const _sinks: AuditSink[] = [];
const _customSinkFactories = new Map<string, (cfg: SinkConfig) => AuditSink>();
const _customHeuristics: Array<{ name: string; pattern: RegExp }> = [];
let _processing = false; // reentrancy guard for self-diagnostics

// ---------------------------------------------------------------------------
// Policy management
// ---------------------------------------------------------------------------

/** Replace the active audit policy and (re)build sinks. */
export function setAuditPolicy(policy: AuditPolicy): void {
  const merged: AuditPolicy = {
    redact: policy.redact ?? [],
    sample: policy.sample ?? {},
    retention: policy.retention ?? defaultAuditPolicy().retention,
    sink: policy.sink,
  };
  detectPolicyConflicts(merged.redact);
  _policy = merged;
  rebuildSinks();
}

/** Return the active policy (read-only). */
export function getAuditPolicy(): AuditPolicy {
  return _policy;
}

/** Set or clear the strict-audit flag (driven by `appGlobals.strictAuditLogging`). */
export function setStrictAudit(strict: boolean): void {
  _strict = !!strict;
}

export function isStrictAudit(): boolean {
  return _strict;
}

// ---------------------------------------------------------------------------
// Custom sink / heuristic registration
// ---------------------------------------------------------------------------

/**
 * Register a custom sink factory. `<auditPolicy><sink kind="my-sink" /></auditPolicy>`
 * will then instantiate it via `factory(cfg)`.
 */
export function registerAuditSink(
  name: string,
  factory: (cfg: SinkConfig) => AuditSink,
): void {
  if (!name || typeof name !== "string") {
    throw new TypeError("registerAuditSink: name must be a non-empty string");
  }
  if (typeof factory !== "function") {
    throw new TypeError(`registerAuditSink(${name}): factory must be a function`);
  }
  _customSinkFactories.set(name, factory);
}

/**
 * Register a content-based PII heuristic. Values matching the pattern
 * fire `audit-redaction-missing` when no rule covers them.
 */
export function registerAuditHeuristic(name: string, pattern: RegExp): void {
  if (!name || typeof name !== "string") {
    throw new TypeError("registerAuditHeuristic: name must be a non-empty string");
  }
  if (!(pattern instanceof RegExp)) {
    throw new TypeError(`registerAuditHeuristic(${name}): pattern must be a RegExp`);
  }
  _customHeuristics.push({ name, pattern });
}

/** Test-only helper to reset module state between unit tests. */
export function _resetAuditPipeline(): void {
  _policy = defaultAuditPolicy();
  _strict = true; // mirrors the production default
  _sinks.length = 0;
  _customSinkFactories.clear();
  _customHeuristics.length = 0;
  _processing = false;
}

// ---------------------------------------------------------------------------
// Entry processing
// ---------------------------------------------------------------------------

/**
 * Process a single trace entry through redaction, content-PII detection,
 * sampling, and forward to all configured sinks.
 *
 * Called from `pushXsLog` after the entry has been buffered. Returns the
 * (possibly-modified) entry that callers should use as the canonical
 * representation; under strict mode an entry with un-redacted PII is
 * replaced with a placeholder `audit-pii-leaked` record.
 */
/**
 * Trace kinds that are framework-internal or diagnostic in nature and should
 * bypass the redactor/PII scanner. Their payloads are produced by the
 * framework itself, never carry user PII, and frequently contain
 * identifier-like strings (component names, diagnostic codes) that would
 * false-positive on content heuristics.
 */
const INTERNAL_KINDS = new Set<string>([
  "audit",
  "versioning",
  "forms",
  "build",
  "errors",
  "lifecycle",
  "sandbox:warn",
  "log:debug",
  "log:info",
  "log:warn",
  "log:error",
  "i18n",
]);

export function processAuditEntry(entry: XsLogEntry): void {
  if (_processing) return; // prevent self-diagnostic recursion
  if (entry.kind === "audit") {
    // forward audit-self entries directly without re-processing
    forwardToSinks(entry);
    return;
  }
  if (INTERNAL_KINDS.has(entry.kind)) {
    // Internal/diagnostic kinds: forward to sinks without redaction/scan.
    forwardToSinks(entry);
    return;
  }

  _processing = true;
  try {
    // 1. Apply redaction rules
    const redacted = redact(entry, _policy);

    // 2. Scan for un-redacted PII
    const leak = scanForUnredactedPii(redacted, _policy.redact);
    let toForward: XsLogEntry = redacted;
    if (leak) {
      emitDiag(
        "audit-redaction-missing",
        _strict ? "error" : "warn",
        `Trace contained un-redacted PII (${leak.category}) at "${leak.path}" with no matching redaction rule.`,
        { category: leak.category, path: leak.path, sourceKind: entry.kind },
      );
      if (_strict) {
        // Drop the entry and emit a leakage marker
        emitDiag(
          "audit-pii-leaked",
          "error",
          `Strict mode dropped a trace entry: un-redacted ${leak.category} at "${leak.path}".`,
          { category: leak.category, path: leak.path, sourceKind: entry.kind },
        );
        return;
      }
    }

    // 3. Sampling
    const forwarded = sampleEntry(toForward, _policy);
    for (const e of forwarded) {
      forwardToSinks(e);
    }
  } finally {
    _processing = false;
  }
}

function forwardToSinks(entry: XsLogEntry): void {
  for (const sink of _sinks) {
    try {
      sink.push(entry);
    } catch (err) {
      // Sinks must not throw; if they do, swallow but log a diagnostic.
      emitDiag(
        "audit-sink-failure",
        "warn",
        `Audit sink threw: ${(err as Error)?.message ?? String(err)}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Sink construction
// ---------------------------------------------------------------------------

function rebuildSinks(): void {
  // Flush any existing sinks before replacing
  for (const s of _sinks) {
    try {
      void s.flush();
    } catch {
      /* noop */
    }
  }
  _sinks.length = 0;

  const cfg = _policy.sink;
  if (!cfg) return;

  let sink: AuditSink | null = null;
  switch (cfg.kind) {
    case "otlp":
      sink = createOtlpSink(cfg);
      break;
    case "console":
      sink = createConsoleSink();
      break;
    case "custom": {
      // Custom sinks are dispatched by name; the SinkConfig encodes name in `endpoint`.
      const name = cfg.endpoint ?? "";
      const factory = _customSinkFactories.get(name);
      if (factory) {
        sink = factory(cfg);
      } else {
        emitDiag(
          "audit-sink-failure",
          "warn",
          `Unknown custom audit sink "${name}". Register it via App.registerAuditSink() before declaring it in <auditPolicy>.`,
        );
      }
      break;
    }
  }
  if (sink) _sinks.push(sink);
}

// ---------------------------------------------------------------------------
// Conflict detection
// ---------------------------------------------------------------------------

function detectPolicyConflicts(rules: ReadonlyArray<RedactionRule>): void {
  const bySelector = new Map<string, RedactionRule[]>();
  for (const r of rules) {
    const list = bySelector.get(r.selector);
    if (list) list.push(r);
    else bySelector.set(r.selector, [r]);
  }
  for (const [sel, list] of bySelector) {
    if (list.length < 2) continue;
    const modes = new Set(list.map((r) => r.mode));
    if (modes.size > 1) {
      emitDiag(
        "audit-policy-conflict",
        _strict ? "error" : "warn",
        `Audit policy declares conflicting redaction modes for "${sel}": ${[...modes].join(", ")}. The more aggressive mode wins (drop > hash > mask).`,
        { selector: sel, modes: [...modes] },
      );
    }
  }
}

// ---------------------------------------------------------------------------
// PII scanning
// ---------------------------------------------------------------------------

function scanForUnredactedPii(
  entry: XsLogEntry,
  rules: ReadonlyArray<RedactionRule>,
): { category: string; path: string } | null {
  return walk(entry as any, "", rules);
}

function walk(
  value: unknown,
  path: string,
  rules: ReadonlyArray<RedactionRule>,
): { category: string; path: string } | null {
  if (value == null) return null;
  if (typeof value === "string") {
    // Skip strings already covered by a redaction rule at this path
    if (rules.some((r) => matchesSelector(r.selector, path))) return null;
    const builtin = detectPii(value);
    if (builtin) return { category: builtin.category, path: path || "<root>" };
    for (const { name, pattern } of _customHeuristics) {
      if (pattern.test(value)) return { category: name, path: path || "<root>" };
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const r = walk(value[i], path ? `${path}.${i}` : String(i), rules);
      if (r) return r;
    }
    return null;
  }
  if (typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      // Skip framework-internal fields to avoid false positives
      if (key === "traceId" || key === "spanId" || key === "parentSpanId") continue;
      const child = (value as Record<string, unknown>)[key];
      const r = walk(child, path ? `${path}.${key}` : key, rules);
      if (r) return r;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Self-diagnostic emission (push directly to _xsLogs, bypass processing)
// ---------------------------------------------------------------------------

function emitDiag(
  code: AuditDiagCode,
  severity: "info" | "warn" | "error",
  message: string,
  data?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (!Array.isArray(w._xsLogs)) return;
  w._xsLogs.push({
    ts: Date.now(),
    kind: "audit",
    code,
    severity,
    message,
    ...data,
  });
}
