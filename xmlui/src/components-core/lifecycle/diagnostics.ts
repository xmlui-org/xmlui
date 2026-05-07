/**
 * Lifecycle diagnostics — Plan #04 Step 0.
 *
 * Pure type module + a typed `Error` subclass for lifecycle-violation
 * reporting. Used by the dispatcher (`./dispatcher.ts`) and by the
 * runtime trace emitter that pushes `kind:"lifecycle"` entries into
 * `pushXsLog`.
 *
 * See `dev-docs/plans/04-managed-lifecycle-vocabulary.md`.
 */

export type LifecyclePhase = "mount" | "unmount" | "beforeDispose";

export type LifecycleViolationReason =
  /** An async handler was registered for `onUnmount`; React commits unmount
   * synchronously, so awaiting after unmount risks writing to a torn-down
   * container. Use `onBeforeDispose` (Step 3.1) for the async-flush case. */
  | "async-onUnmount"
  /** The handler threw. */
  | "throw"
  /** The handler exceeded `App.appGlobals.disposeTimeoutMs` (default 250ms). */
  | "timeout";

export class LifecycleViolationError extends Error {
  constructor(
    public readonly componentUid: string,
    public readonly phase: LifecyclePhase,
    public readonly reason: LifecycleViolationReason,
    cause?: unknown,
  ) {
    super(formatViolation(componentUid, phase, reason));
    this.name = "LifecycleViolationError";
    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

export function formatViolation(
  componentUid: string,
  phase: LifecyclePhase,
  reason: LifecycleViolationReason,
): string {
  switch (reason) {
    case "async-onUnmount":
      return `Lifecycle violation on '${componentUid}': async '${phase}' handler is not awaited (React commits unmount synchronously). Use 'onBeforeDispose' for async flush.`;
    case "throw":
      return `Lifecycle violation on '${componentUid}': '${phase}' handler threw.`;
    case "timeout":
      return `Lifecycle violation on '${componentUid}': '${phase}' handler exceeded the configured budget.`;
  }
}
