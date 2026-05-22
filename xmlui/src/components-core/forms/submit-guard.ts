/**
 * Form submission guard (Plan #9 Phase 4 / Step 4.1).
 *
 * W5-4 wires `<Form submitPolicy>` to the cooperative-concurrency
 * `HandlerCoordinator` (plan #06). This file ships the public type
 * surface plus a tiny in-form guard used by `FormReact.tsx` to honour
 * the policy regardless of whether the coordinator's full runtime
 * (which lands in W7-1) is enforcing it yet.
 */

import type { HandlerPolicy } from "../concurrency";

/**
 * Allowed values for `<Form submitPolicy>`. A subset of `HandlerPolicy`
 * — `parallel` is intentionally omitted because allowing two concurrent
 * submits is unsafe by default.
 */
export type SubmitPolicy = "single-flight" | "queue" | "drop-while-running";

/** Default when `submitPolicy` is unspecified. */
export const DEFAULT_SUBMIT_POLICY: SubmitPolicy = "single-flight";

/**
 * Map a `SubmitPolicy` to its underlying `HandlerPolicy` value. Today
 * the mapping is identity but kept as a function so future divergence
 * (e.g. a Forms-specific "queue-with-cap") doesn't break call sites.
 */
export function submitPolicyToHandlerPolicy(p: SubmitPolicy): HandlerPolicy {
  return p;
}

export interface SubmitGuardState {
  /** True while a submit is in flight. */
  inFlight: boolean;
  /** Submits enqueued under `queue` policy, awaiting their turn. */
  queued: number;
}

export interface SubmitGuardDecision {
  /** Whether the dispatcher should run the submit now. */
  proceed: boolean;
  /** When `false`, why the submit was rejected. */
  reason?: "drop-while-running" | "drop-while-busy";
}

/**
 * Decide whether to admit a new submit given the current guard state
 * and policy. Stateless — the caller mutates `state` based on the
 * returned decision and on submit completion.
 *
 * - `single-flight` / `drop-while-running`: reject the second submit
 *   while one is in flight.
 * - `queue`: always proceed (caller is expected to serialise via a
 *   promise chain).
 */
export function decideSubmit(
  state: SubmitGuardState,
  policy: SubmitPolicy,
): SubmitGuardDecision {
  if (!state.inFlight) return { proceed: true };
  if (policy === "queue") return { proceed: true };
  return {
    proceed: false,
    reason: policy === "drop-while-running" ? "drop-while-running" : "drop-while-busy",
  };
}
