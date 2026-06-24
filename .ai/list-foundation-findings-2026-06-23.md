# List Foundation Findings - 2026-06-23

Wave: Phase 5 Wave C3, List foundation.

Original XMLUI sources inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/List/List.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/List/ListReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/List/List.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/List/List.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/List/List.spec.ts`

Implementation status:

- Added a component-owned List foundation with metadata, defaults, SCSS, docs,
  renderer, compiler contract, registry wiring, API registration, item-template
  context variables, basic grouping, basic selection, and foundation E2E tests.
- The old implementation uses `virtua`, lodash utilities, rich group headers
  and footers, scroll anchoring, pagination, SelectionStore integration,
  keyboard actions, row-selection APIs, and extensive virtualization behavior.
  Those are not fully migrated in this slice.

Testing note:

- The full old `List.spec.ts` suite has not been copied in this foundation
  slice. Full migration is incomplete until those old cases are copied
  literally and pass, or individual blockers are recorded.
- Foundation specs are named `List.foundation.spec.ts` so they are not mistaken
  for transferred old E2E tests.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/List/List.foundation.spec.ts`
  passed with 4 passed.
