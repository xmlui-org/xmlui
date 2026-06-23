# Card Foundation Findings - 2026-06-23

Scope completed: Phase 5 Wave D1C for `Card`.

Old source anchors:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Card/Card.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Card/CardReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Card/Card.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Card/Card.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Card/Card.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Card/Card.md`

Implemented in the rewrite:

- replaced the earlier inline-style experimental Card with source-adjacent
  metadata, defaults, SCSS, React renderer, copied docs, and foundation E2E
  test;
- wired compiler contracts from `CardMd` instead of maintaining a separate
  manual prop/event list;
- added runtime CSS import and dev-server sample `cardFoundation`;
- copied the literal old `Card.spec.ts` suite and skipped it at file level as
  explicit compatibility debt.

Current compatibility debt:

- full old Card suite remains skipped until Avatar/Link/Heading/Text
  composition, `createCardDriver` parity, click/double-click edge behavior,
  link navigation, scroll APIs, title/subtitle parts, and full theme-variable
  coverage are implemented;
- Card SCSS currently uses explicit CSS custom properties and class names to
  avoid config-time SCSS query imports from metadata modules.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Card` passed with 1
  passed and 27 skipped.
- `npm test` passed with 263 tests.
- `npm --workspace xmlui run test:e2e -- --list` collected 3509 tests in 95
  files.

