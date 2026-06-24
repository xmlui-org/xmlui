# RadioGroup Foundation Findings - 2026-06-23

Wave: Phase 5 Wave C2, RadioGroup foundation.

Original XMLUI sources inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/RadioGroup/RadioGroup.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/RadioGroup/RadioGroupReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/RadioGroup/RadioItem.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/RadioGroup/RadioItemReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/RadioGroup/RadioGroup.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/RadioGroup/RadioGroup.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/RadioGroup/RadioGroup.spec.ts`

Implementation status:

- Added a component-owned native radio foundation with source-adjacent metadata,
  defaults, SCSS, docs, renderer, compiler contract, registry wiring, and
  foundation E2E tests.
- The old implementation uses Radix RadioGroup and OptionTypeProvider. The
  rewrite currently avoids adding that dependency until the broader choice
  collection architecture is ready, but preserves the first visible semantics:
  `Option` children, strict value matching, disabled options, required state,
  label rendering, orientation/gap props, events, and `setValue`/`value` API.

Testing note:

- The full old `RadioGroup.spec.ts` suite has not been copied in this
  foundation slice. Full migration is incomplete until those old cases are
  copied literally and pass, or individual blockers are recorded.
- Foundation specs are named `RadioGroup.foundation.spec.ts` so they are not
  mistaken for transferred old E2E tests.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/RadioGroup/RadioGroup.foundation.spec.ts`
  passed with 4 passed.
