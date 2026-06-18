# Managed React Contracts Plan Diff 01

Snapshot: `managed-react-contracts-plan-01.md`  
Previous snapshot: none

## Prompt

Take a snapshot, then create a detailed plan for the "9. Minimal Managed React
Contracts" section of the master plan.

## Edits

- Created `.plans/managed-react-contracts-plan.md` from the master-plan
  Minimal Managed React Contracts scope.
- Defined the first contract slice around a tiny component registry, built-in
  props/events, user-defined component registration, source-located
  diagnostics, and LSP-shaped metadata.
- Split the work into twelve independently testable steps.
- Updated `AGENTS.md` so unqualified snapshots defaulted to
  `.plans/managed-react-contracts-plan.md`.

## Prompt

Go on and implement the entire plan.

## Edits

- Added old metadata and type-contract notes in
  `.ai/managed-react-contracts-old-architecture.md`.
- Implemented `xmlui/src/compiler/contracts/` with contract types, built-in
  contracts, registry creation, user-component registration, event-name
  normalization, IR validation, and LSP-shaped metadata export.
- Integrated contract validation into `compileXmluiModule` after Compiler IR
  construction and before code generation.
- Added focused contract tests for built-ins, user components, metadata,
  unknown components, unsupported props/events, declaration validation, and
  compile-time diagnostic propagation.
- Added `.ai/managed-react-contracts-compatibility-closure.md` to record
  preserved behavior, intentional omissions, and the Verification Harness
  handoff.
- Marked all Managed React contract implementation steps complete.
