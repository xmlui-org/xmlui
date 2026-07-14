# Theme and Style Old-Pattern Migration Closure

## Final Changed Files

- `.plans/theme-style-old-pattern-migration-plan.md`
- `package-lock.json`
- `tools/vscode/tests/semanticTokens.test.ts`
- `website/scripts/generate-sitemap.mjs`
- `xmlui/src/cli/ssg.ts`
- `xmlui/src/components/Select/Select.foundation.spec.ts`
- `xmlui/src/components/Switch/Switch.spec.ts`
- `xmlui/src/components/Timer/Timer.foundation.spec.ts`
- `xmlui/src/runtime/rendering/bindings.ts`
- `xmlui/src/runtime/state/scope.ts`
- `xmlui/src/ssg/discoverRoutes.ts`
- `xmlui/src/ssg/ssgEntry.ts`
- `xmlui/tests/compatibility/artifacts/artifactCompatibility.test.ts`
- `xmlui/tests/compatibility/packageInfrastructure.test.ts`
- `xmlui/tests/e2e/website-route-parity.spec.ts`
- `xmlui/tests/e2e/website-theme-fixtures.ts`
- `xmlui/tests/e2e/website-theme-parity.spec.ts`

## Remaining Deviations and Blockers

- `npm --workspace xmlui run build:production` still fails on broad existing
  TypeScript production-build debt. The failures include strict-null/type
  mismatches, missing internal module imports, Vite environment option typing,
  and legacy DOM type gaps.
- `npm --workspace xmlui run build:ssg` remains blocked because it depends on
  the production build.
- `npm --workspace xmlui run compatibility:sweep` remains blocked by the same
  production and SSG failures, plus the VS Code build's missing optional native
  `@esbuild/darwin-arm64` package in this workspace.

## Flakes Fixed During Closure

- `xmlui/src/components/Timer/Timer.foundation.spec.ts` was rewritten earlier
  in Step 14.3 to avoid a start/stop interval race.
- `xmlui/src/components/Select/Select.foundation.spec.ts` now verifies
  `didChange` through rendered app state instead of a stale API value read.
- `xmlui/src/components/Switch/Switch.spec.ts` string-value API controls now
  dispatch click events directly for the affected tests.

Focused rerun evidence:

- `npx playwright test src/components/Timer/Timer.foundation.spec.ts --repeat-each=5`
  passed 5 repeats.
- `npx playwright test src/components/Select/Select.foundation.spec.ts --grep "didChange fires when selection changes" --repeat-each=10 --workers=1`
  passed 10 repeats.
- `npx playwright test src/components/Switch/Switch.spec.ts --grep "switch handles special string values correctly|switch handles string case sensitivity correctly" --repeat-each=10 --workers=1`
  passed 20 repeats.

## Commands and Results

- `npm --workspace xmlui run test` passed 39 files / 312 tests.
- `npm --workspace xmlui run test:unit` passed 39 files / 312 tests.
- `npm --workspace xmlui run check:metadata` passed, with the known
  sandbox-only Vite WebSocket `EPERM` warning.
- `npm --workspace xmlui run build:production` failed on existing production
  TypeScript blockers.
- `npm --workspace xmlui run build:ssg` failed because production build failed.
- `npm --workspace xmlui run compatibility:sweep` failed because production,
  SSG, and VS Code optional esbuild dependency blockers remain.
- `npm --workspace xmlui run test:e2e -- --max-failures=10` passed with 5,580
  passed, 83 skipped, and no flaky retries.

## Follow-Up Risks

- Website visual parity is covered by focused route and theme canaries, but a
  true website-local E2E runner still does not exist.
- Production/SSG compatibility cannot be closed until the existing TypeScript
  production-build blockers are resolved.
