import { CancelledError, isCancelledError } from "@tanstack/query-core";

export const DEFAULT_OPERATION_CANCEL_REASON = "user";

export type OperationCancelReason = string;

export type CancelledOperationResult = {
  cancelled: true;
  reason: OperationCancelReason;
};

export function createOperationAbortController() {
  return new AbortController();
}

export function createOperationAbortError() {
  if (typeof DOMException !== "undefined") {
    return new DOMException("The operation was aborted.", "AbortError");
  }
  return Object.assign(new Error("The operation was aborted."), { name: "AbortError" });
}

export function createCancelledOperationResult(
  reason: OperationCancelReason = DEFAULT_OPERATION_CANCEL_REASON,
): CancelledOperationResult {
  return {
    cancelled: true,
    reason,
  };
}

export function getAbortSignalReason(
  abortSignal?: AbortSignal,
  fallback: OperationCancelReason = DEFAULT_OPERATION_CANCEL_REASON,
): OperationCancelReason {
  const reason = abortSignal?.reason;
  return typeof reason === "string" && reason ? reason : fallback;
}

export function isAbortError(error: unknown): boolean {
  if (!error) {
    return false;
  }
  if (isCancelledError(error)) {
    return true;
  }
  if (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "AbortError"
  ) {
    return true;
  }
  if (error instanceof Error) {
    return error.name === "AbortError" || error.name === "CancelledError";
  }
  if (typeof error === "object") {
    const candidate = error as { name?: unknown; message?: unknown };
    return candidate.name === "AbortError" || candidate.name === "CancelledError";
  }
  return false;
}

export function createReactQueryCancelledError() {
  return new CancelledError({ revert: true, silent: true });
}
