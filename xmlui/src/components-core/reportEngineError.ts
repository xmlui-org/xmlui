import { ScriptParseError, StatementExecutionError, ThrowStatementError } from "./EngineError";

type ErrorInfo = {
  error: Error;
  helperMessage?: string;
  colors?: string[];
};

const appErrors: ErrorInfo[] = [];

/**
 * Get all errors collected during the last run
 */
export function getAppErrors(): ErrorInfo[] {
  return appErrors;
}

/**
 * Use this function to reset the errors raised by the execution engine
 */
export function resetErrors(): void {
  appErrors.length = 0;
}

/**
 * Use this function to report an error
 * @param error Error or string describing the error to report
 * @param errorToThrow The error to throw
 */
export function reportEngineError(error: Error | string, errorToThrow?: any): void {
  // --- Wrap a string into an error
  if (typeof error === "string") {
    error = new Error(error);
  }

  let helperMessage = "";
  let colors: string[] = [];

  // --- Error-specific helper messages
  if (error instanceof ScriptParseError) {
    let pos = (error?.position ?? 0) - 1;
    if (error.source) {
      while (pos < error.source.length - 1 && error.source[pos] === " ") {
        pos++;
      }
      helperMessage += `%c${error.message}%c\n\n`;
      helperMessage += `${error.source.substring(0, pos)}%c${error.source[pos]}%c${
        error.source.substring(pos + 1) ?? ""
      }\n\n`;
    }
    helperMessage += `%cThe error handler associated with the parsed code did not run.%c`;
    colors = ["color: red", "color: inherited", "color: red", "color: inherited", "color: orange", "color: inherited"];
  } else if (error instanceof StatementExecutionError) {
    helperMessage += `%cError while executing code: ${error.message}%c`;
    if (error.source) {
      helperMessage += `\n\n${error.source}`;
    }
    colors = ["color: red", "color: inherited"];
  } else if (error instanceof ThrowStatementError) {
    helperMessage += `A 'throw' statement executed:\n\n%c${error.message}%c\n\n${error.errorObject}`;
    colors = ["color: red", "color: inherited"];
  }

  if (helperMessage) {
    console.error(helperMessage, ...colors);
  }
  appErrors.push({ error, helperMessage, colors });
  throw errorToThrow ?? error;
}
