/**
 * Trace sampling (Phase 3).
 *
 * Two-level sampling:
 *
 * 1. **Head sampling** — decide at the moment a `traceId` is first seen
 *    whether to keep the entire trace.  A coin-flip based on `rate` (0..1)
 *    determines the outcome.  `rate: 1` (default) keeps everything.
 *
 * 2. **Tail sampling** — buffer all entries for a trace and retroactively
 *    flush the whole trace when any entry contains an error code listed in
 *    `keepIfErrorIn`.  Tail sampling runs *after* head sampling; traces
 *    already dropped by head sampling are not buffered.
 *
 * Both levels are purely in-memory and browser-safe.
 */

import type { XsLogEntry } from "../inspector/inspectorUtils";
import type { AuditPolicy } from "./policy";

// ---------------------------------------------------------------------------
// Head-sampling state
// ---------------------------------------------------------------------------

/**
 * Map of traceId → sampled (true = keep, false = drop).
 * Cleared automatically when it grows beyond MAX_TRACE_DECISIONS to prevent
 * unbounded memory growth in long-running SPAs.
 */
const _headDecisions = new Map<string, boolean>();
const MAX_TRACE_DECISIONS = 2000;

/**
 * Determine (and memoize) whether a `traceId` passes head-based sampling.
 * Returns `true` when the trace should be kept.
 */
function headSample(traceId: string, rate: number): boolean {
  if (_headDecisions.has(traceId)) {
    return _headDecisions.get(traceId)!;
  }
  // Evict oldest entries when the map is too large
  if (_headDecisions.size >= MAX_TRACE_DECISIONS) {
    const firstKey = _headDecisions.keys().next().value;
    if (firstKey !== undefined) _headDecisions.delete(firstKey);
  }
  const keep = rate >= 1 || Math.random() < rate;
  _headDecisions.set(traceId, keep);
  return keep;
}

// ---------------------------------------------------------------------------
// Tail-sampling buffer
// ---------------------------------------------------------------------------

/**
 * Per-trace buffer for tail sampling.  Entries are held here until the trace
 * is either flushed (error detected) or evicted (buffer limit reached).
 */
const _tailBuffer = new Map<string, XsLogEntry[]>();
const MAX_TAIL_TRACES = 200;

/**
 * Add `entry` to the tail buffer for its trace and return any entries that
 * should be forwarded because the trace triggered a tail-sampling flush.
 *
 * Returns:
 *  - An empty array when the entry was buffered but not yet flushed.
 *  - The full buffered trace (including `entry`) when a flush is triggered.
 */
function tailProcess(
  entry: XsLogEntry,
  keepIfErrorIn: ReadonlyArray<string>,
): XsLogEntry[] {
  const traceId = entry.traceId;
  if (!traceId) return [entry]; // no traceId → forward immediately

  // Buffer the entry
  if (!_tailBuffer.has(traceId)) {
    // Evict oldest trace when buffer is full
    if (_tailBuffer.size >= MAX_TAIL_TRACES) {
      const firstKey = _tailBuffer.keys().next().value;
      if (firstKey !== undefined) _tailBuffer.delete(firstKey);
    }
    _tailBuffer.set(traceId, []);
  }
  const buf = _tailBuffer.get(traceId)!;
  buf.push(entry);

  // Check if this entry triggers a flush
  const errorCode = entry.code ?? entry.errorCode;
  const shouldFlush =
    typeof errorCode === "string" &&
    keepIfErrorIn.includes(errorCode);

  if (shouldFlush) {
    _tailBuffer.delete(traceId);
    return buf;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Exported drain helper (for testing / flush-on-unload)
// ---------------------------------------------------------------------------

/**
 * Return and clear all buffered tail entries.  Call on `beforeunload` to
 * prevent losing in-flight traces.
 */
export function drainTailBuffer(): XsLogEntry[] {
  const all: XsLogEntry[] = [];
  _tailBuffer.forEach((entries) => all.push(...entries));
  _tailBuffer.clear();
  return all;
}

/** For testing: clear all head-sampling memoization. */
export function _resetSamplerState(): void {
  _headDecisions.clear();
  _tailBuffer.clear();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Determine whether `entry` should be forwarded to the configured sink.
 *
 * When a `tail` rule is configured this function may buffer the entry and
 * return an empty array (deferred forwarding); callers should iterate the
 * returned array and push each element to the sink.
 *
 * For the simple (no tail sampling) case this returns `[entry]` or `[]`.
 */
export function sampleEntry(entry: XsLogEntry, policy: AuditPolicy): XsLogEntry[] {
  const { head, tail } = policy.sample ?? {};

  // Head sampling
  const rate = head?.rate ?? 1;
  const traceId = entry.traceId;
  if (traceId && !headSample(traceId, rate)) {
    return []; // drop
  }

  // Tail sampling
  if (tail && tail.keepIfErrorIn.length > 0) {
    return tailProcess(entry, tail.keepIfErrorIn);
  }

  return [entry];
}

/**
 * Backward-compatible scalar predicate.
 *
 * Returns `true` when the entry should pass through (i.e. `sampleEntry`
 * returns a non-empty array with no tail buffering involved).
 */
export function sample(entry: XsLogEntry, policy: AuditPolicy): boolean {
  return sampleEntry(entry, policy).length > 0;
}

