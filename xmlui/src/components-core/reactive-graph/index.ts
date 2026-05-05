/**
 * Reactive cycle detection — Plan #03 Phase 1.
 *
 * Public surface for the static cycle detector. Used by:
 *   - `AppContent` (runtime warn-mode probe; Step 3.1)
 *   - The LSP diagnostic provider (W6, Step 3.3)
 *   - The Vite plugin (W6, Step 3.4)
 */
export {
  createReactiveGraph,
  type ReactiveGraph,
  type ReactiveNode,
  type ReactiveNodeKind,
} from "./graph";
export {
  findCycles,
  type CycleHit,
  type ReactiveCycleSeverity,
} from "./findCycles";
export {
  ReactiveCycleError,
  formatCycle,
  describeNode,
  cycleHash,
} from "./diagnostics";
export { collectComponentDefGraph } from "./collectComponentDefGraph";
