# Component E2E migration status: 2026-06-20

When migrating a component, copy the original component E2E spec files under
their original names into the component folder and make those tests pass. Do not
use separate `*-old-e2e.spec.ts` shim files as the migration target.

Current status for the components started so far:

- `Button`: original `Button.spec.ts` and `Button-style.spec.ts` are migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts`
  found 159 tests; 153 passed and 6 were skipped by the suite.
- `Text`: original `Text.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Text/Text.spec.ts`
  passed 140/140.
- `Heading`: original `Heading.spec.ts` and `HeadingShortcuts.spec.ts` are
  migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Heading/Heading.spec.ts src/components/Heading/HeadingShortcuts.spec.ts`
  passed 135/135.
- `Card`: original `Card.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Card/Card.spec.ts`
  passed 27/27.
- `Br`, `Fragment`, and `HtmlTags`: original `Br.spec.ts`,
  `Fragment.spec.ts`, and `HtmlTags.spec.ts` are migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Br/Br.spec.ts src/components/Fragment/Fragment.spec.ts src/components/HtmlTags/HtmlTags.spec.ts`
  passed 8/8.
- `App`: original `App.spec.ts`, `App-layout.spec.ts`,
  `App-layout-mobile.spec.ts`, `App-navigation-events.spec.ts`, and
  `App-script-imports.spec.ts` are copied, but App migration is not complete.
  Verification currently found 220 tests; only 3 passed. The failures are broad
  App-shell migration gaps: layout modes, mobile drawer behavior, navigation
  lifecycle events, script import/function handling, ready/message/keyboard
  events, document title behavior, and desktop layout semantics.

Important learned rule: App must be split into its own focused migration wave.
It is not comparable in scope to primitive/container components because its old
E2E suite covers the full app shell, navigation, scripting, lifecycle events,
and responsive layout system.

Default E2E command behavior:

- `npm --workspace xmlui run test:e2e` excludes the incomplete App
  compatibility suite so the command reflects currently migrated behavior.
  Verification after the split: 526 tests discovered; 520 passed and 6 skipped.
- `npm --workspace xmlui run test:e2e:app-compat` runs only the copied App
  compatibility suite and is expected to fail until the App migration wave is
  completed. Verification after the split: 220 tests discovered; 3 passed and
  the remaining failures are the known App-shell migration backlog.
- `npm --workspace xmlui run test:e2e:all` includes both migrated suites and
  known incomplete compatibility suites.
