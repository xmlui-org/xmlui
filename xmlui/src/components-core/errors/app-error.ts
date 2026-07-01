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

export interface AppErrorInit {
  code: string;
  category: ErrorCategory;
  message: string;
  retryable?: boolean;
  correlationId?: string;
  cause?: unknown;
  data?: Record<string, unknown>;
}

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
      const statusCode = (unknown as any).statusCode;
      if (typeof statusCode === "number") {
        const data: Record<string, unknown> = { statusCode };
        const details = (unknown as any).details;
        if (details != null) {
          data.details = details;
        }
        const response = (unknown as any).response;
        if (response != null) {
          data.response = response;
        }
        const retryAfterMs = (unknown as any).retryAfterMs;
        if (typeof retryAfterMs === "number") {
          data.retryAfterMs = retryAfterMs;
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
  if (status === 400 || status === 422) {
    return "validation";
  }
  if (status === 401 || status === 403) {
    return "authorization";
  }
  if (status === 404) {
    return "not-found";
  }
  if (status === 409) {
    return "conflict";
  }
  if (status === 429) {
    return "rate-limit";
  }
  if (status >= 500 && status <= 599) {
    return "server";
  }
  return "internal";
}
