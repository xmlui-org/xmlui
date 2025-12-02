/**
 * The abstract base class of all UI engine errors
 */
export abstract class EngineError extends Error {
  protected abstract readonly errorCategory: string;
  protected constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EngineError.prototype);
  }
}

/**
 * Extracts information from the error object received from the backend.
 * Handles common API error response formats including:
 * - RFC 7807 Problem Details
 * - Simple message pattern
 * - Code + message pattern
 * - Nested errors (validation)
 * - Google/Microsoft style
 * 
 * (Generated using AI)
 */
export class GenericBackendError extends EngineError {
  readonly errorCategory = "GenericBackendError";
  details: any;
  statusCode: number | undefined;

  constructor(public readonly info: any, errorCode: number | undefined) {
    // Extract the main message (various field names across API formats)
    const message =
      info?.message ||
      info?.error?.message ||
      info?.title ||           // RFC 7807
      (typeof info?.error === "string" ? info.error : null) ||
      (typeof info === "string" ? info : null) ||
      "Unknown error";

    // Extract details (various field names across API formats)
    const extractedDetails =
      info?.details ||
      info?.detail ||          // RFC 7807
      info?.error?.details ||
      info?.errors ||          // Validation errors array
      (info?.error && typeof info.error === "object" ? info.error : null) ||
      null;

    // Build details object, including issues if present at top level
    const details = extractedDetails 
      ? (info?.issues ? { ...extractedDetails, issues: info.issues } : extractedDetails)
      : (info?.issues ? { issues: info.issues } : null);

    super(message);

    this.details = details;
    this.statusCode = errorCode;
    // --- Set the prototype explicitly.
    Object.setPrototypeOf(this, GenericBackendError.prototype);
  }
}

/**
 * Custom exception indicating a parser error
 */
export class ScriptParseError extends EngineError {
  readonly errorCategory = "ScriptParserError";
  constructor(message: string, public readonly source?: string, public readonly position?: number) {
    message = `Parser Error: ${message}`;
    super(message);
    Object.setPrototypeOf(this, ScriptParseError.prototype);
  }
}

/**
 * Custom exception signing parsing error
 */
export class StatementExecutionError extends EngineError {
  readonly errorCategory = "StatementExecutionError";
  constructor(message: string, public readonly source?: string) {
    super(message);
    Object.setPrototypeOf(this, StatementExecutionError.prototype);
  }
}

/**
 * Signs that we get an unexpected type instead of a component definition
 */
export class NotAComponentDefError extends EngineError {
  readonly errorCategory = "NotAComponentError";
  constructor() {
    super("Must be a component definition, cannot use dynamic children here...");
    Object.setPrototypeOf(this, NotAComponentDefError.prototype);
  }
}

/**
 * We throw this error when a throw statement is executed
 */
export class ThrowStatementError extends EngineError {
  readonly errorCategory = "ThrowStatementError";
  readonly message: string;
  constructor(public readonly errorObject: any) {
    const message = typeof errorObject === "string"
        ? errorObject : errorObject?.message || "Error without message";
    super(message);
    this.message = message;
    Object.setPrototypeOf(this, ThrowStatementError.prototype);
  }
}

export function createContextVariableError(err: GenericBackendError) {
  return {
    statusCode: err.statusCode || 500,
    message: err.message || "An error occurred",
    details: err.details || { },
  }
}