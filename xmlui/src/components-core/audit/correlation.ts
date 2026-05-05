/**
 * W3C Trace Context correlation manager (Phase 1).
 *
 * Every interaction (click, route change, initial load) is assigned a
 * `traceId`.  Nested handler calls derive `spanId` / `parentSpanId` via
 * `withSpan`.  `pushXsLog` reads the current context and stamps every
 * entry automatically.
 *
 * Note: browsers have no AsyncLocalStorage, so we use a module-level
 * call-stack maintained by `withSpan`.  This works correctly for
 * synchronous call chains.  Async continuations (Promise.then / await)
 * that cross `withSpan` boundaries propagate the correct context because
 * `withSpan` captures the parent context at call time.
 */

// ---------------------------------------------------------------------------
// TraceContext
// ---------------------------------------------------------------------------

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

// ---------------------------------------------------------------------------
// Module-level context stack
// ---------------------------------------------------------------------------

/**
 * A boot-level trace ID generated once at module load.
 * Used as the fallback `traceId` for log entries produced outside any
 * `withSpan` call (e.g., module initialisation, static side-effects).
 */
export const BOOT_TRACE_ID: string = _randomHex(16);

/** The live call-stack of active spans (innermost last). */
const _spanStack: TraceContext[] = [];

// ---------------------------------------------------------------------------
// Context access
// ---------------------------------------------------------------------------

/**
 * Return the innermost active W3C trace context, or `null` when no span is
 * active.  Log entries produced outside any span use `BOOT_TRACE_ID` as a
 * fallback (see `pushXsLog`).
 */
export function currentContext(): TraceContext | null {
  return _spanStack.length > 0 ? _spanStack[_spanStack.length - 1] : null;
}

/**
 * Execute `fn` inside a new child span derived from the current context.
 *
 * - If there is an active parent span the new span inherits its `traceId` and
 *   sets `parentSpanId` to the parent's `spanId`.
 * - If there is no active span a new root span is created with a fresh
 *   `traceId`.
 * - The span is popped from the stack when `fn` returns (or throws).
 * - `name` is attached as `spanName` for diagnostic purposes but is not part
 *   of the W3C spec.
 */
export function withSpan<T>(name: string, fn: (ctx: TraceContext) => T): T {
  const parent = currentContext();
  const ctx: TraceContext & { spanName: string } = {
    traceId: parent ? parent.traceId : _randomHex(16),
    spanId: _randomHex(8),
    parentSpanId: parent ? parent.spanId : undefined,
    spanName: name,
  };
  _spanStack.push(ctx);
  try {
    return fn(ctx);
  } finally {
    _spanStack.pop();
  }
}

/**
 * Inject a W3C `traceparent` header into `headers` using the current context.
 *
 * Format: `00-{32-hex traceId}-{16-hex spanId}-01`
 *
 * The header is only injected when there is an active span context.  For
 * same-origin restriction, callers should check `url` before calling this
 * helper.
 */
export function injectTraceparent(headers: Headers): void {
  const ctx = currentContext();
  if (!ctx) return;
  // W3C traceparent format: version(2)-traceId(32)-spanId(16)-flags(2)
  headers.set("traceparent", `00-${ctx.traceId}-${ctx.spanId}-01`);
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function _randomHex(bytes: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for environments without Web Crypto (SSR / tests).
  return Array.from({ length: bytes * 2 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}
