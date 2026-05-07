/**
 * Shared utilities for inspector logging and tracing.
 * These functions are used across Container, DataLoader, StateContainer, and AppContent.
 *
 * ## Window Properties (available when xsVerbose=true)
 *
 * The inspector stores state on the window object for external tooling access:
 *
 * ### Logging & Tracing
 * - `window._xsLogs` - Array of log entries (state changes, handler events, API calls)
 * - `window._xsCurrentTrace` - Current trace ID for correlating related events
 * - `window._xsStartupTrace` - Trace ID for app startup events
 * - `window._xsStartupComplete` - Boolean, true after first user interaction
 * - `window._xsLastInteraction` - Last user interaction { id, ts, type, target }
 *
 * ### Component Mapping
 * - `window._xsInspectMap` - Map of inspectId -> { componentType, componentLabel, uid }
 * - `window._xsTestIdMap` - Map of testId -> { componentType, componentLabel, uid }
 *
 * ### Source Code
 * - `window._xsSources` - Map of fileId -> source code string
 * - `window._xsSourceFiles` - Array of source file paths
 *
 * ### Handler Context
 * - `window._xsHandlerSourceInfo` - Source location for current handler
 * - `window._xsPendingConfirmTrace` - Trace ID for pending confirmation dialogs
 *
 * ### API Tracking
 * - `window._xsLastApiStatus` - Map of transactionId -> HTTP status code
 */

import { loggerService } from "../../logging/LoggerService";
import { currentContext, BOOT_TRACE_ID } from "../audit/correlation";

// =============================================================================
// SAFE STRINGIFY
// =============================================================================

/**
 * Safely stringify a value to JSON, handling circular references and special objects.
 */
export function safeStringify(value: any): string {
  if (value === undefined) return "undefined";
  const seen = new WeakSet();
  try {
    return JSON.stringify(
      value,
      (_key, val) => {
        if (typeof val === "function") return "[Function]";
        if (typeof window !== "undefined") {
          if (val === window) return "[Window]";
          if (val === document) return "[Document]";
        }
        if (val && typeof Node !== "undefined" && val instanceof Node) {
          return "[DOM Node]";
        }
        if (val && typeof val === "object") {
          if (seen.has(val)) return "[Circular]";
          seen.add(val);
        }
        return val;
      },
      2,
    );
  } catch {
    return String(value);
  }
}

/**
 * Safely deep-clone a value, replacing circular references, functions,
 * and DOM nodes with placeholder strings. Use when storing values in
 * _xsLogs that will later be JSON.stringify'd during trace capture.
 */
export function safeClone<T>(value: T): T {
  if (value == null || typeof value !== "object") return value;
  try {
    return JSON.parse(safeStringify(value));
  } catch {
    return "[uncloneable]" as any;
  }
}

/**
 * Simple stringify for diff display (no circular reference handling needed).
 */
