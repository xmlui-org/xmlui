# TODO: AST Analysis of `.xs` File Functions

## Context
When a component uses a script behind file (`.xmlui.xs`) or an inline `<script>` tags, it includes potentially complex external function definitions. 

## Problem
Currently, the `computedUses` static analysis does not perform transitive AST analysis (following function calls into the script block to discover what variables they use). Because we do not know what the functions in the code-behind read or write to the parent context, state narrowing for such nodes is completely disabled (and cascades down via `nextDisableNarrowing`). They always receive the full, unoptimized `parentState`.

## Proposed Solution
Extend the Babel/AST analyzer that currently parses template expressions to also process function bodies in `.xs` scripts and `<script>` blocks.
1. When traversing the template, if a script function is referenced, step into its AST.
2. Collect the identifiers used inside the script function.
3. Map these back as dependencies of the node that calls the function.
4. If a component with a code-behind only touches a specific subset of variables across all its functions, it can still be safely narrowed to just those variables, restoring isolated rendering optimization.