# TODO: Pure Static Tracking

## Context
During the initial extraction of scoped state in `ContainerUtils.ts:extractScopedState`, there is a fallback mechanism specifically for lexical variables (variables prefixed with `$`).

## Problem
Because lexical scoping in the static AST analyzer was not historically 100% capable of propagating every edge-case context variable, the runtime narrowing currently maintains a safety net: it unconditionally preserves ALL properties starting with `$` (except `UNSTABLE_GLOBAL_VARS`), regardless of whether they appear in the `computedUses` array. 
While safe, this leaks variables across boundaries needlessly and makes the state projections heavier than strictly required.

## Proposed Solution
Eliminate the `$`-prefix fallback `keepDep` logic entirely.
1. Mature the static analysis of lexical scope tracking (`injectedVars` propagation) until we can mathematically prove it never drops a required context variable.
2. Rely **only** on the explicit `computedUses` list provided by the analyzer for all variables—including framework injected variables and UIDs. 
3. Remove the explicit string prefix (`$`) checks from runtime critical loops.
