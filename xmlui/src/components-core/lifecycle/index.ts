/**
 * Lifecycle module — public barrel.
 *
 * Plan #04 "Managed Lifecycle Vocabulary" — Phases 1–2 ship the
 * universal `onMount` / `onUnmount` / `onError` events on every
 * component (Step 1.1 / 1.2) and the `<Lifecycle>` declarative effect
 * primitive (Step 2.1). Phase 3 (Step 3.1) adds `onBeforeDispose` on
 * container components with async handler support and a timeout budget.
 *
 * See `dev-docs/plans/04-managed-lifecycle-vocabulary.md`.
 */

export {
  LifecycleViolationError,
  formatViolation,
  type LifecyclePhase,
  type LifecycleViolationReason,
} from "./diagnostics";

export {
  createLifecycleDispatcher,
  fireBeforeDispose,
  reportLifecycleEvent,
  reportLifecycleViolation,
  type LifecycleDispatcher,
  type LifecycleEvent,
} from "./dispatcher";
