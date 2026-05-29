# DONE: AST Analysis of `.xs` File Functions

## Context
When a component uses a script behind file (`.xmlui.xs`) or an inline `<script>` tags, it includes potentially complex external function definitions. 

## Problem
Currently, the `computedUses` static analysis does not perform transitive AST analysis (following function calls into the script block to discover what variables they use). Because we do not know what the functions in the code-behind read or write to the parent context, state narrowing for such nodes is completely disabled (and cascades down via `nextDisableNarrowing`). They always receive the full, unoptimized `parentState`.

## Proposed Solution
Extend the Babel/AST analyzer that currently parses template expressions to also process function bodies in `.xs` scripts and `<script>` blocks.
1. ✅ DONE — When traversing the template, if a script function is referenced, step into its AST. (`collectScriptFunctionDeps`, L180–236 in `computedUses.ts`)
2. ✅ DONE — Collect the identifiers used inside the script function. (`depsOfValueWithReads` called per function with transitive DFS)
3. ✅ DONE — Map these back as dependencies of the node that calls the function. (results added to `usedHere` / `usedHereReads`, L404–410)
4. ✅ DONE — If a component with a code-behind only touches a specific subset of variables across all its functions, it can still be safely narrowed to just those variables, restoring isolated rendering optimization. (`safeToNarrow` logic + `disablesChildNarrowing` vs `nextDisableNarrowing` split, L392–394, L521)
