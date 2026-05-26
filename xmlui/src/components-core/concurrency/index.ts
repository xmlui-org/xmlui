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
  createPassThroughHandlerCoordinator,
} from "./policy";
export type {
  HandlerPolicy,
  HandlerInvocation,
  HandlerEntryDecision,
  HandlerCoordinator,
} from "./policy";

export {
  createRealHandlerCoordinator,
  getDefaultHandlerCoordinator,
  setDefaultCoordinatorSink,
  __resetDefaultCoordinatorForTests,
} from "./coordinator";
export type { CoordinatorDiagnosticSink } from "./coordinator";

export { runWithTimeout } from "./timeout";
export type { RunWithTimeoutOptions } from "./timeout";

export {
  createTransactionalBuffer,
  detectSnapshotConflict,
} from "./transactional";
export type {
  BufferedWrite,
  TransactionalBuffer,
} from "./transactional";

export type {
  ConcurrencyCode,
  ConcurrencySeverity,
  ConcurrencyDiagnostic,
} from "./diagnostics";
