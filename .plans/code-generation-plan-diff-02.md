# Code Generation Plan Diff 02

Snapshot: `code-generation-plan-02.md`  
Previous snapshot: `code-generation-plan-01.md`

## Prompt

Perhaps these documents should be reviewed too:
`.plans/expression-event-plan.md` and `.plans/compiler-ir-plan.md`.

## Edits

- Reviewed the expression/event and compiler IR plans against the changed
  compiler boundary.
- Reaffirmed that code generation must compile only expressions and event
  handlers to JavaScript functions.
- Kept rendering responsibilities explicitly assigned to the runtime.

## Prompt

Please review the entire compiler implementation according to the changed
plans.

## Edits

- Audited the compiler pipeline for rendering-related generation.
- Identified the places where generated output still leaned on runtime
  descriptor adaptation and old expression/event execution fallbacks.
- Summarized the updates needed to align the implementation with the revised
  compiler boundary.

## Prompt

Please update the compiler implementation according to your review.

## Edits

- Added a dedicated code-generation pipeline under
  `xmlui/src/compiler/codegen/`.
- Generated JavaScript functions for expression bindings, mixed-text
  expressions, and event handlers.
- Updated `.xmlui` module compilation to emit structural runtime data with
  generated expression/event functions attached.
- Refactored the legacy runtime-document emitter to share generation helpers
  without making it the main compiler path.

## Prompt

Perhaps Section "4. Expression and Event Parsing" and the sections following
it should be updated according to the recent compiler approach changes.

## Edits

- Updated related planning material to clarify that compiler output is limited
  to expression/event JavaScript functions.
- Removed or softened language that suggested compiler-generated rendering,
  render factories, React components, or DOM instructions.
- Preserved the runtime-rendered XMLUI node tree as the cross-phase boundary.

## Prompt

Go on with steps 1, 2, and 3 of the code generation plan.

## Edits

- Recorded old code-generation compatibility notes in `.ai/`.
- Added generated runtime descriptor types for expression functions, event
  functions, text segments, bindings, and source metadata.
- Added deterministic emitter helpers for values, imports, identifiers,
  function expressions, indentation, and raw JavaScript fragments.

## Prompt

Go on with steps 4, 5, and 6.

## Edits

- Implemented script-function generation for the initial expression and event
  subset.
- Added generated binding and mixed-text emission.
- Added generated event-handler emission with writes and invalidation metadata.
- Covered local/global reads, `$props`, logical OR, postfix increments, and
  invalid write targets with focused tests.

## Prompt

Go on with all big steps from 7 to 10.

## Edits

- Walked Compiler IR into runtime-rendered structural node data with compiled
  functions attached.
- Updated runtime execution to prefer generated expression/event functions and
  keep the old IR executor as a transition fallback.
- Integrated generated module output into the Vite `.xmlui` compilation path.
- Preserved source IDs, spans, IR IDs, dependency metadata, and generated names
  for dev-mode diagnostics and future source maps.

## Prompt

Complete the plan's implementation.

## Edits

- Added Playwright E2E coverage for the local-counter and repeated-component
  counter examples.
- Verified the global-counter and local-shadowing example in the generated
  code path.
- Added `.ai/code-generation-compatibility-closure.md` to record preserved
  compatibility, intentional omissions, and the next runtime-state direction.
- Marked all code-generation implementation steps complete.
