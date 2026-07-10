export type ErrorCategory =
  | "network"
  | "validation"
  | "authorization"
  | "not-found"
  | "conflict"
  | "rate-limit"
  | "server"
  | "internal"
  | "user-cancelled";

export interface AppErrorInit {
  code: string;
  category: ErrorCategory;
  message: string;
  retryable?: boolean;
  correlationId?: string;
  cause?: unknown;
  data?: Record<string, unknown>;
}

const defaultRetryable: Record<ErrorCategory, boolean> = {
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
    this.retryable = init.retryable ?? defaultRetryable[init.category];
    this.correlationId = init.correlationId;
    this.data = Object.freeze({ ...(init.data ?? {}) });
  }

  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      name: this.name,
      code: this.code,
      category: this.category,
      retryable: this.retryable,
      message: this.message,
    };
    if (this.correlationId !== undefined) {
      json.correlationId = this.correlationId;
    }
    if (Object.keys(this.data).length > 0) {
      json.data = this.data;
    }
    if (this.cause !== undefined) {
      json.cause = this.cause instanceof AppError
        ? this.cause.toJSON()
        : this.cause instanceof Error
          ? { name: this.cause.name, message: this.cause.message }
          : String(this.cause);
    }
    return json;
  }

  static from(unknown: unknown): AppError {
    if (unknown instanceof AppError) {
      return unknown;
    }
    if (unknown instanceof Error) {
      const statusCode = (unknown as { statusCode?: unknown }).statusCode;
      if (typeof statusCode === "number") {
        const data: Record<string, unknown> = { statusCode };
        const source = unknown as { details?: unknown; response?: unknown; retryAfterMs?: unknown };
        if (source.details != null) {
          data.details = source.details;
        }
        if (source.response != null) {
          data.response = source.response;
        }
        if (typeof source.retryAfterMs === "number") {
          data.retryAfterMs = source.retryAfterMs;
        }
        return new AppError({
          code: `http-${statusCode}`,
          category: categorizeHttpStatus(statusCode),
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

export function categorizeHttpStatus(status: number): ErrorCategory {
  if (status === 400 || status === 422) return "validation";
  if (status === 401 || status === 403) return "authorization";
  if (status === 404) return "not-found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate-limit";
  if (status >= 500 && status <= 599) return "server";
  return "internal";
}
