# Master Plan Diff 04

Snapshot: `master-plan-04.md`  
Previous snapshot: `master-plan-03.md`

## Prompt

Perhaps Section "4. Expression and Event Parsing" and the following sections
should be updated according to the recent compiler approach changes.

## Edits

- Updated the master plan to clarify that compiler output means JavaScript
  functions for expressions and event handlers.
- Replaced ambiguous wording about compiling nodes or rendering with structural
  IR/data terminology.
- Clarified that rendering remains runtime-owned, including React renderers for
  `App`, `H1`, and `Button`.
- Updated Code Generation, Runtime State Model, Rendering Pipeline, Production
  Build, and SSG wording to distinguish structural runtime data from compiled
  expression/event functions.
