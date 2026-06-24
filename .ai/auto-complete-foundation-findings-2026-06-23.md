# AutoComplete Foundation Findings - 2026-06-23

Wave: Phase 5 Wave C2, AutoComplete foundation.

Original XMLUI sources inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/AutoComplete/AutoComplete.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AutoComplete/AutoCompleteReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AutoComplete/AutoCompleteContext.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AutoComplete/AutoComplete.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AutoComplete/AutoComplete.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AutoComplete/AutoComplete.spec.ts`

Implementation status:

- Added a component-owned native autocomplete foundation with source-adjacent
  metadata, defaults, SCSS, docs, renderer, compiler contract, registry wiring,
  and foundation E2E tests.
- The old implementation uses Radix popover, option context, grouping,
  templates, validation feedback, form context, badges for multi mode, and
  richer keyboard navigation. Those are not fully migrated in this slice.

Testing note:

- The full old `AutoComplete.spec.ts` suite has not been copied in this
  foundation slice. Full migration is incomplete until those old cases are
  copied literally and pass, or individual blockers are recorded.
- Foundation specs are named `AutoComplete.foundation.spec.ts` so they are not
  mistaken for transferred old E2E tests.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/AutoComplete/AutoComplete.foundation.spec.ts`
  passed with 5 passed.
