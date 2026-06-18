# Code Generation Plan Diff 01

Snapshot: `code-generation-plan-01.md`  
Previous snapshot: none

## Prompt

Take a snapshot. Then create a detailed plan for the "6. Code Generation"
section of the master plan. Use that plan as the subject of snapshots.

## Edits

- Created `.plans/code-generation-plan.md` from the master-plan Code Generation
  scope.
- Added compatibility notes for the old XMLUI Vite transform and `extractParam`
  behavior.
- Defined scope, compatibility baseline, current starting point, design
  principles, generated module shape, runtime boundary, code-generation units,
  function semantics, source-map/diagnostic expectations, implementation steps,
  tests, risks, and deferred features.
- Updated `AGENTS.md` so unqualified snapshots default to
  `.plans/code-generation-plan.md`.

## Prompt

Perhaps it is a bit late, but I suspect there is some misunderstanding related
to the compiler. I want the compiler to do no rendering-related compilation. I
want it only to compile expressions and event handlers to JavaScript functions.

## Edits

- Revised the Code Generation plan to state that the compiler must only generate
  JavaScript functions for XMLUI expressions and event handlers.
- Removed requirements for generated component factories, render descriptors,
  render functions, render-node factories, and rendering-related code
  generation.
- Reframed the runtime boundary so generated modules keep XMLUI node structure
  as runtime-rendered data with compiled binding/event functions attached.
- Updated the related `.ai` compatibility note to warn future work not to
  generate rendering code in the compiler.
