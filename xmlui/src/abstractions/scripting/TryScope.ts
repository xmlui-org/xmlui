import type { TryStatement } from "../../components-core/script-runner/ScriptingSourceTree";

type ErrorProcessingPhase = "try" | "catch" | "finally" | "error" | "postFinally";
type ErrorHandlerExitType = "break" | "continue" | "return";

// Represents the scope of a try block
export type TryScope = {
  statement: TryStatement;
  processingPhase?: ErrorProcessingPhase;
  tryLabel: number;
  exitType?: ErrorHandlerExitType;
  errorToThrow?: any;
  errorSource?: ErrorProcessingPhase;
};
