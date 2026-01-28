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
  traceId?: string;
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
 */
export function pushXsLog(entry: XsLogEntry, xsLogMax: number = 200): void {
  if (typeof window === "undefined") return;
  const w = window as any;
  w._xsLogs = Array.isArray(w._xsLogs) ? w._xsLogs : [];
  w._xsLogs.push(entry);
  if (Number.isFinite(xsLogMax) && xsLogMax > 0 && w._xsLogs.length > xsLogMax) {
    w._xsLogs.splice(0, w._xsLogs.length - xsLogMax);
  }
}

/**
 * Create a log entry with common fields populated.
 */
export function createLogEntry(
  kind: string,
  extras: Partial<XsLogEntry> = {},
): XsLogEntry {
  const w = typeof window !== "undefined" ? (window as any) : {};
  return {
    ts: Date.now(),
    perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
    traceId: w._xsCurrentTrace,
    kind,
    ...extras,
  };
}

/**
 * Log to console and loggerService with [xs] prefix.
 */
export function xsConsoleLog(...args: any[]): void {
  const payload = ["[xs]", ...args];
  loggerService.log(payload);
  console.log(...payload);
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
 */
export function getCurrentTrace(): string | undefined {
  if (typeof window !== "undefined") {
    return (window as any)._xsCurrentTrace;
  }
  return traceStack[traceStack.length - 1];
}
