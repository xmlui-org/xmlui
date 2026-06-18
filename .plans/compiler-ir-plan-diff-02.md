# Compiler IR Plan Diff 02

Snapshot: `compiler-ir-plan-02.md`  
Previous snapshot: `compiler-ir-plan-01.md`

## Prompt

Perhaps these documents should be reviewed, too:
`.plans/expression-event-plan.md` and `.plans/compiler-ir-plan.md`.

## Edits

- Reviewed the Compiler IR plan for wording that implied render compilation or
  broad code generation.
- Clarified that Compiler IR is the boundary for expression/event code
  generation, runtime state, diagnostics, editor services, tests, and later
  builds.
- Stated explicitly that XMLUI node rendering remains a runtime responsibility.
- Reworded IR fields and pipeline steps around generated expression/event
  source and structural runtime descriptors.
- Updated Vite integration language to mention IR-derived descriptors carrying
  generated expression/event metadata.
