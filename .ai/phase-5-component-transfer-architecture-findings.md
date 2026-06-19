# Phase 5 Component Transfer Architecture Findings

Date: 2026-06-19

## Clarification

Component rebuild work must preserve the source organization pattern of the
original XMLUI framework. Each transferred component should live under
`xmlui/src/components/<ComponentName>/` and own its implementation, renderer or
renderer adapter, metadata, default styles/theme information, documentation,
tests, fixtures, and local helpers.

The rewrite may simplify internals and metadata representation, but component
behavior must not be considered closed when it exists only as centralized
runtime renderer code.

## Plan Decision

Phase 5 now starts with Wave 0: Component Transfer Scaffold. This wave creates
the per-component module convention, registry delegation, transferred-test
location, closure note requirements, and compatibility checks needed before
Wave A resumes.

Existing experimental built-ins are treated as compatibility scaffolding. They
must be migrated behind component modules or remain explicit compatibility debt.

## Closure Rule

A component is closed only when:

- its original component folder was inventoried;
- old tests were copied, referenced, or ported before completion was claimed;
- runnable unit/E2E tests pass or unported old tests are classified in
  compatibility debt;
- metadata and docs are transferred or intentionally deferred;
- the runtime registry imports the component module instead of owning its
  behavior directly;
- a component closure note records old files, rewrite files, deferrals, and
  verification commands.

## Immediate Consequence

Phase 5 Wave A should not restart by adding more built-ins to
`xmlui/src/runtime/rendering/builtins.tsx`. The first implementation step should
create the transfer scaffold and then move the `App` main-content layout slice,
`Text`, `Heading`, and other Wave A components into source-adjacent component
folders with transferred tests.

## Wave 0 Implementation

Wave 0 now has the initial scaffold:

- `xmlui/src/components/types.ts` defines transfer and runtime component module
  types.
- `xmlui/src/components/registry.ts` maps built-in contracts and current
  experimental renderers into component transfer modules.
- `xmlui/src/components/_conventions.md` documents the folder shape,
  transferred-test location, and `partial-centralized` status.
- The runtime renderer imports built-in renderers from the component registry.
- Current experimental runtime-backed components have placeholder folders under
  `xmlui/src/components/<ComponentName>/`.
- `H1` is mapped to the original `Heading` component folder.
- `scripts/check-component-transfer.mjs` prevents components from being marked
  `closed` without closure evidence.

The current renderer implementations still live in
`xmlui/src/runtime/rendering/builtins.tsx`; this is intentional scaffolding
status, not component closure.
