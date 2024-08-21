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
 * Extracts information from the error object received from the backend
 */
export class GenericBackendError extends EngineError {
  readonly errorCategory = "GenericBackendError";
  details: any;
  statusCode: number | undefined;
  constructor(public readonly info: any, errorCode: number | undefined) {
    // `The backend raised an error. (reasonCode: ${info.reasonCode}, isBusiness: ${info.isBusiness}, message: ${info.message})`
    let message = "";
    if (info?.code) {
      message += `[Error code: ${info.code}]\n`;
    }
    if (info?.details && typeof info.details === "string") {
      message += `${info.details}`;
    } else if(info?.message){
      message += `${info.message}`;
    }
    super(message || info?.message || "Unknown error");
    
    this.details = info;
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