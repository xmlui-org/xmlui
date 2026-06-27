# Website E2E Findings

Date: 2026-06-27

## Scope

Added and ran the first automated Playwright E2E suite for the migrated
website. This corrects the earlier display-first package migration work, which
used manual browser smoke checks but did not leave repeatable website tests.

## Files

- `website/playwright.config.ts`
- `website/tests/e2e/website-migration.spec.ts`
- `website/package.json`
- `package.json`

## Coverage

The suite covers:

- home route rendering the migrated website shell;
- docs smoke route rendering migrated extension packages;
- user-visible state updates for Gauge, EChart, Calendar, GridLayout,
  TiptapEditor, and the docs route counter;
- copied docs markdown route at `/docs/intro`;
- blog overview and copied blog post route.

## Verification

Command:

- `npm --workspace xmlui-website run test:e2e`

Result:

- 4 passed.

## Remaining Test Debt

- Package-level smoke tests now run through `npm run test:extensions:e2e`, but
  package-local old specs that were copied or adapted during extension
  migration still need to be fully wired into the current harness.
- `xmlui-docs-blocks` still needs deeper old-spec migration for `Share` default
  boolean behavior and XMLUI-defined docs block expansion.
- `xmlui-website-blocks` still needs its old interaction/layout specs run under
  the current harness, or documented blockers for each failing case.
- The website E2E proves display and state updates through the migrated site,
  but it does not replace detailed package-level parity tests.
