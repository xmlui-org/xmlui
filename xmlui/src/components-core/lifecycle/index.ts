/**
 * Lifecycle module — public barrel.
 *
 * Plan #04 "Managed Lifecycle Vocabulary" — Phases 1–2 ship the
 * universal `onMount` / `onUnmount` / `onError` events on every
 * component (Step 1.1 / 1.2) and the `<Lifecycle>` declarative effect
 * primitive (Step 2.1). The dispatcher and diagnostic helpers in this
 * module support those surfaces and the future `onBeforeDispose` hook
 * (Step 3.1).
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
  reportLifecycleEvent,
  reportLifecycleViolation,
  type LifecycleDispatcher,
  type LifecycleEvent,
} from "./dispatcher";
