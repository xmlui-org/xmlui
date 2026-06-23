# Tree Family Foundation Findings - 2026-06-23

## Scope

Phase 5 Wave C5 started migration of `Tree`, `TreeDisplay`, and
`TableOfContents`.

## Original Sources

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tree/Tree.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tree/TreeReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tree/Tree.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tree/TreeComponent.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tree/*.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tree/testData.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/TreeDisplay/TreeDisplay.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/TreeDisplay/TreeDisplayReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/TreeDisplay/TreeDisplay.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/TableOfContents/TableOfContents.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/TableOfContents/TableOfContentsReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/TableOfContents/TableOfContents.spec.ts`

## Implemented Foundation

- Added source-adjacent folders for `Tree`, `TreeDisplay`, and
  `TableOfContents`.
- Added metadata, defaults, docs, SCSS, React renderer files, compiler
  contracts, IR built-in registrations, runtime registry wiring, stylesheet
  imports, and a dev-server sample.
- `Tree` foundation supports flat and hierarchy data, basic expansion,
  selection, `itemTemplate`, `$item` context, and a minimal API.
- `TreeDisplay` foundation renders indented text content.
- `TableOfContents` foundation scans rendered headings and displays links up to
  `maxHeadingLevel`, with `omitH1` support.
- Added active foundation E2E tests for rendering and state mutation.
- Added the visual sample at
  `http://127.0.0.1:5173/?example=treeFamilyFoundation`.

## Copied Old Tests

- Copied all old `Tree/*.spec.ts` suites and `Tree/testData.ts`.
- Copied old `TreeDisplay.spec.ts`.
- Copied old `TableOfContents.spec.ts`.
- The copied old suites are skipped at file level with explicit compatibility
  debt reasons. They are preserved as literal future closure targets.
- Restored old test-harness compatibility helpers needed for collection:
  `SKIP_REASON.TO_BE_IMPLEMENTED` and a minimal `createTreeDriver` fixture.

## Compatibility Debt

The old Tree family has substantial behavior that is not yet migrated:

- Tree dynamic loading, `loadedField`, `dynamicField`, `autoLoadAfter`,
  spinner delay, async child loading, and API mutation methods;
- full Tree keyboard navigation, focus handling, scroll styling, virtualized
  visibility APIs, context menu behavior, node expand/collapse events, icon
  fields, and theme variable coverage;
- TableOfContents bookmark/indexer integration, active item tracking,
  smooth-scroll details, route/hash behavior, full theme variables, and
  scroller behavior;
- TreeDisplay SVG connector rendering and full visual parity.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/Tree src/components/TreeDisplay src/components/TableOfContents`
  passed with 4 passed and 308 skipped.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed.
- `npm test` passed with 263 unit/compiler tests.
- `npm --workspace xmlui run test:e2e -- --list` collected 3285 tests in 84
  files.

## Important Learning

Copied old suites can still fail during collection even when they have
`beforeEach` skips if their imports or fixture parameters are missing. Preserve
the literal tests, but also copy their support files and add minimal fixture
compatibility so normal E2E collection remains clean.
