# Stack Family Foundation Findings - 2026-06-23

Scope completed: Phase 5 Wave D1A for `Stack`, `HStack`, and `VStack`.

Old source anchors:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Stack/Stack.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Stack/StackReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Stack/Stack.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Stack/*.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Stack/*.md`

Implemented in the rewrite:

- added source-adjacent `xmlui/src/components/Stack` metadata, defaults, SCSS,
  docs, renderer, and foundation E2E tests;
- wired transferred renderers for `Stack`, `HStack`, and `VStack`;
- expanded compiler contracts for Stack-family props and events;
- added `stack-family-foundation` dev-server sample with state mutation;
- copied literal old Stack-family E2E suites into the component folder and
  skipped them at file level as explicit compatibility debt;
- restored the shared `overflows` E2E helper needed by copied old tests.

Current compatibility debt:

- full old Stack-family suites remain skipped until scroller/fade behavior,
  dock layout, `itemWidth`, star sizing, RTL/reverse edge cases, and
  `CHStack`/`CVStack` registration are implemented;
- `gap` is currently bridged by setting `--xmlui-gap-Stack` from the prop while
  retaining CSS-module ownership of the actual visual style.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Stack` passed with 2
  passed and 89 skipped.
- `npm test` passed with 263 tests.
- `npm --workspace xmlui run test:e2e -- --list` collected 3376 tests in 90
  files.

