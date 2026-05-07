/**
 * Concurrency module barrel (Plan #6 Step 0).
 *
 * Public surface of the `concurrency/` module — re-export only the
 * types and factories that other modules (`event-handlers.ts`, the
 * future `App.cancel()` global, component metadata declarations,
 * tests) are expected to consume. Internal helpers stay file-local.
 */

export {
  createCancellationToken,
  HandlerCancelledError,
} from "./token";
export type {
  CancellationToken,
  CancellationReason,
} from "./token";

export {
  createHandlerCoordinator,
} from "./policy";
export type {
  HandlerPolicy,
  HandlerInvocation,
  HandlerEntryDecision,
  HandlerCoordinator,
} from "./policy";

export type {
  ConcurrencyCode,
  ConcurrencySeverity,
  ConcurrencyDiagnostic,
} from "./diagnostics";
