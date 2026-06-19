# Experiment 4 Reactive Graph Closure

Date: 2026-06-19

Experiment 4 implemented the first compiler-directed reactive graph in the
rewrite.

## What Worked

- Existing expression dependency metadata was enough to classify source vs
  derived bindings and build runtime graph edges.
- Owner-aware local keys (`local:<ownerId>:<name>`) preserved repeated
  component instance isolation without recreating the old container stack.
- Eager recomputation after explicit state writes gave event handlers immediate
  access to updated derived values, including after async `delay(...)`
  boundaries.
- The old "reactive until assigned" rule is straightforward when each reactive
  node carries a mode: `source`, `derived`, or `assigned`.
- Prop-driven derived locals need evaluator refresh when component props change;
  otherwise the derived node would keep the initialization-time `$props`
  snapshot.

## Tradeoffs

- Recompute is eager and root-key based. This is simple and compatible for the
  current subset, but later object-path and collection updates may need finer
  dependency keys.
- Cycle detection currently covers local/global initializer cycles in one
  binding bucket. API/context cycles and broader reactive graph diagnostics
  remain future work.
- Prop invalidation is explicit from component rendering. A later scheduler may
  want to batch prop and state invalidations into one reactive flush.

## Verification

- Unit tests cover metadata, graph initialization, derived chains,
  reactive-until-assigned, cycle diagnostics, prop invalidation, and async
  handler interaction.
- E2E tests cover derived locals, transitive chains, derived globals, override
  behavior, and prop-driven derived locals.
