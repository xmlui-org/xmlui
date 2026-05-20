/**
 * AppError — structured error type for XMLUI applications.
 *
 * `AppError` replaces bare `Error` / string throws at XMLUI error boundaries.
 * It carries a machine-readable `code`, a semantic `category` that drives
 * default retry behaviour, an optional `correlationId` (server-issued), a
 * chained `cause`, and a free-form `data` bag for structured metadata.
 *
 * ## Rollout note
 *
 * During the `strictErrors === false` rollout phase (the default), all three
 * containment sites (`ErrorBoundary`, `event-handlers`, `LOADER_ERROR`) still
 * accept plain `Error` and normalise it via `AppError.from()`.  When
 * `strictErrors === true`, passing a plain `Error` from script logs a
 * `kind:"errors"` warn diagnostic with a migration hint.
 */

// ---------------------------------------------------------------------------
// ErrorCategory
// ---------------------------------------------------------------------------

export type ErrorCategory =
  | "network"        // transport-level failures (DNS, TCP, timeout)
  | "validation"     // user input / schema (400, 422)
  | "authorization"  // identity / permission (401, 403)
  | "not-found"      // missing resource (404)
  | "conflict"       // optimistic-concurrency clash (409)
  | "rate-limit"     // too many requests (429)
  | "server"         // server-side fault (5xx)
  | "internal"       // framework / coding bug — non-retryable
  | "user-cancelled"; // explicit cancellation by the user

/** Default retryability per category — overridable via `AppErrorInit.retryable`. */
const DEFAULT_RETRYABLE: Record<ErrorCategory, boolean> = {
  network: true,
  validation: false,
  authorization: false,
  "not-found": false,
  conflict: false,
  "rate-limit": true,
  server: true,
  internal: false,
  "user-cancelled": false,
};

// ---------------------------------------------------------------------------
// AppErrorInit
// ---------------------------------------------------------------------------

export interface AppErrorInit {
  /** Machine-readable error code (app-specific). */
  code: string;
  /** Semantic category that governs default retry behaviour. */
  category: ErrorCategory;
  /** Human-readable description of the problem. */
  message: string;
  /**
   * Whether the operation can be retried.
   * Defaults to `DEFAULT_RETRYABLE[category]` when omitted.
   */
  retryable?: boolean;
  /** Correlation ID issued by the server (e.g. from `X-Correlation-Id`). */
  correlationId?: string;
  /** Original cause; preserved for chained error walks. */
  cause?: unknown;
  /** Arbitrary structured metadata attached to the error. */
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// AppError
// ---------------------------------------------------------------------------

export class AppError extends Error {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly retryable: boolean;
  readonly correlationId: string | undefined;
  readonly data: Readonly<Record<string, unknown>>;

  constructor(init: AppErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
    this.name = "AppError";
    this.code = init.code;
    this.category = init.category;
    this.retryable = init.retryable ?? DEFAULT_RETRYABLE[init.category];
    this.correlationId = init.correlationId;
    this.data = Object.freeze({ ...(init.data ?? {}) });
  }

  /**
   * Return a plain JSON-serialisable representation suitable for trace entries
   * and server-side logging.
   */
  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      name: this.name,
      code: this.code,
      category: this.category,
      retryable: this.retryable,
      message: this.message,
    };
    if (this.correlationId !== undefined) json.correlationId = this.correlationId;
    if (Object.keys(this.data).length > 0) json.data = this.data;
    if (this.cause !== undefined) {
      json.cause = this.cause instanceof AppError
        ? this.cause.toJSON()
        : this.cause instanceof Error
          ? { name: this.cause.name, message: this.cause.message }
          : String(this.cause);
    }
    return json;
  }

  /**
   * Normalise any thrown value to an `AppError`.
   *
   * - `AppError` instances are returned as-is (no double-wrapping).
   * - `Error` instances are wrapped with `category: "internal"`, `code: "unknown"`.
   * - Strings are treated as messages with `category: "internal"`, `code: "unknown"`.
   * - All other values are stringified and wrapped similarly.
   */
  static from(unknown: unknown): AppError {
    if (unknown instanceof AppError) return unknown;
    if (unknown instanceof Error) {
      // Detect a wrapped GenericBackendError (HTTP failure) via duck-typing so
      // we do not introduce a circular import from EngineError → errors.
      const statusCode = (unknown as any).statusCode;
      if (typeof statusCode === "number") {
        const category = categorizeHttpStatus(statusCode);
        const data: Record<string, unknown> = { statusCode };
        const details = (unknown as any).details;
        if (details != null) data.details = details;
        const response = (unknown as any).response;
        if (response != null) data.response = response;
        // Plan #07 Step 3.2 — RestApiProxy attaches the parsed `Retry-After`
        // delay as `retryAfterMs` on the source error.  Promote it onto
        // `AppError.data` so `<RetryPolicy>` can override the backoff.
        const retryAfterMs = (unknown as any).retryAfterMs;
        if (typeof retryAfterMs === "number") data.retryAfterMs = retryAfterMs;
        return new AppError({
          code: `http-${statusCode}`,
          category,
          message: unknown.message,
          cause: unknown,
          data,
        });
      }
      return new AppError({
        code: "unknown",
        category: "internal",
        message: unknown.message,
        cause: unknown,
      });
    }
    return new AppError({
      code: "unknown",
      category: "internal",
      message: typeof unknown === "string" ? unknown : String(unknown),
      cause: unknown,
    });
  }
}

// ---------------------------------------------------------------------------
// HTTP status → ErrorCategory mapping
// ---------------------------------------------------------------------------

/**
 * Map an HTTP status code to a semantic `ErrorCategory`.
 *
 * The mapping follows the table in plan #07 Phase 1 Step 1.2:
 *   400, 422        → "validation"
 *   401, 403        → "authorization"
 *   404             → "not-found"
 *   409             → "conflict"
 *   429             → "rate-limit"
 *   5xx             → "server"
 *   network/timeout → caller maps to "network" before calling this
 *   anything else   → "internal"
 */
export function categorizeHttpStatus(status: number): ErrorCategory {
  if (status === 400 || status === 422) return "validation";
  if (status === 401 || status === 403) return "authorization";
  if (status === 404) return "not-found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate-limit";
  if (status >= 500 && status <= 599) return "server";
  return "internal";
}
