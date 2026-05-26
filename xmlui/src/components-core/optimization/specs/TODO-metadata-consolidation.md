# TODO: Metadata Consolidation (DRY)

## Context
Currently in the component metadata architecture, there is a technical split regarding injected context variables.

## Problem
Developers often have to define injected variables redundantly:
1. `childInjectedVars` (or `events.injectedVars` via `withInjectedContext`) in `optimizer-metadata.ts` for static analysis to know which variables are safe to ignore as external dependencies.
2. `contextVars` in the component's runtime metadata (`metadata.ts`) to inform the language server and renderer what slots are available. 

This causes friction and creates paths for misalignment if one file is updated but the other is forgotten. (Though currently, tests like `renderer-metadata-drift.test.ts` catch this, the duplication of effort remains).

## Proposed Solution
Refactor the framework initialization to merge these concepts.
1. Make `childInjectedVars` and `contextVars` draw from a single unified source of truth.
2. The runtime engine and the static optimizer should both derive their definitions centrally (e.g., if a Variable is typed for the Language Server in `contextVars`, the optimizer should intrinsically trust it implies lexical scoping downstream).
