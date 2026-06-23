# SelectionStore Foundation Findings - 2026-06-23

Wave: Phase 5 Wave C3, SelectionStore foundation.

Original XMLUI sources inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/SelectionStore/SelectionStore.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/SelectionStore/SelectionStoreReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/SelectionStore/SelectionStore.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/SelectionStore/SelectionStore.md`

Implementation status:

- Added a source-adjacent non-visual foundation with metadata, defaults, docs,
  renderer, API registration, selection context, compiler contract, registry
  wiring, and foundation tests.
- The old component is deprecated and has no source-adjacent E2E spec file, so
  there is no literal old `SelectionStore.spec.ts` suite to copy.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/SelectionStore/SelectionStore.foundation.spec.ts`
  passed with 2 passed.
