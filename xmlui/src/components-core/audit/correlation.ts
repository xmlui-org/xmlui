/**
 * W3C Trace Context correlation manager (Step 0 stubs).
 *
 * Every interaction (click, route change, initial load) is assigned a
 * `traceId`.  Nested handler calls derive `spanId` / `parentSpanId` via
 * `withSpan`.  `pushXsLog` reads the current context and stamps every
 * entry automatically (Phase 1.1).
 *
 * **Step 0 stubs**: all functions are present but non-functional.  Phase 1
 * replaces the bodies with the full AsyncLocalStorage-based context manager.
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
// Context access (Step 0 stubs)
// ---------------------------------------------------------------------------

/**
 * Return the current W3C trace context, or `null` when no span is active.
 *
 * **Step 0 stub**: always returns `null`.
 */
export function currentContext(): TraceContext | null {
  return null;
}

/**
 * Execute `fn` inside a new child span derived from the current context.
 *
 * **Step 0 stub**: calls `fn` with a synthetic context and returns its result.
 */
export function withSpan<T>(name: string, fn: (ctx: TraceContext) => T): T {
  const ctx: TraceContext = {
    traceId: _randomHex(16),
    spanId: _randomHex(8),
  };
  return fn(ctx);
}

/**
 * Inject a W3C `traceparent` header into `headers` using the current context.
 *
 * **Step 0 stub**: does nothing.
 */
export function injectTraceparent(_headers: Headers): void {
  // Phase 1.2 implementation
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
