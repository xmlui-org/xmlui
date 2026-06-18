# Rendering Pipeline Plan Diff 01

Snapshot: `rendering-pipeline-plan-01.md`  
Previous snapshot: none

## Prompt

Take a snapshot, then create a detailed plan for the "8. Rendering Pipeline"
section of the master plan.

## Edits

- Created `.plans/rendering-pipeline-plan.md` from the master-plan Rendering
  Pipeline scope.
- Defined the runtime rendering slice around recursive structural rendering,
  built-in renderers, binding evaluation, dependency subscriptions,
  user-defined component instantiation, and clear render errors.
- Split the work into twelve independently testable implementation steps.
- Updated `AGENTS.md` so unqualified snapshots defaulted to
  `.plans/rendering-pipeline-plan.md`.

## Prompt

Implement the entire plan.

## Edits

- Added old rendering architecture notes in
  `.ai/rendering-pipeline-old-architecture.md`.
- Implemented the rendering pipeline under `xmlui/src/runtime/rendering/`,
  including rendering types, binding evaluation, dependency normalization,
  reactive binding subscriptions, built-in renderers, user-defined component
  instantiation, recursive rendering, and render errors.
- Reduced `xmlui/src/runtime/index.tsx` to public module creation, root
  store/scope setup, render-context creation, and root renderer invocation.
- Added rendering pipeline unit tests for dependency normalization, generated
  binding/event execution, registry behavior, render errors, and binding
  evaluation counters.
- Added `.ai/rendering-pipeline-compatibility-closure.md` to record preserved
  behavior, dependency/invalidation behavior, intentional omissions, and the
  handoff to Minimal Managed React Contracts.
- Marked all rendering-pipeline implementation steps complete.
