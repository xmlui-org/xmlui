# FormSegment Foundation Findings - 2026-06-23

Phase 5 Wave E1B migrated a minimal `FormSegment` foundation after the
`Form`/`FormItem` foundation.

## Implemented Foundation

- `FormSegment` now has the migrated component shape:
  - `FormSegment.tsx` for metadata;
  - `FormSegmentReact.tsx` for the React implementation and direct SCSS module
    import;
  - `FormSegment.renderer.tsx` for adapter/runtime wiring;
  - `FormSegment.module.scss` for component styling;
  - `FormSegment.foundation.spec.ts` for executable foundation coverage.
- The renderer creates a child runtime scope with segment context variables:
  - `$segmentData`;
  - `$segmentValidationIssues`;
  - `$hasSegmentValidationIssue`.
- `Form` now tracks a minimal `dirtyFields` set so `FormSegment` can expose
  `isDirty`.
- `FormSegment` registers foundation APIs:
  - `isValid`;
  - `hasIssues`;
  - `isDirty`.
- Visual sample:
  - `xmlui/src/examples/form-segment-foundation/Main.xmlui`
  - available through `?example=formSegmentFoundation` with `npm run dev` from
    `xmlui/`.

## Compatibility Trackers

- Copied the original `FormSegment.spec.ts` into
  `xmlui/src/components/FormSegment/FormSegment.spec.ts`.
- The copied old suite is skipped at file top and currently collects 38
  compatibility test cases.
- One copied old test was run with `--grep` and reports as skipped.

## Important Compiler Limitation

The current expression compiler cannot call a context-provided function target
such as:

```xml
onClick="testState = $hasSegmentValidationIssue('name')"
```

The runtime context function is provided, but executable foundation tests use
direct `$segmentValidationIssues` reads for now. Before enabling the copied old
FormSegment tests, extend expression/event compilation so context variable
functions can be called.

## Remaining Compatibility Debt

- Full old validation result shape and timing semantics.
- Typed child-control `bindTo` integration for existing inputs.
- Exact layout transposition through the old implicit Stack behavior.
- Full old API timing semantics for `isValid`, `hasIssues`, and `isDirty`.
- Integration with future `ValidationSummary` and `ConciseValidationFeedback`.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui exec -- playwright test src/components/FormSegment/FormSegment.foundation.spec.ts`
- `npm --workspace xmlui exec -- playwright test src/components/FormSegment/FormSegment.spec.ts --list`
- `npm --workspace xmlui exec -- playwright test src/components/FormSegment/FormSegment.spec.ts --grep "renders children inside a Form"`