export function simpleStringify(value: any): string {
  if (value === undefined) return "undefined";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

// =============================================================================
// DIFF FORMATTING
// =============================================================================

/**
 * Prefix each line of text with a given prefix.
 */
export function prefixLines(text: string, prefix: string): string {
  return text
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

export interface DiffEntry {
  path: string;
  type: "add" | "remove" | "update";
  before: any;
  after: any;
  beforeJson: string;
  afterJson: string;
  diffText: string;
  diffPretty: string;
}

/**
 * Format a diff between two values.
 */
export function formatDiff(path: string, before: any, after: any): DiffEntry {
  const beforeJson = simpleStringify(before);
  const afterJson = simpleStringify(after);
  const diffPretty =
    `path: ${path}\n` +
    `${prefixLines(beforeJson, "- ")}\n` +
    `${prefixLines(afterJson, "+ ")}`;
  return {
    path,
    type: "update",
    before,
    after,
    beforeJson,
    afterJson,
    diffText: `path: ${path}\n- ${beforeJson}\n+ ${afterJson}`,
    diffPretty,
  };
}

/**
 * Format a state change (from immer-style change objects).
 */
export function formatChange(change: {
  path: string;
  action?: string;
  previousValue: any;
  newValue: any;
}): DiffEntry {
  const prev = change.previousValue;
  const next = change.newValue;
  let kind: "add" | "remove" | "update" = "update";
  if (change.action === "unset") {
    kind = "remove";
  } else if (prev === undefined && next !== undefined) {
    kind = "add";
  }
  const beforeJson = simpleStringify(prev);
  const afterJson = simpleStringify(next);
  const diffPretty =
    `path: ${change.path}\n` +
    `${prefixLines(beforeJson, "- ")}\n` +
    `${prefixLines(afterJson, "+ ")}`;
  return {
    path: change.path,
    type: kind,
    before: prev,
    after: next,
    beforeJson,
    afterJson,
    diffText: `path: ${change.path}\n- ${beforeJson}\n+ ${afterJson}`,
    diffPretty,
  };
}

// =============================================================================
// LOG ENTRY CREATION
// =============================================================================

export interface XsLogEntry {
  ts: number;
  perfTs?: number;
  startPerfTs?: number;
  traceId?: string;
  /** W3C span ID generated by `withSpan`. Undefined for entries produced outside any span. */
  spanId?: string;
  /** Parent span ID (innermost enclosing span). Undefined for root spans. */
  parentSpanId?: string;
  /**
   * Event kind. Well-known values:
   * - `"interaction"` — user interaction (click, input, etc.)
   * - `"navigate"` — route navigation
   * - `"api:start"` / `"api:complete"` — HTTP request lifecycle
   * - `"handler:start"` / `"handler:complete"` / `"handler:error"` — event handler lifecycle
   * - `"state:change"` — container state mutation
   * - `"sandbox:warn"` — a banned DOM API was accessed while `strictDomSandbox` is `false`;
   *   the access was allowed but flagged. Contains `api` and optionally `help` fields.
   * - `"log:debug"` | `"log:info"` | `"log:warn"` | `"log:error"` — Log.* calls from
   *   expressions. Contains `args: unknown[]`.
   * - `"app:randomBytes"` — App.randomBytes(n) called. Contains `n: number`.
   * - `"app:mark"` — App.mark(label). Contains `label: string`, `perfTs: number`.
   * - `"app:measure"` — App.measure(label, from, to?). Contains `duration: number`.
   * - `"app:fetch"` — App.fetch(url) called. Contains `url: string`, `method: string`.
   * - `"clipboard:copy"` — Clipboard.copy(text). Contains `length: number`.
   * - `"navigate"` — navigate(to, options) call. Contains `to: string`,
   *   `target: "_self" | "_blank"`. Emitted whether navigation goes through the
   *   router or opens an external tab.
   * - `"ws:connect"` | `"ws:message"` | `"ws:error"` | `"ws:close"` — WebSocket lifecycle.
   * - `"eventsource:connect"` | `"eventsource:message"` | `"eventsource:error"` | `"eventsource:close"` — EventSource lifecycle.
   * - `"build"` — build-time validation diagnostic echoed at runtime; produced by the
   *   analyzer pipeline (plan #13). Contains `code: string`, `severity`, `file`, `line`,
   *   `column`, `message`, and optional `data` / `suggestions`.
   * - `"errors"` — structured error event; produced when the error pipeline encounters a
   *   noteworthy condition (unhandled error, retry exhausted, circuit open, etc.) (plan #07).
   *   Contains `code: ErrorDiagnosticCode`, `source: ErrorSource`, `severity`, `message`,
   *   and optionally `componentUid`, `correlationId`.
   * - `"audit"` — audit-pipeline self-diagnostic; produced when the audit subsystem
   *   encounters a structural problem (redaction gap, sink failure, buffer overflow, etc.)
   *   (plan #15). Contains `code: AuditDiagCode`, `severity`, `message`, optional `data`.
   * - `"a11y"` — accessibility linter finding emitted at runtime when
   *   `App.appGlobals.strictAccessibility` is truthy; produced by the accessibility
   *   module (plan #05). Contains `code: A11yCode`, `severity`, `componentName`,
   *   `message`, and optional `fix`.
   * - `"reactive-cycle"` — a reactive dependency cycle detected at app startup by
   *   the static graph analyzer (plan #03). Contains `severity: "warn" | "error"`,
   *   `cycle: string[]` (node ids in order, cycle closed implicitly), `nodes` (resolved
   *   `ReactiveNode[]`), `message` (human-readable diagnostic from `formatCycle`),
   *   and `cycleId` (stable hash for deduplication within a session).
   * - `"type-contract"` — a parse-time type-contract violation surfaced at runtime
   *   when `App.appGlobals.strictTypeContracts` is truthy; produced by the
   *   type-contract verifier (plan #01). Contains `code: TypeContractCode`,
   *   `severity`, `componentName`, optional `propName` / `expected` / `actual`,
   *   `message`, and optional `suggestion`.
   */
  kind?: string;
  eventName?: string;
  componentType?: string;
  componentLabel?: string;
  uid?: string;
  text?: string;
  diffPretty?: string;
  diffJson?: DiffEntry[];
  error?: { message: string; stack?: string };
  [key: string]: any; // Allow additional properties
}

/**
 * Push a log entry to window._xsLogs with max limit enforcement.
 *
 * @param entry - The log entry to push.
 * @param xsLogMax - Maximum buffer size. When the buffer is full:
 *   - `"drop-oldest"` (default): evicts the oldest evictable entries.
 *   - `"drop-newest"`: drops `entry` and returns `false`.
 *   - `"block"`: drops `entry`, emits an `audit-buffer-overflow` info entry,
 *     and returns `false`.
 * @returns `true` when the entry was added, `false` when it was dropped.
 */
export function pushXsLog(
  entry: XsLogEntry,
  xsLogMax: number = 200,
  onOverflow: "drop-oldest" | "drop-newest" | "block" = "drop-oldest",
): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  // _xsLogs is only initialized by AppContent when xsVerbose=true.
  // If it doesn't exist, tracing is off — noop.
  if (!Array.isArray(w._xsLogs)) return false;

  const atCapacity =
    Number.isFinite(xsLogMax) && xsLogMax > 0 && w._xsLogs.length >= xsLogMax;

  if (atCapacity) {
    if (onOverflow === "drop-newest") {
      return false;
    }
    if (onOverflow === "block") {
      // Emit overflow diagnostic (but only if there's room to avoid recursion)
      if (w._xsLogs.length < xsLogMax + 10) {
        w._xsLogs.push(
          safeClone({
            ts: Date.now(),
            kind: "audit",
            code: "audit-buffer-overflow",
            severity: "warn",
            message: `Audit log buffer overflow (capacity: ${xsLogMax}). Entry dropped.`,
          }),
        );
      }
      return false;
    }
    // "drop-oldest" (default): trim before adding
    splicePreservingInteractions(w._xsLogs, xsLogMax - 1);
  }

  // Safe-clone the entry to prevent circular references from live objects
  // (e.g., React Query cache) from poisoning _xsLogs and breaking JSON export.
  w._xsLogs.push(safeClone(entry));
  return true;
}

/**
 * Trim _xsLogs to the max size while preserving events critical for Playwright
 * test generation and semantic trace comparison. High-frequency events
 * (state:changes, component:vars:*) are evictable; everything needed to
 * reconstruct user journeys (interactions, navigation, APIs, handlers,
 * modals, toasts) is preserved.
 */
export function splicePreservingInteractions(logs: any[], maxSize: number): void {
  const preserved = new Set(["interaction", "navigate", "api:start", "api:complete", "api:error", "handler:start", "handler:complete", "modal:show", "modal:confirm", "modal:cancel", "toast", "submenu:open", "selection:change", "focus:change", "method:call", "value:change"]);
  const keep: any[] = [];
  const evictable: any[] = [];
  for (const entry of logs) {
    if (preserved.has(entry.kind) || entry.kind?.startsWith("native:")) {
      keep.push(entry);
    } else {
      evictable.push(entry);
    }
  }
  const evictableSlot = maxSize - keep.length;
  const trimmed = evictableSlot > 0 ? evictable.slice(-evictableSlot) : [];
  const merged = [...keep, ...trimmed].sort(
    (a, b) => (a.perfTs || a.ts || 0) - (b.perfTs || b.ts || 0),
  );
  logs.length = 0;
  logs.push(...merged);
}

/**
 * Create a log entry with common fields populated.
 *
 * The entry is stamped with the current W3C trace context (traceId, spanId,
 * parentSpanId) from `correlation.currentContext()` when an active span exists.
 * Entries produced outside any span use the boot-trace ID as fallback and
 * emit an `audit-correlation-missing` info diagnostic.
 */
export function createLogEntry(
  kind: string,
  extras: Partial<XsLogEntry> = {},
): XsLogEntry {
  const w = typeof window !== "undefined" ? (window as any) : {};
  const ctx = currentContext();
  const traceId = ctx ? ctx.traceId : (w._xsCurrentTrace ?? BOOT_TRACE_ID);
  const entry: XsLogEntry = {
    ts: Date.now(),
    perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
    traceId,
    spanId: ctx?.spanId,
    parentSpanId: ctx?.parentSpanId,
    kind,
    ...extras,
  };
  return entry;
}

/**
 * Log to console and loggerService with [xs] prefix.
 */
export function xsConsoleLog(...args: any[]): void {
  const payload = ["[xs]", ...args];
  loggerService.log(payload);
  // console.log(...payload);
}

// =============================================================================
// TRACE ID MANAGEMENT
// =============================================================================

const traceStack: string[] = [];

/**
 * Generate a unique trace ID.
 */
export function generateTraceId(): string {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Push a trace ID onto the stack and set it as current.
 */
export function pushTrace(preferredId?: string): string {
  const id = preferredId || generateTraceId();
  traceStack.push(id);
  if (typeof window !== "undefined") {
    (window as any)._xsCurrentTrace = id;
  }
  return id;
}

/**
 * Pop the current trace ID from the stack.
 */
export function popTrace(): void {
  traceStack.pop();
  if (typeof window !== "undefined") {
    (window as any)._xsCurrentTrace = traceStack[traceStack.length - 1];
  }
}

/**
 * Get the current trace ID.
 * After startup is complete, never return the startup trace — events that
 * fire without an active interaction trace should get no traceId rather
 * than being incorrectly attributed to startup.
 */
export function getCurrentTrace(): string | undefined {
  if (typeof window !== "undefined") {
    const w = window as any;
    const current = w._xsCurrentTrace;
    if (current && w._xsStartupComplete && current === w._xsStartupTrace) {
      return undefined;
    }
    return current;
  }
  return traceStack[traceStack.length - 1];
}
