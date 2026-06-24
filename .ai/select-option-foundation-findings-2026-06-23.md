# Select and Option Foundation Findings - 2026-06-23

Wave: Phase 5 Wave C1, Select/Option foundation.

Original XMLUI sources inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Select/Select.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Select/SelectReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Select/Select.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Select/Select.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Select/Select.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Option/Option.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Option/OptionReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Option/Option.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Option/Option.spec.ts`

Implementation status:

- The rewrite previously had empty `Select` and `Option` folders with runtime
  behavior in the central legacy builtins renderer.
- This slice moved the current native select foundation into source-adjacent
  component files with metadata, defaults, renderer, SCSS, docs, registry
  wiring, and test drivers.
- The old `Select` implementation uses a broader dropdown stack with Radix
  popover/composition, option context, form context, validation feedback,
  grouping, searchable behavior, clear button parts, nested overlay handling,
  and rich templates. Those dependencies are not fully present in the rewrite
  yet.

Testing note:

- The full old `Select.spec.ts` and `Option.spec.ts` suites have not been
  copied into this slice, because most of the literal old Select suite depends
  on the broader dropdown/form/overlay infrastructure that is still pending.
- This is not a completed Select/Option migration. Future Select closure must
  copy the old E2E test cases literally and make them pass or record exact
  blockers per test.
- Foundation specs are intentionally named `*.foundation.spec.ts` so they do
  not masquerade as transferred old E2E suites.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Select/Select.foundation.spec.ts src/components/Option/Option.foundation.spec.ts`
  passed with 5 passed.
